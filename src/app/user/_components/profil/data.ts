import {
  BadgeCheck,
  Bell,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Gift,
  Home,
  KeyRound,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import type {
  PaymentMethod,
  ProfileActivity,
  ProfileAddress,
  ProfileMetric,
  ProfilePreference,
  SecurityItem,
  UserProfile,
} from "./types";

export const userProfile: UserProfile = {
  name: "Rhizal Rhomadon",
  initials: "RR",
  email: "rhizal@example.com",
  phone: "+62 812 3456 7890",
  gender: "Laki-laki",
  birthDate: "12 Agustus 2002",
  joinedAt: "Bergabung sejak Feb 2026",
  memberLevel: "Santuy Regular",
  profileCompletion: 92,
  favoriteService: "Cuci + Setrika",
  defaultOutlet: "Santuy Kemang",
};

export const profileMetrics: ProfileMetric[] = [
  {
    label: "Order selesai",
    value: "14",
    description: "Transaksi berhasil diterima.",
    icon: ReceiptText,
  },
  {
    label: "Poin Santuy",
    value: "860",
    description: "Bisa dipakai untuk voucher.",
    icon: Gift,
  },
  {
    label: "Rating kurir",
    value: "4.8",
    description: "Rata-rata pengalaman pickup.",
    icon: Star,
  },
  {
    label: "Alamat aktif",
    value: "2",
    description: "Tersimpan untuk pickup cepat.",
    icon: MapPin,
  },
];

export const profileAddresses: ProfileAddress[] = [
  {
    id: "home",
    label: "Rumah",
    address: "Jl. Melati Raya No. 24, Jakarta Selatan",
    note: "Patokan pagar putih, pickup lewat teras depan.",
    isPrimary: true,
    icon: Home,
  },
  {
    id: "campus",
    label: "Kampus",
    address: "Gedung Teknik, pintu lobby utama",
    note: "Kurir konfirmasi lewat chat sebelum sampai.",
    icon: MapPin,
  },
];

export const profilePreferences: ProfilePreference[] = [
  {
    id: "pickup",
    label: "Reminder pickup",
    description: "Notifikasi 30 menit sebelum jadwal kurir datang.",
    enabled: true,
    icon: Truck,
  },
  {
    id: "status",
    label: "Update status order",
    description: "Info saat cucian diterima, diproses, dan siap dikirim.",
    enabled: true,
    icon: Bell,
  },
  {
    id: "promo",
    label: "Promo personal",
    description: "Voucher dan paket hemat sesuai layanan favorit.",
    enabled: false,
    icon: Sparkles,
  },
  {
    id: "chat",
    label: "Chat kurir",
    description: "Izinkan kurir mengirim catatan pickup lewat aplikasi.",
    enabled: true,
    icon: MessageCircle,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "ewallet",
    name: "E-wallet",
    description: "OVO, DANA, dan GoPay tersambung.",
    status: "Utama",
    icon: Wallet,
  },
  {
    id: "card",
    name: "Kartu debit",
    description: "Visa berakhir 0248.",
    status: "Cadangan",
    icon: CreditCard,
  },
  {
    id: "cash",
    name: "Tunai",
    description: "Bayar langsung saat pakaian diterima.",
    status: "Aktif",
    icon: CircleDollarSign,
  },
];

export const securityItems: SecurityItem[] = [
  {
    id: "verified",
    label: "Email terverifikasi",
    description: "Akun sudah aman untuk pemulihan password.",
    status: "Aktif",
    icon: Mail,
  },
  {
    id: "phone",
    label: "Nomor HP utama",
    description: "Dipakai untuk konfirmasi pickup dan kurir.",
    status: "Terverifikasi",
    icon: Phone,
  },
  {
    id: "password",
    label: "Password",
    description: "Terakhir diperbarui 2 bulan lalu.",
    status: "Aman",
    icon: KeyRound,
  },
  {
    id: "device",
    label: "Perangkat masuk",
    description: "MacBook dan iPhone aktif minggu ini.",
    status: "2 perangkat",
    icon: Smartphone,
  },
];

export const profileActivities: ProfileActivity[] = [
  {
    id: "profile",
    title: "Profil diperbarui",
    description: "Nomor telepon utama dan alamat pickup disinkronkan.",
    time: "Hari ini",
    icon: UserRound,
  },
  {
    id: "payment",
    title: "Metode bayar aktif",
    description: "E-wallet dipilih sebagai pembayaran utama.",
    time: "Kemarin",
    icon: Wallet,
  },
  {
    id: "membership",
    title: "Poin bertambah",
    description: "Mendapat 80 poin dari order #LS-003.",
    time: "25 Feb 2026",
    icon: BadgeCheck,
  },
];

export const accountHealthItems = [
  {
    label: "Data pribadi",
    value: "Lengkap",
    icon: ShieldCheck,
  },
  {
    label: "Layanan favorit",
    value: userProfile.favoriteService,
    icon: Shirt,
  },
  {
    label: "Outlet utama",
    value: userProfile.defaultOutlet,
    icon: MapPin,
  },
  {
    label: "Jadwal favorit",
    value: "09.00 - 11.00",
    icon: CalendarClock,
  },
] as const;
