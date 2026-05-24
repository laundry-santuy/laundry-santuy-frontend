"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText, Search, SlidersHorizontal, TrendingUp, Wallet, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchRiwayatDriver } from "@/lib/driver-api";
import type { DriverHistoryOrder, DriverHistoryStats } from "../types";
import { RiwayatCard } from "./riwayat-card";
import { RiwayatEmptyState, RiwayatErrorState, RiwayatLoadingState } from "./riwayat-states";

type PageStatus = "loading" | "error" | "empty" | "ready";
type StatusFilter = "semua" | "selesai" | "dibatalkan";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "semua",      label: "Semua" },
  { value: "selesai",    label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

const PAGE_SIZE = 4;

type Metric = { icon: React.ElementType; value: string; label: string; description: string };

function MetricCard({ icon: Icon, value, label, description }: Metric) {
  return (
    <article className="rounded-2xl border border-primary-100 bg-white/75 dark:bg-[var(--odong-surface-strong)] px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
        <p className="text-lg font-extrabold text-[var(--odong-text)]">{value}</p>
      </div>
      <p className="mt-1 text-xs font-bold text-primary-700">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">{description}</p>
    </article>
  );
}

export function RiwayatPage() {
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [orders, setOrders] = useState<DriverHistoryOrder[]>([]);
  const [stats, setStats] = useState<DriverHistoryStats | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [page, setPage] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    setPageStatus("loading");
    setPage(1);
    fetchRiwayatDriver({ q: debouncedQuery || undefined, status: statusFilter !== "semua" ? statusFilter : undefined })
      .then((res) => {
        setOrders(res.riwayat);
        setStats(res.stats);
        setPageStatus(res.riwayat.length === 0 ? "empty" : "ready");
      })
      .catch(() => setPageStatus("error"));
  }, [debouncedQuery, statusFilter]);

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(
    () => orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orders, page],
  );

  const isFiltered = debouncedQuery !== "" || statusFilter !== "semua";

  const metrics: Metric[] = stats
    ? [
        {
          icon: TrendingUp,
          value: String(stats.totalSelesai),
          label: "Order selesai",
          description: "Total pesanan berhasil diantarkan.",
        },
        {
          icon: XCircle,
          value: String(stats.totalDibatalkan),
          label: "Dibatalkan",
          description: "Pesanan yang dibatalkan atau ditolak.",
        },
        {
          icon: Wallet,
          value: stats.totalPendapatan,
          label: "Total pendapatan",
          description: "Akumulasi dari order selesai.",
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Hero + Stats */}
      <section className="overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-primary-700">
              <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
              Riwayat order
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-[var(--odong-text)]">Riwayat Order</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
              Semua pesanan yang sudah selesai atau dibatalkan.
            </p>
          </div>
          {stats && (
            <div className="w-full rounded-3xl border border-primary-100 bg-white/80 p-4 shadow-[0_12px_26px_rgba(0,88,202,0.07)] sm:max-w-[200px]">
              <p className="text-xs font-semibold text-[var(--odong-muted)]">Total tersimpan</p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--odong-text)]">
                {stats.totalSelesai + stats.totalDibatalkan}
              </p>
              <p className="mt-1 text-sm text-[var(--odong-muted)]">order di riwayat kamu</p>
            </div>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
          </div>
        )}
      </section>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted)]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari kode order, pelanggan, layanan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] pl-10 pr-4 text-sm font-medium text-[var(--odong-text)] placeholder:text-[var(--odong-muted)] focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--odong-muted)]" aria-hidden="true" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "h-9 rounded-2xl px-4 text-xs font-extrabold transition",
                statusFilter === f.value
                  ? "bg-primary-600 text-white shadow-[0_6px_14px_rgba(0,88,202,0.18)]"
                  : "border border-[var(--odong-border)] bg-[var(--odong-surface)] text-[var(--odong-muted)] hover:border-primary-300 hover:text-primary-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {pageStatus === "loading" && <RiwayatLoadingState />}
      {pageStatus === "error"   && <RiwayatErrorState />}
      {pageStatus === "empty"   && <RiwayatEmptyState filtered={isFiltered} />}
      {pageStatus === "ready"   && (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {paginatedOrders.map((order) => (
              <RiwayatCard key={order.id_pesanan} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--odong-border)] pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Halaman sebelumnya"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    aria-label={`Halaman ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i + 1 === page
                        ? "w-6 bg-primary-600"
                        : "w-2 bg-primary-200 hover:bg-primary-300",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Halaman berikutnya"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
