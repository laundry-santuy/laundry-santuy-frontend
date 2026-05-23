"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  Clock,
  MapPin,
  Package,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  fetchBeranda,
  formatWaktu,
  mapBeStatus,
  type BerandaResponse,
} from "@/lib/user-api";
import { ActiveOrderCard } from "./active-order-card";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
} from "./dashboard-states";
import { PromoBanner } from "./promo-banner";
import { RecentOrders } from "./recent-orders";
import { SectionHeader } from "./section-header";
import type { ActiveOrder, ActiveOrderStep, RecentOrder, RecentOrderStatus } from "./types";

type DashboardStatus = "loading" | "error" | "empty" | "ready";

const STEP_ICONS = [Package, Package, Shirt, CheckCircle2] as const;

type ProgressItem = { label: string; completed: boolean };

function mapProgressToSteps(progress: ProgressItem[]): ActiveOrderStep[] {
  let foundCurrent = false;
  return progress.map((item: ProgressItem, idx: number) => {
    const icon = STEP_ICONS[idx] ?? Package;
    if (item.completed) return { label: item.label, icon, status: "done" };
    if (!foundCurrent) {
      foundCurrent = true;
      return { label: item.label, icon, status: "current" };
    }
    return { label: item.label, icon, status: "upcoming" };
  });
}

function buildInitials(name: string | undefined): string {
  if (!name) return "KR";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KR";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function mapActiveOrder(raw: NonNullable<BerandaResponse["pesananAktif"]>): ActiveOrder {
  const progress: ProgressItem[] = raw.progress ?? [];
  return {
    id: raw.kodePesanan,
    service: raw.namaLayanan,
    weight: `${raw.berat} kg`,
    eta: raw.eta,
    steps: mapProgressToSteps(progress),
    courier: raw.kurir
      ? {
          name: raw.kurir.nama,
          rating: raw.kurir.rating,
          vehicle: `${raw.kurir.kendaraan} ${raw.kurir.noPolisi}`.trim(),
          distance: "Kurir aktif",
          noTelepon: raw.kurir.noTelepon ?? null,
        }
      : null,
    courierInitials: buildInitials(raw.kurir?.nama),
  };
}

function mapRecentOrders(raw: BerandaResponse["pesananTerbaru"]): RecentOrder[] {
  const VALID_STATUSES: RecentOrderStatus[] = ["Selesai", "Siap Diambil", "Diproses"];

  return raw.map((item) => {
    const mapped = mapBeStatus(item.status) as RecentOrderStatus;
    const status: RecentOrderStatus = VALID_STATUSES.includes(mapped) ? mapped : "Diproses";
    return {
      id: item.kodePesanan,
      service: item.namaLayanan,
      date: formatWaktu(item.waktu),
      weight: `${item.berat} kg`,
      status,
    };
  });
}

type LayananCard = {
  id: string;
  title: string;
  description: string;
  price: string;
  eta: string;
  icon: React.ElementType;
};

function resolveLayananIcon(nama: string, tipe: string): React.ElementType {
  const n = nama.toLowerCase();
  const t = (tipe ?? "").toLowerCase();
  if (t.includes("express") || t.includes("kilat") || n.includes("express") || n.includes("kilat")) return Clock;
  if (n.includes("setrika") || n.includes("ironing")) return Sparkles;
  if (n.includes("bedding") || n.includes("seprei") || n.includes("selimut") || n.includes("bed")) return Package;
  return Shirt;
}

function mapLayananToCard(s: NonNullable<BerandaResponse["layananPopuler"]>[number]): LayananCard {
  const harga = (s.harga ?? 0).toLocaleString("id-ID");
  const satuan = s.satuan ?? "kg";
  return {
    id:          s.id_layanan,
    title:       s.nama,
    description: s.deskripsi ?? `Layanan ${s.nama.toLowerCase()} berkualitas.`,
    price:       `Mulai Rp${harga}/${satuan}`,
    eta:         s.durasi ?? "2-3 hari",
    icon:        resolveLayananIcon(s.nama, s.tipe),
  };
}

const workflowItems = [
  {
    title: "Pilih layanan",
    description: "Pilih outlet, layanan, dan jadwal penjemputan.",
    icon: CalendarClock,
  },
  {
    title: "Kurir menjemput",
    description: "Kurir datang ke alamatmu sesuai jadwal yang dipilih.",
    icon: Truck,
  },
  {
    title: "Terima cucian bersih",
    description: "Pantau proses dan terima cucian bersih langsung di rumah.",
    icon: MapPin,
  },
];

export function BerandaDashboard() {
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [apiData, setApiData] = useState<BerandaResponse | null>(null);
  const [errMsg, setErrMsg]   = useState<string | null>(null);

  useEffect(() => {
    fetchBeranda()
      .then((data) => {
        setApiData(data);
        // Always show the dashboard if the user has no address yet (so the banner is visible)
        const hasActivity = data.pesananTerbaru.length > 0 || !!data.pesananAktif;
        setStatus(hasActivity || !data.profilPengguna.alamat ? "ready" : "empty");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Beranda] fetch error:", msg, err);
        setErrMsg(msg);
        setStatus("error");
      });
  }, []);

  if (status === "loading") return <DashboardLoadingState />;
  if (status === "error")   return <DashboardErrorState detail={errMsg} />;
  if (status === "empty")   return <DashboardEmptyState />;

  const activeOrder  = apiData?.pesananAktif ? mapActiveOrder(apiData.pesananAktif) : null;
  const recentOrders = apiData ? mapRecentOrders(apiData.pesananTerbaru) : [];

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl space-y-6">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-orb-slow absolute left-[-16%] top-[8%] h-[420px] w-[420px] rounded-full bg-primary-300/18 blur-3xl" />
        <div className="odong-orb-medium absolute right-[-14%] top-[18%] h-[380px] w-[380px] rounded-full bg-primary-200/25 blur-3xl" />
        <div className="odong-orb-fast absolute bottom-[-18%] left-[26%] h-[460px] w-[460px] rounded-full bg-primary-100/45 blur-3xl" />
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-6">
        {!apiData?.profilPengguna.alamat && (
          <Link
            href="/user/profil"
            className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <MapPin className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-800">Alamat pickup belum diatur</p>
              <p className="text-xs leading-5 text-amber-600">Atur alamat di profil agar kurir tahu lokasi penjemputan kamu.</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          </Link>
        )}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_380px] lg:items-stretch">
          <div className="odong-surface relative overflow-hidden rounded-[28px] border border-[var(--odong-border)] p-6 shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl sm:p-8">
            <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-primary-200/35 blur-3xl" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Layanan laundry jemput antar
              </p>
              <h1 className="odong-text mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-normal text-neutral-900 sm:text-5xl">
                Halo{apiData?.profilPengguna.nama ? `, ${apiData.profilPengguna.nama.split(" ")[0]}` : ""}. Selamat datang di Laundry Santuy.
              </h1>
              <p className="odong-muted mt-4 max-w-xl text-base leading-7 text-neutral-600">
                Pesan laundry, pantau proses, dan terima pakaian bersih tanpa
                keluar rumah. Semua dibuat santai, rapi, dan transparan dari
                awal sampai selesai.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/user/pesan"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                >
                  <CirclePlus className="h-5 w-5" aria-hidden="true" />
                  Buat Order
                </Link>
                <Link
                  href="/user/lacak"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/75 dark:bg-[var(--odong-surface-strong)] px-5 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                >
                  Lacak Pesanan
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {([
                  [
                    apiData?.statsBeranda?.ratingKurir != null
                      ? `${apiData.statsBeranda.ratingKurir}/5`
                      : "4.8/5",
                    "Rating kurir",
                  ],
                  [apiData?.statsBeranda?.estimasiPickup ?? "2 jam", "Estimasi pickup"],
                  ["24/7", "Pantau order"],
                ] as [string, string][]).map(([value, label]) => (
                  <div
                    key={label}
                    className="odong-surface-soft rounded-2xl border border-primary-100/70 bg-primary-50/70 px-4 py-3"
                  >
                    <p className="odong-text text-xl font-extrabold text-neutral-900">{value}</p>
                    <p className="odong-muted mt-1 text-xs font-medium text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeOrder ? (
            <aside className="odong-surface-soft rounded-[28px] border border-[var(--odong-border)] p-5 shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="odong-muted text-sm font-semibold text-neutral-500">Pesanan aktif</p>
                  <h2 className="odong-text mt-1 text-2xl font-extrabold text-neutral-900">{activeOrder.id}</h2>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">{activeOrder.eta}</span>
              </div>

              <div className="odong-surface-strong mt-5 rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white">
                    <Shirt className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="odong-text font-bold text-neutral-900">{activeOrder.service}</p>
                    <p className="odong-muted mt-1 text-sm text-neutral-500">{activeOrder.weight} sedang diproses</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full bg-primary-600"
                    style={{
                      width: `${Math.round((activeOrder.steps.filter((s) => s.status === "done").length / activeOrder.steps.length) * 100)}%`,
                    }}
                  />
                </div>
                <div className="odong-muted mt-3 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span>Diterima</span>
                  <span>Selesai</span>
                </div>
              </div>

              <Link
                href="/user/lacak"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-sm font-bold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 active:scale-[0.98]"
              >
                Lihat Detail
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="odong-surface-strong rounded-2xl px-4 py-3">
                  <p className="odong-muted-soft text-xs font-semibold text-neutral-400">Kurir</p>
                  <p className="odong-text mt-1 text-sm font-bold text-neutral-900">
                    {activeOrder.courier ? `${activeOrder.courier.name} · ${activeOrder.courier.rating}` : "Belum ada kurir"}
                  </p>
                </div>
                <div className="odong-surface-strong rounded-2xl px-4 py-3">
                  <p className="odong-muted-soft text-xs font-semibold text-neutral-400">Status</p>
                  <p className="odong-text mt-1 text-sm font-bold text-neutral-900">
                    {activeOrder.steps.find((s) => s.status === "current")?.label ?? "Diproses"}
                  </p>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="odong-surface-soft flex flex-col items-center justify-center rounded-[28px] border border-dashed border-primary-100 bg-primary-50/40 p-5 text-center shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl">
              <Package className="h-10 w-10 text-primary-200" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-neutral-500">Belum ada pesanan aktif</p>
              <Link
                href="/user/pesan"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                <CirclePlus className="h-4 w-4" />
                Buat Order Pertama
              </Link>
            </aside>
          )}
        </section>

        <PromoBanner />

        <section className="space-y-3">
          <SectionHeader title="Layanan Tersedia" actionLabel="Order sekarang" href="/user/pesan" />
          {(apiData?.layananPopuler ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 px-5 py-4 text-sm font-semibold text-neutral-400">
              Belum ada layanan tersedia
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(apiData?.layananPopuler ?? []).map((raw) => {
                const service = mapLayananToCard(raw);
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    className="odong-surface-soft group rounded-[24px] border border-[var(--odong-border)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] transition hover:-translate-y-1 hover:bg-[var(--odong-surface-strong)] hover:shadow-[0_20px_44px_rgba(25,28,29,0.075)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="odong-text mt-4 text-lg font-extrabold text-neutral-900">{service.title}</h3>
                    <p className="odong-muted mt-2 min-h-[48px] text-sm leading-6 text-neutral-500">{service.description}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-primary-700">{service.price}</p>
                        <p className="mt-1 text-xs text-neutral-400">Estimasi {service.eta}</p>
                      </div>
                      <Link
                        href={`/user/pesan?layanan=${raw.id_layanan}`}
                        aria-label={`Pesan ${service.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition group-hover:bg-primary-600"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="odong-surface-soft rounded-[28px] border border-[var(--odong-border)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-700">Cara kerja</p>
              <h2 className="odong-text mt-1 text-2xl font-extrabold text-neutral-900">
                Dari keranjang ke lemari, tinggal pantau.
              </h2>
            </div>
            <Link
              href="/user/pesan"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800"
            >
              Mulai sekarang
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workflowItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="odong-surface-strong rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-extrabold text-white">
                      {index + 1}
                    </span>
                    <Icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="odong-text mt-4 font-extrabold text-neutral-900">{item.title}</h3>
                  <p className="odong-muted mt-2 text-sm leading-6 text-neutral-500">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {activeOrder && (
          <section className="space-y-3">
            <SectionHeader title="Pesanan Aktif" actionLabel="Detail" href="/user/lacak" />
            <ActiveOrderCard order={activeOrder} />
          </section>
        )}

        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}