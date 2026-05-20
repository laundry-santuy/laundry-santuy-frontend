import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Download,
  MapPin,
  ReceiptText,
  RotateCcw,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { PaymentStatusBadge } from "./history-status-badge";
import type { HistoryOrder } from "./types";

type HistoryDetailPanelProps = {
  order?: HistoryOrder;
};

export function HistoryDetailPanel({ order }: HistoryDetailPanelProps) {
  if (!order) {
    return (
      <aside className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-8 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <div className="max-w-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <ReceiptText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-[var(--odong-text)]">
            Detail belum tersedia
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
            Pilih order dari daftar untuk melihat rincian transaksi.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col gap-5">
      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Detail order
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
              {order.id}
            </h2>
          </div>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div className="mt-5 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
          <p className="text-xs font-semibold text-[var(--odong-muted)]">
            Total pembayaran
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--odong-text)]">
            {order.total}
          </p>
          <p className="mt-1 text-sm text-[var(--odong-muted)]">
            {order.paymentMethod} - {order.date}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {[
            {
              label: "Jadwal",
              value: `${order.date}, ${order.time}`,
              icon: CalendarClock,
            },
            {
              label: "Outlet",
              value: order.outlet,
              icon: ReceiptText,
            },
            {
              label: "Alamat",
              value: order.address,
              icon: MapPin,
            },
            {
              label: "Kurir",
              value: order.courier,
              icon: Truck,
            },
            {
              label: "Pembayaran",
              value: order.paymentMethod,
              icon: Wallet,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 border-t border-[var(--odong-border)] pt-4 first:border-t-0 first:pt-0"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
                  <Icon
                    className="h-4 w-4 text-primary-600"
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
                <span className="max-w-[190px] text-right text-sm font-extrabold leading-5 text-[var(--odong-text)]">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-6 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Catatan order
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
              {order.note}
            </p>
          </div>
          {order.rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/75 dark:bg-[var(--odong-surface-strong)] px-3 py-1.5 text-xs font-extrabold text-[var(--odong-text)]">
              <Star
                className="h-3.5 w-3.5 fill-[#ffc107] text-[#ffc107]"
                aria-hidden="true"
              />
              {order.rating}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-4 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Invoice
          </button>
          <Link
            href="/user/pesan"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Ulangi
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </aside>
  );
}
