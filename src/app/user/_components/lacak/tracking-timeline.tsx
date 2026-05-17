import { cn } from "@/lib/utils";
import type { TrackingStep } from "./types";

type TrackingTimelineProps = {
  steps: TrackingStep[];
};

const stepCopy = {
  done: "Selesai",
  current: "Berjalan",
  upcoming: "Berikutnya",
} as const;

export function TrackingTimeline({ steps }: TrackingTimelineProps) {
  return (
    <section className="h-full rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.06)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">
            Timeline pengerjaan
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
            Status terbaru dari outlet.
          </h2>
        </div>
        <span className="text-sm font-semibold text-[var(--odong-muted)]">
          {steps.filter((step) => step.status === "done").length} dari{" "}
          {steps.length} tahap selesai
        </span>
      </div>

      <ol className="relative mt-6 space-y-4">
        <div className="absolute bottom-8 left-5 top-8 w-px bg-[var(--odong-border)] sm:left-6" />
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <li key={step.id} className="relative flex gap-4">
              <span
                className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition sm:h-12 sm:w-12",
                  step.status === "done" &&
                    "border-primary-500 bg-primary-500 text-white shadow-[0_10px_20px_rgba(38,113,238,0.20)]",
                  step.status === "current" &&
                    "border-primary-500 bg-primary-50 text-primary-600 shadow-[0_0_0_5px_rgba(38,113,238,0.08)]",
                  step.status === "upcoming" &&
                    "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted-soft)]",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <article
                className={cn(
                  "min-w-0 flex-1 rounded-[24px] border p-4 transition duration-200",
                  step.status === "current"
                    ? "border-primary-100 bg-primary-50"
                    : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)]",
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--odong-text)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-primary-700">
                      {stepCopy[step.status]}
                    </span>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[var(--odong-muted)]">
                      {step.time}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
