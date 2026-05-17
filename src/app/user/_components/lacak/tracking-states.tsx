import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

type TrackingStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function TrackingStateCard({
  icon: Icon,
  title,
  description,
}: TrackingStateCardProps) {
  return (
    <section className="mx-auto flex min-h-[420px] w-full max-w-4xl items-center justify-center rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-8 text-center shadow-[0_18px_40px_rgba(25,28,29,0.05)] backdrop-blur-xl">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
          {description}
        </p>
      </div>
    </section>
  );
}

export function TrackingLoadingState() {
  return (
    <section
      aria-label="Memuat halaman lacak"
      className="mx-auto grid w-full max-w-[1440px] gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div className="space-y-5">
        <div className="h-[260px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[150px] animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
          <div className="h-[150px] animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        </div>
        <div className="h-[340px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="h-[420px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-[620px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <span className="sr-only">Memuat data pelacakan pesanan</span>
    </section>
  );
}

export function TrackingErrorState() {
  return (
    <TrackingStateCard
      icon={AlertCircle}
      title="Status pesanan belum bisa dimuat"
      description="Coba muat ulang halaman atau cek kembali koneksi sebelum menghubungi kurir."
    />
  );
}

export function TrackingEmptyState() {
  return (
    <TrackingStateCard
      icon={Inbox}
      title="Belum ada order yang bisa dilacak"
      description="Order aktif dan jadwal pickup akan muncul di sini setelah kamu membuat pesanan baru."
    />
  );
}
