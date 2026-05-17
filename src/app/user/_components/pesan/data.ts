import {
  BadgePercent,
  Banknote,
  Building2,
  CreditCard,
  Home,
  Leaf,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import type {
  AddOnOption,
  AddressOption,
  PaymentOption,
  PickupSlot,
} from "./types";

export const pickupSlots: PickupSlot[] = [
  {
    id: "today-afternoon",
    day: "Hari ini",
    date: "28 Apr",
    window: "14.00 - 16.00",
    capacity: "3 slot tersisa",
    recommended: true,
  },
  {
    id: "today-evening",
    day: "Hari ini",
    date: "28 Apr",
    window: "18.00 - 20.00",
    capacity: "5 slot tersisa",
  },
  {
    id: "tomorrow-morning",
    day: "Besok",
    date: "29 Apr",
    window: "09.00 - 11.00",
    capacity: "8 slot tersisa",
  },
];

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
    id: "e-wallet",
    label: "E-wallet",
    description: "Bayar setelah berat final dikonfirmasi.",
    icon: Wallet,
  },
  {
    id: "bank-card",
    label: "Kartu",
    description: "Debit atau kartu kredit.",
    icon: CreditCard,
  },
  {
    id: "cash",
    label: "Tunai",
    description: "Bayar ke kurir saat pickup.",
    icon: Banknote,
  },
];
