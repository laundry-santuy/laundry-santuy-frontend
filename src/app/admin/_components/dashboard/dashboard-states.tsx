import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Inbox,
  LoaderCircle,
  PackageCheck,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("rounded-full bg-[var(--odong-surface-muted)]", className)}
    />
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
        <div className="animate-pulse rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-6 shadow-[0_18px_48px_rgba(25,28,29,0.06)] md:p-8">
          <SkeletonLine className="h-8 w-44 bg-primary-100/70" />
          <div className="mt-6 space-y-3">
            <SkeletonLine className="h-10 w-full max-w-xl" />
            <SkeletonLine className="h-10 w-full max-w-md" />
          </div>
          <div className="mt-6 space-y-2">
            <SkeletonLine className="h-4 w-full max-w-lg" />
            <SkeletonLine className="h-4 w-full max-w-md" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--odong-border)] bg-primary-50/60 p-4"
              >
                <SkeletonLine className="h-5 w-16 bg-primary-100" />
                <SkeletonLine className="mt-3 h-3 w-24 bg-primary-100/70" />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-6 shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-36 bg-primary-100/70" />
              <SkeletonLine className="h-7 w-44 bg-primary-100" />
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-200">
              <LoaderCircle className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-6 divide-y divide-[var(--odong-border)]">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-4">
                <SkeletonLine className="h-4 w-32 bg-primary-100/70" />
                <SkeletonLine className="h-6 w-20 bg-primary-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
        <div className="grid divide-y divide-[var(--odong-border)] md:grid-cols-2 md:divide-y-0 xl:grid-cols-4 xl:divide-x">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <SkeletonLine className="h-4 w-28" />
                  <SkeletonLine className="h-8 w-24" />
                </div>
                <SkeletonLine className="h-12 w-12 rounded-2xl bg-primary-50" />
              </div>
              <SkeletonLine className="mt-5 h-3 w-36" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-[430px] animate-pulse rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-6 shadow-[0_18px_48px_rgba(25,28,29,0.06)]"
          >
            <SkeletonLine className="h-11 w-56" />
            <div className="mt-8 h-[300px] rounded-[28px] bg-primary-50/55" />
          </div>
        ))}
      </section>
    </div>
  );
}

function DashboardState({
  title,
  description,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "danger";
}) {
  const iconClass =
    tone === "danger"
      ? "bg-rose-50 text-rose-600"
      : "bg-primary-50 text-primary-600";

  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-6 shadow-[0_18px_48px_rgba(25,28,29,0.06)] md:p-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="max-w-[65ch]">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-normal text-[var(--odong-text)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <Link
            href="/admin/manajemen/pesanan"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(0,88,202,0.2)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            Cek pesanan
          </Link>
          <Link
            href="/admin/manajemen/pengguna"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] px-4 text-sm font-extrabold text-primary-700 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Kelola user
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DashboardEmptyState() {
  return (
    <DashboardState
      title="Belum ada ringkasan operasional"
      description="Data dashboard akan muncul setelah pesanan, pelanggan, dan outlet mulai tersinkron. Gunakan panel manajemen untuk mengecek data awal."
      icon={Inbox}
    />
  );
}

export function DashboardErrorState() {
  return (
    <DashboardState
      title="Dashboard belum bisa dimuat"
      description="Ada masalah saat membaca ringkasan operasional. Cek koneksi backend atau buka panel pesanan untuk melihat data mentahnya."
      icon={AlertTriangle}
      tone="danger"
    />
  );
}
