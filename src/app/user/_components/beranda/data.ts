import {
  CheckCircle2,
  Package,
  Shirt,
  Sparkles,
} from "lucide-react";
import type { ActiveOrder, RecentOrder, Reminder } from "./types";

export const activeOrder: ActiveOrder = {
  id: "#LS-004",
  pesananId: "mock-id",
  service: "Cuci + Setrika",
  weight: "2.5 kg",
  eta: "ETA: 2 jam",
  metodePembayaran: null,
  statusPembayaran: null,
  steps: [
    { label: "Diterima", icon: Package, status: "done" },
    { label: "Dicuci", icon: Package, status: "done" },
    { label: "Disetrika", icon: Shirt, status: "current" },
    { label: "Selesai", icon: CheckCircle2, status: "upcoming" },
  ],
  courier: {
    name: "Ahmad",
    rating: 4.8,
    vehicle: "Honda Beat B 1234 XY",
    distance: "Kurir ~1.2 km dari laundry",
    noTelepon: null,
  },
  courierInitials: "AH",
};

export const reminders: Reminder[] = [
  { id: "routine", title: "Laundry Rutin", dueDate: "Rabu, 23 Oktober 2025" },
  { id: "sheet", title: "Seprei", dueDate: "Selasa, 22 Oktober 2025" },
  { id: "work", title: "Pakaian Kerja", dueDate: "Minggu, 20 Oktober 2025" },
];

export const recentOrders: RecentOrder[] = [
  {
    id: "#LS-001",
    service: "Cuci + Setrika",
    date: "25 Feb 2026",
    weight: "3 kg",
    status: "Selesai",
  },
  {
    id: "#LS-002",
    service: "Express",
    date: "24 Feb 2026",
    weight: "1.5 kg",
    status: "Siap Diambil",
  },
  {
    id: "#LS-003",
    service: "Cuci + Setrika",
    date: "25 Feb 2026",
    weight: "3 kg",
    status: "Selesai",
  },
];

export const promoIcon = Sparkles;
