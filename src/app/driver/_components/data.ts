import {
  Bell,
  LayoutGrid,
  MapPinned,
  PackageCheck,
  UserRound,
} from "lucide-react";
import type {
  DriverIncomingOrder,
  DriverNavItem,
  DriverProfile,
} from "./types";

export const driverProfile: DriverProfile = {
  name: "Joko Kurir",
  role: "Kurir Kencang",
  initials: "JK",
  status: "Online",
  rating: "4.9",
};

export const driverNavItems: DriverNavItem[] = [
  {
    label: "Pesanan Masuk",
    href: "/driver/pesanan/masuk",
    icon: PackageCheck,
  },
  {
    label: "Pesanan Aktif",
    href: "/driver/pesanan/aktif",
    icon: LayoutGrid,
  },
  {
    label: "Profil",
    href: "/driver/profil",
    icon: UserRound,
  },
];

export const driverQuickStats = [
  { label: "Order aktif", value: "5", icon: LayoutGrid },
  { label: "Siap dijemput", value: "2", icon: Bell },
  { label: "Titik tujuan", value: "4", icon: MapPinned },
] as const;

export const driverIncomingOrders: DriverIncomingOrder[] = [
  {
    id: "LS-2026-0456",
    queueNumber: "#1",
    customerName: "Budi Santoso",
    customerInitials: "BS",
    phone: "0812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    pickupTime: "14:00",
    service: "Cuci Kering Setrika",
    estimatedWeight: "~5 kg",
    distance: "~2.5 km",
    estimatedPrice: "Rp 37.500",
    status: "incoming",
  },
  {
    id: "LS-2026-0457",
    queueNumber: "#2",
    customerName: "Siti Nurhaliza",
    customerInitials: "SN",
    phone: "0813-5678-9012",
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    pickupTime: "14:00",
    service: "Cuci Lipat",
    estimatedWeight: "~3 kg",
    distance: "~3.8 km",
    estimatedPrice: "Rp 21.000",
    status: "incoming",
  },
  {
    id: "LS-2026-0458",
    queueNumber: "#3",
    customerName: "Ahmad Fauzi",
    customerInitials: "AF",
    phone: "0812-1122-3344",
    address: "Jl. Dharmawangsa VIII, Jakarta Selatan",
    pickupTime: "15:15",
    service: "Express Wash",
    estimatedWeight: "~4 kg",
    distance: "~1.9 km",
    estimatedPrice: "Rp 44.000",
    status: "accepted",
  },
  {
    id: "LS-2026-0459",
    queueNumber: "#4",
    customerName: "Maya Putri",
    customerInitials: "MP",
    phone: "0815-7788-9900",
    address: "Jl. Melati Raya No. 8, Jakarta Selatan",
    pickupTime: "16:00",
    service: "Bedding Care",
    estimatedWeight: "~7 kg",
    distance: "~2.1 km",
    estimatedPrice: "Rp 58.000",
    status: "rejected",
  },
];

export const driverStatusLabels = {
  incoming: "Order Baru",
  accepted: "Diterima",
  rejected: "Ditolak",
} as const;
