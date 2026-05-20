import Link from "next/link";
import { ChevronRight, MapPin, Truck } from "lucide-react";
import type { CourierInfo } from "./types";

type CourierCardProps = {
  courier: CourierInfo;
};

export function CourierCard({ courier }: CourierCardProps) {
  return (
    <aside className="rounded-2xl bg-[var(--odong-surface-strong)] p-4 shadow-[0_18px_40px_rgba(25,28,29,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[var(--odong-text)]">Posisi Kurir</h2>
        <Link
          href="/user/lacak"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 underline-offset-4 transition hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-primary-400"
        >
          Lihat Peta
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-3 flex h-[128px] items-center justify-center rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-soft)]">
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-[var(--odong-muted-soft)]" aria-hidden="true" />
          <p className="mt-3 text-[10px] leading-4 text-[var(--odong-muted)]">
            Peta akan muncul di sini
          </p>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-2 text-[10px] leading-5 text-[var(--odong-muted)]">
        <Truck className="h-4 w-4 text-primary-600" aria-hidden="true" />
        {courier.distance}
      </p>
    </aside>
  );
}