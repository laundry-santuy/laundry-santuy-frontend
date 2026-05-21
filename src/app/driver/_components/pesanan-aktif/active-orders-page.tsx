"use client";

import { cn } from "@/lib/utils";
import {
  Clock3,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function formatStageCount(count: number) {
  return `${count} order`;
}

export function ActiveOrdersPage() {
  const [orders, setOrders]         = useState<DriverActiveOrder[]>([]);
  const [pageStatus, setPageStatus] = useState<DriverPageStatus>("loading");
  const [pendingId, setPendingId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeFilter, setActiveFilter]   = useState<DriverActiveOrderFilter>("Semua");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toasts, toast, dismiss }            = useDriverToast();

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

  const stageCompletion = useMemo(
    () =>
      stageStats.map((stage) => ({
        ...stage,
        ratio: Math.max(stage.count / Math.max(orders.length, 1), 0),
      })),
    [orders.length, stageStats],
  );

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

      <div className="relative z-10 space-y-5 pb-24 sm:pb-28">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
          <div className="overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 dark:border-primary-800/50 dark:bg-primary-900/40 p-5 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
            <div className="relative">
              <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-primary-200/35 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-white/85 dark:border-primary-800/50 dark:bg-primary-950/70 dark:text-primary-300 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-[0_8px_18px_rgba(0,88,202,0.07)] backdrop-blur-xl">
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
                          "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-extrabold shadow-[0_8px_18px_rgba(0,88,202,0.06)] backdrop-blur-xl",
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
                        <span className="text-[var(--odong-muted)]">
                          {stage.shortLabel}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
                  Pesanan aktif dikelompokkan berdasarkan proses.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
                  Semua order yang sudah diterima tampil di sini, mulai dari
                  yang menuju lokasi sampai yang sudah siap diantar kembali ke
                  pelanggan.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
              <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
              Prioritas berikutnya
            </p>
            <div className="mt-5 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
              <p className="text-sm font-semibold text-[var(--odong-muted)]">
                Order terdekat
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--odong-text)]">
                {nextOrder?.pickupTime ?? "-"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                {nextOrder?.address ?? "Belum ada pesanan aktif"}
              </p>
            </div>
            <a
              href={nextOrder ? getMapsUrl(nextOrder.address) : "#"}
              target={nextOrder ? "_blank" : undefined}
              rel={nextOrder ? "noreferrer" : undefined}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
            >
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Buka Maps
            </a>

            <div className="mt-5 grid gap-3">
              {stageCompletion.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            stageTone[stage.id].icon,
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-extrabold text-[var(--odong-text)]">
                            {stage.label}
                          </p>
                          <p className="text-xs font-medium text-[var(--odong-muted)]">
                            {formatStageCount(stage.count)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[var(--odong-muted)]">
                        {Math.round(stage.ratio * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--odong-surface)]">
                      <div
                        className={cn("h-full rounded-full", stageTone[stage.id].bar)}
                        style={{ width: `${Math.max(stage.ratio * 100, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="space-y-5">
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
                            <p className="text-sm font-bold text-primary-700">
                              {stage.shortLabel}
                            </p>
                            <h3 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">
                              {stage.label}
                            </h3>
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

                      <div className="mt-5 grid gap-5 2xl:grid-cols-2">
                        {stage.orders.map((order) => (
                          <ActiveOrderCard
                            key={order.id}
                            order={order}
                            isPending={pendingId === order.id}
                            onAdvanceStage={handleAdvanceStage}
                            onOpenDetail={(o) => setSelectedOrderId(o.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <ActiveOrdersNoResultState />
            )}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5">
              <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                  Fokus shift
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-[var(--odong-text)]">
                  Urutan kerja hari ini.
                </h2>
                <div className="mt-4 space-y-3">
                  {stageStats.map((stage) => {
                    const Icon = stage.icon;
                    return (
                      <div
                        key={stage.id}
                        className="rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                                stageTone[stage.id].icon,
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="text-sm font-extrabold text-[var(--odong-text)]">
                                {stage.label}
                              </p>
                              <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                                {formatStageCount(stage.count)}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
                            {Math.round((stage.count / Math.max(orders.length, 1)) * 100)}%
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--odong-surface)]">
                          <div
                            className={cn("h-full rounded-full", stageTone[stage.id].bar)}
                            style={{
                              width: `${Math.max((stage.count / Math.max(orders.length, 1)) * 100, 8)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                  Catatan
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)]">
                  Fokus ke order yang paling dekat dulu. Setelah status naik,
                  order berikutnya otomatis mengikuti alur berikutnya.
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
