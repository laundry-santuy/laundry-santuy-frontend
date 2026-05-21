import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Package } from "lucide-react";
import type { TrackingOrder } from "./types";

type TrackingOrderSwitcherProps = {
  orders: TrackingOrder[];
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
};

export function TrackingOrderSwitcher({
  orders,
  selectedOrderId,
  onSelectOrder,
}: TrackingOrderSwitcherProps) {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">
            Pesanan aktif
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
            Pilih order yang ingin dipantau.
          </h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/40 px-3 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-300">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {orders.length} order aktif
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {orders.map((order) => {
          const selected = order.id === selectedOrderId;

          return (
            <button
              key={order.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectOrder(order.id)}
              className={cn(
                "group rounded-[24px] border p-4 text-left shadow-[0_10px_26px_rgba(25,28,29,0.04)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]",
                selected
                  ? "border-primary-200 dark:border-primary-700/50 bg-primary-50 dark:bg-primary-900/30"
                  : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] hover:border-primary-100",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    {order.id}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--odong-muted)]">
                    {order.service} - {order.weight}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                    selected
                      ? "bg-primary-600 text-white"
                      : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 group-hover:bg-primary-600 group-hover:text-white",
                  )}
                >
                  {order.tone === "active" ? (
                    <Package className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--odong-muted)]">
                  <span>{order.statusLabel}</span>
                  <span>{order.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900/50">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/75 dark:bg-[var(--odong-surface-strong)] px-3 py-1 text-xs font-bold text-primary-700">
                  {order.eta}
                </span>
                <span className="rounded-full bg-white/75 dark:bg-[var(--odong-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--odong-muted)]">
                  {order.pickupWindow}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
