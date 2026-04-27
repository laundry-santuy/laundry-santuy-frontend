import {
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AddOnOption,
  AddressOption,
  PaymentOption,
  PickupSlot,
  ServiceOption,
} from "./types";

type OrderSummaryProps = {
  service: ServiceOption;
  quantity: number;
  slot?: PickupSlot;
  address?: AddressOption;
  payment?: PaymentOption;
  payments: PaymentOption[];
  selectedPaymentId: string;
  selectedAddOns: AddOnOption[];
  note: string;
  subtotal: number;
  pickupFee: number;
  discount: number;
  total: number;
  submitted: boolean;
  canSubmit: boolean;
  onSelectPayment: (paymentId: string) => void;
  onNoteChange: (value: string) => void;
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

export function OrderSummary({
  service,
  quantity,
  slot,
  address,
  payment,
  payments,
  selectedPaymentId,
  selectedAddOns,
  note,
  subtotal,
  pickupFee,
  discount,
  total,
  submitted,
  canSubmit,
  onSelectPayment,
  onNoteChange,
}: OrderSummaryProps) {
  return (
    <aside className="h-full" aria-label="Konfirmasi pesanan">
      <section className="flex h-full flex-col rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-700">Checkout</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
              Konfirmasi Pesanan
            </h2>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        {submitted ? (
          <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
            <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Draft order siap dikonfirmasi.
          </div>
        ) : null}

        <div className="mt-5 flex flex-1 flex-col gap-5">
          <div className="border-b border-[var(--odong-border)] pb-5">
            <p className="text-sm font-extrabold text-[var(--odong-text)]">
              {service.name}
            </p>
            <p className="mt-1 text-sm text-[var(--odong-muted)]">
              {formatQuantity(quantity)} {service.unit} - estimasi {service.eta}
            </p>
          </div>

          <div className="grid gap-4 border-b border-[var(--odong-border)] pb-5 text-sm">
            <div>
              <p className="font-bold text-[var(--odong-text)]">Pickup</p>
              <p className="mt-1 text-[var(--odong-muted)]">
                {slot ? `${slot.day}, ${slot.date} - ${slot.window}` : "-"}
              </p>
            </div>
            <div>
              <p className="font-bold text-[var(--odong-text)]">Alamat</p>
              <p className="mt-1 leading-6 text-[var(--odong-muted)]">
                {address ? address.address : "-"}
              </p>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-[var(--odong-text)]">
              Metode pembayaran
            </legend>
            <div className="mt-3 grid gap-2">
              {payments.map((paymentOption) => {
                const Icon = paymentOption.icon;
                const selected = paymentOption.id === selectedPaymentId;

                return (
                  <button
                    key={paymentOption.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectPayment(paymentOption.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]",
                      selected
                        ? "border-primary-200 bg-primary-50 text-primary-700"
                        : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-text)] hover:border-primary-100",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-extrabold">
                        {paymentOption.label}
                      </span>
                      <span className="mt-0.5 block text-xs opacity-70">
                        {paymentOption.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--odong-muted)]">
              Terpilih: {payment ? payment.label : "-"}
            </p>
          </fieldset>

          <div>
            <label
              htmlFor="order-note"
              className="flex items-center gap-2 text-sm font-bold text-[var(--odong-text)]"
            >
              <MessageSquareText
                className="h-4 w-4 text-primary-600"
                aria-hidden="true"
              />
              Catatan kurir
            </label>
            <textarea
              id="order-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={4}
              placeholder="Contoh: pakaian putih dipisah, jemput di lobby utama."
              className="mt-3 w-full resize-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--odong-text)] outline-none transition placeholder:text-[var(--odong-muted-soft)] focus:border-primary-200 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="space-y-3 border-b border-[var(--odong-border)] pb-5">
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow
              label="Pickup"
              value={pickupFee > 0 ? formatCurrency(pickupFee) : "Gratis"}
            />
            <SummaryRow
              label="Promo"
              value={discount > 0 ? `-${formatCurrency(discount)}` : "-"}
              valueClassName={discount > 0 ? "text-primary-700" : undefined}
            />
          </div>

          <div className="mt-auto">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--odong-muted)]">
                  Total estimasi
                </p>
                <p className="mt-1 text-xs text-[var(--odong-muted-soft)]">
                  Final setelah penimbangan outlet.
                </p>
              </div>
              <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                {formatCurrency(total)}
              </p>
            </div>

            {selectedAddOns.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedAddOns.map((addOn) => (
                  <span
                    key={addOn.id}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700"
                  >
                    {addOn.name}
                  </span>
                ))}
              </div>
            ) : null}

            <button
              type="submit"
              form="laundry-order-form"
              disabled={!canSubmit}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none disabled:hover:translate-y-0"
            >
              Konfirmasi Order
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--odong-muted)]">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                aria-hidden="true"
              />
              Harga dan jadwal akan dikunci setelah outlet menerima order.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--odong-muted)]">{label}</span>
      <span
        className={cn(
          "font-bold text-[var(--odong-text)]",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
