"use client";

import { cn } from "@/lib/utils";
import { uploadFotoBukti } from "@/lib/driver-api";
import {
  Camera,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  activeProcessStages,
  activeStageLabels,
  getNextActiveStage,
} from "./data";
import type { DriverActiveOrder, DriverActiveProcessStage } from "../types";

type ActiveOrderCardProps = {
  order: DriverActiveOrder;
  onAdvanceStage: (orderId: string) => void;
  onOpenDetail: (order: DriverActiveOrder) => void;
  isPending?: boolean;
};

const stageTone = {
  "menuju-lokasi": "bg-primary-50 text-primary-700",
  dijemput:        "bg-cyan-50 text-cyan-700",
  "di-laundry":    "bg-tertiary-50 text-tertiary-700",
  "siap-diantar":  "bg-violet-50 text-violet-700",
  diantar:         "bg-emerald-50 text-emerald-700",
} as const;

function getStageIndex(stage: DriverActiveProcessStage) {
  return activeProcessStages.findIndex((item) => item.id === stage);
}

function getMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

type ProgressStepperProps = {
  currentStage: DriverActiveProcessStage;
};

function ProgressStepper({ currentStage }: ProgressStepperProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-5 gap-1">
        {activeProcessStages.map((stage, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const reached = completed || active;

          return (
            <div
              key={stage.id}
              className="relative flex min-w-0 flex-col items-center text-center"
            >
              {index < activeProcessStages.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-0.5 rounded-full",
                    completed ? "bg-primary-500" : "bg-[var(--odong-border)]",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition",
                  reached
                    ? "bg-primary-600 text-white shadow-[0_10px_20px_rgba(0,88,202,0.18)]"
                    : "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
                )}
              >
                {completed ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "mt-2 text-[10px] font-semibold leading-4",
                  active ? "text-primary-700" : "text-[var(--odong-muted)]",
                )}
              >
                {stage.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActiveOrderCard({
  order,
  onAdvanceStage,
  onOpenDetail,
  isPending = false,
}: ActiveOrderCardProps) {
  const [fotoFile, setFotoFile]       = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const isDiantar  = order.currentStage === "diantar";
  const nextStage  = getNextActiveStage(order.currentStage);
  const actionLabel = isDiantar
    ? "Konfirmasi Selesai"
    : nextStage
    ? `Update: ${activeStageLabels[nextStage]}`
    : "Tandai Selesai";

  const canAdvance = !isPending && !isUploading && (!isDiantar || fotoFile !== null);

  const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setFotoFile(null);
      setFotoPreview(null);
      return;
    }
    if (file.size > MAX_FOTO_SIZE) {
      setUploadError("Ukuran foto maksimal 5 MB. Pilih foto yang lebih kecil.");
      e.target.value = "";
      return;
    }
    setFotoFile(file);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirmSelesai = async () => {
    if (!fotoFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fotoFile);
      });
      // Strip the "data:<mime>;base64," prefix — backend expects raw base64
      const [header, rawBase64] = dataUrl.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
      await uploadFotoBukti(order.id, rawBase64, mimeType);
      onAdvanceStage(order.id);
    } catch {
      setUploadError("Gagal unggah foto, coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(25,28,29,0.10)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-extrabold text-primary-700">
            {order.queueNumber}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--odong-muted)]">
              Kode Pesanan
            </p>
            <h2 className="mt-1 truncate text-2xl font-extrabold text-[var(--odong-text)]">
              {order.kodePesanan}
            </h2>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex h-10 w-fit items-center justify-center rounded-2xl px-4 text-sm font-extrabold",
            stageTone[order.currentStage],
          )}
        >
          {activeStageLabels[order.currentStage]}
        </span>
      </div>

      <ProgressStepper currentStage={order.currentStage} />

      <section className="mt-5 rounded-3xl bg-[var(--odong-surface-muted)] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.20)]">
            {order.customerInitials}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-base font-extrabold text-[var(--odong-text)]">
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{order.customerName}</span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {order.phone}
            </p>
            <a
              href={getMapsUrl(order.address)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--odong-text)] transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                aria-hidden="true"
              />
              <span>{order.address}</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_120px_150px] sm:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--odong-muted)]">Layanan</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--odong-text)]">
            {order.service}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--odong-muted)]">Berat</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--odong-text)]">
            {order.weight}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-bold text-[var(--odong-muted)]">
            Waktu Jemput
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-lg font-extrabold text-primary-600 sm:justify-end">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {order.pickupTime}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl bg-primary-100/75 px-4 py-4">
        <span className="flex items-center gap-2 text-base font-extrabold text-[var(--odong-text)]">
          <Wallet className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Total Harga
        </span>
        <span className="text-xl font-extrabold text-emerald-600">
          {order.totalPrice}
        </span>
      </div>

      {isDiantar && (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
            Foto bukti pengiriman
          </p>
          {fotoPreview ? (
            <div className="relative">
              <img
                src={fotoPreview}
                alt="Pratinjau foto bukti"
                className="h-32 w-full rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => { setFotoFile(null); setFotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs font-bold text-white"
              >
                Ganti
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 py-6 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100/50 dark:border-emerald-700 dark:text-emerald-400">
              <Camera className="h-8 w-8" aria-hidden="true" />
              Pilih foto dari galeri
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFotoChange}
              />
            </label>
          )}
          {uploadError && (
            <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpenDetail(order)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-500 bg-white/80 px-4 text-sm font-extrabold text-primary-600 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          Lihat Detail
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={!canAdvance}
          onClick={isDiantar ? handleConfirmSelesai : () => onAdvanceStage(order.id)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending || isUploading ? "Memproses..." : actionLabel}
        </button>
      </div>
    </article>
  );
}
