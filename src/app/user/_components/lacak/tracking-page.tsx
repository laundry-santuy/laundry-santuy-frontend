"use client";

import { useMemo, useState } from "react";
import {
  trackingCheckpoints,
  trackingInsights,
  trackingOrders,
} from "./data";
import { TrackingHero } from "./tracking-hero";
import { TrackingOrderSwitcher } from "./tracking-order-switcher";
import { TrackingSidePanel } from "./tracking-side-panel";
import {
  TrackingEmptyState,
  TrackingErrorState,
  TrackingLoadingState,
} from "./tracking-states";
import { TrackingTimeline } from "./tracking-timeline";
import type { TrackingPageStatus } from "./types";

type TrackingPageProps = {
  status?: TrackingPageStatus;
};

export function TrackingPage({ status = "ready" }: TrackingPageProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(
    trackingOrders[0]?.id ?? "",
  );

  const selectedOrder = useMemo(
    () =>
      trackingOrders.find((order) => order.id === selectedOrderId) ??
      trackingOrders[0],
    [selectedOrderId],
  );

  if (status === "loading") {
    return <TrackingLoadingState />;
  }

  if (status === "error") {
    return <TrackingErrorState />;
  }

  if (status === "empty" || !selectedOrder) {
    return <TrackingEmptyState />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5">
        <TrackingHero order={selectedOrder} insights={trackingInsights} />

        <TrackingOrderSwitcher
          orders={trackingOrders}
          selectedOrderId={selectedOrder.id}
          onSelectOrder={setSelectedOrderId}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <TrackingTimeline steps={selectedOrder.timeline} />
          </div>

          <TrackingSidePanel
            order={selectedOrder}
            checkpoints={trackingCheckpoints}
          />
        </div>

        <span className="sr-only" aria-live="polite">
          Order yang sedang dilacak: {selectedOrder.id},{" "}
          {selectedOrder.statusLabel}.
        </span>
      </div>
    </div>
  );
}
