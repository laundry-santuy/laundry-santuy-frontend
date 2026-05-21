"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  MapPinned,
  Sparkles,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { driverStatusLabels } from "../data";
import type {
  DriverIncomingOrder,
  DriverOrderFilter,
  DriverOrderStatus,
  DriverPageStatus,
} from "../types";
import { IncomingOrderCard } from "./incoming-order-card";
import {
  IncomingOrdersEmptyState,
  IncomingOrdersErrorState,
  IncomingOrdersLoadingState,
  IncomingOrdersNoResultState,
} from "./incoming-orders-states";
import { IncomingOrdersToolbar } from "./incoming-orders-toolbar";
import { fetchPesananMasuk, updatePesananStatus } from "@/lib/driver-api";
import { useDriverToast } from "@/hooks/use-driver-toast";
import { DriverToastList } from "@/components/ui/driver-toast";

const filters: DriverOrderFilter[] = [
  "Semua",
  "Order Baru",
  "Diterima",
  "Ditolak",
];

const statusFilterMap: Record<
  Exclude<DriverOrderFilter, "Semua">,
  DriverOrderStatus
> = {
  "Order Baru": "incoming",
  Diterima:     "accepted",
  Ditolak:      "rejected",
};

const statConfig = [
  { key: "incoming", label: "Order baru", icon: UserPlus  },
  { key: "accepted", label: "Diterima",   icon: UserCheck },
  { key: "rejected", label: "Ditolak",    icon: UserX     },
] as const;

const statPillStyles = {
  incoming: {
    pill:  "border-primary-100 bg-white/85 dark:border-primary-800/50 dark:bg-primary-950/70",
    icon:  "bg-primary-50 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300",
    value: "text-primary-700 dark:text-primary-300",
  },
  accepted: {
    pill:  "border-emerald-100 bg-white/85 dark:border-emerald-800/50 dark:bg-emerald-950/70",
    icon:  "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  rejected: {
    pill:  "border-red-100 bg-white/85 dark:border-red-800/50 dark:bg-red-950/70",
    icon:  "bg-red-50 text-red-600 dark:bg-red-900/60 dark:text-red-300",
    value: "text-red-700 dark:text-red-300",
  },
} as const;

export function IncomingOrdersPage() {
  const [orders, setOrders]         = useState<DriverIncomingOrder[]>([]);
  const [pageStatus, setPageStatus] = useState<DriverPageStatus>("loading");
  const [pendingId, setPendingId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilter, setActiveFilter] = useState<DriverOrderFilter>("Semua");
  const { toasts, toast, dismiss }      = useDriverToast();

  useEffect(() => {
    let cancelled = false;
    setPageStatus("loading");

    fetchPesananMasuk()
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

  const stats = useMemo(
    () =>
      statConfig.map((item) => ({
        ...item,
        value: orders.filter((o) => o.status === item.key).length,
      })),
    [orders],
  );

  const incomingOrders = useMemo(
    () => orders.filter((o) => o.status === "incoming"),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "Semua" ||
        order.status === statusFilterMap[activeFilter];
      const matchesQuery =
        q.length === 0 ||
        [
          order.id,
          order.customerName,
          order.phone,
          order.address,
          order.service,
          driverStatusLabels[order.status],
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, orders, searchQuery]);

  const nextPickupOrder = incomingOrders[0] ?? orders[0];
  const priorityOrders  = incomingOrders.slice(0, 3);

  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: DriverOrderStatus,
  ) => {
    const action = nextStatus === "accepted" ? "terima" : "tolak";
    setPendingId(orderId);
    try {
      const res = await updatePesananStatus(orderId, action);
      setOrders((cur) =>
        cur.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
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

  if (pageStatus === "loading") return <IncomingOrdersLoadingState />;
  if (pageStatus === "error")   return <IncomingOrdersErrorState />;
  if (pageStatus === "empty" || orders.length === 0) return <IncomingOrdersEmptyState />;

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
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <span
                        key={stat.key}
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-extrabold shadow-[0_8px_18px_rgba(0,88,202,0.06)] backdrop-blur-xl",
                          statPillStyles[stat.key].pill,
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            statPillStyles[stat.key].icon,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span className={statPillStyles[stat.key].value}>
                          {stat.value}
                        </span>
                        <span className="text-[var(--odong-muted)]">
                          {stat.label}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
                  Kelola order pickup yang masuk hari ini.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
                  Cek pelanggan, lihat estimasi, buka rute ke Maps, lalu terima
                  order tanpa meninggalkan alur kerja driver.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
              <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
              Pickup terdekat
            </p>
            <div className="mt-5 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
              <p className="text-sm font-semibold text-[var(--odong-muted)]">
                Jadwal jemput
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--odong-text)]">
                {nextPickupOrder?.pickupTime ?? "-"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                {nextPickupOrder?.address ?? "Belum ada order masuk"}
              </p>
            </div>
            <a
              href={
                nextPickupOrder
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextPickupOrder.address)}`
                  : "#"
              }
              target={nextPickupOrder ? "_blank" : undefined}
              rel={nextPickupOrder ? "noreferrer" : undefined}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
            >
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Buka Rute
            </a>
          </aside>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="space-y-5">
            <IncomingOrdersToolbar
              filters={filters}
              activeFilter={activeFilter}
              resultCount={filteredOrders.length}
              searchQuery={searchQuery}
              onFilterChange={setActiveFilter}
              onSearchChange={setSearchQuery}
            />

            {filteredOrders.length > 0 ? (
              <section className="grid gap-5 2xl:grid-cols-2">
                {filteredOrders.map((order) => (
                  <IncomingOrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    isPending={pendingId === order.id}
                  />
                ))}
              </section>
            ) : (
              <IncomingOrdersNoResultState />
            )}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5">
              <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                  Priority queue
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-[var(--odong-text)]">
                  3 order terdekat
                </h2>
                <div className="mt-4 space-y-3">
                  {priorityOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-[var(--odong-muted)]">
                            #{index + 1}
                          </p>
                          <p className="mt-1 text-sm font-extrabold text-[var(--odong-text)]">
                            {order.customerName}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                            {order.address}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
                          {order.pickupTime}
                        </span>
                      </div>
                    </div>
                  ))}
                  {priorityOrders.length === 0 && (
                    <p className="text-sm text-[var(--odong-muted)]">
                      Tidak ada order baru saat ini.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                  Shift note
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)]">
                  Fokus ke order yang paling dekat dulu. Kalau sudah diterima,
                  buka Maps langsung dari kartu untuk menghindari bolak-balik.
                </p>
              </section>
            </div>
          </aside>
        </div>

        <span className="sr-only" aria-live="polite">
          {filteredOrders.length} pesanan tampil dengan filter {activeFilter}.
        </span>
      </div>

      <DriverToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}