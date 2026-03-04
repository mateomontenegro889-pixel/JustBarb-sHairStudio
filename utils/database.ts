import { Platform } from "react-native";
import { Order } from "@/types/order";

const STORAGE_KEY = "order_transcribe_orders";

function normalizeOrder(order: any): Order {
  return {
    ...order,
    tableNumber: order.tableNumber != null ? Number(order.tableNumber) : undefined,
    guestCount: order.guestCount != null ? Number(order.guestCount) : undefined,
    totalItems: order.totalItems != null ? Number(order.totalItems) : 0,
  };
}

function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const raw = data ? JSON.parse(data) : [];
    return raw.map(normalizeOrder);
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save orders:", e);
  }
}

let db: any = null;
let useLocalStorage = Platform.OS === "web";

export async function initDatabase(): Promise<void> {
  if (Platform.OS === "web") {
    useLocalStorage = true;
    return;
  }

  try {
    const SQLite = require("expo-sqlite");
    db = await SQLite.openDatabaseAsync("orders.db");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        audioUri TEXT NOT NULL,
        transcribedText TEXT NOT NULL,
        staffName TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        duration TEXT NOT NULL,
        tableNumber INTEGER,
        guestCount INTEGER,
        status TEXT DEFAULT 'new',
        category TEXT,
        totalItems INTEGER DEFAULT 0
      );
    `);

    try {
      await db.execAsync(`ALTER TABLE orders ADD COLUMN tableNumber INTEGER;`);
    } catch (e) {}
    try {
      await db.execAsync(`ALTER TABLE orders ADD COLUMN guestCount INTEGER;`);
    } catch (e) {}
    try {
      await db.execAsync(
        `ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'new';`,
      );
    } catch (e) {}
    try {
      await db.execAsync(`ALTER TABLE orders ADD COLUMN category TEXT;`);
    } catch (e) {}
    try {
      await db.execAsync(
        `ALTER TABLE orders ADD COLUMN totalItems INTEGER DEFAULT 0;`,
      );
    } catch (e) {}

    useLocalStorage = false;
  } catch (error) {
    console.warn("SQLite not available, falling back to localStorage:", error);
    useLocalStorage = true;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (useLocalStorage) {
    return getStoredOrders().sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }
  if (!db) await initDatabase();
  try {
    return (await db!.getAllAsync(
      "SELECT * FROM orders ORDER BY timestamp DESC",
    )) as Order[];
  } catch (error) {
    console.error("Failed to get all orders:", error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (useLocalStorage) {
    return getStoredOrders().find((o) => o.id === id) || null;
  }
  if (!db) await initDatabase();
  try {
    const result = (await db!.getFirstAsync(
      "SELECT * FROM orders WHERE id = ?",
      [id],
    )) as Order | null;
    return result || null;
  } catch (error) {
    console.error("Failed to get order by id:", error);
    return null;
  }
}

export async function addOrder(order: Order): Promise<void> {
  if (useLocalStorage) {
    const orders = getStoredOrders();
    orders.push(order);
    saveOrders(orders);
    return;
  }
  if (!db) await initDatabase();
  try {
    await db!.runAsync(
      "INSERT INTO orders (id, audioUri, transcribedText, staffName, timestamp, duration, tableNumber, guestCount, status, category, totalItems) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        order.id,
        order.audioUri,
        order.transcribedText,
        order.staffName,
        order.timestamp,
        order.duration,
        order.tableNumber || null,
        order.guestCount || null,
        order.status || "new",
        order.category || null,
        order.totalItems || 0,
      ],
    );
  } catch (error) {
    console.error("Failed to add order:", error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  if (useLocalStorage) {
    const orders = getStoredOrders().filter((o) => o.id !== id);
    saveOrders(orders);
    return;
  }
  if (!db) await initDatabase();
  try {
    await db!.runAsync("DELETE FROM orders WHERE id = ?", [id]);
  } catch (error) {
    console.error("Failed to delete order:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<void> {
  if (useLocalStorage) {
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status as any;
      saveOrders(orders);
    }
    return;
  }
  if (!db) await initDatabase();
  try {
    await db!.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}

export async function searchOrders(query: string): Promise<Order[]> {
  if (useLocalStorage) {
    const lowerQuery = query.toLowerCase();
    return getStoredOrders()
      .filter(
        (o) =>
          o.transcribedText.toLowerCase().includes(lowerQuery) ||
          o.staffName.toLowerCase().includes(lowerQuery) ||
          (o.tableNumber && o.tableNumber.toString().includes(lowerQuery)),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }
  if (!db) await initDatabase();
  try {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return (await db!.getAllAsync(
      "SELECT * FROM orders WHERE LOWER(transcribedText) LIKE ? OR LOWER(staffName) LIKE ? OR CAST(tableNumber AS TEXT) LIKE ? ORDER BY timestamp DESC",
      [lowerQuery, lowerQuery, lowerQuery],
    )) as Order[];
  } catch (error) {
    console.error("Failed to search orders:", error);
    return [];
  }
}

export async function appendToOrder(
  id: string,
  additionalText: string,
): Promise<void> {
  if (useLocalStorage) {
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].transcribedText +=
        "\n\n--- Added Items ---\n" + additionalText;
      saveOrders(orders);
    }
    return;
  }
  if (!db) await initDatabase();
  try {
    const existingOrder = await getOrderById(id);
    if (!existingOrder) throw new Error("Order not found");
    const newText =
      existingOrder.transcribedText +
      "\n\n--- Added Items ---\n" +
      additionalText;
    await db!.runAsync("UPDATE orders SET transcribedText = ? WHERE id = ?", [
      newText,
      id,
    ]);
  } catch (error) {
    console.error("Failed to append to order:", error);
    throw error;
  }
}

export async function getTodayOrders(): Promise<Order[]> {
  const allOrders = await getAllOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  return allOrders.filter((o) => o.timestamp >= todayISO);
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  todayOrders: number;
  activeOrders: number;
  completedOrders: number;
  activeTables: number[];
  totalGuests: number;
  avgOrdersPerHour: number;
}> {
  try {
    const allOrders = await getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const todayOrders = allOrders.filter((o) => o.timestamp >= todayISO);
    const activeOrders = allOrders.filter(
      (o) => o.status !== "completed" && o.status !== "closed",
    );
    const completedOrders = allOrders.filter(
      (o) => o.status === "completed" || o.status === "closed",
    );

    const activeTables: number[] = [];
    activeOrders.forEach((o) => {
      if (o.tableNumber && !activeTables.includes(o.tableNumber)) {
        activeTables.push(o.tableNumber);
      }
    });

    const totalGuests = todayOrders.reduce(
      (sum, o) => sum + (o.guestCount || 0),
      0,
    );

    const hoursOpen = Math.max(1, new Date().getHours() - 8);
    const avgOrdersPerHour =
      todayOrders.length > 0
        ? Math.round((todayOrders.length / hoursOpen) * 10) / 10
        : 0;

    return {
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      activeTables: activeTables.sort((a, b) => a - b),
      totalGuests,
      avgOrdersPerHour,
    };
  } catch (error) {
    console.error("Failed to get order stats:", error);
    return {
      totalOrders: 0,
      todayOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      activeTables: [],
      totalGuests: 0,
      avgOrdersPerHour: 0,
    };
  }
}
