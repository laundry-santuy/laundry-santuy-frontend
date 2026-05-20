import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  activeProcessStages,
  activeStageLabels,
  getNextActiveStage,
} from "./data";
import type { DriverActiveOrder, DriverActiveProcessStage } from "../types";

type ActiveOrderCardProps = {
  order: DriverActiveOrder;
  onAdvanceStage: (orderId: string) => void;
  onOpenDetail: (order: DriverActiveOrder) => void;
  isPending?: boolean;
};

const stageTone = {
  "menuju-lokasi": "bg-primary-50 text-primary-700",
  dijemput: "bg-cyan-50 text-cyan-700",
  "di-laundry": "bg-tertiary-50 text-tertiary-700",
  diantar: "bg-emerald-50 text-emerald-700",
} as const;

function getStageIndex(stage: DriverActiveProcessStage) {
  return activeProcessStages.findIndex((item) => item.id === stage);
}

function getMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

type ProgressStepperProps = {
  currentStage: DriverActiveProcessStage;
};

function ProgressStepper({ currentStage }: ProgressStepperProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-2">
        {activeProcessStages.map((stage, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const reached = completed || active;

          return (
            <div
              key={stage.id}
              className="relative flex min-w-0 flex-col items-center text-center"
            >
              {index < activeProcessStages.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 h-0.5 rounded-full",
                    completed ? "bg-primary-500" : "bg-[var(--odong-border)]",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition",
                  reached
                    ? "bg-primary-600 text-white shadow-[0_10px_20px_rgba(0,88,202,0.18)]"
                    : "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
                )}
              >
                {completed ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "mt-2 text-[11px] font-semibold leading-4 sm:text-xs",
                  active ? "text-primary-700" : "text-[var(--odong-muted)]",
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActiveOrderCard({
  order,
  onAdvanceStage,
  onOpenDetail,
  isPending = false,
}: ActiveOrderCardProps) {
  const nextStage = getNextActiveStage(order.currentStage);
  const actionLabel = nextStage
    ? `Update: ${activeStageLabels[nextStage]}`
    : "Tandai Selesai";

  return (
    <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(25,28,29,0.10)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-extrabold text-primary-700">
            {order.queueNumber}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--odong-muted)]">
              Order ID
            </p>
            <h2 className="mt-1 truncate text-2xl font-extrabold text-[var(--odong-text)]">
              {order.id}
            </h2>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex h-10 w-fit items-center justify-center rounded-2xl px-4 text-sm font-extrabold",
            stageTone[order.currentStage],
          )}
        >
          {activeStageLabels[order.currentStage]}
        </span>
      </div>

      <ProgressStepper currentStage={order.currentStage} />

      <section className="mt-5 rounded-3xl bg-[var(--odong-surface-muted)] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.20)]">
            {order.customerInitials}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-base font-extrabold text-[var(--odong-text)]">
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{order.customerName}</span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {order.phone}
            </p>
            <a
              href={getMapsUrl(order.address)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--odong-text)] transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                aria-hidden="true"
              />
              <span>{order.address}</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_120px_150px] sm:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--odong-muted)]">Layanan</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--odong-text)]">
            {order.service}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--odong-muted)]">Berat</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--odong-text)]">
            {order.weight}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-bold text-[var(--odong-muted)]">
            Waktu Jemput
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-lg font-extrabold text-primary-600 sm:justify-end">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {order.pickupTime}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl bg-primary-100/75 px-4 py-4">
        <span className="flex items-center gap-2 text-base font-extrabold text-[var(--odong-text)]">
          <Wallet className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Total Harga
        </span>
        <span className="text-xl font-extrabold text-emerald-600">
          {order.totalPrice}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpenDetail(order)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-500 bg-white/80 px-4 text-sm font-extrabold text-primary-600 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          Lihat Detail
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onAdvanceStage(order.id)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Memproses..." : actionLabel}
        </button>
      </div>
    </article>
  );
}
