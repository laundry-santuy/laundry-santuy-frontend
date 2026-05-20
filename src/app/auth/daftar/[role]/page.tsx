"use client";

import { cn } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Shirt,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// ── Role config ───────────────────────────────────────────────────────────────

type RoleKey = "driver" | "pengguna" | "admin";

const roleConfig: Record<
  RoleKey,
  {
    label:       string;
    apiRole:     string;
    icon:        typeof Bike;
    description: string;
    color:       string;
  }
> = {
  driver: {
    label:       "Driver",
    apiRole:     "KURIR",
    icon:        Bike,
    description: "Terima dan antar pesanan laundry.",
    color:       "from-primary-600 via-primary-700 to-primary-900",
  },
  pengguna: {
    label:       "Pengguna",
    apiRole:     "PENGGUNA",
    icon:        User,
    description: "Pesan layanan laundry dengan mudah.",
    color:       "from-emerald-600 via-emerald-700 to-emerald-900",
  },
  admin: {
    label:       "Admin",
    apiRole:     "ADMIN",
    icon:        ShieldCheck,
    description: "Kelola laundry dan semua operasional.",
    color:       "from-violet-600 via-violet-700 to-violet-900",
  },
};

// ── Field components ──────────────────────────────────────────────────────────

function Field({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  required = true,
  hint,
}: {
  id:          string;
  label:       string;
  type?:       string;
  placeholder: string;
  icon:        typeof User;
  value:       string;
  onChange:    (v: string) => void;
  required?:   boolean;
  hint?:       string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold text-[var(--odong-text)]">
        {label}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-[var(--odong-muted)]">
            (opsional)
          </span>
        )}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] pl-11 pr-4 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--odong-muted)] focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
      {hint && (
        <p className="pl-1 text-xs text-[var(--odong-muted)]">{hint}</p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id:       string;
  label:    string;
  value:    string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold text-[var(--odong-text)]">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)]">
          <Lock className="size-4" aria-hidden="true" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Minimal 6 karakter"
          minLength={6}
          className="h-12 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] pl-11 pr-12 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--odong-muted)] focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="button"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)] transition hover:text-[var(--odong-text)]"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DaftarRolePage() {
  const { role } = useParams<{ role: string }>();
  const router   = useRouter();
  const config   = roleConfig[role as RoleKey] ?? roleConfig.driver;
  const RoleIcon = config.icon;

  // Common fields
  const [nama,     setNama]     = useState("");
  const [usn,      setUsn]      = useState("");
  const [password, setPassword] = useState("");

  // Driver-only
  const [platKurir,     setPlatKurir]     = useState("");
  const [nomorTelepon,  setNomorTelepon]  = useState("");
  const [alamat,        setAlamat]        = useState("");

  // Admin-only
  const [alamatPusat, setAlamatPusat] = useState("");

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body: Record<string, string> = {
      role:     config.apiRole,
      nama:     nama.trim(),
      usn:      usn.trim(),
      password,
    };

    if (role === "driver") {
      if (platKurir)    body.plat_kurir     = platKurir.trim();
      if (nomorTelepon) body.nomor_telepon  = nomorTelepon.trim();
      if (alamat)       body.alamat         = alamat.trim();
    }

    if (role === "admin") {
      if (alamatPusat) body.alamat_pusat = alamatPusat.trim();
    }

    try {
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        },
      );

      const contentType = res.headers.get("content-type") ?? "";
      const json = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        setError(json?.error ?? `Pendaftaran gagal (${res.status}). Coba lagi.`);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--odong-page-bg)] text-[var(--odong-text)] lg:grid lg:grid-cols-2">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative hidden overflow-hidden bg-gradient-to-br lg:flex lg:flex-col lg:justify-between lg:p-12",
          config.color,
        )}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
          }}
        />
        <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Shirt className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold text-white">Laundry Santuy</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur-sm">
              <Zap className="size-3.5" aria-hidden="true" />
              Daftar sebagai {config.label}
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Bergabung
              <br />
              sekarang.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
              {config.description} Buat akun Anda dalam hitungan detik dan mulai
              gunakan platform Laundry Santuy.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <RoleIcon className="size-6 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-white">{config.label}</p>
              <p className="mt-0.5 text-xs text-white/70">{config.description}</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-white/50">
          © 2026 Laundry Santuy. Semua hak dilindungi.
        </p>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-8 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-[0_14px_26px_rgba(25,28,29,0.18)]">
            <Shirt className="size-6" />
          </span>
          <p className="mt-3 text-xs font-bold text-primary-600">Laundry Santuy</p>
        </div>

        <div className="w-full max-w-sm lg:max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[var(--odong-text)] sm:text-3xl">
              Daftar sebagai {config.label}
            </h2>
            <p className="mt-2 text-sm text-[var(--odong-muted)]">
              Isi data di bawah untuk membuat akun baru.
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-8 text-center shadow-[0_24px_58px_rgba(25,28,29,0.07)]">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-7 text-emerald-600" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-emerald-700">
                Akun berhasil dibuat!
              </h3>
              <p className="mt-2 text-sm text-emerald-600">
                Mengarahkan ke halaman login...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_24px_58px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-8"
            >
              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Common fields */}
                <Field
                  id="nama"
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap"
                  icon={User}
                  value={nama}
                  onChange={setNama}
                />
                <Field
                  id="usn"
                  label="Username"
                  placeholder="Buat username unik"
                  icon={Mail}
                  value={usn}
                  onChange={setUsn}
                  hint="Digunakan untuk login, tidak bisa diubah."
                />
                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                />

                {/* Driver-only fields */}
                {role === "driver" && (
                  <>
                    <div className="my-2 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[var(--odong-border)]" />
                      <span className="text-xs font-bold text-[var(--odong-muted)]">
                        Info Kendaraan
                      </span>
                      <span className="h-px flex-1 bg-[var(--odong-border)]" />
                    </div>
                    <Field
                      id="plat_kurir"
                      label="Plat Nomor"
                      placeholder="Contoh: B 1234 ABC"
                      icon={Bike}
                      value={platKurir}
                      onChange={setPlatKurir}
                      required={false}
                    />
                    <Field
                      id="nomor_telepon"
                      label="Nomor Telepon"
                      placeholder="Contoh: 08123456789"
                      icon={Mail}
                      value={nomorTelepon}
                      onChange={setNomorTelepon}
                      required={false}
                    />
                    <Field
                      id="alamat"
                      label="Alamat"
                      placeholder="Alamat domisili Anda"
                      icon={MapPin}
                      value={alamat}
                      onChange={setAlamat}
                      required={false}
                    />
                  </>
                )}

                {/* Admin-only fields */}
                {role === "admin" && (
                  <>
                    <div className="my-2 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[var(--odong-border)]" />
                      <span className="text-xs font-bold text-[var(--odong-muted)]">
                        Info Outlet
                      </span>
                      <span className="h-px flex-1 bg-[var(--odong-border)]" />
                    </div>
                    <Field
                      id="alamat_pusat"
                      label="Alamat Outlet Pusat"
                      placeholder="Alamat laundry Anda"
                      icon={MapPin}
                      value={alamatPusat}
                      onChange={setAlamatPusat}
                      required={false}
                    />
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                  loading && "cursor-not-allowed opacity-60",
                )}
              >
                {loading && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {loading ? "Mendaftarkan..." : `Daftar sebagai ${config.label}`}
              </button>

              <p className="mt-5 text-center text-sm text-[var(--odong-muted)]">
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-primary-600 transition hover:text-primary-700"
                >
                  Masuk di sini
                </Link>
              </p>
            </form>
          )}

          {/* Back link */}
          <div className="mt-5 text-center">
            <Link
              href="/auth/daftar"
              className="text-xs font-semibold text-[var(--odong-muted)] transition hover:text-primary-600"
            >
              ← Pilih peran lain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}