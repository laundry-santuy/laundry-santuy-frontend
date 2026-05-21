import {
  CalendarClock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import type { TrackingCheckpoint, TrackingOrder } from "./types";

type TrackingSidePanelProps = {
  order: TrackingOrder;
  checkpoints: TrackingCheckpoint[];
};

export function TrackingSidePanel({
  order,
  checkpoints,
}: TrackingSidePanelProps) {
  return (
    <aside className="flex h-full flex-col gap-5">
      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/40 px-3 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-300">
          <Truck className="h-3.5 w-3.5" aria-hidden="true" />
          Kurir aktif
        </p>

        <div className="mt-5 flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-extrabold text-white">
            {order.courier.avatar}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[var(--odong-text)]">
              {order.courier.name}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--odong-muted)]">
              <span className="inline-flex items-center gap-1">
                <Star
                  className="h-4 w-4 fill-[#ffc107] text-[#ffc107]"
                  aria-hidden="true"
                />
                {order.courier.rating}
              </span>
              <span aria-hidden="true">-</span>
              <span>{order.courier.vehicle}</span>
            </p>
            <p className="mt-2 text-xs font-medium text-[var(--odong-muted-soft)]">
              {order.courier.responseTime}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-label={`Telepon kurir ${order.courier.name}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Telepon
          </button>
          <button
            type="button"
            aria-label={`Kirim pesan ke kurir ${order.courier.name}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary-100 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/30 px-4 text-sm font-bold text-primary-700 dark:text-primary-300 transition hover:-translate-y-0.5 hover:bg-primary-100 dark:hover:bg-primary-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          Ringkasan order
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
          {order.id}
        </h2>

        <div className="mt-5 space-y-4">
          {[
            {
              label: "Layanan",
              value: `${order.service} - ${order.weight}`,
              icon: ShieldCheck,
            },
            {
              label: "Pickup",
              value: order.pickupWindow,
              icon: CalendarClock,
            },
            {
              label: "Pembayaran",
              value: `${order.payment} - ${order.total}`,
              icon: Wallet,
            },
            {
              label: "Kurir",
              value: order.courier.distance,
              icon: Truck,
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
                <span className="max-w-[180px] text-right text-sm font-extrabold leading-5 text-[var(--odong-text)]">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-6 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          Quality checkpoint
        </p>
        <div className="mt-4 space-y-3">
          {checkpoints.map((checkpoint) => {
            const Icon = checkpoint.icon;

            return (
              <article
                key={checkpoint.title}
                className="flex items-start gap-3 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--odong-text)]">
                    {checkpoint.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                    {checkpoint.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
