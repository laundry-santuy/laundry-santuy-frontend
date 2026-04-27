"use client";

import { cn } from "@/lib/utils";
import { Bell, Menu, Moon, Shirt, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("odong-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export function UserTopNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const scrolledRef = useRef(false);

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
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      return nextTheme;
    });
  };

  const ThemeIcon = theme === "dark" ? Sun : Moon;

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
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
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
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md transition duration-300 hover:border-primary-100 hover:text-primary-600"
          >
            <Bell className="size-4" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary-500" />
          </button>
          <Link
            href="/auth/login/user"
            className="text-sm font-medium text-primary-600 transition duration-300 hover:text-primary-700"
          >
            Login
          </Link>
          <Link
            href="/auth/daftar/user"
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)] transition duration-300 hover:bg-primary-700"
          >
            Masuk
          </Link>
        </div>

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
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex size-10 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_3px_8px_rgba(25,28,29,0.06)] backdrop-blur-md"
          >
            <Bell className="size-4" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary-500" />
          </button>
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
            <Link
              href="/auth/login/user"
              onClick={() => setOpen(false)}
              className="rounded-full border border-primary-100 px-4 py-3 text-center text-sm font-semibold text-primary-600"
            >
              Login
            </Link>
            <Link
              href="/auth/daftar/user"
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)]"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
