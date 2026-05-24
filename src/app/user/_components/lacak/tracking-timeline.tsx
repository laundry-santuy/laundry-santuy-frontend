"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackingStep } from "./types";

type TrackingTimelineProps = {
  steps: TrackingStep[];
  estNextStep?: string;
};

const stepCopy = {
  done:     "Selesai",
  current:  "Dalam Proses",
  upcoming: "Berikutnya",
} as const;

const STEPS_PER_PAGE = 3;

export function TrackingTimeline({ steps, estNextStep }: TrackingTimelineProps) {
  const totalPages = Math.ceil(steps.length / STEPS_PER_PAGE);

  // Auto-navigate to page containing the active step
  const activeIndex = steps.findIndex((s) => s.status === "current");
  const defaultPage = activeIndex >= 0
    ? Math.floor(activeIndex / STEPS_PER_PAGE)
    : Math.max(0, totalPages - 1);

  const [page, setPage] = useState(defaultPage);

  // Re-sync when steps change (e.g. after polling refresh)
  useEffect(() => {
    const idx = steps.findIndex((s) => s.status === "current");
    if (idx >= 0) setPage(Math.floor(idx / STEPS_PER_PAGE));
  }, [steps]);

  // Inject AI ETA ke step upcoming pertama (langsung setelah step current)
  const firstUpcomingIdx = steps.findIndex((s) => s.status === "upcoming");
  const enrichedSteps = steps.map((s, i) =>
    i === firstUpcomingIdx && estNextStep && s.time === "-"
      ? { ...s, time: `Est. ${estNextStep}` }
      : s,
  );
  const visibleSteps = enrichedSteps.slice(page * STEPS_PER_PAGE, page * STEPS_PER_PAGE + STEPS_PER_PAGE);
  const doneCount    = steps.filter((s) => s.status === "done").length;

  return (
    <section className="rounded-[32px] border border-primary-100 bg-white p-5 shadow-[0_8px_24px_rgba(0,88,202,0.06)] sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">Timeline pengerjaan</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
            Status terbaru dari outlet.
          </h2>
        </div>
        <span className="text-sm font-semibold text-[var(--odong-muted)]">
          {doneCount} dari {steps.length} tahap selesai
        </span>
      </div>

      {/* Steps */}
      <ol className="relative mt-6 space-y-4">
        <div className="absolute bottom-8 left-5 top-8 w-px bg-[var(--odong-border)] sm:left-6" />
        {visibleSteps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.id} className="relative flex gap-4">
              <span
                className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition sm:h-12 sm:w-12",
                  step.status === "done"     && "border-primary-500 bg-primary-500 text-white shadow-[0_10px_20px_rgba(38,113,238,0.20)]",
                  step.status === "current"  && "border-primary-500 bg-primary-600 text-white shadow-[0_0_0_5px_rgba(38,113,238,0.15),0_8px_18px_rgba(0,88,202,0.22)]",
                  step.status === "upcoming" && "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted-soft)]",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <article
                className={cn(
                  "min-w-0 flex-1 rounded-[24px] border-2 p-4 transition duration-200",
                  step.status === "current"
                    ? "border-primary-400 bg-white shadow-[0_4px_16px_rgba(0,88,202,0.10)]"
                    : "border-primary-100 bg-white",
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--odong-text)]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">{step.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <span className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      step.status === "done"     && "bg-primary-600 text-white",
                      step.status === "current"  && "bg-primary-100 text-primary-700",
                      step.status === "upcoming" && "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
                    )}>
                      {stepCopy[step.status]}
                    </span>
                    <span className="rounded-full bg-[var(--odong-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--odong-muted)]">
                      {step.time}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-primary-50 pt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Tahap sebelumnya"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Halaman ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === page
                    ? "w-6 bg-primary-600"
                    : "w-2 bg-primary-200 hover:bg-primary-300",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="Tahap berikutnya"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-primary-100 bg-white text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
