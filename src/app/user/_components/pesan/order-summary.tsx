import {
  ArrowRight,
  ChevronDown,
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
      <section className="flex h-full flex-col rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--odong-border)] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-600">Checkout</p>
            <h2 className="mt-1 text-xl font-extrabold text-[var(--odong-text)]">
              Konfirmasi Pesanan
            </h2>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-0 overflow-y-auto">

          {/* ── Layanan ── */}
          <div className="border-b border-[var(--odong-border)] px-6 py-4">
            <p className="text-sm font-extrabold text-[var(--odong-text)]">{service.name}</p>
            <p className="mt-1 text-sm text-[var(--odong-muted)]">
              {formatQuantity(quantity)} {service.unit} — estimasi {service.eta}
            </p>
          </div>

          {/* ── Pickup & Alamat ── */}
          <div className="grid gap-4 border-b border-[var(--odong-border)] px-6 py-4 text-sm">
            <div>
              <p className="font-bold text-[var(--odong-text)]">Pickup</p>
              <p className="mt-1 text-[var(--odong-muted)]">
                {slot ? `${slot.day}, ${slot.date} · ${slot.window}` : "—"}
              </p>
            </div>
            <div>
              <p className="font-bold text-[var(--odong-text)]">Alamat</p>
              <p className="mt-1 max-h-[4.5rem] overflow-y-auto leading-6 text-[var(--odong-muted)] [scrollbar-width:thin]">
                {address?.address || "—"}
              </p>
            </div>
          </div>

          {/* ── Metode Pembayaran ── */}
          <div className="border-b border-[var(--odong-border)] px-6 py-4">
            <p className="text-sm font-bold text-[var(--odong-text)]">Metode pembayaran</p>
            <div className="relative mt-3">
              <select
                value={selectedPaymentId}
                onChange={(e) => onSelectPayment(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--odong-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="" disabled>Pilih metode…</option>
                {payments.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted)]"
                aria-hidden="true"
              />
            </div>
            {payment && (
              <p className="mt-2 text-xs text-[var(--odong-muted)]">{payment.description}</p>
            )}
          </div>

          {/* ── Catatan Kurir ── */}
          <div className="border-b border-[var(--odong-border)] px-6 py-4">
            <label
              htmlFor="order-note"
              className="flex items-center gap-2 text-sm font-bold text-[var(--odong-text)]"
            >
              <MessageSquareText className="h-4 w-4 text-primary-600" aria-hidden="true" />
              Catatan kurir
            </label>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Contoh: pakaian putih dipisah, jemput di lobby utama."
              className="mt-3 w-full resize-none rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--odong-text)] outline-none transition placeholder:text-[var(--odong-muted-soft)] focus:border-primary-200 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {/* ── Rincian Harga ── */}
          <div className="px-6 py-4">
            <div className="space-y-2.5">
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              <SummaryRow
                label="Pickup"
                value={pickupFee > 0 ? formatCurrency(pickupFee) : "Gratis"}
                valueClassName={pickupFee === 0 ? "text-emerald-600" : undefined}
              />
              {discount > 0 && (
                <SummaryRow
                  label="Promo"
                  value={`–${formatCurrency(discount)}`}
                  valueClassName="text-primary-600"
                />
              )}
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--odong-border)] pt-4">
              <div>
                <p className="text-sm font-semibold text-[var(--odong-muted)]">Total estimasi</p>
                <p className="mt-0.5 text-xs text-[var(--odong-muted-soft)]">
                  Final setelah penimbangan outlet.
                </p>
              </div>
              <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                {formatCurrency(total)}
              </p>
            </div>

            {selectedAddOns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedAddOns.map((addOn) => (
                  <span
                    key={addOn.id}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700"
                  >
                    {addOn.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── CTA ── */}
          <div className="mt-auto border-t border-[var(--odong-border)] px-6 py-5">
            <button
              type="submit"
              form="laundry-order-form"
              disabled={!canSubmit}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                canSubmit
                  ? "bg-primary-600 shadow-[0_14px_26px_rgba(0,88,202,0.22)] hover:-translate-y-0.5 hover:bg-primary-700"
                  : "cursor-not-allowed bg-neutral-300 shadow-none hover:translate-y-0",
              )}
            >
              Konfirmasi Pembayaran
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[var(--odong-muted)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
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
      <span className={cn("font-bold text-[var(--odong-text)]", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
