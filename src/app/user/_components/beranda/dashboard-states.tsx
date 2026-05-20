import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

type DashboardStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function DashboardStateCard({
  icon: Icon,
  title,
  description,
}: DashboardStateCardProps) {
  return (
    <section className="mx-auto flex min-h-[420px] w-full max-w-[896px] items-center justify-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] p-8 text-center shadow-[0_18px_40px_rgba(25,28,29,0.04)]">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[var(--odong-text)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">{description}</p>
      </div>
    </section>
  );
}

export function DashboardLoadingState() {
  return (
    <section
      aria-label="Memuat beranda"
      className="mx-auto grid w-full max-w-[896px] gap-4 lg:grid-cols-[minmax(0,1fr)_180px]"
    >
      <div className="space-y-4">
        <div className="h-[138px] animate-pulse rounded-2xl bg-[var(--odong-surface-strong)]" />
        <div className="h-[184px] animate-pulse rounded-2xl bg-[var(--odong-surface-strong)]" />
        <div className="h-[90px] animate-pulse rounded-2xl bg-[var(--odong-surface-strong)]" />
      </div>
      <div className="space-y-4">
        <div className="h-[184px] animate-pulse rounded-2xl bg-[var(--odong-surface-strong)]" />
        <div className="h-[168px] animate-pulse rounded-2xl bg-[var(--odong-surface-strong)]" />
      </div>
      <span className="sr-only">Memuat data beranda</span>
    </section>
  );
}

export function DashboardErrorState({ detail }: { detail?: string | null }) {
  return (
    <DashboardStateCard
      icon={AlertCircle}
      title="Beranda belum bisa dimuat"
      description={detail ?? "Coba muat ulang halaman atau cek koneksi internet sebelum membuat pesanan baru."}
    />
  );
}

export function DashboardEmptyState() {
  return (
    <DashboardStateCard
      icon={Inbox}
      title="Belum ada pesanan"
      description="Pesanan aktif dan riwayat terbaru akan muncul di sini setelah kamu menggunakan layanan Laundry Santuy."
    />
  );
}
