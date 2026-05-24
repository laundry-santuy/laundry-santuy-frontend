import {
  CalendarClock,
  MessageCircle,
  Phone,
  SearchCheck,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import type { TrackingOrder } from "./types";

type TrackingSidePanelProps = {
  order: TrackingOrder;
};

export function TrackingSidePanel({ order }: TrackingSidePanelProps) {
  return (
    <aside className="flex h-full flex-col gap-5">
      {/* Kurir aktif */}
      <section className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-[0_18px_46px_rgba(0,88,202,0.07)]">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700">
          <Truck className="h-3.5 w-3.5" aria-hidden="true" />
          Kurir aktif
        </p>

        {order.courier ? (
          <>
            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(0,88,202,0.22)]">
                {order.courier.avatar}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-[var(--odong-text)]">
                  {order.courier.name}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--odong-muted)]">
                  {order.courier.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#ffc107] text-[#ffc107]" aria-hidden="true" />
                      {order.courier.rating}
                    </span>
                  )}
                  {order.courier.vehicle && order.courier.vehicle !== "-" && (
                    <>
                      {order.courier.rating > 0 && <span aria-hidden="true">·</span>}
                      <span>{order.courier.vehicle}</span>
                    </>
                  )}
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-4 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat
              </button>
            </div>
          </>
        ) : (
          <div className="mt-5 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <SearchCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-[var(--odong-text)]">
                Sedang mencari kurir
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
                Kurir akan ditugaskan segera setelah pesanan dikonfirmasi.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Ringkasan order */}
      <section className="rounded-[32px] border border-primary-100 bg-white p-6 shadow-[0_18px_46px_rgba(0,88,202,0.07)]">
        <p className="text-sm font-semibold text-primary-700">
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
            ...(order.payment
              ? [{
                  label: "Pembayaran",
                  value: `${order.payment} · ${order.total}`,
                  icon: Wallet,
                }]
              : [{
                  label: "Total",
                  value: order.total,
                  icon: Wallet,
                }]
            ),
            ...(order.courier
              ? [{
                  label: "Kurir",
                  value: order.courier.distance,
                  icon: Truck,
                }]
              : []
            ),
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 border-t border-primary-50 pt-4 first:border-t-0 first:pt-0"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
                  <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
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
    </aside>
  );
}
