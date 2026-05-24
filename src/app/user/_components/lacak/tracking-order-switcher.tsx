"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Package } from "lucide-react";
import type { TrackingOrder } from "./types";

type TrackingOrderSwitcherProps = {
  orders: TrackingOrder[];
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
};

const PER_PAGE = 4;

export function TrackingOrderSwitcher({
  orders,
  selectedOrderId,
  onSelectOrder,
}: TrackingOrderSwitcherProps) {
  const totalPages = Math.ceil(orders.length / PER_PAGE);

  // Auto-open the page that contains the selected order
  const selectedIndex = orders.findIndex((o) => o.id === selectedOrderId);
  const [page, setPage] = useState(selectedIndex >= 0 ? Math.floor(selectedIndex / PER_PAGE) : 0);

  const visible = orders.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">Pesanan aktif</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
            Pilih order yang ingin dipantau.
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {orders.length} order aktif
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Halaman sebelumnya"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-[var(--odong-muted)]">
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                aria-label="Halaman berikutnya"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {visible.map((order) => {
          const selected = order.id === selectedOrderId;

          return (
            <button
              key={order.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectOrder(order.id)}
              className={cn(
                "group rounded-[24px] border-2 p-4 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]",
                selected
                  ? "border-primary-500 bg-white shadow-[0_8px_24px_rgba(0,88,202,0.12)]"
                  : "border-primary-100 bg-white shadow-[0_4px_12px_rgba(25,28,29,0.04)] hover:border-primary-300",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">{order.id}</p>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--odong-muted)]">
                    {order.service} — {order.weight}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                    selected
                      ? "bg-primary-600 text-white"
                      : "bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white",
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
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                  {order.eta}
                </span>
                <span className="rounded-full bg-[var(--odong-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--odong-muted)]">
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
