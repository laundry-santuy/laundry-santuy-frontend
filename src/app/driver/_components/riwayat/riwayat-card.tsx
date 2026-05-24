import { cn } from "@/lib/utils";
import { Building2, CalendarDays, ImageIcon, Package, Shirt, Wallet } from "lucide-react";
import type { DriverHistoryOrder } from "../types";

type RiwayatCardProps = {
  order: DriverHistoryOrder;
};

const statusStyle = {
  selesai:    { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Selesai" },
  dibatalkan: { badge: "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]", dot: "bg-slate-400", label: "Dibatalkan" },
  ditolak:    { badge: "bg-red-50 text-red-600", dot: "bg-red-400", label: "Ditolak" },
} as const;

function Meta({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--odong-muted-soft)]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted-soft)]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-extrabold text-[var(--odong-text)]">{value}</p>
      </div>
    </div>
  );
}

export function RiwayatCard({ order }: RiwayatCardProps) {
  const tone = statusStyle[order.status] ?? statusStyle.dibatalkan;

  return (
    <article className="rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-4 shadow-[0_6px_20px_rgba(25,28,29,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(25,28,29,0.08)] sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--odong-muted-soft)]">
            {order.kodePesanan}
          </p>
          <h3 className="mt-1 truncate text-lg font-extrabold text-[var(--odong-text)]">
            {order.customer}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold",
            tone.badge,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          {tone.label}
        </span>
      </div>

      {/* Meta grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--odong-surface-muted)] p-3 sm:grid-cols-4">
        <Meta label="Layanan"  value={order.layanan} icon={Shirt}       />
        <Meta label="Outlet"   value={order.outlet}  icon={Building2}   />
        <Meta label="Berat"    value={order.berat}   icon={Package}     />
        <Meta label="Tanggal"  value={order.waktu}   icon={CalendarDays}/>
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary-50/70 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--odong-muted)]">
          <Wallet className="h-4 w-4 text-primary-500" aria-hidden="true" />
          Total pendapatan
        </span>
        <span className="text-base font-extrabold text-emerald-600">{order.total}</span>
      </div>

      {/* Foto bukti */}
      {order.status === "selesai" && order.fotoBuktiUrl && (
        <a
          href={order.fotoBuktiUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Lihat foto bukti pengantaran
        </a>
      )}
    </article>
  );
}
