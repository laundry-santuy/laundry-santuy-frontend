"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  LogOut,
  Menu,
  ShieldCheck,
  Shirt,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNavItems } from "./data";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminBrand() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-3 rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_14px_28px_rgba(0,88,202,0.22)]">
        <Shirt className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-extrabold text-[var(--odong-text)]">
          Laundry Santuy
        </span>
        <span className="block text-xs font-semibold text-[var(--odong-muted)]">
          Panel Admin
        </span>
      </span>
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[var(--odong-page-bg)] text-[var(--odong-text)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[296px] border-r border-[var(--odong-nav-border)] bg-[var(--odong-nav-bg)] px-5 py-6 shadow-[18px_0_50px_rgba(25,28,29,0.05)] backdrop-blur-xl lg:flex lg:flex-col">
        <AdminBrand />

        <nav className="mt-8 space-y-2" aria-label="Menu admin">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold text-[var(--odong-muted)] transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                  active &&
                    "bg-primary-600 text-white shadow-[0_14px_28px_rgba(0,88,202,0.22)] hover:bg-primary-700 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-primary-100 bg-primary-50/75 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--odong-surface-strong)] text-primary-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[var(--odong-text)]">
                Admin aktif
              </p>
              <p className="text-xs font-semibold text-[var(--odong-muted)]">
                Semua kontrol tersedia
              </p>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-[var(--odong-nav-border)] bg-[var(--odong-nav-bg)] px-4 py-3 shadow-[0_10px_30px_rgba(25,28,29,0.05)] backdrop-blur-xl lg:left-[296px] lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label={mobileOpen ? "Tutup menu admin" : "Buka menu admin"}
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <AdminBrand />
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-bold text-[var(--odong-muted)]">
              Dashboard admin
            </p>
            <h1 className="text-xl font-extrabold text-[var(--odong-text)]">
              Kontrol operasional laundry
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifikasi admin"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link
              href="/admin/profil"
              aria-label="Profil admin"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/auth/login/admin"
              className="hidden h-11 items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/80 px-4 text-sm font-extrabold text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </Link>
          </div>
        </div>

        {mobileOpen ? (
          <nav className="mt-3 grid gap-2 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-nav-bg)] p-2 shadow-[0_14px_34px_rgba(25,28,29,0.08)] backdrop-blur-xl lg:hidden">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold text-[var(--odong-muted)] transition hover:bg-primary-50 hover:text-primary-700",
                    active &&
                      "bg-primary-600 text-white hover:bg-primary-700 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>

      <main className="px-4 pb-8 pt-24 sm:px-6 lg:pl-[320px] lg:pr-8">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
