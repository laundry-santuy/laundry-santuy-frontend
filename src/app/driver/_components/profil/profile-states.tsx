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
    <section className="mx-auto flex min-h-[420px] w-full max-w-4xl items-center justify-center rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-8 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
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

export function DriverProfileLoadingState() {
  return (
    <section
      aria-label="Memuat profil driver"
      className="space-y-5 pb-24 sm:pb-28"
    >
      <div className="h-24 animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="h-[420px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
        <div className="h-[420px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      </div>
      <div className="h-[180px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <div className="h-[280px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <div className="h-[120px] animate-pulse rounded-[32px] bg-[var(--odong-surface)]" />
      <span className="sr-only">Memuat data profil driver</span>
    </section>
  );
}

export function DriverProfileErrorState() {
  return (
    <ProfileStateCard
      icon={AlertCircle}
      title="Profil driver belum bisa dimuat"
      description="Coba refresh halaman atau masuk kembali untuk sinkronisasi data akun."
    />
  );
}

export function DriverProfileEmptyState() {
  return (
    <ProfileStateCard
      icon={Inbox}
      title="Data profil masih kosong"
      description="Lengkapi data driver, kendaraan, dan aktivitas agar dashboard profil tampil penuh."
    />
  );
}

