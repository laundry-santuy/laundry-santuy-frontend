import { cn } from "@/lib/utils";
import {
  Check,
  MapPin,
  Navigation,
  Phone,
  Shirt,
  Wallet,
  X,
} from "lucide-react";
import { driverStatusLabels } from "../data";
import type { DriverIncomingOrder, DriverOrderStatus } from "../types";

type IncomingOrderCardProps = {
  order: DriverIncomingOrder;
  onUpdateStatus: (orderId: string, status: DriverOrderStatus) => void;
  isPending?: boolean;
};

const statusStyles = {
  incoming: {
    badge: "bg-primary-50 text-primary-700 ring-primary-100",
    marker: "bg-primary-500",
    line: "from-primary-500 to-primary-300",
  },
  accepted: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    marker: "bg-emerald-500",
    line: "from-emerald-500 to-emerald-300",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 ring-red-100",
    marker: "bg-red-500",
    line: "from-red-500 to-red-300",
  },
} as const;

function getMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

type OrderMetaProps = {
  label: string;
  value: string;
  tone?: "default" | "success";
};

function OrderMeta({ label, value, tone = "default" }: OrderMetaProps) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-extrabold text-[var(--odong-text)] sm:text-base",
          tone === "success" && "text-emerald-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function IncomingOrderCard({
  order,
  onUpdateStatus,
  isPending = false,
}: IncomingOrderCardProps) {
  const mapsUrl = getMapsUrl(order.address);
  const isIncoming = order.status === "incoming";
  const theme = statusStyles[order.status];

  return (
    <article className="group relative overflow-hidden rounded-[34px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-4 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_62px_rgba(25,28,29,0.11)] sm:p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r",
          theme.line,
        )}
      />

      <div className="flex items-start justify-between gap-3 pt-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-sm font-extrabold text-primary-700 shadow-[0_10px_22px_rgba(0,88,202,0.08)]">
            {order.queueNumber.replace("#", "")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--odong-muted-soft)]">
              {order.id}
            </p>
            <h2 className="mt-1 truncate text-xl font-extrabold text-[var(--odong-text)]">
              {order.customerName}
            </h2>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-extrabold ring-1",
            theme.badge,
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", theme.marker)} />
          {driverStatusLabels[order.status]}
        </span>
      </div>

      <div className="mt-5 rounded-[28px] bg-[var(--odong-surface-muted)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.20)]">
              {order.customerInitials}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--odong-muted)]">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {order.phone}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-start gap-2 text-sm font-extrabold leading-6 text-[var(--odong-text)] transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <MapPin
                  className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                  aria-hidden="true"
                />
                <span>{order.address}</span>
              </a>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.20)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Maps
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4 sm:grid-cols-4">
        <OrderMeta label="Jemput" value={order.pickupTime} />
        <OrderMeta label="Jarak" value={order.distance} />
        <OrderMeta label="Berat" value={order.estimatedWeight} />
        <OrderMeta
          label="Harga"
          value={order.estimatedPrice}
          tone="success"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[24px] bg-primary-50/70 px-4 py-3 text-sm font-bold text-[var(--odong-text)]">
        <Shirt className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{order.service}</span>
        <Wallet className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
      </div>

      {isIncoming ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus(order.id, "rejected")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white/80 px-4 text-sm font-extrabold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Tolak
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus(order.id, "accepted")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Memproses..." : "Ambil"}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[var(--odong-muted)]">
            Order sudah {driverStatusLabels[order.status].toLowerCase()}.
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Rute
          </a>
        </div>
      )}
    </article>
  );
}
