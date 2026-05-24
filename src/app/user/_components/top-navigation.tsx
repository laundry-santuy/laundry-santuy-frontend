"use client";

import { cn } from "@/lib/utils";
import { Bell, Loader2, LogOut, Menu, Moon, Package, Shirt, Sun, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchBeranda, formatWaktu, mapBeStatus, type BerandaResponse } from "@/lib/user-api";

const navItems = [
  { label: "Beranda", href: "/user/beranda" },
  { label: "Order", href: "/user/pesan" },
  { label: "Lacak", href: "/user/lacak" },
  { label: "Riwayat", href: "/user/riwayat" },
];

type ThemeMode = "light" | "dark";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function decodeToken(token: string | null): { usn?: string; role?: string } | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getInitials(usn: string): string {
  const parts = usn.trim().split(/[\s._@]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return usn.substring(0, 2).toUpperCase();
}

function NotifButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [data, setData] = useState<BerandaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || data) return;
    setLoading(true);
    fetchBeranda()
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open, data]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const hasUnread = !seen && Boolean(data?.ringkasan?.pesananAktif);
  const recents = data?.pesananTerbaru ?? [];

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) setSeen(true);
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        aria-label="Notifikasi"
        aria-expanded={open}
        onClick={handleToggle}
        className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Bell className="size-4" aria-hidden="true" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(320px,calc(100vw-32px))] rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-nav-bg)] p-4 shadow-[0_14px_34px_rgba(25,28,29,0.14)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-[var(--odong-text)]">Notifikasi</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup notifikasi"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] transition hover:text-[var(--odong-text)]"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            </div>
          ) : recents.length === 0 ? (
            <div className="py-6 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-primary-200" aria-hidden="true" />
              <p className="text-sm text-[var(--odong-muted)]">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recents.slice(0, 5).map((item) => {
                const mappedStatus = mapBeStatus(item.status);
                const isDone = mappedStatus === "Selesai" || mappedStatus === "Dibatalkan";
                return (
                  <Link
                    key={item.id_pesanan}
                    href="/user/riwayat"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-[var(--odong-surface-strong)]"
                  >
                    <span className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      isDone ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600",
                    )}>
                      <Package className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-[var(--odong-text)]">{item.namaLayanan}</p>
                      <p className="text-[11px] font-semibold text-[var(--odong-muted)]">{item.kodePesanan} · {mappedStatus}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--odong-muted)]">{formatWaktu(item.waktu)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Link
            href="/user/riwayat"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-xl border border-primary-100 bg-primary-50 py-2 text-center text-xs font-bold text-primary-700 transition hover:bg-primary-100"
          >
            Lihat semua riwayat
          </Link>
        </div>
      )}
    </div>
  );
}

export function UserTopNavigation() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme]     = useState<ThemeMode>("light");
  const [userUsn, setUserUsn] = useState<string | null>(null);
  const scrolledRef = useRef(false);
  const profileActive = isActivePath(pathname, "/user/profil");

  // Read theme from localStorage after hydration (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("odong-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || stored === "light") setTheme(stored);
    else if (prefersDark) setTheme("dark");
  }, []);

  // Read auth token
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const decoded = decodeToken(token);
    if (decoded?.usn) setUserUsn(decoded.usn);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("odong-theme", theme);
  }, [theme]);

  useEffect(() => {
    let frame = 0;
    const updateScrolled = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.scrollY > 24;
        if (next !== scrolledRef.current) {
          scrolledRef.current = next;
          setScrolled(next);
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
    const root = document.documentElement;
    root.classList.add("odong-theme-transition");
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    window.setTimeout(() => root.classList.remove("odong-theme-transition"), 400);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserUsn(null);
    router.push("/auth/login");
  };

  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const isLoggedIn = Boolean(userUsn);
  const initials   = userUsn ? getInitials(userUsn) : null;

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
          href="/user/beranda"
          className="flex shrink-0 items-center gap-2.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white">
            <Shirt className="size-4" />
          </span>
          <span className="text-[17px] font-semibold leading-none text-[var(--odong-text)]">
            Laundry Santuy
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
                  "text-sm font-medium transition-colors duration-300 hover:text-primary-600",
                  active ? "text-primary-600" : "text-[var(--odong-muted)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-4 transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex">
          <button
            type="button"
            aria-label={theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"}
            onClick={toggleTheme}
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ThemeIcon className="size-4" aria-hidden="true" />
          </button>

          <NotifButton />

          <Link
            href="/user/profil"
            aria-label="Profil"
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full border text-xs font-bold shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300",
              profileActive
                ? "border-primary-100 bg-primary-50 text-primary-600"
                : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:border-primary-100 hover:text-primary-600",
            )}
          >
            {initials ?? <UserRound className="size-4" />}
          </Link>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--odong-muted)] transition duration-300 hover:text-red-600"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Keluar
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary-600 transition duration-300 hover:text-primary-700"
              >
                Login
              </Link>
              <Link
                href="/auth/daftar"
                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)] transition duration-300 hover:bg-primary-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label={theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"}
            onClick={toggleTheme}
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            <ThemeIcon className="size-4" aria-hidden="true" />
          </button>

          <NotifButton />

          <Link
            href="/user/profil"
            aria-label="Profil"
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full border text-xs font-bold shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300",
              profileActive
                ? "border-primary-100 bg-primary-50 text-primary-600"
                : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:border-primary-100 hover:text-primary-600",
            )}
          >
            {initials ?? <UserRound className="size-4" />}
          </Link>

          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-nav-bg)] p-3 shadow-[0_14px_34px_rgba(25,28,29,0.10)] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
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
                className="col-span-2 rounded-full border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700"
              >
                Keluar
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
                  href="/auth/daftar"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)]"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
