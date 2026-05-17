"use client";

import { cn } from "@/lib/utils";
import { Bike, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { driverNavItems, driverProfile } from "./data";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DriverSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[292px] border-r border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-5 py-6 shadow-[18px_0_50px_rgba(25,28,29,0.05)] backdrop-blur-xl lg:block">
      <Link href="/driver/pesanan/masuk" className="flex items-center gap-4">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_16px_32px_rgba(0,88,202,0.24)]">
          <Bike className="h-7 w-7" aria-hidden="true" />
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900 ring-4 ring-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
        <span>
          <span className="block text-xl font-extrabold text-[var(--odong-text)]">
            Driver Panel
          </span>
          <span className="mt-1 block text-sm font-medium text-[var(--odong-muted)]">
            Laundry Santuy
          </span>
        </span>
      </Link>

      <nav className="mt-9 space-y-2" aria-label="Navigasi driver">
        {driverNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 items-center gap-4 rounded-2xl px-4 text-[15px] font-bold text-[var(--odong-muted)] transition duration-300 hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                active &&
                  "bg-primary-500 text-white shadow-[0_16px_28px_rgba(38,113,238,0.22)] hover:bg-primary-600 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-[28px] border border-primary-100 bg-primary-50/80 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-extrabold text-white">
            {driverProfile.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[var(--odong-text)]">
              {driverProfile.name}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-primary-700">
              {driverProfile.status} - Rating {driverProfile.rating}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
