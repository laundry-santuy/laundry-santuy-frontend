import {
  BadgePercent,
  Banknote,
  Building2,
  Clock,
  CreditCard,
  Home,
  Leaf,
  Package,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import type {
  AddOnOption,
  AddressOption,
  PaymentOption,
  PickupSlot,
  ServiceOption,
} from "./types";

export const serviceOptions: ServiceOption[] = [
  {
    id: "wash-fold",
    name: "Cuci Kiloan",
    description: "Pakaian harian dicuci bersih, dikeringkan, lalu dilipat rapi.",
    price: 7000,
    unit: "kg",
    eta: "2-3 hari",
    badge: "Hemat",
    minQuantity: 1,
    maxQuantity: 12,
    step: 0.5,
    icon: Shirt,
  },
  {
    id: "wash-iron",
    name: "Cuci + Setrika",
    description: "Paket favorit untuk pakaian siap pakai dan langsung masuk lemari.",
    price: 10000,
    unit: "kg",
    eta: "2 hari",
    badge: "Favorit",
    minQuantity: 1,
    maxQuantity: 12,
    step: 0.5,
    icon: Sparkles,
  },
  {
    id: "express",
    name: "Express",
    description: "Laundry prioritas untuk kebutuhan mendadak di hari yang sama.",
    price: 18000,
    unit: "kg",
    eta: "6-12 jam",
    badge: "Cepat",
    minQuantity: 1,
    maxQuantity: 8,
    step: 0.5,
    icon: Clock,
  },
  {
    id: "bedding",
    name: "Bedding Care",
    description: "Perawatan untuk seprai, bed cover, selimut, dan bahan besar.",
    price: 25000,
    unit: "item",
    eta: "2-3 hari",
    badge: "Higienis",
    minQuantity: 1,
    maxQuantity: 6,
    step: 1,
    icon: Package,
  },
];

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
