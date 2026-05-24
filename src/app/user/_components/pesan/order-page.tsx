"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  Home,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wind,
} from "lucide-react";
import {
  generatePickupSlots,
  paymentOptions,
} from "./data";
import { createPesanan, fetchPesan, type AddonTersediaItem, type PesanLayananItem } from "@/lib/user-api";
import type { AddOnOption } from "./types";
import { OrderDetailsPanel } from "./order-details-panel";
import { OrderServiceGrid } from "./order-service-grid";
import { OrderSummary } from "./order-summary";
import { PaymentConfirmModal } from "./payment-confirm-modal";
import {
  OrderEmptyState,
  OrderErrorState,
  OrderLoadingState,
} from "./order-states";
import type { AddressOption, OrderPageStatus } from "./types";
import { getOutletServiceIcon, suggestOutletServiceIconKey, type OutletServiceIconKey } from "@/lib/outlet-services";

type PesanOrderPageProps = {
  status?: OrderPageStatus;
};

const DEFAULT_INFO_PICKUP = { estimasiPickup: "2 jam", biayaPickup: 8000, minGratisPickup: 75000 };

import type { LucideIcon } from "lucide-react";

const ADDON_ICON_MAP: Record<string, LucideIcon> = {
  leaf:            Leaf,
  shield:          ShieldCheck,
  truck:           Truck,
  "badge-percent": BadgePercent,
  sparkles:        Sparkles,
  star:            Star,
  package:         Package,
  wind:            Wind,
};

function getAddonIcon(key: string | null): LucideIcon {
  return (key && ADDON_ICON_MAP[key]) ? ADDON_ICON_MAP[key] : Sparkles;
}

function mapApiAddons(items: AddonTersediaItem[]): AddOnOption[] {
  return items.map((a) => ({
    id:          a.id_addon,
    name:        a.nama,
    description: a.deskripsi ?? "",
    price:       a.harga,
    icon:        getAddonIcon(a.icon_key),
  }));
}

function clampQuantity(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PesanOrderPage({ status = "ready" }: PesanOrderPageProps) {
  const [infoPickup, setInfoPickup] = useState(DEFAULT_INFO_PICKUP);
  const [apiServices, setApiServices] = useState<PesanLayananItem[]>([]);
  const [apiAddons, setApiAddons] = useState<AddonTersediaItem[]>([]);
  const [apiOutlets, setApiOutlets] = useState<{
    id_laundry: string;
    nama: string;
    alamat: string | null;
    jarak_km: number | null;
    jam_mulai: string | null;
    jam_selesai: string | null;
    jam_operasional: string | null;
    is_open: boolean;
    is_tutup_sementara: boolean;
    jumlah_kurir: number;
    kapasitas_persen: number;
    sisa_kapasitas: number;
    max_kapasitas: number;
    nama_bank: string | null;
    nomor_rekening: string | null;
    atas_nama: string | null;
    qris_url: string | null;
  }[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [fetchStatus, setFetchStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetchPesan()
      .then((data) => {
        setApiServices(data.pilihLayanan.items);
        setApiOutlets(data.outletTersedia);
        if (data.addonTersedia?.length > 0) setApiAddons(data.addonTersedia);
        if (data.infoPickup) setInfoPickup(data.infoPickup);
        if (data.outletTersedia.length > 0) {
          setSelectedOutletId(data.outletTersedia[0].id_laundry);
        }
        const userAlamat = data.alamatPickupUser;
        const addrList: AddressOption[] = userAlamat
          ? [{ id: "rumah-utama", label: "Rumah Utama", recipient: "", address: userAlamat, note: "Alamat utama dari profil", icon: Home }]
          : [{ id: "belum-diatur", label: "Alamat belum diatur", recipient: "", address: "", note: "Atur alamat di halaman Profil terlebih dahulu", icon: Home }];
        setAddressOptions(addrList);
        setSelectedAddressId(addrList[0].id);
        setFetchStatus("ready");
      })
      .catch(() => setFetchStatus("error"));
  }, []);

  const serviceOptions = useMemo(
    () =>
      apiServices.map((s) => ({
        id: s.id_layanan,
        outletId: s.id_laundry,
        name: s.nama,
        description: s.deskripsi ?? "Layanan laundry berkualitas.",
        price: s.harga,
        unit: s.satuan as "kg" | "item",
        eta: s.durasi || "2 hari",
        badge: s.tipe,
        minQuantity: s.min_quantity ?? 1,
        maxQuantity: s.max_quantity ?? 12,
        step: s.step_quantity ?? 0.5,
        icon: getOutletServiceIcon(
          (s.icon_key ?? suggestOutletServiceIconKey(s.nama)) as OutletServiceIconKey,
        ),
      })),
    [apiServices],
  );
  const filteredServiceOptions = serviceOptions;

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const selectedService =
    filteredServiceOptions.find((service) => service.id === selectedServiceId) ??
    filteredServiceOptions[0];
  const displayedServiceId = selectedService?.id ?? "";
  const [quantity, setQuantity] = useState(1);
  const effectiveQuantity = selectedService
    ? clampQuantity(
        quantity,
        selectedService.minQuantity,
        selectedService.maxQuantity,
      )
    : quantity;
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedPickupDay, setSelectedPickupDay] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const activeAddOns: AddOnOption[] = mapApiAddons(apiAddons);

  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    paymentOptions[0]?.id ?? "",
  );
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    idPesanan: string | null;
    kodePesanan: string | null;
    total: number;
    paymentId: string;
    namaBank: string | null;
    nomorRekening: string | null;
    atasNama: string | null;
    qrisUrl: string | null;
  } | null>(null);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (serviceOptions.length === 0 || selectedServiceId !== "") return;
    const preId = searchParams.get("layanan");
    if (!preId) return;
    const match = serviceOptions.find((s) => s.id === preId);
    if (!match) return;
    setSelectedOutletId(match.outletId);
    setSelectedServiceId(preId);
    setQuantity(match.minQuantity);
  }, [serviceOptions, searchParams, selectedServiceId]);

  const selectedOutlet = apiOutlets.find((o) => o.id_laundry === selectedOutletId) ?? apiOutlets[0] ?? null;

  const currentSlots = useMemo(
    () =>
      generatePickupSlots(
        selectedOutlet?.jam_mulai ?? null,
        selectedOutlet?.jam_selesai ?? null,
        selectedOutlet?.sisa_kapasitas ?? 20,
        selectedOutlet?.max_kapasitas ?? 20,
      ),
    [selectedOutletId, selectedOutlet?.jam_mulai, selectedOutlet?.jam_selesai, selectedOutlet?.sisa_kapasitas],
  );

  const prevOutletId = useRef<string>("");
  useEffect(() => {
    if (prevOutletId.current === selectedOutletId) return;
    prevOutletId.current = selectedOutletId;
    const recommended = currentSlots.find((s) => s.recommended) ?? currentSlots[0];
    if (recommended) {
      setSelectedPickupDay(recommended.day);
      setSelectedSlotId(recommended.id);
    } else {
      setSelectedPickupDay("");
      setSelectedSlotId("");
    }
  }, [selectedOutletId, currentSlots]);

  const selectedSlot = currentSlots.find((slot) => slot.id === selectedSlotId);
  const selectedAddress = addressOptions.find(
    (address) => address.id === selectedAddressId,
  );
  const selectedPayment = paymentOptions.find(
    (payment) => payment.id === selectedPaymentId,
  );
  const selectedAddOns = activeAddOns.filter((addOn) =>
    selectedAddOnIds.includes(addOn.id),
  );

  const pricing = useMemo(() => {
    if (!selectedService) {
      return { subtotal: 0, pickupFee: 0, discount: 0, total: 0 };
    }

    const serviceTotal = selectedService.price * effectiveQuantity;
    const addOnTotal = selectedAddOns.reduce(
      (total, addOn) => total + addOn.price,
      0,
    );
    const subtotal = serviceTotal + addOnTotal;
    const pickupFee = subtotal >= infoPickup.minGratisPickup ? 0 : infoPickup.biayaPickup;
    const total = subtotal + pickupFee;

    return { subtotal, pickupFee, discount: 0, total };
  }, [effectiveQuantity, selectedAddOns, selectedService]);


  if (status === "loading" || fetchStatus === "loading") {
    return <OrderLoadingState />;
  }

  if (status === "error" || fetchStatus === "error") {
    return <OrderErrorState />;
  }

  if (serviceOptions.length === 0) {
    return (
      <OrderEmptyState
        title="Layanan tidak tersedia"
        description="Pastikan admin telah menambahkan layanan ke outlet."
      />
    );
  }

  if (status === "empty") {
    return <OrderEmptyState />;
  }

  if (!selectedService) {
    return (
      <OrderEmptyState
        title="Outlet ini belum memiliki layanan"
        description="Pilih outlet lain untuk melanjutkan."
      />
    );
  }

  const outletTutup = selectedOutlet?.is_tutup_sementara === true || !selectedOutlet?.is_open;
  const canSubmit = Boolean(selectedService && selectedSlot && selectedAddress?.address?.trim() && !outletTutup);

  const handleSelectService = (serviceId: string) => {
    const nextService = serviceOptions.find(
      (service) => service.id === serviceId,
    );

    if (!nextService) {
      return;
    }

    setSelectedServiceId(serviceId);
    setQuantity(nextService.minQuantity);
    setSubmitted(false);
  };

  const handleSelectOutlet = (outletId: string) => {
    if (outletId === selectedOutletId) return;
    setSelectedOutletId(outletId);
    setSubmitted(false);
  };

  const handleToggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((currentAddOns) =>
      currentAddOns.includes(addOnId)
        ? currentAddOns.filter((currentId) => currentId !== addOnId)
        : [...currentAddOns, addOnId],
    );
    setSubmitted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError(null);

    if (!selectedService) return;

    const beService =
      apiServices.find((s) => s.id_layanan === selectedService.id) ??
      apiServices[0];

    if (!beService) {
      setSubmitError("Layanan tidak tersedia. Pastikan admin telah menambahkan layanan ke outlet.");
      return;
    }

    const today    = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = selectedSlot?.day === "Hari ini";
    const pickupDate = (isToday ? today : tomorrow)
      .toISOString()
      .slice(0, 10);
    const pickupTime = selectedSlot?.window
      ? selectedSlot.window.replace(" WIB", "").split("-")[0].replace(".", ":") + ":00"
      : undefined;

    setIsSubmitting(true);
    try {
      const result = await createPesanan({
        id_layanan: beService.id_layanan,
        id_laundry: beService.id_laundry,
        berat: effectiveQuantity,
        tanggal_penjemputan: pickupDate,
        waktu_penjemputan: pickupTime,
        catatan: note.trim() || undefined,
        alamat_penjemputan: selectedAddress?.address,
        metode_pembayaran: selectedPaymentId || undefined,
        addon_ids: selectedAddOnIds.length > 0 ? selectedAddOnIds : undefined,
      });
      setPaymentModal({
        idPesanan: result.pesanan.id_pesanan ?? null,
        kodePesanan: result.pesanan.kodePesanan,
        total: result.pesanan.totalEstimasi,
        paymentId: selectedPaymentId,
        namaBank: selectedOutlet?.nama_bank ?? null,
        nomorRekening: selectedOutlet?.nomor_rekening ?? null,
        atasNama: selectedOutlet?.atas_nama ?? null,
        qrisUrl: selectedOutlet?.qris_url ?? null,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal membuat pesanan.");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(
        selectedService.minQuantity,
        clampQuantity(
          currentQuantity,
          selectedService.minQuantity,
          selectedService.maxQuantity,
        ) - selectedService.step,
      ),
    );
    setSubmitted(false);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.min(
        selectedService.maxQuantity,
        clampQuantity(
          currentQuantity,
          selectedService.minQuantity,
          selectedService.maxQuantity,
        ) + selectedService.step,
      ),
    );
    setSubmitted(false);
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      {paymentModal && (
        <PaymentConfirmModal
          open={true}
          idPesanan={paymentModal.idPesanan}
          paymentId={paymentModal.paymentId}
          total={paymentModal.total}
          kodePesanan={paymentModal.kodePesanan}
          outletName={selectedOutlet?.nama}
          namaBank={paymentModal.namaBank}
          nomorRekening={paymentModal.nomorRekening}
          atasNama={paymentModal.atasNama}
          qrisUrl={paymentModal.qrisUrl}
          onClose={() => setPaymentModal(null)}
        />
      )}
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          <section className="flex flex-col overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 dark:border-[var(--odong-border)] dark:bg-[var(--odong-surface-soft)] p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 dark:bg-[var(--odong-surface-strong)] px-3 py-1.5 text-xs font-bold text-primary-700">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Workspace order
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
                  Atur layanan, pickup, dan pembayaran dalam satu layar.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
                  Kelola pesanan baru dari pilihan paket sampai jadwal jemput
                  sebelum dikirim ke outlet.
                </p>
              </div>

              <div className="rounded-3xl border border-primary-100 bg-white/80 dark:bg-[var(--odong-surface-strong)] p-4 shadow-[0_12px_26px_rgba(0,88,202,0.07)] lg:min-w-[230px]">
                <p className="text-xs font-semibold text-[var(--odong-muted)]">
                  Pilihan aktif
                </p>
                <p className="mt-2 text-xl font-extrabold text-[var(--odong-text)]">
                  {selectedService.name}
                </p>
                <p className="mt-1 text-sm text-[var(--odong-muted)]">
                  {selectedSlot
                    ? `${selectedSlot.day}, ${selectedSlot.window}`
                    : "Slot belum dipilih"}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {([
                { value: infoPickup.estimasiPickup, label: "Estimasi pickup", icon: CalendarClock },
                {
                  value: infoPickup.biayaPickup === 0
                    ? "Gratis"
                    : `Gratis ≥ Rp${(infoPickup.minGratisPickup / 1000).toFixed(0)}rb`,
                  label: "Pickup",
                  icon: Truck,
                },
                { value: "Real-time", label: "Update status", icon: ShieldCheck },
              ] as { value: string; label: string; icon: React.ElementType }[]).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-primary-100 bg-white/75 dark:bg-[var(--odong-surface-strong)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 text-primary-600"
                        aria-hidden="true"
                      />
                      <p className="text-lg font-extrabold text-[var(--odong-text)]">
                        {item.value}
                      </p>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {apiOutlets.length > 0 && (
              <div className="mt-auto pt-6 space-y-2">
                <p className="text-sm font-semibold text-[var(--odong-muted)]">Pilih Outlet</p>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {apiOutlets.map((outlet, index) => (
                    <button
                      key={outlet.id_laundry}
                      type="button"
                      onClick={() => handleSelectOutlet(outlet.id_laundry)}
                      className={cn(
                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                        selectedOutletId === outlet.id_laundry
                          ? "bg-primary-600 text-white shadow-sm"
                          : "border border-primary-100 bg-white/80 dark:bg-[var(--odong-surface-strong)] text-primary-700 hover:bg-primary-50",
                      )}
                    >
                      {outlet.nama}
                      {outlet.jarak_km != null && (
                        <span className="ml-1.5 text-[10px] opacity-80">
                          {index === 0
                            ? `(Terdekat · ${outlet.jarak_km} km)`
                            : `(${outlet.jarak_km} km)`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
              <CirclePlus className="h-3.5 w-3.5" aria-hidden="true" />
              Order baru
            </p>
            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--odong-muted)]">
                  Outlet dipilih
                </p>
                <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
                  {selectedOutlet?.nama ?? "Memuat outlet…"}
                </h1>
                <div className="mt-2 h-12 overflow-y-auto text-sm leading-6 text-[var(--odong-muted)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {selectedOutlet?.alamat ?? "Alamat belum tersedia"}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-y border-[var(--odong-border)] py-4">
              {[
                {
                  label: "Status outlet",
                  value: selectedOutlet
                    ? selectedOutlet.is_open ? "Pickup tersedia" : "Sedang tutup"
                    : "-",
                  icon: CheckCircle2,
                  valueClass: selectedOutlet && !selectedOutlet.is_open
                    ? "text-red-500" : undefined,
                },
                {
                  label: "Jam operasional",
                  value: selectedOutlet?.jam_operasional ?? "08.00-21.00 WIB",
                  icon: CalendarClock,
                  valueClass: undefined,
                },
                {
                  label: "Kurir standby",
                  value: selectedOutlet
                    ? selectedOutlet.jumlah_kurir > 0
                      ? `${selectedOutlet.jumlah_kurir} kurir siap jemput`
                      : "Belum ada kurir online"
                    : "-",
                  icon: Truck,
                  valueClass: undefined,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
                      <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className={cn("text-right text-sm font-extrabold text-[var(--odong-text)]", item.valueClass)}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--odong-muted)]">
                <span>Kapasitas pickup hari ini</span>
                <span>{selectedOutlet?.kapasitas_persen ?? 0}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${selectedOutlet?.kapasitas_persen ?? 0}%` }}
                />
              </div>
            </div>

            <Link
              href="/user/lacak"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 text-sm font-bold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
            >
              Cek order aktif
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          <div className="min-w-0 space-y-5">
            <form
              id="laundry-order-form"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {outletTutup && selectedOutlet && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
                  <MapPin className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-red-800">
                      {selectedOutlet.is_tutup_sementara ? "Outlet sedang tutup sementara" : "Outlet sedang tutup"}
                    </p>
                    <p className="text-xs leading-5 text-red-600">
                      {selectedOutlet.is_tutup_sementara
                        ? "Admin menutup outlet ini untuk sementara. Pilih outlet lain atau coba lagi nanti."
                        : `Outlet buka ${selectedOutlet.jam_operasional ?? "sesuai jadwal operasional"}.`}
                    </p>
                  </div>
                </div>
              )}

              {addressOptions.length > 0 && !addressOptions[0].address && (
                <Link
                  href="/user/profil"
                  className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 shadow-[0_4px_12px_rgba(217,119,6,0.08)] transition hover:bg-amber-100"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-amber-800">Alamat pickup belum diatur</p>
                    <p className="text-xs leading-5 text-amber-600">Atur alamat di profil agar kurir tahu lokasi penjemputan kamu.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                </Link>
              )}

              <OrderServiceGrid
                services={filteredServiceOptions}
                selectedServiceId={displayedServiceId}
                onSelectService={handleSelectService}
              />
              <OrderDetailsPanel
                service={selectedService}
                quantity={effectiveQuantity}
                selectedSlotId={selectedSlotId}
                selectedPickupDay={selectedPickupDay}
                selectedAddressId={selectedAddressId}
                selectedAddOnIds={selectedAddOnIds}
                slots={currentSlots}
                addresses={addressOptions}
                addOns={activeAddOns}
                onDecreaseQuantity={handleDecreaseQuantity}
                onIncreaseQuantity={handleIncreaseQuantity}
                onSelectDay={(day) => {
                  setSelectedPickupDay(day);
                  setSelectedSlotId("");
                }}
                onSelectSlot={(slotId) => {
                  setSelectedSlotId(slotId);
                  setSubmitted(false);
                }}
                onSelectAddress={(addressId) => {
                  setSelectedAddressId(addressId);
                  setSubmitted(false);
                }}
                onToggleAddOn={handleToggleAddOn}
              />
            </form>

          <section className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-soft)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-700">
                  Proteksi order
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
                  Diproses transparan dari pickup sampai selesai.
                </h2>
              </div>
              <CheckCircle2
                className="h-8 w-8 text-primary-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                "Foto bukti pickup dari kurir",
                "Update status cucian real-time",
                "Estimasi biaya sebelum pembayaran",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border-t border-[var(--odong-border)] pt-4 text-sm font-bold text-[var(--odong-text)]"
                >
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
          </div>

          {submitError && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {submitError}
            </p>
          )}
          <OrderSummary
            service={selectedService}
            quantity={effectiveQuantity}
            slot={selectedSlot}
            address={selectedAddress}
            payment={selectedPayment}
            payments={paymentOptions}
            selectedPaymentId={selectedPaymentId}
            selectedAddOns={selectedAddOns}
            note={note}
            subtotal={pricing.subtotal}
            pickupFee={pricing.pickupFee}
            discount={pricing.discount}
            total={pricing.total}
            submitted={submitted}
            canSubmit={canSubmit && !isSubmitting}
            onSelectPayment={(paymentId) => {
              setSelectedPaymentId(paymentId);
              setSubmitted(false);
            }}
            onNoteChange={(value) => {
              setNote(value);
              setSubmitted(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
