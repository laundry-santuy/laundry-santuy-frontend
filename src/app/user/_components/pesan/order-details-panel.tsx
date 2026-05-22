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
  selectedAddressId: string;
  selectedAddOnIds: string[];
  slots: PickupSlot[];
  addresses: AddressOption[];
  addOns: AddOnOption[];
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onSelectSlot: (slotId: string) => void;
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
  selectedAddressId,
  selectedAddOnIds,
  slots,
  addresses,
  addOns,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSelectSlot,
  onSelectAddress,
  onToggleAddOn,
}: OrderDetailsPanelProps) {
  const minReached = quantity <= service.minQuantity;
  const maxReached = quantity >= service.maxQuantity;

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

        <div>
          <label
            htmlFor="slot-pickup"
            className="text-sm font-bold text-[var(--odong-text)]"
          >
            Slot pickup
          </label>
          <div className="relative mt-3">
            <select
              id="slot-pickup"
              value={selectedSlotId}
              onChange={(e) => onSelectSlot(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--odong-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="" disabled>
                Pilih slot waktu...
              </option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.day}, {slot.date} · {slot.window}
                  {slot.recommended ? " ★" : ""} — {slot.capacity}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted)]"
              aria-hidden="true"
            />
          </div>
          {selectedSlotId && (() => {
            const slot = slots.find((s) => s.id === selectedSlotId);
            return slot ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {slot.day}, {slot.date} · {slot.window} · {slot.capacity}
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
                    <span className="mt-1 block text-sm leading-5 opacity-75">
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

        <div className="space-y-6">
          <fieldset>
            <legend className="text-sm font-bold text-[var(--odong-text)]">
              Add-on
            </legend>
            <div className="mt-3 divide-y divide-[var(--odong-border)] overflow-hidden rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
              {addOns.map((addOn) => {
                const Icon = addOn.icon;
                const selected = selectedAddOnIds.includes(addOn.id);

                return (
                  <button
                    key={addOn.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleAddOn(addOn.id)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          selected
                            ? "bg-primary-600 text-white"
                            : "bg-primary-50 text-primary-600",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold text-[var(--odong-text)]">
                          {addOn.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--odong-muted)]">
                          {addOn.description}
                        </span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-bold text-primary-700">
                        {addOn.price > 0
                          ? formatCurrency(addOn.price)
                          : "Gratis"}
                      </span>
                      {selected ? (
                        <CheckCircle2
                          className="ml-auto mt-1 h-4 w-4 text-primary-600"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

        </div>
      </div>
    </section>
  );
}
