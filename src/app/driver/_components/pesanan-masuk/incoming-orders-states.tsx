import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, PackageSearch } from "lucide-react";

type IncomingOrdersStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function IncomingOrdersState({
  icon: Icon,
  title,
  description,
}: IncomingOrdersStateProps) {
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

export function IncomingOrdersLoadingState() {
  return (
    <section
      className="space-y-5"
      aria-label="Memuat pesanan masuk driver"
    >
      <div className="h-24 animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="h-24 animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-24 animate-pulse rounded-[30px] bg-[var(--odong-surface)]" />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-[430px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="h-[430px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      </div>
    </section>
  );
}

export function IncomingOrdersErrorState() {
  return (
    <IncomingOrdersState
      icon={AlertCircle}
      title="Pesanan masuk belum bisa dimuat"
      description="Coba refresh halaman atau cek koneksi sebelum menerima order baru."
    />
  );
}

export function IncomingOrdersEmptyState() {
  return (
    <IncomingOrdersState
      icon={Inbox}
      title="Belum ada pesanan masuk"
      description="Saat ada order pickup baru, daftar pesanan akan muncul di sini."
    />
  );
}

export function IncomingOrdersNoResultState() {
  return (
    <IncomingOrdersState
      icon={PackageSearch}
      title="Pesanan tidak ditemukan"
      description="Coba ubah kata kunci pencarian atau filter status order."
    />
  );
}
