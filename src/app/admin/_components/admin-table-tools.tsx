"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "./admin-page";

const iconToneClass = {
  neutral:
    "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:bg-primary-50",
  primary:
    "border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100",
  danger: "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
} as const;

export function AdminIconButton({
  icon: Icon,
  label,
  tone = "neutral",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  tone?: keyof typeof iconToneClass;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        iconToneClass[tone],
        className,
      )}
      {...props}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

type AdminPaginationBarProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function AdminPaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: AdminPaginationBarProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "mt-5 flex flex-col gap-3 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-sm font-extrabold text-[var(--odong-text)]">
          Menampilkan {start}-{end} dari {totalItems}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--odong-muted)]">
          {pageSize} data per halaman
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(safePage - 1, 1))}
          disabled={safePage <= 1}
          className={adminSecondaryButtonClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Sebelumnya
        </button>

        <span className="inline-flex h-11 items-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 text-sm font-extrabold text-[var(--odong-text)]">
          Halaman {safePage}/{safeTotalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safePage + 1, safeTotalPages))}
          disabled={safePage >= safeTotalPages}
          className={adminPrimaryButtonClass}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

type AdminActionBarProps = {
  children: ReactNode;
  className?: string;
};

export function AdminActionBar({ children, className }: AdminActionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}
