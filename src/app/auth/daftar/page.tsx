import { Bike, Shirt, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    key:         "driver",
    label:       "Driver",
    description: "Terima dan antar pesanan laundry pelanggan.",
    icon:        Bike,
    href:        "/auth/daftar/driver",
    color:       "bg-primary-50 text-primary-600 border-primary-100",
    badge:       "bg-primary-600",
  },
  {
    key:         "pengguna",
    label:       "Pengguna",
    description: "Pesan layanan laundry kapan saja, di mana saja.",
    icon:        User,
    href:        "/auth/daftar/pengguna",
    color:       "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge:       "bg-emerald-600",
  },
  {
    key:         "admin",
    label:       "Admin",
    description: "Kelola laundry, layanan, dan semua operasional.",
    icon:        ShieldCheck,
    href:        "/auth/daftar/admin",
    color:       "bg-tertiary-50 text-tertiary-600 border-tertiary-100",
    badge:       "bg-tertiary-600",
  },
];

export default function DaftarPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--odong-page-bg)] px-5 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-[0_14px_26px_rgba(25,28,29,0.18)]">
            <Shirt className="size-6" />
          </span>
          <p className="mt-3 text-xs font-bold text-primary-600">Laundry Santuy</p>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--odong-text)] sm:text-3xl">
            Daftar akun baru
          </h1>
          <p className="mt-2 text-sm text-[var(--odong-muted)]">
            Pilih peran yang sesuai dengan Anda.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {roles.map(({ key, label, description, icon: Icon, href, color }) => (
            <Link
              key={key}
              href={href}
              className="group flex items-center gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_8px_24px_rgba(25,28,29,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(25,28,29,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${color}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[var(--odong-text)]">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--odong-muted)]">
                  {description}
                </p>
              </div>
              <svg
                className="size-4 shrink-0 text-[var(--odong-muted)] transition group-hover:text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--odong-muted)]">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-primary-600 transition hover:text-primary-700"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}