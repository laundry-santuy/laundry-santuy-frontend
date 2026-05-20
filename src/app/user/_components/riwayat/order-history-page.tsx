"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ReceiptText,
  Wallet,
} from "lucide-react";
import {
  fetchRiwayat,
  formatRupiah,
  formatWaktu,
  mapBeStatus,
  type RiwayatResponse,
} from "@/lib/user-api";
import { HistoryDetailPanel } from "./history-detail-panel";
import { HistoryHero } from "./history-hero";
import { HistoryOrderList } from "./history-order-list";
import {
  HistoryEmptyState,
  HistoryErrorState,
  HistoryLoadingState,
} from "./history-states";
import { HistoryToolbar } from "./history-toolbar";
import type {
  HistoryFilter,
  HistoryMetric,
  HistoryOrder,
  HistoryOrderStatus,
  HistoryPageStatus,
} from "./types";

type OrderHistoryPageProps = {
  status?: HistoryPageStatus;
};

const HISTORY_FILTERS: HistoryFilter[] = [
  "Semua",
  "Selesai",
  "Siap Diambil",
  "Diproses",
  "Dibatalkan",
];

const VALID_STATUSES: HistoryOrderStatus[] = [
  "Selesai",
  "Siap Diambil",
  "Diproses",
  "Dibatalkan",
];

function mapRawToHistoryOrder(
  raw: RiwayatResponse["riwayat"][number],
): HistoryOrder {
  const mapped = mapBeStatus(raw.status);
  const status: HistoryOrderStatus = VALID_STATUSES.includes(
    mapped as HistoryOrderStatus,
  )
    ? (mapped as HistoryOrderStatus)
    : "Diproses";

  return {
    id: raw.kodePesanan,
    service: raw.namaLayanan,
    status,
    date: formatWaktu(raw.waktu),
    time: "-",
    weight: `${raw.berat} kg`,
    total: formatRupiah(raw.total),
    subtotal: formatRupiah(raw.total),
    discount: "Rp 0",
    paymentMethod: "-",
    paymentStatus:
      status === "Selesai" ? "Lunas" : status === "Dibatalkan" ? "Refund" : "Menunggu",
    outlet: raw.outlet,
    address: "-",
    courier: "-",
    note: "-",
    items: [
      {
        name: raw.namaLayanan,
        quantity: `${raw.berat} kg`,
        price: formatRupiah(raw.total),
      },
    ],
  };
}

function buildMetrics(summary: RiwayatResponse["kartuRingkasan"]): HistoryMetric[] {
  return [
    {
      label: "Total order",
      value: `${summary.totalPesanan}x`,
      description: "Semua transaksi laundry.",
      icon: ReceiptText,
    },
    {
      label: "Selesai",
      value: String(summary.selesai),
      description: "Order berhasil diterima.",
      icon: CheckCircle2,
    },
    {
      label: "Total pengeluaran",
      value: formatRupiah(summary.totalPengeluaran),
      description: "Akumulasi dari order selesai.",
      icon: Wallet,
    },
    {
      label: "Dalam proses",
      value: String(summary.totalPesanan - summary.selesai),
      description: "Order sedang berjalan.",
      icon: Clock,
    },
  ];
}

export function OrderHistoryPage({ status: propStatus = "ready" }: OrderHistoryPageProps) {
  const [pageStatus, setPageStatus] = useState<HistoryPageStatus>("loading");
  const [apiData, setApiData] = useState<RiwayatResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");

  useEffect(() => {
    fetchRiwayat()
      .then((data) => {
        setApiData(data);
        setPageStatus(data.riwayat.length === 0 ? "empty" : "ready");
        if (data.riwayat[0]) {
          setSelectedOrderId(data.riwayat[0].kodePesanan);
        }
      })
      .catch(() => setPageStatus("error"));
  }, []);

  const allOrders: HistoryOrder[] = useMemo(
    () => (apiData?.riwayat ?? []).map(mapRawToHistoryOrder),
    [apiData],
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allOrders.filter((order) => {
      const matchFilter =
        activeFilter === "Semua" || order.status === activeFilter;
      const matchSearch =
        q.length === 0 ||
        [order.id, order.service, order.status, order.outlet]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchFilter && matchSearch;
    });
  }, [allOrders, activeFilter, searchQuery]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ?? filteredOrders[0];

  const metrics = useMemo(
    () => (apiData ? buildMetrics(apiData.kartuRingkasan) : []),
    [apiData],
  );

  const effectiveStatus = propStatus !== "ready" ? propStatus : pageStatus;

  if (effectiveStatus === "loading") return <HistoryLoadingState />;
  if (effectiveStatus === "error")   return <HistoryErrorState />;
  if (effectiveStatus === "empty" || allOrders.length === 0) return <HistoryEmptyState />;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-24 sm:pb-28">
        <HistoryHero metrics={metrics} totalOrders={allOrders.length} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 h-full">
            <HistoryOrderList
              orders={filteredOrders}
              selectedOrderId={selectedOrder?.id}
              onSelectOrder={setSelectedOrderId}
            />
          </div>
          <HistoryDetailPanel order={selectedOrder} />
        </div>

        <span className="sr-only" aria-live="polite">
          {selectedOrder
            ? `Riwayat order terpilih: ${selectedOrder.id}, ${selectedOrder.status}.`
            : "Tidak ada riwayat yang sesuai filter."}
        </span>

        <HistoryToolbar
          filters={HISTORY_FILTERS}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          resultCount={filteredOrders.length}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
}