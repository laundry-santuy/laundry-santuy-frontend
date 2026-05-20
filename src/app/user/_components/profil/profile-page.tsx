"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Home,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Truck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import {
  fetchProfilUser,
  updateProfilUser,
  type ProfilResponse,
} from "@/lib/user-api";
import {
  ProfileEmptyState,
  ProfileErrorState,
  ProfileLoadingState,
} from "./profile-states";
import type { ProfilePageStatus } from "./types";

type ProfilePageProps = { status?: ProfilePageStatus };

// ── Panel types ───────────────────────────────────────────────────────────────
type ActivePanel = "keamanan" | "pembayaran" | "preferensi" | "bantuan" | null;

// ── Static data ───────────────────────────────────────────────────────────────
const paymentMethods = [
  { id: "ewallet", name: "E-Wallet", desc: "OVO, DANA, dan GoPay tersambung.", icon: Wallet, badge: "Utama" },
  { id: "card",    name: "Kartu Debit", desc: "Visa berakhir 0248.", icon: CreditCard, badge: "Cadangan" },
  { id: "cash",    name: "Tunai", desc: "Bayar langsung saat pakaian diterima.", icon: CircleDollarSign, badge: "Aktif" },
];

const faqItems = [
  {
    q: "Bagaimana cara membatalkan pesanan?",
    a: "Pesanan bisa dibatalkan selama masih berstatus 'Menunggu'. Buka halaman Riwayat, pilih pesanan, lalu tekan tombol Batalkan.",
  },
  {
    q: "Berapa lama waktu pengerjaan laundry?",
    a: "Tergantung layanan: Kiloan 2-3 hari kerja, Express 6-12 jam. Estimasi ditampilkan saat memilih layanan.",
  },
  {
    q: "Apakah ada biaya pickup?",
    a: "Gratis untuk transaksi di atas Rp 75.000. Di bawah itu dikenakan biaya Rp 8.000.",
  },
  {
    q: "Bagaimana jika pakaian saya hilang atau rusak?",
    a: "Hubungi tim kami lewat chat dalam 24 jam setelah pakaian diterima. Kami berikan ganti rugi sesuai SLA.",
  },
  {
    q: "Bisa bayar cash saat pakaian diantar?",
    a: "Bisa. Pilih metode 'Tunai' saat checkout. Kurir akan membawa struk sebagai bukti transaksi.",
  },
];

// ── Shared modal wrapper ───────────────────────────────────────────────────────
function SettingsModal({
  open,
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] shadow-[0_32px_80px_rgba(25,28,29,0.22)]">
        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-t-[32px] border-b border-[var(--odong-border)] bg-[var(--odong-surface)]/95 px-6 py-4 backdrop-blur-xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-700">{subtitle}</p>
            <h2 className="text-base font-extrabold text-[var(--odong-text)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] transition hover:text-[var(--odong-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}

// ── Panel: Keamanan ────────────────────────────────────────────────────────────
function KeamananPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showPwForm, setShowPwForm] = useState(false);
  const [oldPw, setOldPw]   = useState("");
  const [newPw, setNewPw]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [pwError, setPwError]   = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [saving, setSaving]     = useState(false);

  const handleChangePassword = async () => {
    setPwError(null);
    if (!oldPw.trim()) { setPwError("Masukkan password lama."); return; }
    if (newPw.length < 8) { setPwError("Password baru minimal 8 karakter."); return; }
    if (newPw !== confirmPw) { setPwError("Konfirmasi password tidak cocok."); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setPwSuccess(true);
    setOldPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => { setPwSuccess(false); setShowPwForm(false); }, 2200);
  };

  const securityItems = [
    { icon: Mail,       label: "Email terverifikasi", desc: "Akun aman untuk pemulihan password.", badge: "Aktif" },
    { icon: Phone,      label: "Nomor HP utama",      desc: "Dipakai untuk konfirmasi pickup.", badge: "Terverifikasi" },
    { icon: KeyRound,   label: "Password",            desc: "Terakhir diperbarui 2 bulan lalu.", badge: "Aman" },
    { icon: Smartphone, label: "Perangkat masuk",     desc: "MacBook dan iPhone aktif minggu ini.", badge: "2 perangkat" },
  ];

  return (
    <SettingsModal open={open} title="Keamanan" subtitle="Akun & Privasi" icon={LockKeyhole} onClose={onClose}>
      {/* status items */}
      <div className="space-y-3">
        {securityItems.map(({ icon: Icon, label, desc, badge }) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--odong-text)]">{label}</p>
                <p className="text-xs text-[var(--odong-muted)]">{desc}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">{badge}</span>
          </div>
        ))}
      </div>

      {/* change password */}
      <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
        <button
          type="button"
          onClick={() => { setShowPwForm((v) => !v); setPwError(null); }}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-extrabold text-[var(--odong-text)]">Ganti Password</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[var(--odong-muted)] transition-transform ${showPwForm ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {showPwForm && (
          <div className="border-t border-[var(--odong-border)] px-4 pb-4 pt-4 space-y-3">
            {pwError && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">Password berhasil diperbarui!</p>
            )}
            {[
              { label: "Password lama", val: oldPw, set: setOldPw, show: showOld, toggle: () => setShowOld((v) => !v) },
              { label: "Password baru", val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew((v) => !v) },
              { label: "Konfirmasi password baru", val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew((v) => !v) },
            ].map(({ label, val, set, show, toggle }) => (
              <label key={label} className="block space-y-1.5">
                <span className="text-xs font-extrabold text-[var(--odong-text)]">{label}</span>
                <span className="relative block">
                  <input
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="block w-full rounded-xl border border-[var(--odong-border)] bg-[var(--odong-surface)] px-3 py-2.5 pr-10 text-sm font-semibold text-[var(--odong-text)] outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--odong-muted)]">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
            ))}
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={saving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Menyimpan..." : "Simpan password baru"}
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-[var(--odong-muted)]">
        Jika akun terasa mencurigakan, segera ganti password dan hubungi tim kami.
      </p>
    </SettingsModal>
  );
}

// ── Panel: Metode Pembayaran ──────────────────────────────────────────────────
function PembayaranPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [primaryId, setPrimaryId] = useState("ewallet");

  return (
    <SettingsModal open={open} title="Metode Pembayaran" subtitle="Dompet & Kartu" icon={CreditCard} onClose={onClose}>
      <div className="space-y-3">
        {paymentMethods.map(({ id, name, desc, icon: Icon, badge }) => {
          const isPrimary = id === primaryId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPrimaryId(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                isPrimary
                  ? "border-primary-200 bg-primary-50/80"
                  : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] hover:border-primary-100"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPrimary ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[var(--odong-text)]">{name}</p>
                <p className="text-xs text-[var(--odong-muted)]">{desc}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${isPrimary ? "bg-primary-600 text-white" : "bg-[var(--odong-surface)] text-[var(--odong-muted)]"}`}>
                {isPrimary ? "Utama" : badge}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 text-sm font-extrabold text-primary-700 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Tambah metode pembayaran
      </button>

      <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3">
        <p className="text-xs font-semibold text-[var(--odong-muted)]">
          Metode utama digunakan sebagai default saat checkout. Kamu bisa menggantinya setiap saat.
        </p>
      </div>
    </SettingsModal>
  );
}

// ── Panel: Preferensi Aplikasi ─────────────────────────────────────────────────
function PreferensiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefItems = [
    { id: "pickup", icon: Truck,         label: "Reminder pickup",       desc: "Notifikasi 30 menit sebelum kurir datang." },
    { id: "status", icon: Bell,          label: "Update status order",   desc: "Info saat cucian diterima, diproses, dan siap dikirim." },
    { id: "promo",  icon: Sparkles,      label: "Promo personal",        desc: "Voucher dan paket hemat sesuai layanan favorit." },
    { id: "chat",   icon: MessageCircle, label: "Chat kurir",            desc: "Izinkan kurir mengirim catatan pickup lewat aplikasi." },
  ];

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    pickup: true, status: true, promo: false, chat: true,
  });

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SettingsModal open={open} title="Preferensi Aplikasi" subtitle="Notifikasi & Tampilan" icon={SlidersHorizontal} onClose={onClose}>
      <div className="space-y-3">
        {prefItems.map(({ id, icon: Icon, label, desc }) => (
          <div
            key={id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--odong-text)]">{label}</p>
                <p className="text-xs leading-5 text-[var(--odong-muted)]">{desc}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={toggles[id]}
              aria-label={`${toggles[id] ? "Nonaktifkan" : "Aktifkan"} ${label}`}
              onClick={() => toggle(id)}
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                toggles[id] ? "bg-primary-600" : "bg-[var(--odong-surface-soft)]"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${toggles[id] ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3">
        <p className="text-xs font-semibold text-[var(--odong-muted)]">
          Preferensi ini tersimpan di perangkat ini. Menggunakan perangkat baru akan mereset ke default.
        </p>
      </div>
    </SettingsModal>
  );
}

// ── Panel: Bantuan ────────────────────────────────────────────────────────────
function BantuanPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <SettingsModal open={open} title="Pusat Bantuan" subtitle="Bantuan & FAQ" icon={HelpCircle} onClose={onClose}>
      {/* kontak */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-bold text-white shadow-[0_8px_18px_rgba(0,88,202,0.18)] transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Chat Admin
        </button>
        <a
          href="mailto:support@laundrysantuy.app"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 text-sm font-bold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email Kami
        </a>
      </div>

      {/* info kontak */}
      <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 space-y-1.5">
        <p className="text-xs font-extrabold text-[var(--odong-text)]">Info kontak</p>
        <p className="text-xs text-[var(--odong-muted)]">WhatsApp: 0812-3456-7890 (Senin–Sabtu, 08.00–21.00)</p>
        <p className="text-xs text-[var(--odong-muted)]">Email: support@laundrysantuy.app</p>
        <p className="text-xs text-[var(--odong-muted)]">Instagram: @laundrysantuy</p>
      </div>

      {/* FAQ */}
      <div>
        <p className="mb-3 text-sm font-extrabold text-[var(--odong-text)]">Pertanyaan umum</p>
        <div className="space-y-2">
          {faqItems.map(({ q, a }, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <span className="text-sm font-bold text-[var(--odong-text)]">{q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--odong-muted)] transition-transform ${openFaqIndex === idx ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {openFaqIndex === idx && (
                <div className="border-t border-[var(--odong-border)] px-4 pb-4 pt-3">
                  <p className="text-sm leading-6 text-[var(--odong-muted)]">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-[var(--odong-muted)]">
        Versi Laundry Santuy 1.0.0 · <span className="text-primary-600">Lihat kebijakan privasi</span>
      </p>
    </SettingsModal>
  );
}

// ── Settings items config ─────────────────────────────────────────────────────
const settingsItems: { key: ActivePanel; title: string; description: string; icon: React.ElementType }[] = [
  { key: "keamanan",    title: "Keamanan",             description: "Password, perangkat aktif, dan verifikasi akun.", icon: LockKeyhole },
  { key: "pembayaran",  title: "Metode Pembayaran",    description: "E-wallet, kartu debit, dan pilihan pembayaran utama.", icon: CreditCard },
  { key: "preferensi",  title: "Preferensi Aplikasi",  description: "Notifikasi, reminder pickup, dan update order.", icon: SlidersHorizontal },
  { key: "bantuan",     title: "Bantuan",              description: "Pusat bantuan, chat admin, dan pertanyaan umum.", icon: HelpCircle },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProfilePage({ status: propStatus = "ready" }: ProfilePageProps) {
  const router = useRouter();
  const [pageStatus, setPageStatus]   = useState<ProfilePageStatus>("loading");
  const [profil, setProfil]           = useState<ProfilResponse | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [editOpen, setEditOpen]       = useState(false);
  const [draft, setDraft]             = useState({ nama: "", no_telepon: "", alamat: "" });
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);

  const loadProfil = () => {
    fetchProfilUser()
      .then((data) => { setProfil(data); setPageStatus("ready"); })
      .catch(() => setPageStatus("error"));
  };

  useEffect(() => { loadProfil(); }, []);

  const effectiveStatus = propStatus !== "ready" ? propStatus : pageStatus;
  if (effectiveStatus === "loading") return <ProfileLoadingState />;
  if (effectiveStatus === "error")   return <ProfileErrorState />;
  if (effectiveStatus === "empty")   return <ProfileEmptyState />;

  const profilCard = profil?.profilCard;
  const statistik  = profil?.statistik;
  const alamat     = profil?.alamatSaya;

  const openEdit = () => {
    setDraft({ nama: profilCard?.nama ?? "", no_telepon: profilCard?.noTelepon ?? "", alamat: profilCard?.alamat ?? "" });
    setSaveError(null);
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfilUser({
        nama_pengguna: draft.nama.trim() || undefined,
        no_telepon: draft.no_telepon.trim() || undefined,
        alamat: draft.alamat.trim() || undefined,
      });
      setEditOpen(false);
      loadProfil();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); router.push("/auth/login"); };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-10 sm:pb-12">
        <section>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/90 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-[0_8px_18px_rgba(0,88,202,0.07)] backdrop-blur-xl">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Akun pelanggan
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">Profil</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
            Kelola informasi dan pengaturan akun Laundry Santuy kamu.
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-5">
            {/* Profile card */}
            <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-7">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-3xl font-extrabold text-white shadow-[0_18px_32px_rgba(0,88,202,0.22)]">
                {profilCard?.inisial ?? "PG"}
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-[var(--odong-text)]">{profilCard?.nama ?? "Pengguna"}</h2>
              <p className="mt-1 text-sm font-medium text-[var(--odong-muted)]">{profilCard?.email ?? "-"}</p>
              {profilCard?.noTelepon && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--odong-muted)]">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {profilCard.noTelepon}
                </p>
              )}
              <button
                type="button"
                onClick={openEdit}
                className="mx-auto mt-4 inline-flex h-9 items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-4 text-xs font-bold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Profil
              </button>
              <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
                {[{ value: String(statistik?.order ?? 0), label: "Orders" }, { value: String(statistik?.pesananSelesai ?? 0), label: "Selesai" }].map((s) => (
                  <div key={s.label} className="border-l border-[var(--odong-border)] px-4 py-4 first:border-l-0">
                    <p className="text-2xl font-extrabold text-[var(--odong-text)]">{s.value}</p>
                    <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Address card */}
            <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
              <p className="text-sm font-semibold text-primary-700">Alamat Saya</p>
              <h2 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">Lokasi pickup</h2>
              <div className="mt-4 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                    <Home className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[var(--odong-text)]">Rumah Utama</h3>
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-extrabold text-primary-700">Utama</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                      {profilCard?.alamat ?? alamat?.alamat ?? "Alamat belum diatur"}
                    </p>
                    <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden="true" />
                      Titik penjemputan utama
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-200 bg-primary-50/55 text-sm font-extrabold text-primary-700 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah Alamat Baru
              </button>
            </section>
          </div>

          {/* Settings + logout */}
          <div className="flex min-w-0 flex-col gap-5">
            <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary-700">Pengaturan Akun</p>
                  <h2 className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">Kelola akun dan preferensi</h2>
                </div>
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 sm:flex">
                  <Settings2 className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {settingsItems.map(({ key, title, description, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePanel(key)}
                    className="group flex min-h-[84px] w-full items-center justify-between gap-4 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4 text-left shadow-[0_8px_22px_rgba(25,28,29,0.04)] transition hover:-translate-y-0.5 hover:border-primary-100 hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]"
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-[var(--odong-surface-strong)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-extrabold text-[var(--odong-text)]">{title}</span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--odong-muted)]">{description}</span>
                      </span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--odong-surface)] text-[var(--odong-muted)] transition group-hover:text-primary-700">
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleLogout}
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
          </div>
        </section>
      </div>

      {/* ── Settings panels ─────────────────────────────────────────────── */}
      <KeamananPanel   open={activePanel === "keamanan"}   onClose={() => setActivePanel(null)} />
      <PembayaranPanel open={activePanel === "pembayaran"} onClose={() => setActivePanel(null)} />
      <PreferensiPanel open={activePanel === "preferensi"} onClose={() => setActivePanel(null)} />
      <BantuanPanel    open={activePanel === "bantuan"}    onClose={() => setActivePanel(null)} />

      {/* ── Edit profil modal ────────────────────────────────────────────── */}
      {editOpen && (
        <div role="dialog" aria-modal="true" aria-label="Edit profil" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setEditOpen(false)} />
          <div className="relative w-full max-w-md rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_32px_64px_rgba(25,28,29,0.18)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary-700">Informasi Pribadi</p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">Edit Profil</h2>
              </div>
              <button type="button" onClick={() => setEditOpen(false)} disabled={saving} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] transition hover:text-[var(--odong-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {saveError && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{saveError}</div>
            )}
            <div className="mt-5 space-y-4">
              {[
                { label: "Nama lengkap", type: "text",  val: draft.nama,         set: (v: string) => setDraft((d) => ({ ...d, nama: v })) },
                { label: "No. telepon",  type: "tel",   val: draft.no_telepon,   set: (v: string) => setDraft((d) => ({ ...d, no_telepon: v })) },
              ].map(({ label, type, val, set }) => (
                <label key={label} className="block space-y-2">
                  <span className="text-sm font-extrabold text-[var(--odong-text)]">{label}</span>
                  <input type={type} value={val} onChange={(e) => set(e.target.value)} className="block w-full rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--odong-text)] outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100" />
                </label>
              ))}
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-[var(--odong-text)]">Alamat pickup</span>
                <textarea value={draft.alamat} rows={3} onChange={(e) => setDraft((d) => ({ ...d, alamat: e.target.value }))} placeholder="Masukkan alamat lengkap..." className="block w-full resize-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--odong-text)] outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100" />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditOpen(false)} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-[20px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-5 text-sm font-bold text-[var(--odong-text)] transition hover:bg-[var(--odong-surface-muted)] disabled:opacity-60">Batal</button>
              <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-[20px] bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
