import type { LucideIcon } from "lucide-react";

export type DriverNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DriverProfile = {
  name: string;
  role: string;
  initials: string;
  status: string;
  rating: string;
};

export type DriverOrderStatus = "incoming" | "accepted" | "rejected";

export type DriverOrderFilter = "Semua" | "Order Baru" | "Diterima" | "Ditolak";

export type DriverIncomingOrder = {
  id: string;
  queueNumber: string;
  customerName: string;
  customerInitials: string;
  phone: string;
  address: string;
  pickupTime: string;
  service: string;
  estimatedWeight: string;
  distance: string;
  estimatedPrice: string;
  status: DriverOrderStatus;
};

export type DriverPageStatus = "loading" | "error" | "empty" | "ready";

export type DriverActiveProcessStage =
  | "menuju-lokasi"
  | "dijemput"
  | "di-laundry"
  | "siap-diantar"
  | "diantar";

export type DriverActiveOrderFilter =
  | "Semua"
  | "Menuju Lokasi"
  | "Dijemput"
  | "Di Laundry"
  | "Siap Diantar"
  | "Diantar";

export type DriverActiveOrder = {
  id: string;
  queueNumber: string;
  customerName: string;
  customerInitials: string;
  phone: string;
  address: string;
  service: string;
  weight: string;
  totalPrice: string;
  pickupTime: string;
  currentStage: DriverActiveProcessStage;
  note: string;
};
