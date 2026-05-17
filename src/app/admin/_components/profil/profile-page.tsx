"use client";

import {
  AdminMetricStrip,
  AdminPageHeader,
  AdminPanel,
  adminControlClass,
} from "../admin-page";
import { defaultAdminProfile } from "../data";
import type { AdminProfileValues } from "../types";
import {
  BadgeCheck,
  Check,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD"
  );
}

function ProfileInput({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-extrabold text-[var(--odong-text)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={adminControlClass}
      />
    </label>
  );
}

export function AdminProfilePage() {
  const [profile, setProfile] =
    useState<AdminProfileValues>(defaultAdminProfile);
  const [saved, setSaved] = useState(false);
  const initials = getInitials(profile.name);

  const updateProfile = <Key extends keyof AdminProfileValues>(
    key: Key,
    value: AdminProfileValues[Key],
  ) => {
    setSaved(false);
    setProfile((currentProfile) => ({
      ...currentProfile,
      [key]: value,
    }));
  };

  const saveProfile = () => {
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Profil"
        title="Profil admin"
        description="Kelola identitas admin yang tampil di panel operasional dan kartu akun."
        actions={
          <button
            type="button"
            onClick={saveProfile}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(0,88,202,0.2)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Simpan cepat
          </button>
        }
      />

      <AdminMetricStrip
        items={[
          {
            label: "Nama admin",
            value: profile.name,
            caption: "Pemilik akun",
            icon: UserRound,
          },
          {
            label: "Akses",
            value: profile.role,
            caption: "Level kontrol",
            icon: ShieldCheck,
            tone: "success",
          },
          {
            label: "Outlet utama",
            value: profile.outlet,
            caption: "Area operasional",
            icon: MapPin,
            tone: "warning",
          },
          {
            label: "Status",
            value: saved ? "Tersimpan" : "Draft",
            caption: saved ? "Data terbaru aktif" : "Belum disimpan",
            icon: BadgeCheck,
            tone: saved ? "success" : "muted",
          },
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-6 text-center shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] bg-primary-600 text-4xl font-extrabold text-white shadow-[0_18px_38px_rgba(0,88,202,0.22)]">
            {initials}
          </div>
          <h3 className="mt-5 text-2xl font-extrabold text-[var(--odong-text)]">
            {profile.name}
          </h3>
          <p className="mt-2 text-sm font-medium text-[var(--odong-muted)]">
            {profile.email}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-600">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            {profile.role}
          </div>

          <div className="mt-6 divide-y divide-[var(--odong-border)] rounded-[26px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] text-left">
            <div className="flex items-start gap-3 px-4 py-4">
              <Mail
                className="mt-1 h-5 w-5 text-primary-600"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[var(--odong-text)]">
                  Email
                </p>
                <p className="truncate text-sm text-[var(--odong-muted)]">
                  {profile.email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-4">
              <MapPin
                className="mt-1 h-5 w-5 text-amber-600"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[var(--odong-text)]">
                  Outlet
                </p>
                <p className="truncate text-sm text-[var(--odong-muted)]">
                  {profile.outlet}
                </p>
              </div>
            </div>
          </div>
        </article>

        <AdminPanel
          title="Data akun"
          description="Perubahan di form ini langsung memperbarui kartu profil di sebelah kiri setelah disimpan."
          icon={UserRound}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile();
            }}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInput
                label="Nama Admin"
                value={profile.name}
                onChange={(value) => updateProfile("name", value)}
              />
              <ProfileInput
                label="Email"
                type="email"
                value={profile.email}
                onChange={(value) => updateProfile("email", value)}
              />
              <ProfileInput
                label="Role"
                value={profile.role}
                onChange={(value) => updateProfile("role", value)}
              />
              <ProfileInput
                label="Outlet Utama"
                value={profile.outlet}
                onChange={(value) => updateProfile("outlet", value)}
              />
            </div>

            <div className="grid gap-3 rounded-[26px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Mail
                  className="mt-1 h-5 w-5 text-primary-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    Email
                  </p>
                  <p className="truncate text-sm text-[var(--odong-muted)]">
                    {profile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheck
                  className="mt-1 h-5 w-5 text-emerald-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    Akses
                  </p>
                  <p className="truncate text-sm text-[var(--odong-muted)]">
                    {profile.role}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-1 h-5 w-5 text-amber-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    Outlet
                  </p>
                  <p className="truncate text-sm text-[var(--odong-muted)]">
                    {profile.outlet}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(0,88,202,0.2)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Simpan profil
              </button>
              {saved ? (
                <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Profil berhasil disimpan
                </p>
              ) : null}
            </div>
          </form>
        </AdminPanel>
      </section>
    </div>
  );
}
