"use client";

import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "panel";
};

const dialogSizeClass = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

export function AdminDialog({
  open,
  title,
  description,
  children,
  onClose,
  size = "md",
  tone = "default",
}: AdminDialogProps) {
  const panelTone = tone === "panel";

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-[rgba(17,27,41,0.42)] backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[80] max-h-[88dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] shadow-[0_24px_70px_rgba(25,28,29,0.18)] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            dialogSizeClass[size],
          )}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b border-[var(--odong-border)] px-5 py-5",
              panelTone
                ? "bg-[var(--odong-surface-strong)]"
                : "bg-[var(--odong-surface-soft)]",
            )}
          >
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-xl font-extrabold leading-tight tracking-normal text-[var(--odong-text)]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-2 max-w-[65ch] text-sm leading-6 text-[var(--odong-muted)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Tutup dialog"
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                  panelTone
                    ? "border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100"
                    : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] hover:bg-primary-50 hover:text-primary-700",
                )}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <div className="max-h-[calc(88dvh-128px)] overflow-y-auto px-5 py-5">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
