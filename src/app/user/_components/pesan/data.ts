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

function generatePickupSlots(): PickupSlot[] {
  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const todayStr    = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);
  const currentHour = now.getHours();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const capacityFor = (h: number) => {
    if (h <= 10) return "8 slot tersisa";
    if (h <= 12) return "5 slot tersisa";
    if (h <= 16) return "3 slot tersisa";
    return "6 slot tersisa";
  };

  const slots: PickupSlot[] = [];
  let firstTodaySet = false;

  for (let h = 8; h < 20; h++) {
    const window = `${pad(h)}.00 - ${pad(h + 1)}.00`;

    if (h > currentHour) {
      const recommended = !firstTodaySet;
      firstTodaySet = true;
      slots.push({
        id:       `today-${pad(h)}-${pad(h + 1)}`,
        day:      "Hari ini",
        date:     todayStr,
        window,
        capacity: capacityFor(h),
        ...(recommended ? { recommended: true } : {}),
      });
    }

    slots.push({
      id:       `tomorrow-${pad(h)}-${pad(h + 1)}`,
      day:      "Besok",
      date:     tomorrowStr,
      window,
      capacity: capacityFor(h),
    });
  }

  return slots;
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
