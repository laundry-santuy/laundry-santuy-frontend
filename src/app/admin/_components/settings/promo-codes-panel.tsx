import { BadgePercent, PencilLine, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PromoCampaign } from "@/lib/promo-campaigns";
import { AdminPanel } from "../admin-page";
import { AdminIconButton } from "../admin-table-tools";

type PromoCodesPanelProps = {
  campaigns: PromoCampaign[];
  onEdit: (campaign: PromoCampaign) => void;
  onToggle: (campaignId: string) => void;
};

export function PromoCodesPanel({
  campaigns,
  onEdit,
  onToggle,
}: PromoCodesPanelProps) {
  const activeCampaigns = campaigns.filter((campaign) => campaign.active);

  return (
    <AdminPanel
      title="Kode Promo Aktif"
      description={`${activeCampaigns.length} kode siap tampil di beranda user.`}
      icon={BadgePercent}
    >
      {activeCampaigns.length > 0 ? (
        <div className="space-y-3">
          {activeCampaigns.map((campaign) => (
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
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                      Aktif
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                    Diskon: {campaign.discount} • Tarif: {campaign.basePrice}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted-soft)]">
                    Min. {campaign.minimumOrder} • Berlaku {campaign.validUntil}
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
                  role="switch"
                  aria-checked={campaign.active}
                  aria-label={`Nonaktifkan promo ${campaign.code}`}
                  onClick={() => onToggle(campaign.id)}
                  className={cn(
                    "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                    campaign.active
                      ? "bg-primary-600"
                      : "bg-[var(--odong-surface-soft)]",
                  )}
                >
                  <span
                    className={cn(
                      "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
                      campaign.active ? "translate-x-6" : "translate-x-0",
                    )}
                  />
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
