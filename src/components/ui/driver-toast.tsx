"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, X, XCircle } from "lucide-react";
import type { DriverToast } from "@/hooks/use-driver-toast";

type DriverToastListProps = {
  toasts: DriverToast[];
  onDismiss: (id: number) => void;
};

export function DriverToastList({ toasts, onDismiss }: DriverToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-8"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_46px_rgba(25,28,29,0.18)] backdrop-blur-xl",
            "animate-in fade-in slide-in-from-bottom-4 duration-300",
            t.variant === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-red-100 bg-red-50 text-red-800",
          )}
        >
          {t.variant === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          )}
          <p className="text-sm font-bold">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Tutup notifikasi"
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full transition",
              t.variant === "success"
                ? "hover:bg-emerald-100 text-emerald-600"
                : "hover:bg-red-100 text-red-600",
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}