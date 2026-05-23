"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Package,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import {
  adminActivities,
  orderStatusDistribution,
  revenueTrend,
  topOutlets,
} from "../data";

const yTicks = [0, 15000000, 30000000, 45000000, 60000000];
const dashboardYears = ["2026", "2025", "2024"] as const;

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

type DashboardYear = (typeof dashboardYears)[number];

const revenueTrendByYear: Record<DashboardYear, typeof revenueTrend> = {
  "2026": revenueTrend,
  "2025": [
    { month: "Jan", value: 24000000 },
    { month: "Feb", value: 27000000 },
    { month: "Mar", value: 31000000 },
    { month: "Apr", value: 29500000 },
    { month: "May", value: 34000000 },
    { month: "Jun", value: 38500000 },
  ],
  "2024": [
    { month: "Jan", value: 18000000 },
    { month: "Feb", value: 20500000 },
    { month: "Mar", value: 23200000 },
    { month: "Apr", value: 24800000 },
    { month: "May", value: 27100000 },
    { month: "Jun", value: 31400000 },
  ],
};

const orderStatusByYear: Record<DashboardYear, typeof orderStatusDistribution> = {
  "2026": orderStatusDistribution,
  "2025": [
    { label: "Selesai", value: 66, color: "#16a34a" },
    { label: "Diproses", value: 19, color: "#d97706" },
    { label: "Menunggu", value: 11, color: "#e11d48" },
    { label: "Dibatalkan", value: 4, color: "#64748b" },
  ],
  "2024": [
    { label: "Selesai", value: 61, color: "#16a34a" },
    { label: "Diproses", value: 22, color: "#d97706" },
    { label: "Menunggu", value: 12, color: "#e11d48" },
    { label: "Dibatalkan", value: 5, color: "#64748b" },
  ],
};

const totalOrdersByYear: Record<DashboardYear, number> = {
  "2026": 703,
  "2025": 628,
  "2024": 541,
};

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#0058CA",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  completed: {
    label: "Selesai",
    color: "#16a34a",
  },
  processing: {
    label: "Diproses",
    color: "#d97706",
  },
  pending: {
    label: "Menunggu",
    color: "#e11d48",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "#64748b",
  },
} satisfies ChartConfig;

function formatCurrencyTick(value: number) {
  return value.toLocaleString("id-ID");
}

function formatCompactCurrency(value: number) {
  return `Rp ${(value / 1000000).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  })} Jt`;
}

function buildPolyline(
  values: number[],
  width: number,
  height: number,
  padding: number,
) {
  const maxValue = Math.max(...yTicks);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (chartWidth * index) / Math.max(values.length - 1, 1);
      const y =
        height - padding - (Math.max(value, 0) / maxValue) * chartHeight;

      return `${x},${y}`;
    })
    .join(" ");
}

function getPointPosition({
  value,
  index,
  total,
  width,
  height,
  padding,
}: {
  value: number;
  index: number;
  total: number;
  width: number;
  height: number;
  padding: number;
}) {
  const x = padding + ((width - padding * 2) * index) / Math.max(total - 1, 1);
  const y =
    height -
    padding -
    (value / yTicks[yTicks.length - 1]) * (height - padding * 2);

  return { x, y };
}

function buildDonutSlices(distribution: typeof orderStatusDistribution) {
  let currentOffset = 0;

  return distribution.map((item) => {
    const slice = {
      ...item,
      offset: currentOffset,
    };

    currentOffset += item.value;

    return slice;
  });
}

function DashboardCardHeader({
  icon: Icon,
  title,
  description,
  year,
  onYearChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  year?: DashboardYear;
  onYearChange?: (year: DashboardYear) => void;
}) {
  return (
    <CardHeader className="flex-col gap-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50/85 text-primary-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-[24px] leading-tight tracking-normal">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 leading-6">
            {description}
          </CardDescription>
        </div>
      </div>

      {year && onYearChange ? (
        <label className="relative inline-flex h-11 w-full shrink-0 items-center sm:w-auto">
          <span className="sr-only">Pilih tahun dashboard</span>
          <select
            value={year}
            onChange={(event) =>
              onYearChange(event.target.value as DashboardYear)
            }
            className="h-11 w-full appearance-none rounded-2xl border border-primary-100 bg-primary-50/70 py-0 pl-4 pr-10 text-sm font-bold text-primary-700 outline-none transition hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-300 sm:w-auto"
          >
            {dashboardYears.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 h-4 w-4 text-primary-700"
            aria-hidden="true"
          />
        </label>
      ) : null}
    </CardHeader>
  );
}

type RevenueTrendCardProps = {
  data?: { month: string; revenue: number }[];
};

export function RevenueTrendCard({ data }: RevenueTrendCardProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const width = 640;
  const height = 320;
  const padding = 44;
  
  // Transform backend data to component format
  const activeTrend = data ? data.map(item => ({
    month: (() => {
      const monthPart = item.month.split('-')[1];
      const monthIndex = Number(monthPart) - 1;
      return Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex < monthNames.length
        ? monthNames[monthIndex]
        : item.month;
    })(),
    value: item.revenue
  })) : revenueTrendByYear["2026"];
  
  // Set active index to last item if not set
  const activeIdx = activeIndex === -1 ? activeTrend.length - 1 : activeIndex;
  const monthTicks = activeTrend.map((item) => item.month);
  const polylinePoints = buildPolyline(
    activeTrend.map((item) => item.value),
    width,
    height,
    padding,
  );
  const activePoint = activeTrend[activeIdx] ?? activeTrend.at(-1);
  const activePosition = activePoint
    ? getPointPosition({
        value: activePoint.value,
        index: activeIdx,
        total: activeTrend.length,
        width,
        height,
        padding,
      })
    : null;

  return (
    <Card className="transition hover:-translate-y-0.5">
      <DashboardCardHeader
        icon={TrendingUp}
        title="Tren Pendapatan"
        description="6 bulan terakhir"
      />

      <CardContent className="pt-6">
        <ChartContainer
          config={revenueChartConfig}
          className="relative min-h-[260px] overflow-hidden rounded-[28px] bg-[var(--odong-surface-muted)] p-3"
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full touch-pan-y"
            role="img"
            aria-label="Tren pendapatan"
          >
            {yTicks.map((tick) => {
              const y =
                height -
                padding -
                (tick / yTicks[yTicks.length - 1]) * (height - padding * 2);

              return (
                <g key={tick}>
                  <line
                    x1={padding}
                    x2={width - padding}
                    y1={y}
                    y2={y}
                    stroke="rgba(0,88,202,0.14)"
                    strokeDasharray="4 6"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 8}
                    y={y + 5}
                    textAnchor="end"
                    className="fill-[var(--odong-muted-soft)] text-[12px] font-medium"
                  >
                    {formatCurrencyTick(tick)}
                  </text>
                </g>
              );
            })}

            {monthTicks.map((month, index) => {
              const x =
                padding +
                ((width - padding * 2) * index) /
                  Math.max(monthTicks.length - 1, 1);

              return (
                <g key={`${month}-${index}`}>
                  <line
                    x1={x}
                    x2={x}
                    y1={padding}
                    y2={height - padding}
                    stroke="rgba(0,88,202,0.14)"
                    strokeDasharray="4 6"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={height - padding + 20}
                    textAnchor="middle"
                    className="fill-[var(--odong-muted-soft)] text-[12px] font-medium"
                  >
                    {month}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              points={polylinePoints}
              stroke="var(--color-revenue)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />

            {activeTrend.map((item, index) => {
              const { x, y } = getPointPosition({
                value: item.value,
                index,
                total: activeTrend.length,
                width,
                height,
                padding,
              });
              const isActive = activeIndex === index;

              return (
                <g
                  key={item.month}
                  tabIndex={0}
                  role="button"
                  aria-label={`${item.month} ${formatCompactCurrency(item.value)}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  className="outline-none"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? "13" : "11"}
                    fill="transparent"
                    className="cursor-pointer"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? "7" : "5"}
                    fill="var(--odong-surface-strong)"
                    stroke="var(--color-revenue)"
                    strokeWidth="4"
                    className="cursor-pointer transition"
                  />
                </g>
              );
            })}
          </svg>

          {activePoint && activePosition ? (
            <ChartTooltip
              className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-full sm:block"
              style={{
                left: `${(activePosition.x / width) * 100}%`,
                top: `${(activePosition.y / height) * 100}%`,
              }}
            >
              <ChartTooltipContent
                indicator="line"
                label={`${activePoint.month}`}
                value={formatCompactCurrency(activePoint.value)}
              />
            </ChartTooltip>
          ) : null}
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-primary-600 bg-[var(--odong-surface-strong)]" />
          Pendapatan (Rp)
        </div>
        {activePoint ? (
          <p className="text-sm font-bold text-[var(--odong-muted)]">
            Titik aktif: {activePoint.month} •{" "}
            {formatCompactCurrency(activePoint.value)}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}

type OrderStatusCardProps = {
  data?: { status: string; count: number }[];
};

export function OrderStatusCard({ data }: OrderStatusCardProps) {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  // Transform backend data to component format
  const activeDistribution = data
    ? (() => {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        const statusMap: Record<string, { label: string; color: string }> = {
          selesai: { label: "Selesai", color: "#16a34a" },
          proses: { label: "Diproses", color: "#d97706" },
          menunggu: { label: "Menunggu", color: "#e11d48" },
          dibatalkan: { label: "Dibatalkan", color: "#64748b" },
        };
        
        return data.map(item => {
          const normalizedStatus = item.status.toLowerCase();
          const mapping = statusMap[normalizedStatus] || { label: item.status, color: "#94a3b8" };
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          
          return {
            label: mapping.label,
            value: percentage,
            color: mapping.color,
          };
        });
      })()
    : orderStatusByYear["2026"];
  
  const totalOrders = data ? data.reduce((sum, item) => sum + item.count, 0) : totalOrdersByYear["2026"];
  const activeSlices = buildDonutSlices(activeDistribution);
  const activeSlice =
    activeDistribution.find((item) => item.label === activeStatus) ?? null;

  return (
    <Card className="transition hover:-translate-y-0.5">
      <DashboardCardHeader
        icon={Package}
        title="Status Pesanan"
        description="Distribusi saat ini"
      />

      <CardContent className="pt-6">
        <ChartContainer
          config={statusChartConfig}
          className="relative flex min-h-[300px] items-center justify-center rounded-[28px] bg-[var(--odong-surface-muted)] p-5 sm:min-h-[320px]"
        >
          <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
            <svg
              viewBox="0 0 240 240"
              className="absolute inset-0 h-full w-full -rotate-90"
              role="img"
              aria-label="Distribusi status pesanan"
            >
              {activeSlices.map((item) => {
                const dashOffset = -item.offset;
                const isActive = activeStatus === item.label;

                return (
                  <circle
                    key={item.label}
                    cx="120"
                    cy="120"
                    r="84"
                    pathLength="100"
                    fill="none"
                    stroke={item.color}
                    strokeWidth={isActive ? "50" : "44"}
                    strokeDasharray={`${item.value} ${100 - item.value}`}
                    strokeDashoffset={dashOffset}
                    className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                    opacity={activeStatus && !isActive ? 0.45 : 1}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item.label} ${item.value}%`}
                    onMouseEnter={() => setActiveStatus(item.label)}
                    onFocus={() => setActiveStatus(item.label)}
                    onClick={() =>
                      setActiveStatus((current) =>
                        current === item.label ? null : item.label,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveStatus((current) =>
                          current === item.label ? null : item.label,
                        );
                      }
                    }}
                  />
                );
              })}
            </svg>
            <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-center shadow-[0_14px_30px_rgba(25,28,29,0.08)]">
              <span className="text-3xl font-extrabold text-[var(--odong-text)]">
                {activeSlice ? `${activeSlice.value}%` : totalOrders}
              </span>
              <span className="mt-1 text-xs font-bold text-[var(--odong-muted)]">
                {activeSlice ? activeSlice.label : "total pesanan"}
              </span>
            </div>
          </div>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-[var(--odong-muted)]">
          {activeDistribution.map((item) => {
            const isActive = activeStatus === item.label;

            return (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setActiveStatus(item.label)}
              onFocus={() => setActiveStatus(item.label)}
              onClick={() =>
                setActiveStatus((current) =>
                  current === item.label ? null : item.label,
                )
              }
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                isActive
                  ? "border-primary-100 bg-primary-50 text-primary-700"
                  : "border-transparent hover:border-[var(--odong-border)] hover:bg-[var(--odong-surface-muted)]",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}: {item.value}%
            </button>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}

type TopOutletCardProps = {
  data?: { rank: number; name: string; orders: number; revenue: number }[];
};

export function TopOutletCard({ data }: TopOutletCardProps) {
  // Format revenue number to display format
  const formatRevenueDisplay = (value: number): string => {
    if (value >= 1000000) {
      const juta = value / 1000000;
      return `Rp ${juta.toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`;
    }
    if (value >= 1000) {
      const ribu = value / 1000;
      return `Rp ${ribu.toLocaleString("id-ID", { maximumFractionDigits: 0 })}rb`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const activeOutlets = data || topOutlets;

  return (
    <Card>
      <DashboardCardHeader
        icon={TrendingUp}
        title="Outlet Teratas"
        description="Berdasarkan jumlah pesanan bulan ini"
      />

      <CardContent className="pt-6">
        <ol className="divide-y divide-[var(--odong-border)]">
          {activeOutlets.map((outlet) => (
            <li
              key={outlet.rank}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-base font-extrabold text-primary-700">
                  #{outlet.rank}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold text-[var(--odong-text)]">
                    {outlet.name}
                  </p>
                  <p className="text-sm text-[var(--odong-muted-soft)]">
                    {outlet.orders} pesanan
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-extrabold text-[var(--odong-text)]">
                  {typeof outlet.revenue === 'string' ? outlet.revenue : formatRevenueDisplay(outlet.revenue)}
                </p>
                <p className="text-sm text-[var(--odong-muted-soft)]">
                  Pendapatan
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

type LatestActivityCardProps = {
  data?: { id: string; pesan: string; waktu: string; harga: number }[];
};

export function LatestActivityCard({ data }: LatestActivityCardProps) {
  // Transform backend data to component format
  const transformedActivities = data ? data.map((activity) => ({
    id: activity.id,
    title: activity.pesan,
    time: activity.waktu,
    tone: activity.pesan.toLowerCase().includes('batalkan') || activity.pesan.toLowerCase().includes('baru')
      ? 'danger' as const
      : activity.pesan.toLowerCase().includes('kapasitas') || activity.pesan.toLowerCase().includes('warning')
        ? 'warning' as const
        : 'success' as const,
  })) : adminActivities;

  return (
    <Card>
      <DashboardCardHeader
        icon={Clock3}
        title="Aktivitas Terbaru"
        description="Update operasional"
      />

      <CardContent className="pt-6">
        <ul className="divide-y divide-[var(--odong-border)]">
          {transformedActivities.map((activity) => {
            const toneClass =
              activity.tone === "danger"
                ? "bg-rose-50 text-rose-600"
                : activity.tone === "warning"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600";
            const Icon =
              activity.tone === "danger"
                ? CircleAlert
                : activity.tone === "warning"
                  ? Activity
                  : CheckCircle2;

            return (
              <li
                key={activity.id}
                className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl",
                    toneClass,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold leading-6 text-[var(--odong-text)]">
                    {activity.title}
                  </p>
                  <p className="text-sm text-[var(--odong-muted-soft)]">
                    {activity.time}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
