"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, PackageCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileItems = [
  {
    label: "Masuk",
    href: "/driver/pesanan/masuk",
    icon: PackageCheck,
  },
  {
    label: "Aktif",
    href: "/driver/pesanan/aktif",
    icon: LayoutGrid,
  },
  {
    label: "Profil",
    href: "/driver/profil",
    icon: UserRound,
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DriverMobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi driver mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--odong-border)] bg-[var(--odong-nav-bg)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-[var(--odong-muted)] transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                active &&
                  "bg-primary-500 text-white shadow-[0_12px_24px_rgba(38,113,238,0.22)] hover:bg-primary-600 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
