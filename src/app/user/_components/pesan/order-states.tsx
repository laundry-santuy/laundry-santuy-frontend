import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

type OrderStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function OrderStateCard({
  icon: Icon,
  title,
  description,
}: OrderStateCardProps) {
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

export function OrderLoadingState() {
  return (
    <section
      aria-label="Memuat halaman order"
      className="mx-auto grid w-full max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="space-y-5">
        <div className="h-[180px] animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[190px] animate-pulse rounded-[24px] bg-[var(--odong-surface)]" />
          <div className="h-[190px] animate-pulse rounded-[24px] bg-[var(--odong-surface)]" />
        </div>
        <div className="h-[360px] animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-[520px] animate-pulse rounded-[28px] bg-[var(--odong-surface)]" />
      <span className="sr-only">Memuat data order</span>
    </section>
  );
}

export function OrderErrorState() {
  return (
    <OrderStateCard
      icon={AlertCircle}
      title="Order belum bisa dimuat"
      description="Coba muat ulang halaman atau kembali ke beranda sebelum membuat pesanan baru."
    />
  );
}

export function OrderEmptyState({
  title = "Layanan belum tersedia",
  description = "Daftar layanan akan muncul di sini setelah outlet Laundry Santuy aktif menerima order.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <OrderStateCard
      icon={Inbox}
      title={title}
      description={description}
    />
  );
}
