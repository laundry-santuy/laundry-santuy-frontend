"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  MapPin,
  MessageSquare,
  History,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export const mainNav = [
  { id: "beranda", label: "Beranda", href: "/user/beranda", icon: Home },
  { id: "pesan", label: "Pesan", href: "/user/pesan", icon: MessageSquare },
  { id: "lacak", label: "Lacak Pesanan", href: "/user/lacak", icon: MapPin },
  { id: "riwayat", label: "Riwayat", href: "/user/riwayat", icon: History },
];

export const prefNav = [
  { id: "pengaturan", label: "Pengaturan", href: "/user/pengaturan", icon: Settings },
  { id: "bantuan", label: "Bantuan", href: "/user/bantuan", icon: HelpCircle },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-100 bg-white">
      {/* ── Header / Logo ── */}
      <SidebarHeader className="p-0">
        <div className={cn(
          "flex items-center gap-3 border-b border-neutral-100",
          collapsed ? "justify-center px-2 py-[18px]" : "px-4 py-[18px]"
        )}>
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">LS</span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-sm text-neutral-900">Laundry</p>
              <p className="text-xs text-neutral-500">Santuy</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Main Navigation ── */}
      <SidebarContent className="p-0">
        {!collapsed && (
          <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-neutral-300 uppercase tracking-widest">
            Menu
          </p>
        )}
        <nav className="flex flex-col gap-1 px-2 py-2">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg text-sm transition-all duration-200",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-primary-100 text-primary-600 font-semibold border-l-4 border-primary-600"
                    : "text-neutral-600 hover:bg-primary-50 hover:text-primary-600"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-primary-600" : "text-current"
                )} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Preferences ── */}
        {!collapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-neutral-300 uppercase tracking-widest">
            Preferensi
          </p>
        )}
        {collapsed && <div className="mx-2 my-1 border-t border-neutral-100" />}
        <nav className="flex flex-col gap-1 px-2 py-2">
          {prefNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg text-sm transition-all duration-200",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-primary-100 text-primary-600 font-semibold border-l-4 border-primary-600"
                    : "text-neutral-600 hover:bg-primary-50 hover:text-primary-600"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-primary-600" : "text-current"
                )} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      {/* ── Footer / User Profile ── */}
      <SidebarFooter className="p-0">
        <div className="border-t border-neutral-100 p-3">
          <div className={cn(
            "flex items-center gap-3 px-2 py-2",
            collapsed && "justify-center px-0"
          )}>
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 text-xs font-bold">
              BS
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate leading-tight">
                  Budi Santoso
                </p>
                <p className="text-xs text-neutral-400 leading-tight">Pelanggan</p>
              </div>
            )}
          </div>
          <Link
            href="#"
            title="Logout"
            className={cn(
              "flex items-center gap-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-1",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
