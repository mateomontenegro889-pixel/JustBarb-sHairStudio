import * as SQLite from 'expo-sqlite';
import { Order } from '@/types/order';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('orders.db');
    
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
    
    try { await db.execAsync(`ALTER TABLE orders ADD COLUMN tableNumber INTEGER;`); } catch (e) {}
    try { await db.execAsync(`ALTER TABLE orders ADD COLUMN guestCount INTEGER;`); } catch (e) {}
    try { await db.execAsync(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'new';`); } catch (e) {}
    try { await db.execAsync(`ALTER TABLE orders ADD COLUMN category TEXT;`); } catch (e) {}
    try { await db.execAsync(`ALTER TABLE orders ADD COLUMN totalItems INTEGER DEFAULT 0;`); } catch (e) {}
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (!db) await initDatabase();
  try {
    return await db!.getAllAsync<Order>('SELECT * FROM orders ORDER BY timestamp DESC');
  } catch (error) {
    console.error('Failed to get all orders:', error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!db) await initDatabase();
  try {
    const result = await db!.getFirstAsync<Order>('SELECT * FROM orders WHERE id = ?', [id]);
    return result || null;
  } catch (error) {
    console.error('Failed to get order by id:', error);
    return null;
  }
}

export async function addOrder(order: Order): Promise<void> {
  if (!db) await initDatabase();
  try {
    await db!.runAsync(
      'INSERT INTO orders (id, audioUri, transcribedText, staffName, timestamp, duration, tableNumber, guestCount, status, category, totalItems) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [order.id, order.audioUri, order.transcribedText, order.staffName, order.timestamp, order.duration, order.tableNumber || null, order.guestCount || null, order.status || 'new', order.category || null, order.totalItems || 0]
    );
  } catch (error) {
    console.error('Failed to add order:', error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  if (!db) await initDatabase();
  try {
    await db!.runAsync('DELETE FROM orders WHERE id = ?', [id]);
  } catch (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  if (!db) await initDatabase();
  try {
    await db!.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
}

export async function searchOrders(query: string): Promise<Order[]> {
  if (!db) await initDatabase();
  try {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db!.getAllAsync<Order>(
      'SELECT * FROM orders WHERE LOWER(transcribedText) LIKE ? OR LOWER(staffName) LIKE ? OR CAST(tableNumber AS TEXT) LIKE ? ORDER BY timestamp DESC',
      [lowerQuery, lowerQuery, lowerQuery]
    );
  } catch (error) {
    console.error('Failed to search orders:', error);
    return [];
  }
}

export async function appendToOrder(id: string, additionalText: string): Promise<void> {
  if (!db) await initDatabase();
  try {
    const existingOrder = await getOrderById(id);
    if (!existingOrder) throw new Error('Order not found');
    const newText = existingOrder.transcribedText + '\n\n--- Added Items ---\n' + additionalText;
    await db!.runAsync('UPDATE orders SET transcribedText = ? WHERE id = ?', [newText, id]);
  } catch (error) {
    console.error('Failed to append to order:', error);
    throw error;
  }
}

export async function getTodayOrders(): Promise<Order[]> {
  if (!db) await initDatabase();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    return await db!.getAllAsync<Order>(
      'SELECT * FROM orders WHERE timestamp >= ? ORDER BY timestamp DESC',
      [todayISO]
    );
  } catch (error) {
    console.error('Failed to get today orders:', error);
    return [];
  }
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
  if (!db) await initDatabase();
  try {
    const allOrders = await getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const todayOrders = allOrders.filter(o => o.timestamp >= todayISO);
    const activeOrders = allOrders.filter(o => o.status !== 'completed' && o.status !== 'closed');
    const completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'closed');
    
    const activeTables: number[] = [];
    activeOrders.forEach(o => {
      if (o.tableNumber && !activeTables.includes(o.tableNumber)) {
        activeTables.push(o.tableNumber);
      }
    });
    
    const totalGuests = todayOrders.reduce((sum, o) => sum + (o.guestCount || 0), 0);
    
    const hoursOpen = Math.max(1, (new Date().getHours() - 8));
    const avgOrdersPerHour = todayOrders.length > 0 ? Math.round((todayOrders.length / hoursOpen) * 10) / 10 : 0;
    
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
    console.error('Failed to get order stats:', error);
    return { totalOrders: 0, todayOrders: 0, activeOrders: 0, completedOrders: 0, activeTables: [], totalGuests: 0, avgOrdersPerHour: 0 };
  }
}
