"use client";

import { useCallback, useState } from "react";

export type ToastVariant = "success" | "error";

export type DriverToast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

export function useDriverToast() {
  const [toasts, setToasts] = useState<DriverToast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}