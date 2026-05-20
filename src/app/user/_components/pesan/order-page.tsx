"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePlus,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  addOnOptions,
  addressOptions,
  paymentOptions,
  pickupSlots,
} from "./data";
import { createPesanan, fetchPesan, type PesanLayananItem } from "@/lib/user-api";
import { OrderDetailsPanel } from "./order-details-panel";
import { OrderServiceGrid } from "./order-service-grid";
import { OrderSummary } from "./order-summary";
import {
  OrderEmptyState,
  OrderErrorState,
  OrderLoadingState,
} from "./order-states";
import type { OrderPageStatus } from "./types";
import { getOutletServiceIcon, suggestOutletServiceIconKey, type OutletServiceIconKey } from "@/lib/outlet-services";

type PesanOrderPageProps = {
  status?: OrderPageStatus;
};

const commandStats = [
  { value: "2 jam", label: "Estimasi pickup", icon: CalendarClock },
  { value: "Rp75rb", label: "Gratis pickup", icon: Truck },
  { value: "Real-time", label: "Update status", icon: ShieldCheck },
];

function clampQuantity(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PesanOrderPage({ status = "ready" }: PesanOrderPageProps) {
  const [apiServices, setApiServices] = useState<PesanLayananItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetchPesan()
      .then((data) => {
        setApiServices(data.pilihLayanan.items);
        setFetchStatus("ready");
      })
      .catch(() => setFetchStatus("error"));
  }, []);

  const serviceOptions = useMemo(
    () =>
      apiServices.map((s) => ({
        id: s.id_layanan,
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
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const selectedService =
    serviceOptions.find((service) => service.id === selectedServiceId) ??
    serviceOptions[1] ??
    serviceOptions[0];
  const displayedServiceId = selectedService?.id ?? "";
  const [quantity, setQuantity] = useState(1);
  const effectiveQuantity = selectedService
    ? clampQuantity(
        quantity,
        selectedService.minQuantity,
        selectedService.maxQuantity,
      )
    : quantity;
  const [selectedSlotId, setSelectedSlotId] = useState(
    pickupSlots[0]?.id ?? "",
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    addressOptions[0]?.id ?? "",
  );
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([
    addOnOptions[0]?.id ?? "",
  ]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    paymentOptions[0]?.id ?? "",
  );
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ kodePesanan: string | null; total: number } | null>(null);

  const selectedSlot = pickupSlots.find((slot) => slot.id === selectedSlotId);
  const selectedAddress = addressOptions.find(
    (address) => address.id === selectedAddressId,
  );
  const selectedPayment = paymentOptions.find(
    (payment) => payment.id === selectedPaymentId,
  );
  const selectedAddOns = addOnOptions.filter((addOn) =>
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
    const pickupFee = subtotal >= 75000 ? 0 : 8000;
    const discount = Math.min(Math.floor(subtotal * 0.1), 15000);
    const total = Math.max(subtotal + pickupFee - discount, 0);

    return { subtotal, pickupFee, discount, total };
  }, [effectiveQuantity, selectedAddOns, selectedService]);

  if (successOrder) {
    return (
      <div className="relative mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <CheckCircle2 className="h-10 w-10 text-primary-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--odong-text)]">Pesanan berhasil dibuat!</h2>
          {successOrder.kodePesanan && (
            <p className="mt-2 text-sm font-semibold text-primary-700">
              Kode: {successOrder.kodePesanan}
            </p>
          )}
          <p className="mt-2 text-sm text-[var(--odong-muted)]">
            Estimasi total: Rp {successOrder.total.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-sm text-[var(--odong-muted)]">Kurir akan segera menjemput cucianmu.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/user/lacak"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary-600 px-6 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Lacak Pesanan
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/user/beranda"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface)] px-6 text-sm font-bold text-[var(--odong-text)] transition hover:bg-[var(--odong-surface-strong)]"
          >
            Beranda
          </Link>
        </div>
      </div>
    );
  }

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

  if (status === "empty" || !selectedService) {
    return <OrderEmptyState />;
  }

  const canSubmit = Boolean(selectedService && selectedSlot && selectedAddress);

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
      ? selectedSlot.window.split(" - ")[0].replace(".", ":") + ":00"
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
      });
      setSuccessOrder({
        kodePesanan: result.pesanan.kodePesanan,
        total: result.pesanan.totalEstimasi,
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
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          <section className="overflow-hidden rounded-[32px] border border-primary-100 bg-primary-50/80 dark:border-[var(--odong-border)] dark:bg-[var(--odong-surface-soft)] p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
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
              {commandStats.map((item) => {
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
                  Outlet terdekat
                </p>
                <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
                  Santuy Kemang
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                  1.2 km dari alamat pickup utama. Area Jakarta Selatan aktif
                  setiap hari 08.00 - 21.00.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-y border-[var(--odong-border)] py-4">
              {[
                {
                  label: "Status outlet",
                  value: "Pickup tersedia",
                  icon: CheckCircle2,
                },
                {
                  label: "Jam operasional",
                  value: "08.00 - 21.00",
                  icon: CalendarClock,
                },
                {
                  label: "Kurir standby",
                  value: "4 kurir siap jemput",
                  icon: Truck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--odong-muted)]">
                      <Icon
                        className="h-4 w-4 text-primary-600"
                        aria-hidden="true"
                      />
                      {item.label}
                    </span>
                    <span className="text-right text-sm font-extrabold text-[var(--odong-text)]">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--odong-muted)]">
                <span>Kapasitas pickup hari ini</span>
                <span>75%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
                <div className="h-full w-3/4 rounded-full bg-primary-600" />
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
              <OrderServiceGrid
                services={serviceOptions}
                selectedServiceId={displayedServiceId}
                onSelectService={handleSelectService}
              />
              <OrderDetailsPanel
                service={selectedService}
                quantity={effectiveQuantity}
                selectedSlotId={selectedSlotId}
                selectedAddressId={selectedAddressId}
                selectedAddOnIds={selectedAddOnIds}
                slots={pickupSlots}
                addresses={addressOptions}
                addOns={addOnOptions}
                onDecreaseQuantity={handleDecreaseQuantity}
                onIncreaseQuantity={handleIncreaseQuantity}
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
