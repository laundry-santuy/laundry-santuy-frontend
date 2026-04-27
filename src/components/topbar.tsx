"use client";
import { cn } from "@/lib/utils";
import { Bell, Search } from "lucide-react";

type TopbarProps = {
  title: string;
  subtitle?: string;
  accentColor?: "primary" | "secondary" | "tertiary";
  user?: {
    name: string;
    role: string;
    initials: string;
  };
};

const colorMap = {
  primary: { search: "focus-within:border-primary-400" },
  secondary: { search: "focus-within:border-secondary-400" },
  tertiary: { search: "focus-within:border-tertiary-400" },
};

export function Topbar({
  title,
  accentColor = "primary",
}: TopbarProps) {
  const colors = colorMap[accentColor];

  return (
    <header className="py-[18px] bg-white border-b border-neutral-100 flex items-center px-[150px] gap-4">
      {/* Title */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
          {title}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div
        className={cn(
          "flex items-center gap-2 w-[30%] bg-neutral-50 rounded-lg px-3 py-2 transition-colors",
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

      {/* Bell */}
      <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors">
        <Bell className="w-4 h-4 text-neutral-600" />
      </button>
    </header>
  );
}