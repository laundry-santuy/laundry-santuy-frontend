import { cn } from "@/lib/utils";
import { historyStatusIcon } from "./data";
import type { HistoryOrderStatus, HistoryPaymentStatus } from "./types";

const statusStyles: Record<HistoryOrderStatus, string> = {
  Selesai: "bg-[#51cf66]/12 text-[#2fbd4d]",
  "Siap Diambil": "bg-[#4dabf7]/12 text-[#278be6]",
  Diproses: "bg-primary-50 text-primary-700",
  Dibatalkan: "bg-[#ff6b6b]/12 text-[#e03131]",
};

const paymentStyles: Record<HistoryPaymentStatus, string> = {
  Lunas: "bg-[#51cf66]/12 text-[#2fbd4d]",
  Menunggu: "bg-primary-50 text-primary-700",
  Refund: "bg-[#ff6b6b]/12 text-[#e03131]",
};

type HistoryStatusBadgeProps = {
  status: HistoryOrderStatus;
};

type PaymentStatusBadgeProps = {
  status: HistoryPaymentStatus;
};

export function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
  const Icon = historyStatusIcon[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold",
        statusStyles[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold",
        paymentStyles[status],
      )}
    >
      {status}
    </span>
  );
}
