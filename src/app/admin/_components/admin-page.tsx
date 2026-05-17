import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

type AdminMetricItem = {
  label: string;
  value: ReactNode;
  caption?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
};

type AdminPanelProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const metricToneClass = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
  muted: "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
} as const;

export const adminControlClass =
  "h-12 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:text-[var(--odong-muted-soft)] focus:border-primary-200 focus:bg-[var(--odong-surface-strong)] focus:ring-4 focus:ring-primary-100/70";

export const adminSelectClass = cn(adminControlClass, "appearance-none");

export const adminPrimaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-[#f8fbff] shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const adminSecondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] px-4 text-sm font-extrabold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const adminDangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 text-sm font-extrabold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[65ch]">
          <p className="inline-flex rounded-full border border-primary-100 bg-primary-50/80 px-3 py-1.5 text-xs font-extrabold text-primary-700">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-normal text-[var(--odong-text)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AdminMetricStrip({ items }: { items: AdminMetricItem[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone ?? "primary";

        return (
          <article
            key={item.label}
            className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--odong-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 break-words text-[28px] font-extrabold leading-[1.08] tracking-normal text-[var(--odong-text)]">
                  {item.value}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  metricToneClass[tone],
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            {item.caption ? (
              <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                {item.caption}
              </p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

export function AdminPanel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  contentClassName,
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-b border-[var(--odong-border)] pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50/85 text-primary-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-2xl font-extrabold leading-tight tracking-normal text-[var(--odong-text)]">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 max-w-[65ch] text-sm leading-6 text-[var(--odong-muted)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className={cn("pt-5", contentClassName)}>{children}</div>
    </section>
  );
}
