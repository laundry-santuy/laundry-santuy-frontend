"use client";

import { AlertCircle, Loader } from "lucide-react";

export function SettingsLoadingState() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader className="mx-auto h-12 w-12 animate-spin text-primary-600" />
        <p className="text-lg font-semibold text-[var(--odong-text)]">
          Memuat pengaturan...
        </p>
        <p className="text-sm text-[var(--odong-muted)]">
          Silakan tunggu sebentar
        </p>
      </div>
    </div>
  );
}

export function SettingsErrorState({ error }: { error: string | null }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
        <p className="text-lg font-semibold text-[var(--odong-text)]">
          Gagal memuat pengaturan
        </p>
        <p className="text-sm text-[var(--odong-muted)]">
          {error || "Terjadi kesalahan saat memuat data pengaturan"}
        </p>
      </div>
    </div>
  );
}
