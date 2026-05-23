import {
  BadgePercent,
  Banknote,
  Building2,
  Home,
  Leaf,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type {
  AddOnOption,
  AddressOption,
  PaymentOption,
  PickupSlot,
} from "./types";

export function generatePickupSlots(
  jamMulai: string | null = "08:00",
  jamSelesai: string | null = "20:00",
  sisaKapasitas: number = 20,
  maxKapasitas: number = 20,
): PickupSlot[] {
  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const todayStr    = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);
  const currentHour = now.getHours();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const startHour = jamMulai ? parseInt(jamMulai.split(":")[0], 10) : 8;
  const endHour   = jamSelesai ? parseInt(jamSelesai.split(":")[0], 10) : 20;

  const todaySlots: PickupSlot[] = [];
  const tomorrowSlots: PickupSlot[] = [];
  let firstTodaySet = false;

  for (let h = startHour; h < endHour; h++) {
    const window = `${pad(h)}.00-${pad(h + 1)}.00 WIB`;

    if (h > currentHour) {
      const recommended = !firstTodaySet;
      firstTodaySet = true;
      todaySlots.push({
        id:       `today-${pad(h)}-${pad(h + 1)}`,
        day:      "Hari ini",
        date:     todayStr,
        window,
        capacity: sisaKapasitas > 0 ? `${sisaKapasitas} slot tersisa` : "Penuh",
        ...(recommended ? { recommended: true } : {}),
      });
    }

    tomorrowSlots.push({
      id:       `tomorrow-${pad(h)}-${pad(h + 1)}`,
      day:      "Besok",
      date:     tomorrowStr,
      window,
      capacity: `${maxKapasitas} slot tersisa`,
    });
  }

  return [...todaySlots, ...tomorrowSlots];
}

export const pickupSlots: PickupSlot[] = generatePickupSlots();

export const addressOptions: AddressOption[] = [
  {
    id: "home",
    label: "Rumah",
    recipient: "Rhizal",
    address: "Jl. Melati Raya No. 24, Jakarta Selatan",
    note: "Titip ke satpam kalau belum di rumah.",
    icon: Home,
  },
  {
    id: "campus",
    label: "Kampus",
    recipient: "Rhizal",
    address: "Gedung Teknik, pintu lobby utama",
    note: "Hubungi saat kurir sudah sampai.",
    icon: Building2,
  },
];

export const addOnOptions: AddOnOption[] = [
  {
    id: "premium-fragrance",
    name: "Pewangi premium",
    description: "Aroma lebih tahan lama.",
    price: 3000,
    icon: Leaf,
  },
  {
    id: "stain-care",
    name: "Anti noda",
    description: "Treatment noda ringan.",
    price: 7000,
    icon: ShieldCheck,
  },
  {
    id: "reusable-bag",
    name: "Tas reusable",
    description: "Lebih aman untuk pickup berikutnya.",
    price: 12000,
    icon: Truck,
  },
  {
    id: "promo-lock",
    name: "Kunci promo",
    description: "Simpan kode SANTUY20.",
    price: 0,
    icon: BadgePercent,
  },
];

export const paymentOptions: PaymentOption[] = [
  {
    id: "cod",
    label: "COD",
    description: "Bayar tunai ke kurir saat pengiriman selesai.",
    icon: Banknote,
  },
  {
    id: "transfer_bank",
    label: "Transfer Bank",
    description: "Transfer manual ke rekening outlet setelah order dibuat.",
    icon: Building2,
  },
  {
    id: "qris",
    label: "QRIS Outlet",
    description: "Scan QRIS statis di outlet saat mengambil pakaian.",
    icon: QrCode,
  },
];
