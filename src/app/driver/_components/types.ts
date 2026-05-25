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
  kodePesanan: string;
  queueNumber: string;
  customerName: string;
  customerInitials: string;
  phone: string;
  address: string;
  outletName: string;
  outletAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  outletLat: number | null;
  outletLng: number | null;
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

export type DriverHistoryOrder = {
  id_pesanan: string;
  kodePesanan: string;
  customer: string;
  layanan: string;
  outlet: string;
  berat: string;
  total: string;
  status: "selesai" | "dibatalkan" | "ditolak";
  waktu: string;
  fotoBuktiUrl?: string | null;
};

export type DriverHistoryStats = {
  totalSelesai: number;
  totalDibatalkan: number;
  totalPendapatan: string;
};

export type DriverActiveOrder = {
  id: string;
  queueNumber: string;
  kodePesanan: string;
  customerName: string;
  customerInitials: string;
  phone: string;
  address: string;
  outletAddress: string;
  service: string;
  weight: string;
  totalPrice: string;
  pickupTime: string;
  currentStage: DriverActiveProcessStage;
  note: string;
  fotoBuktiUrl: string | null;
};
