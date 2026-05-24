"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import {
  fetchEtaAI,
  fetchKurirPosisi,
  fetchLacak,
  formatRupiah,
  formatWaktu,
  type LacakResponse,
} from "@/lib/user-api";
import { TrackingHero } from "./tracking-hero";
import { MapView, MapViewPlaceholder } from "./map-view";
import { TrackingOrderSwitcher } from "./tracking-order-switcher";
import { TrackingSidePanel } from "./tracking-side-panel";
import {
  TrackingEmptyState,
  TrackingErrorState,
  TrackingLoadingState,
} from "./tracking-states";
import { TrackingTimeline } from "./tracking-timeline";
import type {
  TrackingCheckpoint,
  TrackingInsight,
  TrackingOrder,
  TrackingPageStatus,
  TrackingStep,
  TrackingStepStatus,
} from "./types";

type TrackingPageProps = {
  status?: TrackingPageStatus;
};

const STATUS_LABEL: Record<string, string> = {
  menunggu:      "Menunggu Kurir",
  menuju_lokasi: "Kurir Menuju Lokasi",
  dijemput:      "Cucian Dijemput",
  di_laundry:    "Sedang Dicuci",
  siap_diantar:  "Siap Diantar",
  diantar:       "Dalam Pengiriman",
  selesai:       "Selesai",
  dibatalkan:    "Dibatalkan",
  ditolak:       "Ditolak",
};

function formatStatusLabel(raw: string | null | undefined): string {
  if (!raw) return "Menunggu Kurir";
  const key = raw.toLowerCase().trim().replace(/\s+/g, "_");
  return STATUS_LABEL[key] ?? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const STEP_ICONS = [Truck, Package, Sparkles, Shirt, MapPin, CheckCircle2] as const;

const STATIC_INSIGHTS: TrackingInsight[] = [
  {
    label: "Pickup",
    value: "Tepat jadwal",
    description: "Kurir datang sesuai slot yang dipilih.",
    icon: CalendarClock,
  },
  {
    label: "Proteksi",
    value: "Terverifikasi",
    description: "Setiap tahap punya catatan status.",
    icon: ShieldCheck,
  },
  {
    label: "Pembayaran",
    value: "Transparan",
    description: "Total final terlihat sebelum selesai.",
    icon: Wallet,
  },
];

const STATIC_CHECKPOINTS: TrackingCheckpoint[] = [
  {
    title: "Foto pickup tersimpan",
    description: "Bukti serah terima disimpan pada order aktif.",
    icon: CheckCircle2,
  },
  {
    title: "Estimasi tetap diperbarui",
    description: "ETA berubah mengikuti antrean dan rute kurir.",
    icon: Clock,
  },
  {
    title: "Laundry dipisah per order",
    description: "Label order dipakai dari pickup sampai kembali.",
    icon: Package,
  },
];

function buildTimeline(
  steps: LacakResponse["statusPerjalanan"],
): TrackingStep[] {
  let foundCurrent = false;
  return steps.map((step, idx) => {
    const icon = STEP_ICONS[idx] ?? Package;
    let status: TrackingStepStatus;
    if (step.completed) {
      status = "done";
    } else if (step.active || !foundCurrent) {
      foundCurrent = true;
      status = "current";
    } else {
      status = "upcoming";
    }
    if (!step.completed && !step.active && foundCurrent && status !== "current") {
      status = "upcoming";
    }
    return {
      id: `step-${idx}`,
      title: step.label,
      description: step.sublabel,
      time: step.time,
      status,
      icon,
    };
  });
}

function calcProgress(steps: LacakResponse["statusPerjalanan"]): number {
  if (!steps.length) return 0;
  return Math.round((steps.filter((s) => s.completed).length / steps.length) * 100);
}

function mapToTrackingOrder(data: LacakResponse, aiEtaLabel?: string): TrackingOrder {
  const detail = data.detailPesanan ?? data.pesananAktif;
  const kurir  = data.infoKurir;
  const alamat = data.alamatPenjemputan;
  const peta   = data.petaTracking;

  const etaDisplay = aiEtaLabel
    ?? (peta ? `${peta.estimasiTibaMenit} menit` : "-");

  return {
    id: detail?.kodePesanan ?? "-",
    service: detail?.namaLayanan ?? "Layanan",
    statusLabel: formatStatusLabel(detail?.status),
    statusDescription: "Status pesanan kamu diperbarui secara real-time.",
    tone: "active",
    eta: etaDisplay,
    progress: calcProgress(data.statusPerjalanan),
    updatedAt: "Diperbarui baru saja",
    weight: `${detail?.berat ?? 0} kg`,
    total: formatRupiah(detail?.total ?? 0),
    pickupWindow: detail ? formatWaktu(detail.waktu) : "-",
    outlet: data.detailPesanan?.namaOutlet ?? "-",
    payment: null,
    pickup: {
      label: alamat?.label ?? "Rumah",
      address: alamat?.alamat ?? "Alamat belum diatur",
      note: "Kurir akan menghubungi sebelum tiba.",
    },
    dropoff: {
      label: "Alamat kembali",
      address: alamat?.alamat ?? "Alamat belum diatur",
      note: "Pakaian bersih dikembalikan ke alamat yang sama.",
    },
    courier: kurir ? {
      name: kurir.nama,
      avatar: kurir.inisial ?? "KR",
      rating: kurir.rating ?? 0,
      vehicle: kurir.kendaraan ?? "-",
      distance: peta ? `${peta.jarakKm.toFixed(1)} km dari outlet` : "-",
      responseTime: "Biasanya membalas < 5 menit",
    } : null,
    timeline: buildTimeline(data.statusPerjalanan),
  };
}

const GPS_POLL_INTERVAL_MS = 5_000;

export function TrackingPage({ status: propStatus = "ready" }: TrackingPageProps) {
  const [pageStatus, setPageStatus] = useState<TrackingPageStatus>("loading");
  const [apiData, setApiData] = useState<LacakResponse | null>(null);
  const [aiEtaLabel, setAiEtaLabel]     = useState<string | undefined>(undefined);
  const [aiEtaMenit, setAiEtaMenit]     = useState<number | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [liveDriverLat, setLiveDriverLat] = useState<number | null>(null);
  const [liveDriverLng, setLiveDriverLng] = useState<number | null>(null);
  const [selectedIdPesanan, setSelectedIdPesanan] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPageStatus("loading");
    setAiEtaLabel(undefined);
    fetchLacak(selectedIdPesanan)
      .then((data) => {
        setApiData(data);
        setFetchedAt(new Date());
        setPageStatus(data.detailPesanan || data.pesananAktif ? "ready" : "empty");
        // Seed initial driver position from lacak snapshot
        setLiveDriverLat(data.petaTracking?.kurirLat ?? null);
        setLiveDriverLng(data.petaTracking?.kurirLng ?? null);
        const orderId = data.detailPesanan?.id_pesanan ?? data.pesananAktif?.id_pesanan;
        if (orderId) {
          fetchEtaAI(orderId)
            .then((eta) => {
              setAiEtaLabel(eta.label);
              setAiEtaMenit(eta.estimasiMenit);
            })
            .catch(() => {});
        }
      })
      .catch(() => setPageStatus("error"));
  }, [fetchKey, selectedIdPesanan]);

  // Poll courier GPS every 5 s whenever a courier is assigned
  const idKurir = apiData?.infoKurir?.id ?? null;
  useEffect(() => {
    if (!idKurir) return;
    const poll = () => {
      fetchKurirPosisi(idKurir)
        .then(({ lat, lng }) => {
          if (lat !== null && lng !== null) {
            setLiveDriverLat(lat);
            setLiveDriverLng(lng);
          }
        })
        .catch(() => {});
    };
    poll();
    const timer = setInterval(poll, GPS_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [idKurir]);

  const handleRefresh = () => setFetchKey((k) => k + 1);

  const handleSelectOrder = (kodePesanan: string) => {
    const matched = apiData?.semuaPesananAktif?.find(o => o.kodePesanan === kodePesanan);
    if (matched && matched.id_pesanan !== (apiData?.detailPesanan?.id_pesanan ?? apiData?.pesananAktif?.id_pesanan)) {
      setSelectedIdPesanan(matched.id_pesanan);
    }
  };

  const trackingOrder = useMemo(
    () => (apiData ? mapToTrackingOrder(apiData, aiEtaLabel) : null),
    [apiData, aiEtaLabel],
  );

  const allSwitcherOrders = useMemo((): TrackingOrder[] => {
    const list = apiData?.semuaPesananAktif;
    if (!list?.length || !trackingOrder) return trackingOrder ? [trackingOrder] : [];
    return list.map(o => ({
      id: o.kodePesanan,
      service: o.namaLayanan,
      statusLabel: formatStatusLabel(o.status),
      statusDescription: "",
      tone: "active" as const,
      eta: "-",
      progress: o.progress,
      updatedAt: "",
      weight: `${o.berat} kg`,
      total: formatRupiah(o.total),
      pickupWindow: o.waktu ? formatWaktu(o.waktu) : "-",
      outlet: "-",
      payment: null,
      pickup: { label: "", address: "", note: "" },
      dropoff: { label: "", address: "", note: "" },
      courier: null,
      timeline: [],
    }));
  }, [apiData, trackingOrder]);

  const effectiveStatus = propStatus !== "ready" ? propStatus : pageStatus;

  if (effectiveStatus === "loading") return <TrackingLoadingState />;
  if (effectiveStatus === "error")   return <TrackingErrorState />;
  if (effectiveStatus === "empty" || !trackingOrder) return <TrackingEmptyState />;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5">
        <TrackingHero order={trackingOrder} insights={STATIC_INSIGHTS} fetchedAt={fetchedAt} onRefresh={handleRefresh} />

        {allSwitcherOrders.length > 1 && (
          <TrackingOrderSwitcher
            orders={allSwitcherOrders}
            selectedOrderId={trackingOrder.id}
            onSelectOrder={handleSelectOrder}
          />
        )}

        {/* Peta pelacakan real-time */}
        {apiData?.petaTracking?.outletLat && apiData.petaTracking.outletLng ? (
          <MapView
            outletLat={apiData.petaTracking.outletLat}
            outletLng={apiData.petaTracking.outletLng}
            outletName={trackingOrder.outlet}
            userLat={apiData.petaTracking.userLat}
            userLng={apiData.petaTracking.userLng}
            driverLat={liveDriverLat}
            driverLng={liveDriverLng}
          />
        ) : (
          <MapViewPlaceholder />
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-5">
            <TrackingTimeline
          steps={trackingOrder.timeline}
          estNextStep={
            aiEtaMenit != null
              ? new Date(Date.now() + aiEtaMenit * 60_000).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : undefined
          }
        />
            <section className="rounded-[32px] border border-primary-100 bg-white p-5 shadow-[0_8px_24px_rgba(0,88,202,0.06)] sm:p-6">
              <p className="text-sm font-semibold text-primary-700">Quality checkpoint</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {STATIC_CHECKPOINTS.map((checkpoint) => {
                  const Icon = checkpoint.icon;
                  return (
                    <article key={checkpoint.title} className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[var(--odong-text)]">{checkpoint.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">{checkpoint.description}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
          <TrackingSidePanel order={trackingOrder} />
        </div>

        <span className="sr-only" aria-live="polite">
          Order yang sedang dilacak: {trackingOrder.id}, {trackingOrder.statusLabel}.
        </span>
      </div>
    </div>
  );
}