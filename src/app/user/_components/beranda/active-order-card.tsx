"use client";

import { Clock, Loader2, MessageCircle, Phone, Star, Truck, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { konfirmasiBayarUser } from "@/lib/user-api";
import type { ActiveOrder, ActiveOrderStep } from "./types";

const STEP_DESCRIPTIONS: Record<string, string> = {
  "Diterima":  "Pesanan sudah diterima outlet dan menunggu proses selanjutnya.",
  "Dicuci":    "Pakaian kamu sedang dalam proses pencucian.",
  "Disetrika": "Pakaian kamu sedang disetrika dan hampir siap dikirim.",
  "Selesai":   "Pakaian siap, kurir akan segera mengantar ke alamatmu.",
};

type ActiveOrderCardProps = {
  order: ActiveOrder;
};

function StepIndicator({
  step,
  meta,
  valueClassName,
}: {
  step: ActiveOrderStep;
  meta: { label: string; value: string };
  valueClassName?: string;
}) {
  const Icon = step.icon;
  const isDone = step.status === "done";
  const isCurrent = step.status === "current";

  return (
    <li className="relative flex min-w-0 flex-col items-center text-center">
      <div className="odong-surface-muted min-h-[48px] w-full rounded-2xl px-2 py-2">
        <p className="odong-muted-soft text-[10px] font-semibold uppercase leading-3 tracking-wide text-neutral-400">
          {meta.label}
        </p>
        <p
          className={cn(
            "odong-text mt-1 truncate text-xs font-bold leading-4 text-neutral-900 sm:text-sm",
            valueClassName,
          )}
        >
          {meta.value}
        </p>
      </div>

      <div className="relative mt-4 flex w-full justify-center">
        <div
          className={cn(
            "z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 transition duration-200",
            isDone &&
              "border-primary-500 bg-primary-500 text-white shadow-[0_8px_16px_rgba(38,113,238,0.22)]",
            isCurrent &&
              "border-primary-500 bg-primary-50 text-primary-600 shadow-[0_0_0_4px_rgba(38,113,238,0.08)]",
            !isDone && !isCurrent && "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted-soft)]",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <span
        className={cn(
          "mt-2 text-xs font-semibold leading-4",
          isCurrent ? "text-neutral-900" : "text-neutral-500",
          isCurrent ? "odong-text" : "odong-muted",
        )}
      >
        {step.label}
      </span>
    </li>
  );
}

function KonfirmasiModal({
  metodePembayaran,
  onConfirm,
  onClose,
  loading,
}: {
  metodePembayaran: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const label = metodePembayaran.toLowerCase() === "qris" ? "QRIS" : "Transfer Bank";

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[6px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 w-[min(calc(100vw-32px),440px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_28px_68px_rgba(25,28,29,0.22)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-600">Konfirmasi Pembayaran</p>
            <h3 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">
              Sudah bayar via {label}?
            </h3>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] hover:bg-[var(--odong-surface-soft)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--odong-muted)]">
          Tekan tombol di bawah jika kamu sudah melakukan pembayaran via{" "}
          <strong>{label}</strong>. Pembayaran akan diverifikasi oleh admin outlet sebelum
          kurir dikirim.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(245,158,11,0.28)] transition hover:bg-amber-600 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Mengirim..." : `Ya, saya sudah bayar via ${label}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--odong-border)] text-sm font-bold text-[var(--odong-muted)] transition hover:bg-[var(--odong-surface-soft)]"
          >
            Belum, tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActiveOrderCard({ order }: ActiveOrderCardProps) {
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  const stepMeta = [
    { label: "ID Order", value: order.id },
    { label: "Layanan", value: order.service },
    { label: "Berat", value: order.weight },
    { label: "Estimasi", value: order.eta },
  ];

  const currentStep = order.steps.find((s) => s.status === "current");
  const statusDescription =
    (currentStep && STEP_DESCRIPTIONS[currentStep.label]) ??
    "Pesanan kamu sedang diproses oleh outlet.";

  const phone = order.courier?.noTelepon ?? null;
  const waNumber = phone
    ? phone.replace(/^0/, "62").replace(/\D/g, "")
    : null;

  const metode = (order.metodePembayaran ?? "").toLowerCase();
  const isNonCod = metode && metode !== "cod";
  const sp = (order.statusPembayaran ?? "").toLowerCase();
  const needsKonfirmasi = isNonCod && !confirmed && (sp === "" || sp === "pending");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await konfirmasiBayarUser(order.pesananId);
      if (res.success) {
        setConfirmed(true);
        setShowModal(false);
      } else {
        alert(res.message);
      }
    } catch (err: unknown) {
      alert((err as Error)?.message ?? "Gagal mengkonfirmasi pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="odong-surface-strong rounded-[24px] p-4 shadow-[0_18px_40px_rgba(25,28,29,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(25,28,29,0.07)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="odong-text text-xl font-extrabold leading-7 text-neutral-900 sm:text-2xl">
              Laundry sedang diproses
            </h3>
            <p className="odong-muted mt-1 text-sm leading-6 text-neutral-500">
              {statusDescription}
            </p>
          </div>
          <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {order.eta}
          </div>
        </div>

        <ol className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[86px] hidden h-0.5 bg-[var(--odong-border)] sm:block" />
          <div className="pointer-events-none absolute left-[12.5%] right-[37.5%] top-[86px] hidden h-0.5 bg-primary-500 sm:block" />
          {order.steps.map((step, index) => (
            <StepIndicator
              key={step.label}
              step={step}
              meta={stepMeta[index]}
              valueClassName={index === 3 ? "text-primary-600" : undefined}
            />
          ))}
        </ol>

        {order.courier ? (
          <div className="odong-surface-muted mt-5 grid gap-3 rounded-2xl p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {order.courierInitials}
              </div>
              <div className="min-w-0">
                <p className="odong-text text-sm font-bold leading-5 text-neutral-900">
                  {order.courier.name} - Kurir
                </p>
                <p className="odong-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Star
                      className="h-3.5 w-3.5 fill-[#ffc107] text-[#ffc107]"
                      aria-hidden="true"
                    />
                    {order.courier.rating}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{order.courier.vehicle}</span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                    {order.courier.distance}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                disabled={!phone}
                aria-label={phone ? "Telepon kurir" : "Nomor telepon kurir tidak tersedia"}
                onClick={() => { if (phone) window.location.href = `tel:${phone}`; }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-95",
                  phone
                    ? "bg-primary-600 text-white shadow-[0_8px_18px_rgba(38,113,238,0.25)] hover:bg-primary-700"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400",
                )}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={!waNumber}
                aria-label={waNumber ? "Chat kurir via WhatsApp" : "Chat kurir tidak tersedia"}
                onClick={() => { if (waNumber) window.open(`https://wa.me/${waNumber}`, "_blank", "noopener,noreferrer"); }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-95",
                  waNumber
                    ? "bg-primary-600 text-white shadow-[0_8px_18px_rgba(38,113,238,0.25)] hover:bg-primary-700"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400",
                )}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="odong-surface-muted mt-5 rounded-2xl p-3">
            <p className="text-xs text-[var(--odong-muted)]">Kurir belum ditugaskan</p>
          </div>
        )}

        {needsKonfirmasi && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">Konfirmasi pembayaran diperlukan</p>
            <p className="mt-1 text-xs leading-5 text-amber-600">
              Pesananmu menggunakan metode{" "}
              <strong>
                {metode === "qris" ? "QRIS" : "Transfer Bank"}
              </strong>
              . Konfirmasi setelah melakukan pembayaran agar kurir segera diproses.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(245,158,11,0.25)] transition hover:bg-amber-600 active:scale-[0.97]"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        )}

        {isNonCod && confirmed && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-700">Pembayaran dikonfirmasi</p>
            <p className="mt-0.5 text-xs text-emerald-600">
              Menunggu verifikasi admin. Kurir akan segera ditugaskan setelah pembayaran diverifikasi.
            </p>
          </div>
        )}

        {isNonCod && sp === "menunggu_konfirmasi" && !confirmed && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm font-bold text-blue-700">Menunggu verifikasi admin</p>
            <p className="mt-0.5 text-xs text-blue-600">
              Pembayaranmu sudah kami terima dan sedang diverifikasi oleh admin.
            </p>
          </div>
        )}
      </article>

      {showModal && order.metodePembayaran && (
        <KonfirmasiModal
          metodePembayaran={order.metodePembayaran}
          onConfirm={handleConfirm}
          onClose={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </>
  );
}
