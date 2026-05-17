import {
  BadgeCheck,
  CalendarDays,
  Cake,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Shirt,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type {
  ProfileAddress,
  ProfilePreference,
  UserProfile,
} from "./types";

type ProfileMainPanelProps = {
  profile: UserProfile;
  addresses: ProfileAddress[];
  preferences: ProfilePreference[];
  onTogglePreference: (preferenceId: string) => void;
};

function CardHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-primary-700">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function ProfileMainPanel({
  profile,
  addresses,
  preferences,
  onTogglePreference,
}: ProfileMainPanelProps) {
  const enabledPreferences = preferences.filter((item) => item.enabled).length;
  const personalDetails = [
    {
      label: "Nama lengkap",
      value: profile.name,
      icon: UserRound,
    },
    {
      label: "Email",
      value: profile.email,
      icon: Mail,
    },
    {
      label: "Nomor HP",
      value: profile.phone,
      icon: Phone,
    },
    {
      label: "Jenis kelamin",
      value: profile.gender,
      icon: BadgeCheck,
    },
    {
      label: "Tanggal lahir",
      value: profile.birthDate,
      icon: Cake,
    },
    {
      label: "Bergabung",
      value: profile.joinedAt.replace("Bergabung sejak ", ""),
      icon: CalendarDays,
    },
    {
      label: "Layanan favorit",
      value: profile.favoriteService,
      icon: Shirt,
    },
    {
      label: "Outlet default",
      value: profile.defaultOutlet,
      icon: MapPin,
    },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
        <CardHeader
          eyebrow="Informasi pribadi"
          title="Data dasar akun."
          action={
            <button
              type="button"
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-4 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
            >
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
          }
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-primary-100 bg-primary-50/75 p-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 text-2xl font-extrabold text-white shadow-[0_16px_34px_rgba(25,28,29,0.12)]">
              {profile.initials}
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-[var(--odong-text)]">
              {profile.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-primary-700">
              {profile.memberLevel}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)]">
              Data ini dipakai untuk pickup, konfirmasi kurir, invoice, dan
              notifikasi order.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {personalDetails.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 text-primary-600"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold text-[var(--odong-muted)]">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-sm font-extrabold text-[var(--odong-text)]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
        <CardHeader
          eyebrow="Alamat pickup"
          title="Lokasi yang sering dipakai."
          action={
            <button
              type="button"
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah alamat
            </button>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {addresses.map((address) => {
            const Icon = address.icon;

            return (
              <article
                key={address.id}
                className={cn(
                  "rounded-[26px] border p-5 transition hover:-translate-y-0.5",
                  address.isPrimary
                    ? "border-primary-200 bg-primary-50"
                    : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                      address.isPrimary
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-primary-600",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {address.isPrimary ? (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-primary-700">
                      Utama
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[var(--odong-text)]">
                  {address.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                  {address.address}
                </p>
                <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-xs font-medium leading-5 text-[var(--odong-muted)]">
                  {address.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
        <CardHeader
          eyebrow="Preferensi"
          title="Atur pengalaman laundry."
          action={
            <span className="inline-flex h-10 items-center rounded-full bg-primary-50 px-4 text-xs font-bold text-primary-700">
              {enabledPreferences} aktif
            </span>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {preferences.map((preference) => {
            const Icon = preference.icon;

            return (
              <article
                key={preference.id}
                className="rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-[var(--odong-text)]">
                        {preference.label}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                        {preference.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preference.enabled}
                    aria-label={`${preference.enabled ? "Matikan" : "Aktifkan"} ${preference.label}`}
                    onClick={() => onTogglePreference(preference.id)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.97]",
                      preference.enabled ? "bg-primary-600" : "bg-primary-100",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(25,28,29,0.12)] transition",
                        preference.enabled ? "left-6" : "left-1",
                      )}
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
