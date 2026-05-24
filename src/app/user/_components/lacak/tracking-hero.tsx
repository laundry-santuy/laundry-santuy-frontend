import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Package,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import type { TrackingInsight, TrackingOrder } from "./types";

type TrackingHeroProps = {
  order: TrackingOrder;
  insights: TrackingInsight[];
  fetchedAt?: Date | null;
  onRefresh?: () => void;
};

function formatFetchedAt(date: Date | null | undefined): string {
  if (!date) return "Diperbarui baru saja";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "Diperbarui baru saja";
  if (diffSec < 60) return `Diperbarui ${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Diperbarui ${diffMin} menit lalu`;
  const jam = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `Diperbarui pukul ${jam}`;
}

export function TrackingHero({ order, insights, fetchedAt, onRefresh }: TrackingHeroProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch">
      <div className="overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3 py-1.5 text-xs font-bold text-primary-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Live tracking
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Lacak cucian kamu dari pickup sampai kembali.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Pantau posisi order, tahap pengerjaan, kurir, dan estimasi selesai
              dalam satu dashboard yang rapi.
            </p>
          </div>

          <div className="rounded-3xl border border-primary-100 bg-white p-4 shadow-[0_12px_26px_rgba(0,88,202,0.07)] lg:min-w-[230px]">
            <p className="text-xs font-semibold text-[var(--odong-muted)]">
              Order aktif
            </p>
            <p className="mt-2 text-xl font-extrabold text-[var(--odong-text)]">
              {order.id}
            </p>
            <p className="mt-1 text-sm text-[var(--odong-muted)]">
              {order.service}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {insights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-2xl border border-primary-100 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary-600"
                    aria-hidden="true"
                  />
                  <p className="text-base font-extrabold text-[var(--odong-text)]">
                    {item.value}
                  </p>
                </div>
                <p className="mt-1 text-xs font-bold text-primary-700">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-[0_18px_46px_rgba(0,88,202,0.07)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,88,202,0.22)]">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {order.eta}
            </p>
            <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
              {order.statusLabel}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
              {order.statusDescription}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_8px_18px_rgba(0,88,202,0.22)]">
            <Package className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--odong-muted)]">
            <span>Progress order</span>
            <span>{order.progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-500"
              style={{ width: `${order.progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-[var(--odong-muted)]">
            {formatFetchedAt(fetchedAt)}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/user/pesan"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            Order lagi
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-4 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </aside>
    </section>
  );
}
