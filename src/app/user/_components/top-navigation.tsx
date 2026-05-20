"use client";

import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu, Moon, Shirt, Sun, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600"
          >
            <Bell className="size-4" />
          </button>

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

          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            <Bell className="size-4" />
          </button>

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
