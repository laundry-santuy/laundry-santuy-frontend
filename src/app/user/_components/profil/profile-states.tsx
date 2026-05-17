import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

type ProfileStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function ProfileStateCard({
  icon: Icon,
  title,
  description,
}: ProfileStateCardProps) {
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

export function ProfileLoadingState() {
  return (
    <section
      aria-label="Memuat profil"
      className="mx-auto grid w-full max-w-[1440px] gap-5 xl:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div className="space-y-5">
        <div className="h-[280px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="h-[320px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="h-[300px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-[680px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <span className="sr-only">Memuat data profil pelanggan</span>
    </section>
  );
}

export function ProfileErrorState() {
  return (
    <ProfileStateCard
      icon={AlertCircle}
      title="Profil belum bisa dimuat"
      description="Coba muat ulang halaman atau masuk kembali untuk sinkronisasi data akun."
    />
  );
}

export function ProfileEmptyState() {
  return (
    <ProfileStateCard
      icon={Inbox}
      title="Data profil masih kosong"
      description="Lengkapi data pribadi, alamat pickup, dan preferensi laundry agar order berikutnya lebih cepat."
    />
  );
}
