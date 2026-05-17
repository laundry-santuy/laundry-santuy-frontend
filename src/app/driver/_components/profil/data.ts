import {
  BadgeCheck,
  Bell,
  Bike,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Star,
  UsersRound,
  UserRound,
} from "lucide-react";
import { driverProfile } from "../data";
import type {
  DriverProfileActivity,
  DriverProfileField,
  DriverProfileStat,
} from "./types";

export const driverProfileDetail = {
  ...driverProfile,
  email: "jokokurir@gmail.com",
  phone: "0812-3456-7890",
  address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
  vehicleType: "Motor",
  plateNumber: "B 1234 XYZ",
  reviews: "234",
  totalOrders: "567",
  totalRevenue: "Rp 12.8 Juta",
  activeCustomers: "856",
  serviceZone: "Jakarta Selatan",
  onlineStatus: "Online",
};

export const driverAccountFields: DriverProfileField[] = [
  {
    label: "Nama Akun",
    value: driverProfileDetail.name,
    icon: UserRound,
    fullWidth: true,
  },
  {
    label: "Email",
    value: driverProfileDetail.email,
    icon: Mail,
  },
  {
    label: "Nomor Telepon",
    value: driverProfileDetail.phone,
    icon: Phone,
  },
  {
    label: "Alamat",
    value: driverProfileDetail.address,
    icon: MapPin,
    fullWidth: true,
  },
  {
    label: "Jenis Kendaraan",
    value: driverProfileDetail.vehicleType,
    icon: Bike,
  },
  {
    label: "Plat Nomor",
    value: driverProfileDetail.plateNumber,
    icon: BadgeCheck,
  },
];

export const driverProfileStats: DriverProfileStat[] = [
  {
    label: "Total Pesanan",
    value: driverProfileDetail.totalOrders,
    description: "+8.2% bulan ini",
    icon: PackageCheck,
    tone: "primary",
  },
  {
    label: "Total Pendapatan",
    value: driverProfileDetail.totalRevenue,
    description: "+12.5% bulan ini",
    icon: CircleDollarSign,
    tone: "emerald",
  },
  {
    label: "Pelanggan Aktif",
    value: driverProfileDetail.activeCustomers,
    description: "+15.3% bulan ini",
    icon: UsersRound,
    tone: "tertiary",
  },
];

export const driverRecentActivities: DriverProfileActivity[] = [
  {
    id: "activity-1",
    title: "Pesanan #LS-2026-0455 selesai diantar",
    time: "30 menit lalu",
    icon: CheckCircle2,
    rightValue: "Rp 12.000",
    rightCaption: "Selesai",
    tone: "success",
  },
  {
    id: "activity-2",
    title: "Mendapat rating 5.0 dari Dewi Kartika",
    time: "1 jam lalu",
    icon: Star,
    rightValue: "5.0",
    rightCaption: "Rating",
    tone: "warning",
  },
  {
    id: "activity-3",
    title: "Pesanan #LS-2026-0453 selesai diantar",
    time: "2 jam lalu",
    icon: CheckCircle2,
    rightValue: "Rp 48.000",
    rightCaption: "Selesai",
    tone: "success",
  },
];

export const driverProfileSignals = [
  {
    label: "Status",
    value: driverProfileDetail.onlineStatus,
    icon: Bell,
  },
  {
    label: "Rating",
    value: driverProfile.rating,
    icon: Star,
  },
  {
    label: "Zona layanan",
    value: driverProfileDetail.serviceZone,
    icon: MapPin,
  },
  {
    label: "Ulasan",
    value: driverProfileDetail.reviews,
    icon: Clock3,
  },
] as const;
