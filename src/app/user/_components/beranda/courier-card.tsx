import Link from "next/link";
import { ChevronRight, MapPin, Truck } from "lucide-react";
import type { CourierInfo } from "./types";

type CourierCardProps = {
  courier: CourierInfo;
};

export function CourierCard({ courier }: CourierCardProps) {
  return (
    <aside className="rounded-2xl bg-white p-4 shadow-[0_18px_40px_rgba(25,28,29,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#070917]">Posisi Kurir</h2>
        <Link
          href="/user/lacak"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#3d81ff] underline-offset-4 transition hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Lihat Peta
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-3 flex h-[128px] items-center justify-center rounded-2xl border border-[#dee2e6] bg-[#f1f3f5]">
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 text-[#868e96]" aria-hidden="true" />
          <p className="mt-3 text-[10px] leading-4 text-[#868e96]">
            Peta akan muncul di sini
          </p>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-2 text-[10px] leading-5 text-[#868e96]">
        <Truck className="h-4 w-4 text-[#3d81ff]" aria-hidden="true" />
        {courier.distance}
      </p>
    </aside>
  );
}
