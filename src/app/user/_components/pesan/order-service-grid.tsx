import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceOption } from "./types";

type OrderServiceGridProps = {
  services: ServiceOption[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderServiceGrid({
  services,
  selectedServiceId,
  onSelectService,
}: OrderServiceGridProps) {
  return (
    <section
      className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl sm:p-6"
      aria-labelledby="service-title"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">Layanan</p>
          <h2
            id="service-title"
            className="text-2xl font-extrabold text-[var(--odong-text)]"
          >
            Pilih paket laundry
          </h2>
        </div>
        <p className="text-sm font-medium text-[var(--odong-muted)]">
          Harga estimasi sebelum penimbangan final.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {services.map((service) => {
          const Icon = service.icon;
          const selected = service.id === selectedServiceId;

          return (
            <button
              key={service.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectService(service.id)}
              className={cn(
                "group flex w-full flex-col gap-4 rounded-[22px] border p-4 text-left transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99] sm:flex-row sm:items-center sm:justify-between",
                selected
                  ? "border-primary-200 bg-primary-600 text-white shadow-[0_16px_36px_rgba(0,88,202,0.18)]"
                  : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:border-primary-100 hover:bg-primary-50/60",
              )}
            >
              <span className="flex min-w-0 items-start gap-4">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  {selected ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-700">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold">
                      {service.name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-primary-50 text-primary-700",
                      )}
                    >
                      {service.badge}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-sm leading-6",
                      selected ? "text-white/80" : "text-[var(--odong-muted)]",
                    )}
                  >
                    {service.description}
                  </span>
                </span>
              </span>

              <span className="flex shrink-0 items-center justify-between gap-4 sm:min-w-[168px] sm:justify-end">
                <span className="sm:text-right">
                  <span
                    className={cn(
                      "block text-sm font-extrabold",
                      selected ? "text-white" : "text-primary-700",
                    )}
                  >
                    {formatCurrency(service.price)}/{service.unit}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs font-medium",
                      selected
                        ? "text-white/70"
                        : "text-[var(--odong-muted-soft)]",
                    )}
                  >
                    Estimasi {service.eta}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition",
                    selected
                      ? "border-white bg-white text-primary-700"
                      : "border-primary-200 bg-white text-transparent group-hover:text-primary-600",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
