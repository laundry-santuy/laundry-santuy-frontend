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
    statusLabel: detail?.status ?? "menunggu",
    statusDescription: "Status pesanan kamu diperbarui secara real-time.",
    tone: "active",
    eta: etaDisplay,
    progress: calcProgress(data.statusPerjalanan),
    updatedAt: "Diperbarui baru saja",
    weight: `${detail?.berat ?? 0} kg`,
    total: formatRupiah(detail?.total ?? 0),
    pickupWindow: detail ? formatWaktu(detail.waktu) : "-",
    outlet: data.detailPesanan?.namaOutlet ?? "-",
    payment: "-",
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
    courier: {
      name: kurir?.nama ?? "Kurir",
      avatar: kurir?.inisial ?? "KR",
      rating: kurir?.rating ?? 4.8,
      vehicle: kurir?.kendaraan ?? "-",
      distance: peta ? `${peta.jarakKm.toFixed(1)} km dari outlet` : "-",
      responseTime: "Biasanya membalas < 5 menit",
    },
    timeline: buildTimeline(data.statusPerjalanan),
  };
}

export function TrackingPage({ status: propStatus = "ready" }: TrackingPageProps) {
  const [pageStatus, setPageStatus] = useState<TrackingPageStatus>("loading");
  const [apiData, setApiData] = useState<LacakResponse | null>(null);
  const [aiEtaLabel, setAiEtaLabel] = useState<string | undefined>(undefined);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    setPageStatus("loading");
    setAiEtaLabel(undefined);
    fetchLacak()
      .then((data) => {
        setApiData(data);
        setPageStatus(data.detailPesanan || data.pesananAktif ? "ready" : "empty");
        const orderId = data.detailPesanan?.id_pesanan ?? data.pesananAktif?.id_pesanan;
        if (orderId) {
          fetchEtaAI(orderId)
            .then((eta) => setAiEtaLabel(eta.label))
            .catch(() => {});
        }
      })
      .catch(() => setPageStatus("error"));
  }, [fetchKey]);

  const handleRefresh = () => setFetchKey((k) => k + 1);

  const trackingOrder = useMemo(
    () => (apiData ? mapToTrackingOrder(apiData, aiEtaLabel) : null),
    [apiData, aiEtaLabel],
  );

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
        <TrackingHero order={trackingOrder} insights={STATIC_INSIGHTS} onRefresh={handleRefresh} />

        <TrackingOrderSwitcher
          orders={[trackingOrder]}
          selectedOrderId={trackingOrder.id}
          onSelectOrder={() => {}}
        />

        {/* Peta pelacakan real-time */}
        {apiData?.petaTracking?.outletLat && apiData.petaTracking.outletLng ? (
          <MapView
            outletLat={apiData.petaTracking.outletLat}
            outletLng={apiData.petaTracking.outletLng}
            outletName={trackingOrder.outlet}
            userLat={apiData.petaTracking.userLat}
            userLng={apiData.petaTracking.userLng}
            driverLat={apiData.petaTracking.kurirLat}
            driverLng={apiData.petaTracking.kurirLng}
          />
        ) : (
          <MapViewPlaceholder />
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <TrackingTimeline steps={trackingOrder.timeline} />
          </div>
          <TrackingSidePanel order={trackingOrder} checkpoints={STATIC_CHECKPOINTS} />
        </div>

        <span className="sr-only" aria-live="polite">
          Order yang sedang dilacak: {trackingOrder.id}, {trackingOrder.statusLabel}.
        </span>
      </div>
    </div>
  );
}