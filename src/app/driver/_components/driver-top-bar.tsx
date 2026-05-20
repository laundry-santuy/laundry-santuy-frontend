"use client";

import { cn } from "@/lib/utils";
import { useDriverProfile } from "@/contexts/driver-profile-context";
import {
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  Moon,
  Shirt,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  fetchNotifikasi,
  formatWaktuRelatif,
  formatRupiah,
  type DriverNotifikasi,
} from "@/lib/driver-api";
import { driverNavItems } from "./data";

type ThemeMode = "light" | "dark";

const navItems = driverNavItems.filter((item) => item.href !== "/driver/profil");

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DriverAvatar({ initials }: { initials: string }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(0,88,202,0.22)]">
      {initials}
    </span>
  );
}

function NotifDropdown({ onClose }: { onClose: () => void }) {
  const [items, setItems]       = useState<DriverNotifikasi[]>([]);
  const [loading, setLoading]   = useState(true);
  const ref                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifikasi()
      .then((r) => setItems(r.notifikasi))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-3 w-80 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface)] shadow-[0_24px_58px_rgba(25,28,29,0.14)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--odong-border)]">
        <p className="text-sm font-extrabold text-[var(--odong-text)]">Notifikasi</p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-full text-[var(--odong-muted)] hover:text-[var(--odong-text)]"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-[var(--odong-surface-muted)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--odong-muted)]">
            Belum ada notifikasi.
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--odong-surface-muted)]"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                    item.tipe === "order_selesai"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-primary-50 text-primary-600",
                  )}
                >
                  {item.tipe === "order_selesai" ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : (
                    <Bell className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-5 text-[var(--odong-text)]">
                    {item.pesan}
                  </p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[var(--odong-muted)]">
                      {formatWaktuRelatif(item.waktu)}
                    </p>
                    {item.nominal > 0 && (
                      <p className="text-[11px] font-bold text-emerald-600">
                        {formatRupiah(item.nominal)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function DriverTopNavigation() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { data }   = useDriverProfile();

  const [open, setOpen]           = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [theme, setTheme]         = useState<ThemeMode>("light");
  const scrolledRef                = useRef(false);
  const profileActive              = isActivePath(pathname, "/driver/profil");

  useEffect(() => {
    const stored = localStorage.getItem("odong-theme") as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchNotifikasi()
      .then((r) => setHasUnread(r.notifikasi.length > 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("odong-theme", theme);
  }, [theme]);

  useEffect(() => {
    let frame = 0;

    const updateScrolled = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 24;

        if (nextScrolled !== scrolledRef.current) {
          scrolledRef.current = nextScrolled;
          setScrolled(nextScrolled);
        }
      });
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const ThemeIcon   = theme === "dark" ? Sun : Moon;
  const isLoggedIn  = !!data;
  const initials    = data?.profil.inisial ?? "";
  const driverName  = data?.profil.nama ?? "";

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-[top,padding,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        scrolled ? "top-4 px-4 sm:top-6" : "top-0 px-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-3 border transition-[max-width,min-height,border-radius,border-color,background-color,box-shadow,padding,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[max-width,border-radius,box-shadow]",
          scrolled
            ? "min-h-[60px] max-w-6xl rounded-full border-[var(--odong-nav-border)] bg-[var(--odong-nav-bg)] px-3.5 py-3.5 shadow-[0_14px_34px_rgba(25,28,29,0.10),0_4px_10px_rgba(25,28,29,0.06)] backdrop-blur-xl backdrop-saturate-150 sm:px-4"
            : "min-h-[76px] max-w-[100vw] rounded-none border-x-0 border-t-0 border-[var(--odong-nav-border)] bg-[var(--odong-nav-bg)] px-5 py-4 shadow-none backdrop-blur-lg backdrop-saturate-150 sm:px-8 lg:px-12",
        )}
      >
        <Link
          href="/driver/pesanan/masuk"
          className="flex shrink-0 items-center gap-2.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <Shirt className="size-4" />
          </span>
          <span className="text-[17px] font-semibold leading-none text-[var(--odong-text)]">
            Driver Panel
          </span>
        </Link>

        <nav className="hidden items-center gap-7 transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium text-neutral-600 transition-colors duration-300 hover:text-primary-600",
                  active && "text-primary-600",
                  !active && "text-[var(--odong-muted)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right section */}
        <div className="hidden shrink-0 items-center gap-4 transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex">
          <button
            type="button"
            aria-label={
              theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"
            }
            onClick={toggleTheme}
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ThemeIcon className="size-4" aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => { setNotifOpen((v) => !v); setHasUnread(false); }}
              className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600"
            >
              <Bell className="size-4" />
              {hasUnread && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary-500" />
              )}
            </button>
            {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} />}
          </div>
          <Link
            href="/driver/profil"
            aria-label="Profil"
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
              profileActive &&
                "border-primary-100 bg-primary-50 text-primary-600",
            )}
          >
            {isLoggedIn ? (
              <DriverAvatar initials={initials} />
            ) : (
              <UserRound className="size-4" aria-hidden="true" />
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <span className="max-w-[120px] truncate text-sm font-semibold text-[var(--odong-text)]">
                {driverName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition duration-300 hover:bg-red-50"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary-600 transition duration-300 hover:text-primary-700"
              >
                Login
              </Link>
              <Link
                href="/auth/daftar/driver"
                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)] transition duration-300 hover:bg-primary-700"
              >
                Masuk
              </Link>
            </>
          )}
        </div>

        {/* Mobile right section */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label={
              theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"
            }
            onClick={toggleTheme}
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            <ThemeIcon className="size-4" aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => { setNotifOpen((v) => !v); setHasUnread(false); }}
              className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
            >
              <Bell className="size-4" />
              {hasUnread && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary-500" />
              )}
            </button>
            {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} />}
          </div>
          <Link
            href="/driver/profil"
            aria-label="Profil"
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600",
              profileActive &&
                "border-primary-100 bg-primary-50 text-primary-600",
            )}
          >
            {isLoggedIn ? (
              <DriverAvatar initials={initials} />
            ) : (
              <UserRound className="size-4" aria-hidden="true" />
            )}
          </Link>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((value) => !value)}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-nav-bg)] p-3 shadow-[0_14px_34px_rgba(25,28,29,0.10)] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
          {isLoggedIn && (
            <div className="mb-3 flex items-center gap-3 rounded-full border border-primary-100 bg-primary-50/80 px-4 py-3">
              <DriverAvatar initials={initials} />
              <span className="flex-1 truncate text-sm font-extrabold text-[var(--odong-text)]">
                {driverName}
              </span>
            </div>
          )}
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-full px-4 py-3 text-sm font-medium text-[var(--odong-muted)] transition hover:bg-primary-50 hover:text-primary-600",
                    active && "bg-primary-50 text-primary-600",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-primary-100 px-4 py-3 text-center text-sm font-semibold text-primary-600"
                >
                  Login
                </Link>
                <Link
                  href="/auth/daftar/driver"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)]"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}