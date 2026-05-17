import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HelpCircle,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import type {
  PaymentMethod,
  ProfileActivity,
  SecurityItem,
} from "./types";

type ProfileSidePanelProps = {
  payments: PaymentMethod[];
  securityItems: SecurityItem[];
  activities: ProfileActivity[];
};

export function ProfileSidePanel({
  payments,
  securityItems,
  activities,
}: ProfileSidePanelProps) {
  return (
    <aside className="flex h-full flex-col gap-5">
      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Pembayaran
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
              Metode bayar.
            </h2>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <BadgeCheck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {payments.map((payment) => {
            const Icon = payment.icon;

            return (
              <article
                key={payment.id}
                className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-extrabold text-[var(--odong-text)]">
                        {payment.name}
                      </h3>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                        {payment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                      {payment.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          Kelola pembayaran
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Keamanan
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
              Akun tetap aman.
            </h2>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {securityItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-t border-[var(--odong-border)] pt-4 first:border-t-0 first:pt-0"
              >
                <span className="flex min-w-0 items-start gap-2 text-sm font-medium text-[var(--odong-muted)]">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block font-extrabold text-[var(--odong-text)]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5">
                      {item.description}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-6 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl">
        <p className="text-sm font-semibold text-primary-700">
          Aktivitas profil
        </p>

        <div className="relative mt-5 space-y-4">
          <div className="absolute bottom-8 left-5 top-8 w-px bg-[var(--odong-border)]" />
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <article key={activity.id} className="relative flex gap-3">
                <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-[var(--odong-text)]">
                      {activity.title}
                    </h3>
                    <span className="shrink-0 text-xs font-bold text-primary-700">
                      {activity.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                    {activity.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <p className="text-sm font-semibold text-primary-700">
          Bantuan akun
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
          Butuh bantuan?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
          Tim Laundry Santuy siap bantu masalah pickup, pembayaran, dan data
          akun kamu.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-4 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            FAQ
          </button>
        </div>

        <Link
          href="/auth/login/user"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 text-sm font-bold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar akun
        </Link>
      </section>
    </aside>
  );
}
