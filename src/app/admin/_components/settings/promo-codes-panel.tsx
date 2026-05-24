import { BadgePercent, PencilLine, Sparkles, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PromoCampaign } from "@/lib/promo-campaigns";
import { AdminPanel } from "../admin-page";
import { AdminIconButton } from "../admin-table-tools";

function formatCurrency(value: string) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Tanpa minimum";
  }

  return `Rp${numericValue.toLocaleString("id-ID")}`;
}

type PromoCodesPanelProps = {
  campaigns: PromoCampaign[];
  onEdit: (campaign: PromoCampaign) => void;
  onDelete: (campaignId: string) => void;
};

export function PromoCodesPanel({
  campaigns,
  onEdit,
  onDelete,
}: PromoCodesPanelProps) {
  return (
    <AdminPanel
      title="Kode Promo Aktif"
      description={`${campaigns.length} promo tersimpan di database.`}
      icon={BadgePercent}
    >
      {campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-4"
            >
              <button
                type="button"
                onClick={() => onEdit(campaign)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <BadgePercent className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-extrabold tracking-wide text-[var(--odong-text)]">
                      {campaign.code}
                    </p>
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      campaign.active
                        ? "bg-primary-50 text-primary-700"
                        : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                    )}>
                      {campaign.active ? "Aktif" : "Kedaluwarsa"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                    Diskon: {campaign.discount}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted-soft)]">
                    Min. pembelian {formatCurrency(campaign.minPembelian)} • Berlaku sampai {campaign.validUntil}
                  </p>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <AdminIconButton
                  icon={PencilLine}
                  label={`Edit promo ${campaign.code}`}
                  tone="neutral"
                  onClick={() => onEdit(campaign)}
                />
                <button
                  type="button"
                  aria-label={`Hapus promo ${campaign.code}`}
                  onClick={() => onDelete(campaign.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-extrabold text-[var(--odong-text)]">
            Belum ada promo aktif
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
            Tambahkan promo dari panel kiri agar muncul di beranda user.
          </p>
        </div>
      )}
    </AdminPanel>
  );
}
