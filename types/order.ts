export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "served"
  | "completed";

export interface Order {
  id: string;
  audioUri: string;
  transcribedText: string;
  timestamp: string;
  staffName: string;
  duration: string;
  tableNumber?: number;
  guestCount?: number;
  status?: OrderStatus | "open" | "closed";
  category?: string;
  totalItems?: number;
}

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  new: {
    label: "New",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    icon: "plus-circle",
  },
  open: {
    label: "Active",
    color: "#6D28D9",
    bgColor: "#EDE9FE",
    icon: "clock",
  },
  preparing: {
    label: "Preparing",
    color: "#D97706",
    bgColor: "#FEF3C7",
    icon: "loader",
  },
  ready: {
    label: "Ready",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "check-circle",
  },
  served: {
    label: "Served",
    color: "#6D28D9",
    bgColor: "#EDE9FE",
    icon: "coffee",
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "check",
  },
  closed: {
    label: "Completed",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "check",
  },
};

export const STATUS_FLOW: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "served",
  "completed",
];
