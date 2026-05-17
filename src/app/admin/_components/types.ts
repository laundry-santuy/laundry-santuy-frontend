import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminStat = {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "rose";
};

export type RevenuePoint = {
  month: string;
  value: number;
};

export type OrderStatusSlice = {
  label: string;
  value: number;
  color: string;
};

export type OutletPerformance = {
  rank: number;
  name: string;
  orders: number;
  revenue: string;
};

export type AdminActivity = {
  id: string;
  title: string;
  time: string;
  tone: "danger" | "success" | "warning";
};

export type AdminUserRole = "Admin" | "Kurir" | "Pelanggan";
export type AdminUserStatus = "Aktif" | "Nonaktif";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
};

export type AdminOrderStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Cancelled";

export type AdminOrder = {
  id: string;
  customer: string;
  outlet: string;
  service: string;
  total: string;
  status: AdminOrderStatus;
  createdAt: string;
};

export type AdminSettingValues = {
  businessName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  openTime: string;
  closeTime: string;
  headquartersAddress: string;
  defaultOutlet: string;
  outletAddress: string;
  pickupRadiusKm: string;
  dailyCapacityKg: string;
  pricePerKg: string;
  expressSurcharge: string;
  minimumOrder: string;
  promoCode: string;
  promoDiscount: string;
  promoEnabled: boolean;
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  opsEmail: string;
  dailySummaryEmail: boolean;
  twoFactorRequired: boolean;
  sessionTimeoutMinutes: string;
  loginAttemptLimit: string;
  autoAssignCourier: boolean;
  codEnabled: boolean;
  pickupDeliveryEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  liveTrackingEnabled: boolean;
  pushNotificationsEnabled: boolean;
  multiLanguageEnabled: boolean;
};

export type AdminProfileValues = {
  name: string;
  email: string;
  role: string;
  outlet: string;
};
