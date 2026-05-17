import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { accountHealthItems } from "./data";
import type { ProfileMetric, UserProfile } from "./types";

type ProfileHeroProps = {
  profile: UserProfile;
  metrics: ProfileMetric[];
};

export function ProfileHero({ profile, metrics }: ProfileHeroProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-primary-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Profil pelanggan
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Profil kamu tersusun rapi di satu tempat.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Kelola identitas akun, alamat pickup, metode bayar, dan
              preferensi laundry tanpa lompat-lompat halaman.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/user/pengaturan"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <UserRound className="h-5 w-5" aria-hidden="true" />
                Edit profil
              </Link>
              <Link
                href="/user/riwayat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/75 px-5 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                Lihat riwayat
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                {
                  label: profile.email,
                  icon: Mail,
                },
                {
                  label: profile.phone,
                  icon: Phone,
                },
                {
                  label: profile.joinedAt,
                  icon: CalendarClock,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-xs font-bold text-[var(--odong-text)] shadow-[0_8px_18px_rgba(0,88,202,0.05)]"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="w-full rounded-3xl border border-primary-100 bg-white/80 p-4 shadow-[0_12px_26px_rgba(0,88,202,0.07)] lg:max-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-lg font-extrabold text-white">
                {profile.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--odong-muted)]">
                  Akun aktif
                </p>
                <h2 className="truncate text-xl font-extrabold text-[var(--odong-text)]">
                  {profile.name}
                </h2>
                <p className="mt-1 text-sm text-primary-700">
                  {profile.memberLevel}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-primary-100 bg-primary-50/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--odong-muted)]">
                    Kelengkapan profil
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[var(--odong-text)]">
                    {profile.profileCompletion}%
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/75">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${profile.profileCompletion}%` }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)]">
                Lengkapi data dan alamat supaya pickup berikutnya lebih cepat.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  label: "Layanan favorit",
                  value: profile.favoriteService,
                  icon: Sparkles,
                },
                {
                  label: "Outlet utama",
                  value: profile.defaultOutlet,
                  icon: MapPin,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 text-primary-600"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold text-[var(--odong-muted)]">
                        {item.label}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-extrabold text-[var(--odong-text)]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
              <p className="text-xs font-bold text-primary-700">
                Status akun
              </p>
              <div className="mt-3 grid gap-3">
                {accountHealthItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 border-t border-[var(--odong-border)] pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
                        <Icon
                          className="h-4 w-4 text-primary-600"
                          aria-hidden="true"
                        />
                        {item.label}
                      </span>
                      <span className="text-right text-sm font-extrabold text-[var(--odong-text)]">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className={cn(
                  "rounded-2xl border border-primary-100 bg-white/75 px-4 py-3",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary-600"
                    aria-hidden="true"
                  />
                  <p className="text-lg font-extrabold text-[var(--odong-text)]">
                    {metric.value}
                  </p>
                </div>
                <p className="mt-1 text-xs font-bold text-primary-700">
                  {metric.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                  {metric.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
