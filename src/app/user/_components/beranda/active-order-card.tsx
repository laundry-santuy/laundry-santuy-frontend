import { Clock, MessageCircle, Phone, Star, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveOrder, ActiveOrderStep } from "./types";

type ActiveOrderCardProps = {
  order: ActiveOrder;
};

function StepIndicator({
  step,
  meta,
  valueClassName,
}: {
  step: ActiveOrderStep;
  meta: { label: string; value: string };
  valueClassName?: string;
}) {
  const Icon = step.icon;
  const isDone = step.status === "done";
  const isCurrent = step.status === "current";

  return (
    <li className="relative flex min-w-0 flex-col items-center text-center">
      <div className="odong-surface-muted min-h-[48px] w-full rounded-2xl px-2 py-2">
        <p className="odong-muted-soft text-[10px] font-semibold uppercase leading-3 tracking-wide text-neutral-400">
          {meta.label}
        </p>
        <p
          className={cn(
            "odong-text mt-1 truncate text-xs font-bold leading-4 text-neutral-900 sm:text-sm",
            valueClassName,
          )}
        >
          {meta.value}
        </p>
      </div>

      <div className="relative mt-4 flex w-full justify-center">
        <div
          className={cn(
            "z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 transition duration-200",
            isDone &&
              "border-primary-500 bg-primary-500 text-white shadow-[0_8px_16px_rgba(38,113,238,0.22)]",
            isCurrent &&
              "border-primary-500 bg-primary-50 text-primary-600 shadow-[0_0_0_4px_rgba(38,113,238,0.08)]",
            !isDone && !isCurrent && "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted-soft)]",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <span
        className={cn(
          "mt-2 text-xs font-semibold leading-4",
          isCurrent ? "text-neutral-900" : "text-neutral-500",
          isCurrent ? "odong-text" : "odong-muted",
        )}
      >
        {step.label}
      </span>
    </li>
  );
}

export function ActiveOrderCard({ order }: ActiveOrderCardProps) {
  const stepMeta = [
    { label: "ID Order", value: order.id },
    { label: "Layanan", value: order.service },
    { label: "Berat", value: order.weight },
    { label: "Estimasi", value: order.eta },
  ];

  return (
    <article className="odong-surface-strong rounded-[24px] p-4 shadow-[0_18px_40px_rgba(25,28,29,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(25,28,29,0.07)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Pesanan aktif
          </p>
          <h3 className="odong-text mt-1 text-xl font-extrabold leading-7 text-neutral-900 sm:text-2xl">
            Laundry sedang diproses
          </h3>
          <p className="odong-muted mt-1 max-w-xl text-sm leading-6 text-neutral-500">
            Status terakhir: pakaian kamu sedang masuk tahap setrika dan akan
            segera siap dikirim kembali.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {order.eta}
        </div>
      </div>

      <ol className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[86px] hidden h-0.5 bg-[var(--odong-border)] sm:block" />
        <div className="pointer-events-none absolute left-[12.5%] right-[37.5%] top-[86px] hidden h-0.5 bg-primary-500 sm:block" />
        {order.steps.map((step, index) => (
          <StepIndicator
            key={step.label}
            step={step}
            meta={stepMeta[index]}
            valueClassName={index === 3 ? "text-primary-600" : undefined}
          />
        ))}
      </ol>

      <div className="odong-surface-muted mt-5 grid gap-3 rounded-2xl p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
          AH
          </div>
          <div className="min-w-0">
            <p className="odong-text text-sm font-bold leading-5 text-neutral-900">
              {order.courier.name} - Kurir
            </p>
            <p className="odong-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Star
                  className="h-3.5 w-3.5 fill-[#ffc107] text-[#ffc107]"
                  aria-hidden="true"
                />
                {order.courier.rating}
              </span>
              <span aria-hidden="true">·</span>
              <span>{order.courier.vehicle}</span>
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                {order.courier.distance}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <button
            type="button"
            aria-label="Telepon kurir"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_8px_18px_rgba(38,113,238,0.25)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Kirim pesan ke kurir"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_8px_18px_rgba(38,113,238,0.25)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
