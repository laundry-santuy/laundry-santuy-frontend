import { AlertCircle, History, Loader2 } from "lucide-react";

export function RiwayatLoadingState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-[var(--odong-muted)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-sm font-semibold">Memuat riwayat...</p>
    </div>
  );
}

export function RiwayatErrorState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <div>
        <p className="font-extrabold text-[var(--odong-text)]">Gagal memuat riwayat</p>
        <p className="mt-1 text-sm text-[var(--odong-muted)]">Periksa koneksi lalu coba lagi.</p>
      </div>
    </div>
  );
}

export function RiwayatEmptyState({ filtered }: { filtered?: boolean }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-400">
        <History className="h-8 w-8" />
      </span>
      <div>
        <p className="font-extrabold text-[var(--odong-text)]">
          {filtered ? "Tidak ada hasil" : "Belum ada riwayat"}
        </p>
        <p className="mt-1 text-sm text-[var(--odong-muted)]">
          {filtered
            ? "Coba ubah filter atau kata kunci pencarian."
            : "Riwayat pesanan yang selesai atau dibatalkan akan muncul di sini."}
        </p>
      </div>
    </div>
  );
}
