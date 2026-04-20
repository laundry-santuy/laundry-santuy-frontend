"use client";

import { cn } from "@/lib/utils";
import { Bell, Search, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

type TopbarProps = {
  accentColor?: "primary" | "secondary" | "tertiary";
};

const colorMap = {
  primary: { search: "focus-within:border-primary-400" },
  secondary: { search: "focus-within:border-secondary-400" },
  tertiary: { search: "focus-within:border-tertiary-400" },
};

// Map path segments to readable labels
const pageLabelMap: Record<string, string> = {
  beranda: "Beranda",
  pesan: "Pesan",
  lacak: "Lacak Pesanan",
  riwayat: "Riwayat",
  pengaturan: "Pengaturan",
  bantuan: "Bantuan",
  profil: "Profil",
};

import { mainNav, prefNav } from "@/app/user/_components/sidebar";

export function Topbar({ accentColor = "primary" }: TopbarProps) {
  const colors = colorMap[accentColor];
  const pathname = usePathname();

  // Find which section the current path belongs to
  let parentLabel = "Menu";
  let pageLabel = "Beranda";

  const mainMatch = mainNav.find((item) => item.href === pathname);
  const prefMatch = prefNav.find((item) => item.href === pathname);

  if (mainMatch) {
    parentLabel = "Menu";
    pageLabel = mainMatch.label;
  } else if (prefMatch) {
    parentLabel = "Preferensi";
    pageLabel = prefMatch.label;
  } else {
    // Fallback based on pathname if not in sidebar arrays
    const segments = pathname.split("/").filter(Boolean);
    const pageSegment = segments[segments.length - 1] || "beranda";
    pageLabel = pageLabelMap[pageSegment] || pageSegment;
  }

  return (
    <header className="py-[14px] bg-white border-b border-neutral-100 flex items-center px-4 sm:px-6 gap-4">
      {/* Sidebar trigger */}
      <SidebarTrigger className="shrink-0" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm shrink-0 uppercase tracking-widest text-[10px]">
        <span className="font-semibold text-neutral-400">
          {parentLabel}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-bold text-neutral-900">{pageLabel}</span>
      </nav>

      {/* Search (center, expanded) */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div
          className={cn(
            "flex items-center gap-2 w-full bg-neutral-50 rounded-xl px-3 py-2.5 transition-colors",
            colors.search,
          )}
        >
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari Layanan..."
            className="bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Notification */}
      <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors relative shrink-0">
        <Bell className="w-4 h-4 text-neutral-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Auth buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="px-5 py-2 rounded-lg border border-primary-500 text-primary-500 text-sm font-semibold hover:bg-primary-50 transition-colors">
          Masuk
        </button>
        <button className="px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
          Daftar
        </button>
      </div>
    </header>
  );
}
