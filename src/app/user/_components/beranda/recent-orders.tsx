import { Package } from "lucide-react";
import type { RecentOrder } from "./types";
import { SectionHeader } from "./section-header";
import { StatusBadge } from "./status-badge";

type RecentOrdersProps = {
  orders: RecentOrder[];
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Pesanan Terbaru"
        actionLabel="Lihat semua"
        href="/user/riwayat"
      />
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="odong-surface-soft grid min-h-[92px] gap-3 rounded-3xl border border-white/80 bg-primary-50/65 px-5 shadow-[0_18px_40px_rgba(25,28,29,0.04)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--odong-surface-strong)] hover:shadow-[0_22px_48px_rgba(25,28,29,0.07)] sm:grid-cols-[auto_minmax(0,1fr)_120px_110px_auto] sm:items-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-[inset_0_0_0_1px_rgba(0,88,202,0.08)]">
                <Package className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="odong-text text-base font-extrabold leading-6 text-neutral-900">
                  {order.id}
                </h3>
                <p className="odong-muted mt-1 truncate text-sm leading-5 text-neutral-500">
                  {order.service}
                </p>
              </div>
              <p className="odong-muted text-sm font-medium leading-5 text-neutral-500 sm:text-center">
                {order.date}
              </p>
              <p className="odong-text text-sm font-bold leading-5 text-neutral-700 sm:text-center">
                {order.weight}
              </p>
              <div className="sm:justify-self-end">
                <StatusBadge status={order.status} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="odong-surface-soft rounded-2xl border border-dashed border-primary-100 bg-primary-50/65 p-8 text-center text-sm text-neutral-500">
          Belum ada pesanan terbaru.
        </div>
      )}
    </section>
  );
}
