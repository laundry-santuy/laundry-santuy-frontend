"use client";

import { useMemo, useState } from "react";
import {
  historyFilters,
  historyMetrics,
  historyOrders,
} from "./data";
import { HistoryDetailPanel } from "./history-detail-panel";
import { HistoryHero } from "./history-hero";
import { HistoryOrderList } from "./history-order-list";
import {
  HistoryEmptyState,
  HistoryErrorState,
  HistoryLoadingState,
} from "./history-states";
import { HistoryToolbar } from "./history-toolbar";
import type { HistoryFilter, HistoryPageStatus } from "./types";

type OrderHistoryPageProps = {
  status?: HistoryPageStatus;
};

export function OrderHistoryPage({ status = "ready" }: OrderHistoryPageProps) {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(
    historyOrders[0]?.id ?? "",
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return historyOrders.filter((order) => {
      const matchesFilter =
        activeFilter === "Semua" || order.status === activeFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          order.id,
          order.service,
          order.status,
          order.outlet,
          order.address,
          order.courier,
          order.paymentMethod,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0];

  if (status === "loading") {
    return <HistoryLoadingState />;
  }

  if (status === "error") {
    return <HistoryErrorState />;
  }

  if (status === "empty" || historyOrders.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-24 sm:pb-28">
        <HistoryHero metrics={historyMetrics} totalOrders={historyOrders.length} />

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
          filters={historyFilters}
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
