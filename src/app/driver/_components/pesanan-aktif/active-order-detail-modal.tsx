"use client";

import { cn } from "@/lib/utils";
import {
  Camera,
  CheckCircle2,
  Clock3,
  ImageUp,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Scale,
  Shirt,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadFotoBukti } from "@/lib/driver-api";
import {
  activeProcessStages,
  activeStageLabels,
  getNextActiveStage,
} from "./data";
import type { DriverActiveOrder } from "../types";

type ActiveOrderDetailModalProps = {
  order?: DriverActiveOrder;
  onClose: () => void;
  onAdvanceStage: (orderId: string) => void;
  onFotoUploaded?: (orderId: string, url: string) => void;
};

function getMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

export function ActiveOrderDetailModal({
  order,
  onClose,
  onAdvanceStage,
  onFotoUploaded,
}: ActiveOrderDetailModalProps) {
  const [preview, setPreview]         = useState<string | null>(null);
  const [mimeType, setMimeType]       = useState<string>('image/jpeg');
  const [uploading, setUploading]     = useState(false);
  const [uploadDone, setUploadDone]   = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // Reset upload state when order changes
  useEffect(() => {
    setPreview(null);
    setUploadDone(false);
    setUploading(false);
  }, [order?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !order) return;
    setUploading(true);
    try {
      // Strip "data:image/...;base64," prefix
      const base64 = preview.split(',')[1];
      const res = await uploadFotoBukti(order.id, base64, mimeType);
      if (res.success) {
        setUploadDone(true);
        onFotoUploaded?.(order.id, (res as any).data?.foto_url ?? '');
      }
    } catch (err: any) {
      alert(err?.message ?? 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!order) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, order]);

  if (!order) {
    return null;
  }

  const nextStage = getNextActiveStage(order.currentStage);
  const mapsUrl = getMapsUrl(order.address);

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Tutup detail order aktif"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[6px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-order-detail-title"
        className="absolute left-1/2 top-1/2 flex max-h-[min(760px,calc(100vh-32px))] w-[min(calc(100vw-24px),720px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px] border border-[var(--odong-border)] bg-[var(--odong-surface)] text-[var(--odong-text)] shadow-[0_28px_68px_rgba(25,28,29,0.22)] backdrop-blur-xl"
      >
        <div className="flex min-h-0 w-full flex-col p-5 sm:p-6">
          <div className="flex shrink-0 items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-700">
                Detail pesanan aktif
              </p>
              <h3
                id="active-order-detail-title"
                className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]"
              >
                {order.id}
              </h3>
            </div>

            <button
              type="button"
              aria-label="Tutup detail order aktif"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--odong-surface-strong)] text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-4">
                <div className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">
                        Proses saat ini
                      </p>
                      <p className="mt-2 text-xl font-extrabold text-[var(--odong-text)]">
                        {activeStageLabels[order.currentStage]}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
                        Order bergerak dari penjemputan hingga pengantaran balik
                        ke pelanggan.
                      </p>
                    </div>

                    <span className="inline-flex h-10 items-center rounded-full bg-primary-50 px-3 text-sm font-extrabold text-primary-700">
                      {order.queueNumber}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    {activeProcessStages.map((stage, index) => {
                      const StageIcon = stage.icon;
                      const reached =
                        activeProcessStages.findIndex(
                          (item) => item.id === order.currentStage,
                        ) >= index;
                      const active = stage.id === order.currentStage;

                      return (
                        <div
                          key={stage.id}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-center transition",
                            reached
                              ? "border-primary-100 bg-primary-50/70"
                              : "border-[var(--odong-border)] bg-[var(--odong-surface)]",
                          )}
                        >
                          <div
                            className={cn(
                              "mx-auto flex h-9 w-9 items-center justify-center rounded-full",
                              active
                                ? "bg-primary-600 text-white"
                                : reached
                                  ? "bg-primary-100 text-primary-700"
                                  : "bg-[var(--odong-surface-strong)] text-[var(--odong-muted)]",
                            )}
                          >
                            <StageIcon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <p
                            className={cn(
                              "mt-2 text-[11px] font-bold leading-4",
                              active
                                ? "text-primary-700"
                                : "text-[var(--odong-muted)]",
                            )}
                          >
                            {stage.shortLabel}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Pelanggan",
                      value: order.customerName,
                      icon: UserRound,
                    },
                    {
                      label: "Telepon",
                      value: order.phone,
                      icon: Phone,
                    },
                    {
                      label: "Layanan",
                      value: order.service,
                      icon: Shirt,
                    },
                    {
                      label: "Berat",
                      value: order.weight,
                      icon: Scale,
                    },
                    {
                      label: "Waktu jemput",
                      value: order.pickupTime,
                      icon: Clock3,
                    },
                    {
                      label: "Total",
                      value: order.totalPrice,
                      icon: Wallet,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4"
                      >
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--odong-muted-soft)]">
                          <Icon className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-extrabold text-[var(--odong-text)]">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                    Catatan
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                    {order.note}
                  </p>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">
                    Alamat pickup
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-start gap-2 text-sm font-extrabold leading-6 text-[var(--odong-text)] transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <MapPin
                      className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                      aria-hidden="true"
                    />
                    <span>{order.address}</span>
                  </a>
                </div>

                <div className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">
                    Berikutnya
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-[var(--odong-text)]">
                    {nextStage ? activeStageLabels[nextStage] : "Selesai"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
                    {nextStage
                      ? "Tekan update untuk memindahkan order ke tahap berikutnya."
                      : "Order ini sudah selesai diantar dan bisa dihapus dari daftar aktif."}
                  </p>
                </div>

                {/* Upload foto bukti — hanya tampil saat stage "diantar" */}
                {order.currentStage === 'diantar' && (
                  <div className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-700">
                      Foto Bukti Pengantaran
                    </p>

                    {order.fotoBuktiUrl ? (
                      <div className="mt-3 space-y-2">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Foto sudah diunggah
                        </p>
                        <a
                          href={order.fotoBuktiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                          <Camera className="h-4 w-4" />
                          Lihat foto
                        </a>
                      </div>
                    ) : uploadDone ? (
                      <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Foto sudah diunggah
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview foto bukti"
                            className="h-28 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 text-sm font-bold text-primary-700 transition hover:border-primary-400 hover:bg-primary-50"
                          >
                            <Camera className="h-4 w-4" />
                            Ambil / Pilih Foto
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {preview && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-[var(--odong-border)] text-xs font-bold text-[var(--odong-muted)] transition hover:bg-[var(--odong-surface-soft)]"
                            >
                              Ganti
                            </button>
                            <button
                              type="button"
                              onClick={handleUpload}
                              disabled={uploading}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_8px_18px_rgba(22,163,74,0.22)] transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
                              {uploading ? 'Mengunggah...' : 'Upload'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Buka Maps
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onAdvanceStage(order.id);
                      if (!nextStage) {
                        onClose();
                      }
                    }}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white/80 px-4 text-sm font-extrabold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                  >
                    {nextStage
                      ? `Update: ${activeStageLabels[nextStage]}`
                      : "Tandai Selesai"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
