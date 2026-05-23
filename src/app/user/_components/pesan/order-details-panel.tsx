"use client";

import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AddOnOption,
  AddressOption,
  PickupSlot,
  ServiceOption,
} from "./types";

type OrderDetailsPanelProps = {
  service: ServiceOption;
  quantity: number;
  selectedSlotId: string;
  selectedPickupDay: string;
  selectedAddressId: string;
  selectedAddOnIds: string[];
  slots: PickupSlot[];
  addresses: AddressOption[];
  addOns: AddOnOption[];
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onSelectSlot: (slotId: string) => void;
  onSelectDay: (day: string) => void;
  onSelectAddress: (addressId: string) => void;
  onToggleAddOn: (addOnId: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function OrderDetailsPanel({
  service,
  quantity,
  selectedSlotId,
  selectedPickupDay,
  selectedAddressId,
  selectedAddOnIds,
  slots,
  addresses,
  addOns,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSelectSlot,
  onSelectDay,
  onSelectAddress,
  onToggleAddOn,
}: OrderDetailsPanelProps) {
  const minReached = quantity <= service.minQuantity;
  const maxReached = quantity >= service.maxQuantity;

  const todaySlots = slots.filter((s) => s.day === "Hari ini");
  const tomorrowSlots = slots.filter((s) => s.day === "Besok");
  const todayDate = todaySlots[0]?.date ?? "";
  const tomorrowDate = tomorrowSlots[0]?.date ?? "";
  const visibleTimeSlots = slots.filter((s) => s.day === selectedPickupDay);

  return (
    <section className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">Detail order</p>
          <h2 className="text-2xl font-extrabold text-[var(--odong-text)]">
            Jadwal dan preferensi
          </h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          Pickup terjadwal
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <label
            id="quantity-label"
            className="text-sm font-bold text-[var(--odong-text)]"
          >
            Berat / jumlah
          </label>
          <div
            className="mt-3 flex h-[72px] items-center justify-between rounded-[24px] border border-primary-100 bg-primary-50/70 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            aria-labelledby="quantity-label"
          >
            <button
              type="button"
              aria-label="Kurangi jumlah"
              disabled={minReached}
              onClick={onDecreaseQuantity}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-[0_12px_22px_rgba(25,28,29,0.18)] transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-[var(--odong-surface-strong)] disabled:text-[var(--odong-muted-soft)] disabled:shadow-none disabled:hover:translate-y-0"
            >
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="min-w-20 text-center text-2xl font-extrabold text-[var(--odong-text)]">
              {formatQuantity(quantity)}{" "}
              <span className="text-sm text-[var(--odong-muted)]">
                {service.unit}
              </span>
            </p>
            <button
              type="button"
              aria-label="Tambah jumlah"
              disabled={maxReached}
              onClick={onIncreaseQuantity}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_12px_24px_rgba(0,88,202,0.28)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-[var(--odong-surface-strong)] disabled:text-[var(--odong-muted-soft)] disabled:shadow-none disabled:hover:translate-y-0"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-xs font-medium text-[var(--odong-muted)]">
            Batas {service.minQuantity}-{service.maxQuantity} {service.unit}.
          </p>
        </div>

        {/* ── Slot Picker ─────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-[var(--odong-text)]">Slot pickup</p>

          {/* Row 1: Tanggal + Jam — dua dropdown sejajar */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* Kiri: Pilih tanggal */}
            <div className="relative">
              <select
                value={selectedPickupDay}
                onChange={(e) => onSelectDay(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--odong-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="" disabled>Pilih tanggal…</option>
                {todaySlots.length > 0 && (
                  <option value="Hari ini">Hari ini · {todayDate}</option>
                )}
                {tomorrowSlots.length > 0 && (
                  <option value="Besok">Besok · {tomorrowDate}</option>
                )}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted)]"
                aria-hidden="true"
              />
            </div>

            {/* Kanan: Pilih jam */}
            <div className="relative">
              <select
                value={selectedSlotId}
                onChange={(e) => onSelectSlot(e.target.value)}
                disabled={!selectedPickupDay || visibleTimeSlots.length === 0}
                className={cn(
                  "w-full appearance-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--odong-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200",
                  (!selectedPickupDay || visibleTimeSlots.length === 0) && "cursor-not-allowed opacity-50",
                )}
              >
                <option value="" disabled>Pilih jam…</option>
                {visibleTimeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id} disabled={slot.capacity === "Penuh"}>
                    {slot.window.replace(" WIB", "")}
                    {slot.capacity === "Penuh" ? " (Penuh)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Row 2: Info slot — muncul setelah keduanya dipilih */}
          {selectedPickupDay && selectedSlotId && (() => {
            const slot = slots.find((s) => s.id === selectedSlotId);
            return slot ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {slot.capacity} tersedia · {slot.day}, {slot.date} · {slot.window}
              </p>
            ) : null;
          })()}
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <fieldset>
          <legend className="flex items-center gap-2 text-sm font-bold text-[var(--odong-text)]">
            <MapPin className="h-4 w-4 text-primary-600" aria-hidden="true" />
            Alamat pickup
          </legend>
          <div className="mt-3 space-y-3">
            {addresses.map((address) => {
              const Icon = address.icon;
              const selected = address.id === selectedAddressId;

              return (
                <button
                  key={address.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectAddress(address.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]",
                    selected
                      ? "border-primary-200 bg-primary-50 text-primary-700"
                      : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:border-primary-100",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      selected
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-primary-600",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">
                      {address.label} - {address.recipient}
                    </span>
                    <span className="mt-1 block max-h-[60px] overflow-y-auto text-sm leading-5 opacity-75 [scrollbar-width:thin]">
                      {address.address}
                    </span>
                    <span className="mt-2 block text-xs font-medium opacity-65">
                      {address.note}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--odong-text)]">
            Add-on
            {selectedAddOnIds.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                {selectedAddOnIds.length}
              </span>
            )}
          </p>
          {addOns.length === 0 ? (
            <p className="mt-3 text-xs text-[var(--odong-muted)]">
              Belum ada add-on yang tersedia.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {addOns.map((addOn) => {
                const Icon = addOn.icon;
                const selected = selectedAddOnIds.includes(addOn.id);

                return (
                  <button
                    key={addOn.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleAddOn(addOn.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                      selected
                        ? "border-primary-200 bg-primary-50"
                        : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition",
                        selected
                          ? "bg-primary-600 text-white shadow-[0_6px_14px_rgba(0,88,202,0.25)]"
                          : "bg-primary-50 text-primary-600",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 w-full">
                      <span className="block truncate text-[11px] font-extrabold leading-tight text-[var(--odong-text)]">
                        {addOn.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-bold text-primary-600">
                        {addOn.price > 0 ? formatCurrency(addOn.price) : "Gratis"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
