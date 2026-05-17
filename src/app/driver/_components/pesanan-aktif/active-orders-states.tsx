import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, PackageSearch } from "lucide-react";

type ActiveOrdersStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function ActiveOrdersState({
  icon: Icon,
  title,
  description,
}: ActiveOrdersStateProps) {
  return (
    <section className="flex min-h-[360px] items-center justify-center rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-8 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
      <div className="max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
          {description}
        </p>
      </div>
    </section>
  );
}

export function ActiveOrdersLoadingState() {
  return (
    <section
      aria-label="Memuat pesanan aktif driver"
      className="space-y-5"
    >
      <div className="h-24 animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-24 animate-pulse rounded-[30px] bg-[var(--odong-surface)]" />
      <div className="h-[520px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
    </section>
  );
}

export function ActiveOrdersErrorState() {
  return (
    <ActiveOrdersState
      icon={AlertCircle}
      title="Pesanan aktif belum bisa dimuat"
      description="Coba refresh halaman atau cek koneksi sebelum memperbarui proses order."
    />
  );
}

export function ActiveOrdersEmptyState() {
  return (
    <ActiveOrdersState
      icon={Inbox}
      title="Belum ada pesanan aktif"
      description="Order yang sudah diterima akan muncul di sini dan dikelompokkan berdasarkan proses."
    />
  );
}

export function ActiveOrdersNoResultState() {
  return (
    <ActiveOrdersState
      icon={PackageSearch}
      title="Pesanan aktif tidak ditemukan"
      description="Coba ubah kata kunci pencarian atau filter proses order."
    />
  );
}
