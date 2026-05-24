"use client";

import { cn } from "@/lib/utils";
import { CalendarClock, ChevronRight, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  historyServiceIcon,
  historyStatusIcon,
} from "./data";
import { HistoryStatusBadge } from "./history-status-badge";
import type { HistoryOrder } from "./types";

type HistoryOrderListProps = {
  orders: HistoryOrder[];
  totalCount?: number;
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
};

export function HistoryOrderList({
  orders,
  totalCount,
  selectedOrderId,
  onSelectOrder,
}: HistoryOrderListProps) {
  const [openOrderId, setOpenOrderId] = useState("");
  const openOrder = orders.find((order) => order.id === openOrderId);

  useEffect(() => {
    if (!openOrderId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenOrderId("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openOrderId]);

  return (
    <section className="h-full min-h-[420px]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">
            Riwayat order
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
            Daftar transaksi terbaru.
          </h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
          <Package className="h-3.5 w-3.5" aria-hidden="true" />
          {totalCount ?? orders.length} order
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-dashed border-primary-100 bg-primary-50/65 px-4 py-10 text-center shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl">
          <div className="max-w-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Package className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-[var(--odong-text)]">
              Riwayat tidak ditemukan
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const selected = order.id === selectedOrderId;
            const ServiceIcon =
              historyServiceIcon[
                order.service as keyof typeof historyServiceIcon
              ] ?? Package;
            const StatusIcon = historyStatusIcon[order.status];

            return (
              <article
                key={order.id}
                className={cn(
                  "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[28px] border p-4 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5",
                  selected
                    ? "border-primary-200 bg-primary-50"
                    : "border-[var(--odong-border)] bg-[var(--odong-surface)] hover:border-primary-100 hover:bg-[var(--odong-surface-strong)]",
                )}
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectOrder(order.id)}
                  className="grid min-w-0 w-full gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 md:grid-cols-[auto_minmax(0,1fr)_140px] md:items-center"
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
                      selected
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white",
                    )}
                  >
                    <ServiceIcon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-[var(--odong-text)]">
                        {order.id}
                      </h3>
                      <HistoryStatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-[var(--odong-text)]">
                      {order.service} - {order.weight}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--odong-muted)]">
                      <CalendarClock
                        className="h-3.5 w-3.5 text-primary-600"
                        aria-hidden="true"
                      />
                      {order.time && order.time !== "-" ? `${order.date}, ${order.time}` : order.date}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm font-extrabold text-[var(--odong-text)]">
                      {order.total}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                      {order.paymentMethod}
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-primary-600 shadow-[0_8px_18px_rgba(25,28,29,0.04)]">
                    <StatusIcon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <button
                    type="button"
                    aria-label={`Lihat rincian layanan ${order.id}`}
                    onClick={() => setOpenOrderId(order.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-primary-600 shadow-[0_8px_18px_rgba(25,28,29,0.04)] transition hover:border-primary-100 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {openOrder ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Tutup rincian layanan"
            onClick={() => setOpenOrderId("")}
            className="absolute inset-0 cursor-default bg-neutral-950/40 backdrop-blur-[4px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-service-detail-title"
            className="absolute left-1/2 top-1/2 flex max-h-[min(720px,calc(100vh-48px))] w-[min(calc(100vw-32px),560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px] border border-[var(--odong-border)] bg-[var(--odong-surface)] text-[var(--odong-text)] shadow-[0_28px_68px_rgba(25,28,29,0.22)] backdrop-blur-xl"
          >
            <div className="flex min-h-0 w-full flex-col p-5 sm:p-6">
              <div className="flex shrink-0 items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary-700">
                    Rincian layanan
                  </p>
                  <h3
                    id="history-service-detail-title"
                    className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]"
                  >
                    {openOrder.id}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <HistoryStatusBadge status={openOrder.status} />
                  <button
                    type="button"
                    aria-label="Tutup rincian layanan"
                    onClick={() => setOpenOrderId("")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {openOrder.items.map((item) => (
                    <div
                      key={`${openOrder.id}-${item.name}`}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[var(--odong-text)]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                          {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-sm font-extrabold text-[var(--odong-text)]">
                        {item.price}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3 border-t border-[var(--odong-border)] pt-4 text-sm">
                  <div className="flex justify-between gap-4 text-[var(--odong-muted)]">
                    <span>Subtotal</span>
                    <span className="font-bold">{openOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[var(--odong-muted)]">
                    <span>Diskon</span>
                    <span className="font-bold">{openOrder.discount}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-base font-extrabold text-[var(--odong-text)]">
                    <span>Total</span>
                    <span>{openOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
