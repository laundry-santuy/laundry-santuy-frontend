import { cn } from "@/lib/utils";
import type { RecentOrderStatus } from "./types";

const statusClassName: Record<RecentOrderStatus, string> = {
  Selesai: "bg-[#51cf66]/10 text-[#2fbd4d]",
  "Siap Diambil": "bg-[#4dabf7]/10 text-[#278be6]",
  Diproses: "bg-primary-100 text-primary-700",
};

type StatusBadgeProps = {
  status: RecentOrderStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-3 text-xs font-medium leading-4",
        statusClassName[status],
      )}
    >
      {status}
    </span>
  );
}
