import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Clock3,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  UsersRound,
} from "lucide-react";

import {
  LatestActivityCard,
  OrderStatusCard,
  RevenueTrendCard,
  TopOutletCard,
} from "./dashboard-charts";
import { adminStats } from "../data";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
} from "./dashboard-states";
import type { DashboardResponse } from "@/lib/admin-api";

export type DashboardStatus = "loading" | "error" | "empty" | "ready";

const statToneClass = {
  blue: "bg-primary-50 text-primary-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

// Helper function to format currency
function formatCurrency(value: number): string {
  if (value === 0) return "Rp 0";
  if (value >= 1000000) {
    const juta = value / 1000000;
    return `Rp ${juta.toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`;
  }
  if (value >= 1000) {
    const ribu = value / 1000;
    return `Rp ${ribu.toLocaleString("id-ID", { maximumFractionDigits: 0 })}rb`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

const heroHighlights = [
  {
    label: "Pickup antre",
    value: "42",
    caption: "12 sudah diambil",
    icon: Truck,
  },
  {
    label: "SLA tepat waktu",
    value: "98,2%",
    caption: "6 jam terakhir",
    icon: ShieldCheck,
  },
  {
    label: "Butuh tindak lanjut",
    value: "7",
    caption: "Tiket aktif",
    icon: CircleAlert,
  },
];

const liveOverviewRows = [
  {
    label: "Revenue hari ini",
    value: "Rp 8,43 Jt",
    caption: "143 transaksi",
  },
  {
    label: "Pesanan diproses",
    value: "156",
    caption: "38 siap antar",
  },
  {
    label: "Outlet tersibuk",
    value: "Kemang",
    caption: "Kapasitas 90%",
  },
  {
    label: "Sinkron data",
    value: "1 mnt lalu",
    caption: "API admin aktif",
  },
];

type AdminDashboardPageProps = {
  status?: DashboardStatus;
  dashboardData?: DashboardResponse | null;
};

export function AdminDashboardPage({
  status = "ready",
  dashboardData,
}: AdminDashboardPageProps) {
  if (status === "loading") {
    return <DashboardLoadingState />;
  }

  if (status === "error") {
    return <DashboardErrorState />;
  }

  if (status === "empty") {
    return <DashboardEmptyState />;
  }

  // Build dynamic hero highlights from dashboardData
  const dynamicHeroHighlights = dashboardData
    ? [
        {
          label: "Pickup antre",
          value: dashboardData.operasionalHariIni.pickupQueue.toString(),
          caption: "Menunggu diambil",
          icon: Truck,
        },
        {
          label: "SLA tepat waktu",
          value: `${dashboardData.operasionalHariIni.slaCompliance}%`,
          caption: "Kinerja hari ini",
          icon: ShieldCheck,
        },
        {
          label: "Butuh tindak lanjut",
          value: dashboardData.operasionalHariIni.pendingTickets.toString(),
          caption: "Tiket aktif",
          icon: CircleAlert,
        },
      ]
    : heroHighlights;

  // Build dynamic live overview rows from dashboardData
  const formatLastSync = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Baru saja";
    if (diffMin === 1) return "1 mnt lalu";
    if (diffMin < 60) return `${diffMin} mnt lalu`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour === 1) return "1 jam lalu";
    return `${diffHour} jam lalu`;
  };

  const dynamicLiveOverviewRows = dashboardData
    ? [
        {
          label: "Revenue hari ini",
          value: formatCurrency(dashboardData.operasiAktif.todayRevenue),
          caption: `${dashboardData.operasiAktif.todayTransactions} transaksi`,
        },
        {
          label: "Pesanan diproses",
          value: dashboardData.operasiAktif.ordersInProcess.toString(),
          caption: "Sedang dikerjakan",
        },
        {
          label: "Outlet tersibuk",
          value: dashboardData.topOutlets[0]?.name || "N/A",
          caption: `${dashboardData.topOutlets[0]?.orders || 0} pesanan`,
        },
        {
          label: "Sinkron data",
          value: formatLastSync(dashboardData.operasiAktif.lastSync),
          caption: "API admin aktif",
        },
      ]
    : liveOverviewRows;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
        <div className="relative overflow-hidden rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-6 shadow-[0_18px_48px_rgba(25,28,29,0.06)] md:p-8">
          <div className="pointer-events-none absolute right-[-96px] top-[-96px] h-72 w-72 rounded-full bg-primary-200/35 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/80 px-3 py-1.5 text-xs font-extrabold text-primary-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Pusat kendali admin
            </p>
            <h2 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-normal text-[var(--odong-text)] sm:text-5xl">
              Kontrol operasional laundry hari ini.
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-[var(--odong-muted)]">
              Revenue, antrean, outlet, dan aktivitas terbaru tetap terbaca
              cepat sebelum tim mulai bergerak.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/manajemen/pesanan"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <PackageCheck className="h-5 w-5" aria-hidden="true" />
                Kelola Pesanan
              </Link>
              <Link
                href="/admin/manajemen/pengguna"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] px-5 text-sm font-extrabold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                Manajemen User
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {dynamicHeroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-primary-100/70 bg-primary-50/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xl font-extrabold text-[var(--odong-text)]">
                        {item.value}
                      </p>
                      <Icon
                        className="h-4 w-4 text-primary-600"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-xs font-extrabold text-[var(--odong-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--odong-muted-soft)]">
                      {item.caption}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--odong-muted)]">
                Snapshot hari ini
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
                Operasi aktif
              </h3>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
              Live
            </span>
          </div>

          <div className="mt-5 divide-y divide-[var(--odong-border)] overflow-hidden rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
            {dynamicLiveOverviewRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    {row.label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--odong-muted-soft)]">
                    {row.caption}
                  </p>
                </div>
                <p className="shrink-0 text-right text-base font-extrabold text-primary-700">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50/75 px-4 py-3 text-sm font-semibold text-primary-700">
            <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Update berikutnya dijadwalkan otomatis setiap 5 menit.
          </div>
        </aside>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData ? (
          <>
            {/* Pendapatan */}
            <article className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--odong-muted)]">
                    Pendapatan
                  </p>
                  <p className="mt-2 break-words text-3xl font-extrabold tracking-normal text-[var(--odong-text)]">
                    {formatCurrency(dashboardData.overview.totalRevenue)}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <PackageCheck className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                Total pesanan terselesaikan
              </p>
            </article>

            {/* Pesanan */}
            <article className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--odong-muted)]">
                    Pesanan
                  </p>
                  <p className="mt-2 break-words text-3xl font-extrabold tracking-normal text-[var(--odong-text)]">
                    {dashboardData.overview.totalPesanan}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <PackageCheck className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                Total semua pesanan
              </p>
            </article>

            {/* Pelanggan Aktif */}
            <article className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--odong-muted)]">
                    Pelanggan Aktif
                  </p>
                  <p className="mt-2 break-words text-3xl font-extrabold tracking-normal text-[var(--odong-text)]">
                    {dashboardData.overview.pelangganAktif}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <UsersRound className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                Pelanggan dengan pesanan aktif
              </p>
            </article>

            {/* Outlet */}
            <article className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--odong-muted)]">
                    Outlet
                  </p>
                  <p className="mt-2 break-words text-3xl font-extrabold tracking-normal text-[var(--odong-text)]">
                    {dashboardData.overview.totalOutlet}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                Outlet aktif
              </p>
            </article>
          </>
        ) : (
          <>
            {adminStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="min-h-[132px] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)] transition hover:-translate-y-0.5 hover:bg-primary-50/35 md:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--odong-muted)]">
                        {stat.label}
                      </p>
                      <p className="mt-2 break-words text-3xl font-extrabold tracking-normal text-[var(--odong-text)]">
                        {stat.value}
                      </p>
                    </div>
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${statToneClass[stat.tone]}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[var(--odong-muted)]">
                    {stat.caption}
                  </p>
                </article>
              );
            })}
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RevenueTrendCard data={dashboardData?.revenueTrend} />
        <OrderStatusCard data={dashboardData?.statusPesanan} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <TopOutletCard />
        <LatestActivityCard />
      </section>
    </div>
  );
}
