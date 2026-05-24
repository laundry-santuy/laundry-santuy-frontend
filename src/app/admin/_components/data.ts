import {
  ClipboardList,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Shirt,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type {
  AdminActivity,
  AdminNavItem,
  AdminOrder,
  AdminProfileValues,
  AdminSettingValues,
  AdminStat,
  AdminUser,
  OrderStatusSlice,
  OutletPerformance,
  RevenuePoint,
} from "./types";

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manajemen User",
    href: "/admin/manajemen/pengguna",
    icon: UsersRound,
  },
  {
    label: "Manajemen Pesanan",
    href: "/admin/manajemen/pesanan",
    icon: ClipboardList,
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
  },
  {
    label: "Profil",
    href: "/admin/profil",
    icon: UserRound,
  },
];

export const adminStats: AdminStat[] = [
  {
    label: "Pendapatan",
    value: "Rp 46,2 Jt",
    caption: "+12% dari bulan lalu",
    icon: WalletCards,
    tone: "blue",
  },
  {
    label: "Pesanan",
    value: "703",
    caption: "156 pesanan aktif",
    icon: PackageCheck,
    tone: "green",
  },
  {
    label: "Outlet",
    value: "8",
    caption: "5 outlet performa tinggi",
    icon: Shirt,
    tone: "amber",
  },
  {
    label: "Pertumbuhan",
    value: "18%",
    caption: "6 bulan terakhir",
    icon: TrendingUp,
    tone: "rose",
  },
];

export const revenueTrend: RevenuePoint[] = [
  { month: "Jan", value: 28000000 },
  { month: "Feb", value: 32000000 },
  { month: "Mar", value: 37000000 },
  { month: "Apr", value: 35000000 },
  { month: "May", value: 42000000 },
  { month: "Jun", value: 46000000 },
];

export const orderStatusDistribution: OrderStatusSlice[] = [
  { label: "Selesai", value: 70, color: "#16a34a" },
  { label: "Di Laundry", value: 17, color: "#f59e0b" },
  { label: "Siap Diantar", value: 10, color: "#0ea5e9" },
  { label: "Menunggu", value: 10, color: "#e11d48" },
  { label: "Dibatalkan", value: 3, color: "#64748b" },
];

export const topOutlets: OutletPerformance[] = [
  { rank: 1, name: "Outlet Sudirman", orders: 156, revenue: "Rp 12,5 Jt" },
  { rank: 2, name: "Outlet Gatot Subroto", orders: 134, revenue: "Rp 10,8 Jt" },
  { rank: 3, name: "Outlet Kemang", orders: 128, revenue: "Rp 9,7 Jt" },
  { rank: 4, name: "Outlet Senopati", orders: 98, revenue: "Rp 7,2 Jt" },
  { rank: 5, name: "Outlet Menteng", orders: 87, revenue: "Rp 6,5 Jt" },
];

export const adminActivities: AdminActivity[] = [
  {
    id: "activity-1",
    title: "Pesanan baru dari Budi Santoso",
    time: "2 menit lalu",
    tone: "danger",
  },
  {
    id: "activity-2",
    title: "Pembayaran berhasil #LS-2026-0432",
    time: "5 menit lalu",
    tone: "success",
  },
  {
    id: "activity-3",
    title: "Pelanggan baru mendaftar: Siti Nurhaliza",
    time: "12 menit lalu",
    tone: "success",
  },
  {
    id: "activity-4",
    title: "Pesanan #LS-2026-0431 selesai",
    time: "18 menit lalu",
    tone: "success",
  },
  {
    id: "activity-5",
    title: "Outlet Kemang mencapai kapasitas 90%",
    time: "25 menit lalu",
    tone: "warning",
  },
  {
    id: "activity-6",
    title: "Pesanan #LS-2026-0430 selesai",
    time: "31 menit lalu",
    tone: "success",
  },
];

export const adminUsers: AdminUser[] = [
  {
    id: "USR-001",
    name: "Rizal Admin",
    email: "rizal@laundrysantuy.id",
    role: "Admin",
    status: "Aktif",
    joinedAt: "11 Mei 2026",
  },
  {
    id: "USR-002",
    name: "Joko Kurir",
    email: "jokokurir@gmail.com",
    role: "Kurir",
    status: "Aktif",
    joinedAt: "10 Mei 2026",
  },
  {
    id: "USR-003",
    name: "Budi Santoso",
    email: "budi@mail.com",
    role: "Pelanggan",
    status: "Aktif",
    joinedAt: "9 Mei 2026",
  },
  {
    id: "USR-004",
    name: "Siti Nurhaliza",
    email: "siti@mail.com",
    role: "Pelanggan",
    status: "Nonaktif",
    joinedAt: "8 Mei 2026",
  },
  {
    id: "USR-005",
    name: "Maya Putri",
    email: "maya@mail.com",
    role: "Pelanggan",
    status: "Aktif",
    joinedAt: "7 Mei 2026",
  },
  {
    id: "USR-006",
    name: "Nadia Rahma",
    email: "nadia.rahma@livespace.id",
    role: "Pelanggan",
    status: "Aktif",
    joinedAt: "6 Mei 2026",
  },
  {
    id: "USR-007",
    name: "Arif Pratama",
    email: "arif.pratama@laundrysantuy.id",
    role: "Kurir",
    status: "Nonaktif",
    joinedAt: "5 Mei 2026",
  },
  {
    id: "USR-008",
    name: "Tania Permata",
    email: "tania.permata@lattice.id",
    role: "Pelanggan",
    status: "Aktif",
    joinedAt: "4 Mei 2026",
  },
  {
    id: "USR-009",
    name: "Raka Wirawan",
    email: "raka@laundrysantuy.id",
    role: "Admin",
    status: "Nonaktif",
    joinedAt: "3 Mei 2026",
  },
];

// adminOrders removed — orders are fetched from API via `fetchManajemenPesanan`

export const defaultAdminSettings: AdminSettingValues = {
  businessName: "Laundry Santuy",
  tagline: "Laundry cepat, bersih, dan terpercaya",
  supportEmail: "info@laundrysantuy.id",
  supportPhone: "021-5551234",
  openTime: "08:00",
  closeTime: "21:00",
  headquartersAddress: "Jl. Jenderal Sudirman Kav. 52, Jakarta Selatan",
  defaultOutlet: "Outlet Sudirman",
  outletAddress: "Jl. Jenderal Sudirman Kav. 52, Jakarta Selatan",
  outletLatitude: "-6.2088",
  outletLongitude: "106.8456",
  outletEmail: "outlet@laundrysantuy.id",
  outletPhone: "021-5550000",
  pickupRadiusKm: "4.5",
  dailyCapacityKg: "320",
  biayaAntarJemput: "8000",
  estimasiPickup: "2 jam",
  pricePerKg: "Rp 7.500",
  expressSurcharge: "35%",
  minimumOrder: "Rp 18.000",
  promoCode: "SANTUY12",
  promoDiscount: "12%",
  promoEnabled: true,
  senderName: "Laundry Santuy Ops",
  senderEmail: "ops@laundrysantuy.id",
  smtpHost: "smtp.laundrysantuy.id",
  opsEmail: "operasional@laundrysantuy.id",
  dailySummaryEmail: true,
  twoFactorRequired: true,
  sessionTimeoutMinutes: "45",
  loginAttemptLimit: "5",
  autoAssignCourier: true,
  codEnabled: true,
  pickupDeliveryEnabled: true,
  aiSuggestionsEnabled: true,
  liveTrackingEnabled: true,
  pushNotificationsEnabled: true,
  multiLanguageEnabled: true,
};

export const defaultAdminProfile: AdminProfileValues = {
  name: "Rizal Admin",
  email: "admin@laundrysantuy.id",
  role: "Owner",
  outlet: "Outlet Sudirman",
};
