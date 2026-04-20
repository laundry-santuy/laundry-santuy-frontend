"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LogOut, ChevronUp } from "lucide-react";
import { useState } from "react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isLogout?: boolean;
};

type SidebarProps = {
  appName?: string;
  appInitial?: string;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  accentColor?: "primary" | "secondary" | "tertiary";
  user?: {
    name: string;
    role: string;
    initials: string;
  };
};

const colorMap = {
  primary: {
    logo: "bg-primary-600",
    active:
      "bg-primary-100 text-primary-600 font-semibold border-l-4 border-primary-600",
    bar: "bg-primary-600",
    icon: "text-primary-600",
    hover: "hover:bg-primary-50 hover:text-primary-600",
    avatar: "bg-primary-100 text-primary-700",
  },
  secondary: {
    logo: "bg-secondary-600",
    active:
      "bg-secondary-100 text-secondary-600 font-semibold border-l-4 border-secondary-600",
    bar: "bg-secondary-600",
    icon: "text-secondary-600",
    hover: "hover:bg-secondary-50 hover:text-secondary-600",
    avatar: "bg-secondary-100 text-secondary-700",
  },
  tertiary: {
    logo: "bg-tertiary-500",
    active:
      "bg-tertiary-100 text-tertiary-600 font-semibold border-l-4 border-tertiary-500",
    bar: "bg-tertiary-500",
    icon: "text-tertiary-500",
    hover: "hover:bg-tertiary-50 hover:text-tertiary-600",
    avatar: "bg-tertiary-100 text-tertiary-700",
  },
};

function NavLink({
  item,
  isActive,
  colors,
}: {
  item: NavItem;
  isActive: boolean;
  colors: (typeof colorMap)[keyof typeof colorMap];
}) {
  const { href, label, icon: Icon, isLogout } = item;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
        isLogout
          ? "text-red-600 hover:bg-red-50 hover:text-red-700"
          : isActive
            ? colors.active
            : cn("text-neutral-600", colors.hover),
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          isActive && !isLogout ? colors.icon : "text-current",
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

function UserProfile({
  user,
  colors,
}: {
  user: NonNullable<SidebarProps["user"]>;
  colors: (typeof colorMap)[keyof typeof colorMap];
}) {
  return (
    <div className="border-t border-neutral-100 p-3">
      {/* User info */}
      <div className="flex items-center gap-3 px-2 py-2">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
            colors.avatar,
          )}
        >
          {user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate leading-tight">
            {user.name}
          </p>
          <p className="text-xs text-neutral-400 leading-tight">{user.role}</p>
        </div>
      </div>

      {/* Logout langsung di bawah */}
      <Link
        href="#"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        Logout
      </Link>
    </div>
  )
}

export function Sidebar({
  appName = "App",
  appInitial = "A",
  navItems,
  bottomItems,
  accentColor = "primary",
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const colors = colorMap[accentColor];

  return (
    <aside className="sticky left-0 top-0 w-64 h-screen bg-white flex flex-col z-40 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-neutral-100">
        <p className="px-4 font-normal text-lg text-neutral-300">PREFERENCES</p>

        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            colors.logo,
          )}
        >
          <span className="text-white font-bold text-sm">{appInitial}</span>
        </div>
        <div>
          <p className="font-bold text-sm text-neutral-900">
            {appName.split(" ")[0]}
          </p>
          <p className="text-xs text-neutral-500">{appName.split(" ")[1]}</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-3">

        {navItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={pathname === item.href}
            colors={colors}
          />
        ))}
      </nav>

      {/* Bottom Items */}
      {bottomItems && bottomItems.length > 0 && (
        <>
          <div className="mx-2" />
          <p className="px-4 font-normal text-lg text-neutral-300">PREFERENCES</p>
          <nav className="flex flex-col gap-1 px-2 py-3">
            {bottomItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={pathname === item.href}
                colors={colors}
              />
            ))}
          </nav>
        </>
      )}

      {/* User Profile */}
      {user && <UserProfile user={user} colors={colors} />}
    </aside>
  );
}
