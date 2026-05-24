"use client";

import { useRouter } from "next/navigation";
import { Banknote, Building2, CheckCircle2, Loader2, QrCode, X } from "lucide-react";
import { useState } from "react";
import { konfirmasiBayarUser } from "@/lib/user-api";

type PaymentConfirmModalProps = {
  open: boolean;
  idPesanan?: string | null;
  paymentId: string;
  total: number;
  kodePesanan: string | null;
  outletName?: string;
  namaBank?: string | null;
  nomorRekening?: string | null;
  atasNama?: string | null;
  qrisUrl?: string | null;
  onClose: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PaymentConfirmModal({
  open,
  idPesanan,
  paymentId,
  total,
  kodePesanan,
  outletName,
  namaBank,
  nomorRekening,
  atasNama,
  qrisUrl,
  onClose,
}: PaymentConfirmModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isCod = paymentId === "cod";

  const doneLabel = isCod
    ? "OK, Mengerti"
    : paymentId === "transfer_bank"
      ? "Saya Sudah Transfer"
      : "Saya Sudah Bayar";

  const handleDone = async () => {
    if (!isCod && idPesanan) {
      setLoading(true);
      try {
        await konfirmasiBayarUser(idPesanan);
      } catch {
        // Tetap lanjutkan redirect meskipun konfirmasi gagal
      } finally {
        setLoading(false);
      }
    }
    onClose();
    router.push("/user/lacak");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-[32px] bg-[var(--odong-surface)] shadow-[0_-8px_40px_rgba(25,28,29,0.18)] sm:rounded-[32px] sm:shadow-[0_24px_64px_rgba(25,28,29,0.24)]">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--odong-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-emerald-700">Pesanan berhasil dibuat!</p>
              {kodePesanan && (
                <p className="mt-0.5 text-xs font-semibold text-[var(--odong-muted)]">
                  Kode: {kodePesanan}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--odong-muted)] transition hover:bg-[var(--odong-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">

          {/* COD */}
          {isCod && (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Banknote className="h-5 w-5" />
                </span>
                <p className="text-base font-extrabold text-[var(--odong-text)]">
                  Siapkan Pembayaran Tunai
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-800">
                  Siapkan uang tunai sebesar{" "}
                  <span className="font-extrabold">{formatCurrency(total)}</span>.
                  Berikan kepada kurir saat menjemput laundry kamu.
                </p>
              </div>
              <p className="text-xs leading-5 text-[var(--odong-muted)]">
                Uang pas sangat membantu kurir — kurir tidak selalu membawa uang kembalian.
              </p>
            </>
          )}

          {/* Transfer Bank */}
          {paymentId === "transfer_bank" && (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="text-base font-extrabold text-[var(--odong-text)]">
                  Instruksi Transfer
                </p>
              </div>
              <div className="divide-y divide-[var(--odong-border)] rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
                {[
                  { label: "Bank", value: namaBank ?? "-" },
                  { label: "No. Rekening", value: nomorRekening ?? "-", mono: true },
                  { label: "Atas Nama", value: atasNama ?? outletName ?? "Laundry Santuy" },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs font-semibold text-[var(--odong-muted)]">{label}</span>
                    <span className={`text-sm font-extrabold text-[var(--odong-text)] ${mono ? "font-mono tracking-wider" : ""}`}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-primary-50 px-4 py-3 rounded-b-2xl">
                  <span className="text-xs font-bold text-primary-700">Total Transfer</span>
                  <span className="text-base font-extrabold text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-blue-400" />
                <p className="text-xs font-semibold text-blue-700">
                  Tekan tombol di bawah setelah transfer selesai agar admin dapat memverifikasi.
                </p>
              </div>
            </>
          )}

          {/* QRIS */}
          {paymentId === "qris" && (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <QrCode className="h-5 w-5" />
                </span>
                <p className="text-base font-extrabold text-[var(--odong-text)]">
                  Scan QRIS Outlet
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5">
                {qrisUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrisUrl}
                    alt="QRIS"
                    className="h-44 w-44 rounded-2xl object-contain"
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--odong-border)] bg-[var(--odong-surface-muted)]">
                    <QrCode className="h-20 w-20 text-[var(--odong-muted-soft)]" />
                  </div>
                )}
                <p className="text-xs font-semibold text-[var(--odong-muted)]">
                  QRIS {outletName ?? "Outlet"}
                </p>
                <p className="text-base font-extrabold text-[var(--odong-text)]">
                  {formatCurrency(total)}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-violet-400" />
                <p className="text-xs font-semibold text-violet-700">
                  Tekan tombol di bawah setelah scan QRIS selesai agar admin dapat memverifikasi.
                </p>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleDone}
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Mengirim konfirmasi..." : doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
