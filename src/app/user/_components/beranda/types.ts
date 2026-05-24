import type { LucideIcon } from "lucide-react";

export type OrderStepStatus = "done" | "current" | "upcoming";

export type ActiveOrderStep = {
  label: string;
  icon: LucideIcon;
  status: OrderStepStatus;
};

export type CourierInfo = {
  name: string;
  rating: number;
  vehicle: string;
  distance: string;
  noTelepon: string | null;
};

export type ActiveOrder = {
  id: string;
  pesananId: string;
  service: string;
  weight: string;
  eta: string;
  metodePembayaran: string | null;
  statusPembayaran: string | null;
  steps: ActiveOrderStep[];
  courier: CourierInfo | null;
  courierInitials: string;
};

export type Reminder = {
  id: string;
  title: string;
  dueDate: string;
};

export type RecentOrderStatus = "Selesai" | "Siap Diambil" | "Diproses";

export type RecentOrder = {
  id: string;
  service: string;
  date: string;
  weight: string;
  status: RecentOrderStatus;
};

export type Promo = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  validUntil: string;
};
