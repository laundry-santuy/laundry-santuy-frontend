import type { LucideIcon } from "lucide-react";

export type HistoryPageStatus = "loading" | "error" | "empty" | "ready";

export type HistoryOrderStatus =
  | "Selesai"
  | "Siap Diambil"
  | "Diproses"
  | "Dibatalkan";

export type HistoryFilter = "Semua" | HistoryOrderStatus;

export type HistoryPaymentStatus = "Lunas" | "Menunggu" | "Refund";

export type HistoryOrderItem = {
  name: string;
  quantity: string;
  price: string;
};

export type HistoryOrder = {
  id: string;
  service: string;
  status: HistoryOrderStatus;
  date: string;
  time: string;
  weight: string;
  total: string;
  subtotal: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: HistoryPaymentStatus;
  outlet: string;
  address: string;
  courier: string;
  rating?: number;
  note: string;
  items: HistoryOrderItem[];
};

export type HistoryMetric = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};
