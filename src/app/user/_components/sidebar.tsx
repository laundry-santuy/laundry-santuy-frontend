"use client";
import {
  Home,
  MapPin,
  MessageSquare,
  History,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export function UserSidebar() {
  return (
    <Sidebar
      appName="Laundry Santuy"
      appInitial="LS"
      accentColor="primary"
      navItems={[
        { id: "beranda", label: "Beranda", href: "/user/beranda", icon: Home },
        {
          id: "pesan",
          label: "Pesan",
          href: "/user/pesan",
          icon: MessageSquare,
        },
        {
          id: "lacak",
          label: "Lacak Pesanan",
          href: "/user/lacak",
          icon: MapPin,
        },
        {
          id: "riwayat",
          label: "Riwayat",
          href: "/user/riwayat",
          icon: History,
        },
      ]}
      bottomItems={[
        {
          id: "pengaturan",
          label: "Pengaturan",
          href: "/user/pengaturan",
          icon: Settings,
        },
        {
          id: "bantuan",
          label: "Bantuan",
          href: "/user/bantuan",
          icon: HelpCircle,
        },
      ]}
      user={{
        name: "Budi Santoso",
        role: "Pelanggan",
        initials: "BS",
      }}
    />
  );
}
