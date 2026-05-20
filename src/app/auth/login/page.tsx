"use client";

import { cn } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  PackageCheck,
  Shirt,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const roleRedirect: Record<string, string> = {
  KURIR:    "/driver/pesanan/masuk",
  PENGGUNA: "/user/beranda",
  ADMIN:    "/admin",
};

const features = [
  { icon: PackageCheck, text: "Kelola order laundry secara real-time" },
  { icon: Bike,        text: "Driver dapat menerima & update pesanan" },
  { icon: Zap,         text: "Satu akun, akses sesuai peran Anda" },
];

export default function LoginPage() {
  const router = useRouter();

  const [usn, setUsn]           = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/general`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ usn: usn.trim(), password }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Login gagal. Periksa kembali username dan password.");
        return;
      }

      localStorage.setItem("token", json.token);
      const redirect = roleRedirect[json.role] ?? "/";
      router.push(redirect);
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--odong-page-bg)] text-[var(--odong-text)] lg:grid lg:grid-cols-2">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)",
          }}
        />
        <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] h-[320px] w-[320px] rounded-full bg-primary-400/30 blur-3xl" />

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
              Platform Laundry Modern
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Satu login,
              <br />
              akses penuh.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
              Login dengan akun Anda — sistem akan otomatis mengarahkan ke
              dashboard yang sesuai dengan peran Anda.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Icon className="size-4 text-white" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-white/90">{text}</span>
              </li>
            ))}
          </ul>
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
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[var(--odong-text)] sm:text-3xl">
              Selamat datang kembali
            </h2>
            <p className="mt-2 text-sm text-[var(--odong-muted)]">
              Masuk dengan username Anda — kami akan mengarahkan otomatis.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_24px_58px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-8"
          >
            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="usn" className="text-sm font-bold text-[var(--odong-text)]">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)]">
                    <User className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id="usn"
                    type="text"
                    autoComplete="username"
                    required
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="Masukkan username"
                    className="h-12 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] pl-11 pr-4 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--odong-muted)] focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-[var(--odong-text)]">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)]">
                    <Lock className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="h-12 w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] pl-11 pr-12 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--odong-muted)] focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--odong-muted)] transition hover:text-[var(--odong-text)]"
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                loading && "cursor-not-allowed opacity-60",
              )}
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {loading ? "Mengecek akun..." : "Masuk"}
            </button>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--odong-border)]" />
              <span className="text-xs text-[var(--odong-muted)]">atau</span>
              <span className="h-px flex-1 bg-[var(--odong-border)]" />
            </div>

            <p className="mt-4 text-center text-sm text-[var(--odong-muted)]">
              Belum punya akun?{" "}
              <Link
                href="/auth/daftar"
                className="font-bold text-primary-600 transition hover:text-primary-700"
              >
                Daftar sekarang
              </Link>
            </p>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4">
            {["Aman & terenkripsi", "Redirect otomatis"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--odong-muted)]"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}