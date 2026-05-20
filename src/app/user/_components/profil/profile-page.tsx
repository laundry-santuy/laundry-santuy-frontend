"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  Home,
  LockKeyhole,
  LogOut,
  MapPin,
  Plus,
  Settings2,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { fetchProfilUser, type ProfilResponse } from "@/lib/user-api";
import {
  ProfileEmptyState,
  ProfileErrorState,
  ProfileLoadingState,
} from "./profile-states";
import type { ProfilePageStatus } from "./types";

type ProfilePageProps = {
  status?: ProfilePageStatus;
};

const settingsItems = [
  {
    title: "Informasi Pribadi",
    description: "Nama, email, nomor telepon, dan data dasar akun.",
    icon: UserRound,
  },
  {
    title: "Keamanan",
    description: "Password, perangkat aktif, dan verifikasi akun.",
    icon: LockKeyhole,
  },
  {
    title: "Metode Pembayaran",
    description: "E-wallet, kartu debit, dan pilihan pembayaran utama.",
    icon: CreditCard,
  },
  {
    title: "Preferensi Aplikasi",
    description: "Notifikasi, reminder pickup, dan update order.",
    icon: SlidersHorizontal,
  },
  {
    title: "Bantuan",
    description: "Pusat bantuan, chat admin, dan pertanyaan umum.",
    icon: HelpCircle,
  },
];

export function ProfilePage({ status: propStatus = "ready" }: ProfilePageProps) {
  const router = useRouter();
  const [pageStatus, setPageStatus] = useState<ProfilePageStatus>("loading");
  const [profil, setProfil] = useState<ProfilResponse | null>(null);

  useEffect(() => {
    fetchProfilUser()
      .then((data) => {
        setProfil(data);
        setPageStatus("ready");
      })
      .catch(() => setPageStatus("error"));
  }, []);

  const effectiveStatus = propStatus !== "ready" ? propStatus : pageStatus;

  if (effectiveStatus === "loading") return <ProfileLoadingState />;
  if (effectiveStatus === "error")   return <ProfileErrorState />;
  if (effectiveStatus === "empty")   return <ProfileEmptyState />;

  const profilCard = profil?.profilCard;
  const statistik  = profil?.statistik;
  const alamat     = profil?.alamatSaya;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-10 sm:pb-12">
        <section className="flex flex-col gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/90 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-[0_8px_18px_rgba(0,88,202,0.07)] backdrop-blur-xl">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Akun pelanggan
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Profil
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Kelola informasi dan pengaturan akun Laundry Santuy kamu.
            </p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-5">
            <ProfileSummaryCard
              initials={profilCard?.inisial ?? "PG"}
              name={profilCard?.nama ?? "Pengguna"}
              email={profilCard?.email ?? "-"}
              orderCount={statistik?.order ?? 0}
              selesaiCount={statistik?.pesananSelesai ?? 0}
            />
            <AddressCard alamat={alamat?.alamat ?? "Alamat belum diatur"} />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <SettingsPanel />
            <LogoutPanel onLogout={handleLogout} />
          </div>
        </section>

        <span className="sr-only" aria-live="polite">
          Profil {profilCard?.nama ?? "pengguna"} terbuka.
        </span>
      </div>
    </div>
  );
}

function ProfileSummaryCard({
  initials,
  name,
  email,
  orderCount,
  selesaiCount,
}: {
  initials: string;
  name: string;
  email: string;
  orderCount: number;
  selesaiCount: number;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-7">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-3xl font-extrabold text-white shadow-[0_18px_32px_rgba(0,88,202,0.22)]">
        {initials}
      </div>

      <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">{name}</h2>
      <p className="mt-2 text-sm font-medium text-[var(--odong-muted)]">{email}</p>

      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
        {[
          { value: String(orderCount), label: "Orders" },
          { value: String(selesaiCount), label: "Selesai" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border-l border-[var(--odong-border)] px-4 py-4 first:border-l-0"
          >
            <p className="text-2xl font-extrabold text-[var(--odong-text)]">{stat.value}</p>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AddressCard({ alamat }: { alamat: string }) {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary-700">Alamat Saya</p>
          <h2 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">Lokasi pickup</h2>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Home className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-[var(--odong-text)]">Rumah Utama</h3>
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-extrabold text-primary-700">
                Utama
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">{alamat}</p>
            <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-[var(--odong-muted)]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden="true" />
              Titik penjemputan utama
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-200 bg-primary-50/55 text-sm font-extrabold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Tambah Alamat Baru
      </button>
    </section>
  );
}

function SettingsPanel() {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary-700">Pengaturan Akun</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
            Kelola akun dan preferensi
          </h2>
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 sm:flex">
          <Settings2 className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              className="group flex min-h-[84px] w-full items-center justify-between gap-4 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4 text-left shadow-[0_8px_22px_rgba(25,28,29,0.04)] transition hover:-translate-y-0.5 hover:border-primary-100 hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-[var(--odong-surface-strong)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold text-[var(--odong-text)]">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--odong-muted)]">{item.description}</span>
                </span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--odong-surface)] text-[var(--odong-muted)] transition group-hover:text-primary-700">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LogoutPanel({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="group flex w-full items-center justify-between gap-4 rounded-[28px] border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/20 p-5 text-left shadow-[0_14px_34px_rgba(220,38,38,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 active:scale-[0.99]"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--odong-surface-strong)] text-red-600">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-extrabold text-red-700 dark:text-red-400">Keluar</span>
          <span className="mt-1 block text-sm leading-6 text-red-500 dark:text-red-500/80">Akhiri sesi dan kembali ke halaman login.</span>
        </span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--odong-surface)] text-red-500 dark:text-red-400 transition group-hover:text-red-700 dark:group-hover:text-red-300">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}