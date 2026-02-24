import { Order } from "@/types/order";
import {
  getAllOrders,
  getOrderById,
  addOrder,
  searchOrders,
  initDatabase,
  deleteOrder,
  updateOrderStatus,
  appendToOrder,
  getTodayOrders,
  getOrderStats,
} from "./database";

export const orderStore = {
  init: async (): Promise<void> => {
    await initDatabase();
  },

  getAll: async (): Promise<Order[]> => {
    return await getAllOrders();
  },

  getById: async (id: string): Promise<Order | null> => {
    return await getOrderById(id);
  },

  add: async (order: Order): Promise<void> => {
    await addOrder(order);
  },

  search: async (query: string): Promise<Order[]> => {
    return await searchOrders(query);
  },

  delete: async (id: string): Promise<void> => {
    await deleteOrder(id);
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    await updateOrderStatus(id, status);
  },

  closeOrder: async (id: string): Promise<void> => {
    await updateOrderStatus(id, "completed");
  },

  reopenOrder: async (id: string): Promise<void> => {
    await updateOrderStatus(id, "new");
  },

  appendItems: async (id: string, additionalText: string): Promise<void> => {
    await appendToOrder(id, additionalText);
  },

  getTodayOrders: async (): Promise<Order[]> => {
    return await getTodayOrders();
  },

  getStats: async () => {
    return await getOrderStats();
  },
};
