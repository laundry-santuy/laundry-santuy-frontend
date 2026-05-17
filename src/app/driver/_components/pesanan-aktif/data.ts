import {
  ArrowRight,
  MapPinned,
  Shirt,
  Truck,
} from "lucide-react";
import type {
  DriverActiveOrder,
  DriverActiveProcessStage,
} from "../types";

export const activeProcessStages: {
  id: DriverActiveProcessStage;
  label: string;
  shortLabel: string;
  icon: typeof MapPinned;
}[] = [
  {
    id: "menuju-lokasi",
    label: "Menuju Lokasi",
    shortLabel: "Menuju",
    icon: MapPinned,
  },
  {
    id: "dijemput",
    label: "Dijemput",
    shortLabel: "Jemput",
    icon: Truck,
  },
  {
    id: "di-laundry",
    label: "Di Laundry",
    shortLabel: "Laundry",
    icon: Shirt,
  },
  {
    id: "diantar",
    label: "Diantar",
    shortLabel: "Antar",
    icon: ArrowRight,
  },
];

export const activeStageFilters = [
  "Semua",
  "Menuju Lokasi",
  "Dijemput",
  "Di Laundry",
  "Diantar",
] as const;

export const activeStageFilterMap: Record<
  Exclude<(typeof activeStageFilters)[number], "Semua">,
  DriverActiveProcessStage
> = {
  "Menuju Lokasi": "menuju-lokasi",
  Dijemput: "dijemput",
  "Di Laundry": "di-laundry",
  Diantar: "diantar",
};

export const activeOrders: DriverActiveOrder[] = [
  {
    id: "LS-2026-0456",
    queueNumber: "#1",
    customerName: "Dewi Kartika",
    customerInitials: "DK",
    phone: "0815-9876-5432",
    address: "Jl. Kemang Raya No. 67, Jakarta Selatan",
    service: "Cuci Kering Setrika",
    weight: "6 kg",
    totalPrice: "Rp 37.500",
    pickupTime: "14:00",
    currentStage: "menuju-lokasi",
    note: "Ambil dari lobby depan, keamanan sudah diinformasikan.",
  },
  {
    id: "LS-2026-0457",
    queueNumber: "#2",
    customerName: "Siti Nurhaliza",
    customerInitials: "SN",
    phone: "0813-5678-9012",
    address: "Jl. Panglima Polim No. 12, Jakarta Selatan",
    service: "Cuci Lipat",
    weight: "3 kg",
    totalPrice: "Rp 21.000",
    pickupTime: "14:30",
    currentStage: "menuju-lokasi",
    note: "Pelanggan menunggu di depan rumah, hubungi 5 menit sebelum tiba.",
  },
  {
    id: "LS-2026-0458",
    queueNumber: "#3",
    customerName: "Ahmad Fauzi",
    customerInitials: "AF",
    phone: "0812-1122-3344",
    address: "Jl. Dharmawangsa VIII, Jakarta Selatan",
    service: "Express Wash",
    weight: "4 kg",
    totalPrice: "Rp 44.000",
    pickupTime: "15:15",
    currentStage: "dijemput",
    note: "Tas laundry sudah diserahkan, lanjut ke outlet Kemang.",
  },
  {
    id: "LS-2026-0459",
    queueNumber: "#4",
    customerName: "Maya Putri",
    customerInitials: "MP",
    phone: "0815-7788-9900",
    address: "Jl. Melati Raya No. 8, Jakarta Selatan",
    service: "Bedding Care",
    weight: "7 kg",
    totalPrice: "Rp 58.000",
    pickupTime: "16:00",
    currentStage: "di-laundry",
    note: "Sedang diproses di area bedding, target selesai sore ini.",
  },
  {
    id: "LS-2026-0460",
    queueNumber: "#5",
    customerName: "Raka Pratama",
    customerInitials: "RP",
    phone: "0819-4455-6677",
    address: "Jl. Radio Dalam Raya No. 5, Jakarta Selatan",
    service: "Cuci Setrika",
    weight: "5 kg",
    totalPrice: "Rp 34.000",
    pickupTime: "17:00",
    currentStage: "diantar",
    note: "Order sudah selesai dan siap kembali ke pelanggan.",
  },
];

export const activeStageLabels = {
  "menuju-lokasi": "Menuju Lokasi",
  dijemput: "Dijemput",
  "di-laundry": "Di Laundry",
  diantar: "Diantar",
} as const;

export function getNextActiveStage(
  stage: DriverActiveProcessStage,
): DriverActiveProcessStage | null {
  const index = activeProcessStages.findIndex((item) => item.id === stage);

  return activeProcessStages[index + 1]?.id ?? null;
}
