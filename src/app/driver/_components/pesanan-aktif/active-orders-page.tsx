"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  activeProcessStages,
  activeStageFilterMap,
  activeStageFilters,
  activeStageLabels,
  getNextActiveStage,
} from "./data";
import { ActiveOrderCard } from "./active-order-card";
import { ActiveOrderDetailModal } from "./active-order-detail-modal";
import { ActiveOrdersToolbar } from "./active-orders-toolbar";
import {
  ActiveOrdersEmptyState,
  ActiveOrdersErrorState,
  ActiveOrdersLoadingState,
  ActiveOrdersNoResultState,
} from "./active-orders-states";
import type {
  DriverActiveOrder,
  DriverActiveOrderFilter,
  DriverPageStatus,
} from "../types";
import { fetchPesananAktif, updatePesananStatus } from "@/lib/driver-api";
import { GpsShareButton } from "../gps-share-button";
import { useDriverToast } from "@/hooks/use-driver-toast";
import { DriverToastList } from "@/components/ui/driver-toast";

const stageTone = {
  "menuju-lokasi": {
    chip: "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
    icon: "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
    line: "from-primary-500 to-primary-300",
    bar:  "bg-primary-500",
  },
  dijemput: {
    chip: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    icon: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    line: "from-cyan-500 to-cyan-300",
    bar:  "bg-cyan-500",
  },
  "di-laundry": {
    chip: "bg-tertiary-50 text-tertiary-700 dark:bg-tertiary-900/50 dark:text-tertiary-300",
    icon: "bg-tertiary-50 text-tertiary-700 dark:bg-tertiary-900/50 dark:text-tertiary-300",
    line: "from-tertiary-500 to-tertiary-300",
    bar:  "bg-tertiary-500",
  },
  "siap-diantar": {
    chip: "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    icon: "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    line: "from-violet-500 to-violet-300",
    bar:  "bg-violet-500",
  },
  diantar: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    line: "from-emerald-500 to-emerald-300",
    bar:  "bg-emerald-500",
  },
} as const;

function getMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}


export function ActiveOrdersPage() {
  const [orders, setOrders]         = useState<DriverActiveOrder[]>([]);
  const [pageStatus, setPageStatus] = useState<DriverPageStatus>("loading");
  const [pendingId, setPendingId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeFilter, setActiveFilter]   = useState<DriverActiveOrderFilter>("Semua");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toasts, toast, dismiss }            = useDriverToast();
  const STAGE_PAGE_SIZE = 2;
  const [stagePages, setStagePages] = useState<Partial<Record<string, number>>>({});
  const prevFilterRef = useRef(activeFilter);

  const getStagePage = (stageId: string) => stagePages[stageId] ?? 1;
  const setStagePageFor = (stageId: string, page: number) =>
    setStagePages((prev) => ({ ...prev, [stageId]: page }));

  useEffect(() => {
    let cancelled = false;
    setPageStatus("loading");

    fetchPesananAktif()
      .then(({ orders: fetched }) => {
        if (cancelled) return;
        setOrders(fetched);
        setPageStatus(fetched.length === 0 ? "empty" : "ready");
      })
      .catch(() => {
        if (!cancelled) setPageStatus("error");
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (prevFilterRef.current !== activeFilter) {
      prevFilterRef.current = activeFilter;
      setStagePages({});
    }
  }, [activeFilter]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "Semua" ||
        order.currentStage === activeStageFilterMap[activeFilter];
      const matchesQuery =
        q.length === 0 ||
        [
          order.id,
          order.queueNumber,
          order.customerName,
          order.phone,
          order.address,
          order.service,
          order.weight,
          order.totalPrice,
          order.pickupTime,
          activeStageLabels[order.currentStage],
          order.note,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, orders, searchQuery]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const stageStats = useMemo(
    () =>
      activeProcessStages.map((stage) => ({
        ...stage,
        count: orders.filter((o) => o.currentStage === stage.id).length,
      })),
    [orders],
  );

  const groupedOrders = useMemo(
    () =>
      activeProcessStages
        .map((stage) => ({
          ...stage,
          count:  filteredOrders.filter((o) => o.currentStage === stage.id).length,
          orders: filteredOrders.filter((o) => o.currentStage === stage.id),
        }))
        .filter((stage) => stage.orders.length > 0),
    [filteredOrders],
  );

  const nextOrder =
    orders.find((o) => o.currentStage === "menuju-lokasi") ?? orders[0];

  const handleAdvanceStage = async (orderId: string) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;

    setPendingId(orderId);
    try {
      const res = await updatePesananStatus(orderId, "advance");
      const nextStage = getNextActiveStage(current.currentStage);

      if (!nextStage) {
        setOrders((cur) => cur.filter((o) => o.id !== orderId));
        if (selectedOrderId === orderId) setSelectedOrderId(null);
      } else {
        setOrders((cur) =>
          cur.map((o) =>
            o.id === orderId ? { ...o, currentStage: nextStage } : o,
          ),
        );
      }
      toast(res.message, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Gagal memperbarui status",
        "error",
      );
    } finally {
      setPendingId(null);
    }
  };

  if (pageStatus === "loading") return <ActiveOrdersLoadingState />;
  if (pageStatus === "error")   return <ActiveOrdersErrorState />;
  if (pageStatus === "empty" || orders.length === 0) return <ActiveOrdersEmptyState />;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 pb-24 sm:pb-28">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">

          {/* ── Kolom kiri ── */}
          <div className="space-y-5">
            {/* Workspace driver card */}
            <div className="driver-workspace-card overflow-hidden rounded-[32px] border border-primary-100 dark:border-primary-800/50 dark:bg-primary-900/40 p-5 shadow-[0_24px_58px_rgba(0,88,202,0.08)] sm:p-6">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/70 dark:text-primary-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Workspace driver
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {stageStats.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <span
                      key={stage.id}
                      className={cn(
                        "stat-pill-base inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-extrabold shadow-[0_8px_18px_rgba(0,88,202,0.06)]",
                        stageTone[stage.id].chip,
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          stageTone[stage.id].icon,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-extrabold">{stage.count}</span>
                      <span className="text-[var(--odong-muted)]">{stage.shortLabel}</span>
                    </span>
                  );
                })}
              </div>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-3xl">
                Pesanan aktif dikelompokkan berdasarkan proses.
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                Semua order yang sudah diterima tampil di sini, mulai menuju lokasi hingga siap diantar.
              </p>
              {nextOrder && (
                <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-primary-100 bg-primary-50/60 p-3 dark:border-[var(--odong-border)] dark:bg-[var(--odong-surface-muted)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">Prioritas berikutnya</p>
                    <p className="mt-0.5 text-sm font-extrabold text-[var(--odong-text)]">{nextOrder.pickupTime} · {nextOrder.customerName}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--odong-muted)]">{nextOrder.address}</p>
                  </div>
                  <a
                    href={getMapsUrl(nextOrder.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-primary-600 px-4 text-xs font-extrabold text-white shadow-[0_10px_22px_rgba(0,88,202,0.20)] transition hover:-translate-y-0.5 hover:bg-primary-700 active:scale-[0.98]"
                  >
                    <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                    Maps
                  </a>
                </div>
              )}
            </div>

            {/* Daftar proses header */}
            <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary-700">
                    Daftar proses
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
                    Order aktif yang sedang berjalan.
                  </h2>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {filteredOrders.length} order aktif
                </span>
              </div>
            </section>

            {/* Order groups */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-5">
                {groupedOrders.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <section
                      key={stage.id}
                      className="overflow-hidden rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              stageTone[stage.id].icon,
                            )}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-primary-700">{stage.shortLabel}</p>
                            <h3 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">{stage.label}</h3>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                            stageTone[stage.id].chip,
                          )}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {stage.count} aktif
                        </span>
                      </div>

                      {(() => {
                        const stagePage = getStagePage(stage.id);
                        const stageTotalPages = Math.max(1, Math.ceil(stage.orders.length / STAGE_PAGE_SIZE));
                        const pageOrders = stage.orders.slice(
                          (stagePage - 1) * STAGE_PAGE_SIZE,
                          stagePage * STAGE_PAGE_SIZE,
                        );
                        return (
                          <>
                            <div className="mt-5 grid gap-5 2xl:grid-cols-2">
                              {pageOrders.map((order) => (
                                <ActiveOrderCard
                                  key={order.id}
                                  order={order}
                                  isPending={pendingId === order.id}
                                  onAdvanceStage={handleAdvanceStage}
                                  onOpenDetail={(o) => setSelectedOrderId(o.id)}
                                />
                              ))}
                            </div>
                            {stageTotalPages > 1 && (
                              <div className="mt-5 flex items-center justify-between gap-3 rounded-[24px] border border-[var(--odong-border)] bg-white px-4 py-3 dark:bg-[var(--odong-surface)]">
                                <button
                                  type="button"
                                  disabled={stagePage <= 1}
                                  onClick={() => setStagePageFor(stage.id, stagePage - 1)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--odong-border)] bg-white text-[var(--odong-text)] shadow-sm transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--odong-surface-strong)]"
                                >
                                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <div className="flex items-center gap-2">
                                  {Array.from({ length: stageTotalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      type="button"
                                      onClick={() => setStagePageFor(stage.id, page)}
                                      className={cn(
                                        "inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold transition",
                                        page === stagePage
                                          ? "bg-primary-600 text-white shadow-[0_8px_18px_rgba(0,88,202,0.22)]"
                                          : "text-[var(--odong-muted)] hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30",
                                      )}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  disabled={stagePage >= stageTotalPages}
                                  onClick={() => setStagePageFor(stage.id, stagePage + 1)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--odong-border)] bg-white text-[var(--odong-text)] shadow-sm transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--odong-surface-strong)]"
                                >
                                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </section>
                  );
                })}
              </div>
            ) : (
              <ActiveOrdersNoResultState />
            )}
          </div>

          {/* ── Kolom kanan (sticky) ── */}
          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5">
              {/* GPS Lokasi */}
              <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">GPS Lokasi</p>
                <p className="mt-2 mb-4 text-sm leading-6 text-[var(--odong-muted)]">
                  Bagikan posisi real-time agar pelanggan bisa melacak kamu di peta.
                </p>
                <GpsShareButton />
              </section>



<section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">Catatan</p>
                <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)]">
                  Fokus ke order yang paling dekat dulu. Setelah status naik, order berikutnya otomatis mengikuti alur berikutnya.
                </p>
              </section>

            </div>
          </aside>
        </div>

        <span className="sr-only" aria-live="polite">
          {filteredOrders.length} pesanan tampil dengan filter {activeFilter}.
        </span>
      </div>

      <ActiveOrdersToolbar
        filters={[...activeStageFilters]}
        activeFilter={activeFilter}
        resultCount={filteredOrders.length}
        searchQuery={searchQuery}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
      />

      <ActiveOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onAdvanceStage={handleAdvanceStage}
      />

      <DriverToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
