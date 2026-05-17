import Link from "next/link";
import {
  ChevronRight,
  Clock3,
  LogOut,
  PencilLine,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { driverProfile } from "../data";
import {
  driverAccountFields,
  driverProfileDetail,
  driverProfileStats,
  driverRecentActivities,
} from "./data";
import {
  DriverProfileEmptyState,
  DriverProfileErrorState,
  DriverProfileLoadingState,
} from "./profile-states";
import type { DriverPageStatus } from "../types";

type DriverProfilePageProps = {
  status?: DriverPageStatus;
};

const statCardTone = {
  primary: {
    icon: "bg-primary-500 text-white",
    line: "text-primary-600",
  },
  emerald: {
    icon: "bg-emerald-500 text-white",
    line: "text-emerald-600",
  },
  tertiary: {
    icon: "bg-tertiary-500 text-white",
    line: "text-tertiary-600",
  },
} as const;

const activityTone = {
  success: {
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-[var(--odong-text)]",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    value: "text-[var(--odong-text)]",
  },
  primary: {
    icon: "bg-primary-50 text-primary-600",
    value: "text-[var(--odong-text)]",
  },
} as const;

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ReadonlyField({
  label,
  value,
  icon: Icon,
  fullWidth,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("space-y-2", fullWidth && "md:col-span-2")}>
      <p className="text-sm font-bold text-[var(--odong-text)]">{label}</p>
      <div className="relative rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 pr-12 shadow-[0_8px_18px_rgba(25,28,29,0.03)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-[var(--odong-text)] sm:text-base">
            {value}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Edit ${label}`}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary-100 bg-white/80 text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
        >
          <PencilLine className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: (typeof driverProfileStats)[number]) {
  return (
    <article className="rounded-[30px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--odong-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            statCardTone[tone].icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p
        className={cn(
          "mt-4 inline-flex items-center gap-2 text-sm font-bold",
          statCardTone[tone].line,
        )}
      >
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        {description}
      </p>
    </article>
  );
}

function ActivityRow({
  title,
  time,
  rightValue,
  rightCaption,
  icon: Icon,
  tone,
}: (typeof driverRecentActivities)[number]) {
  return (
    <article className="flex flex-col gap-4 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-4 shadow-[0_14px_34px_rgba(25,28,29,0.045)] transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            activityTone[tone].icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[var(--odong-text)]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
            {time}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-end gap-3 sm:flex-col sm:items-end">
        {rightValue ? (
          <div className="text-right">
            <p className={cn("text-base font-extrabold", activityTone[tone].value)}>
              {rightValue}
            </p>
            {rightCaption ? (
              <p className="text-sm text-[var(--odong-muted)]">{rightCaption}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DriverProfilePage({ status = "ready" }: DriverProfilePageProps) {
  if (status === "loading") {
    return <DriverProfileLoadingState />;
  }

  if (status === "error") {
    return <DriverProfileErrorState />;
  }

  if (status === "empty") {
    return <DriverProfileEmptyState />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-24 sm:pb-28">
        <section>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/90 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-[0_8px_18px_rgba(0,88,202,0.07)] backdrop-blur-xl">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Driver profile
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Profil Driver
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Informasi dan statistik performa Anda
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-7">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-4xl font-extrabold text-white shadow-[0_18px_32px_rgba(0,88,202,0.22)] sm:h-36 sm:w-36">
              {driverProfile.initials}
            </div>

            <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
              {driverProfile.name}
            </h2>
            <p className="mt-2 text-sm font-medium text-[var(--odong-muted)]">
              {driverProfileDetail.email}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {driverProfileDetail.onlineStatus}
            </div>

            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
              <div className="border-r border-[var(--odong-border)] px-4 py-4">
                <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                  {driverProfileDetail.reviews}
                </p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">
                  Ulasan
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                  {driverProfile.rating}
                </p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">
                  Ratings
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-700">
                  Informasi Akun
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
                  Data driver dan kendaraan.
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <PencilLine className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {driverAccountFields.map((field) => (
                <ReadonlyField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  icon={field.icon}
                  fullWidth={field.fullWidth}
                />
              ))}
            </div>
          </article>
        </section>

        <section className="space-y-3">
          <SectionHeader
            icon={Sparkles}
            title="Statistik Keseluruhan"
            description="Ringkasan performa driver selama periode berjalan."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {driverProfileStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            icon={Clock3}
            title="Aktivitas Terbaru"
            description="Riwayat singkat kerja driver yang terakhir dikerjakan."
          />
          <div className="space-y-3">
            {driverRecentActivities.map((activity) => (
              <ActivityRow key={activity.id} {...activity} />
            ))}
          </div>
        </section>

        <Link
          href="/auth/login/driver"
          className="group flex items-center justify-between gap-4 rounded-[28px] border border-rose-100 bg-rose-50/80 p-5 text-left shadow-[0_14px_34px_rgba(220,38,38,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 active:scale-[0.99]"
        >
          <span className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-extrabold text-rose-600">
                Keluar
              </span>
              <span className="mt-1 block text-sm leading-6 text-rose-500">
                Keluar dari akun Anda
              </span>
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-rose-500 transition group-hover:text-rose-700">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>

        <span className="sr-only" aria-live="polite">
          Profil {driverProfileDetail.name} terbuka.
        </span>
      </div>
    </div>
  );
}
