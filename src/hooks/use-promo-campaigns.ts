"use client";

import { useCallback, useEffect, useState } from "react";

import {
  mapBackendPromoToCampaign,
  type PromoCampaign,
  type PromoDraft,
} from "@/lib/promo-campaigns";
import {
  createAdminPromo,
  deleteAdminPromo,
  fetchDashboardHargaPromo,
  updateAdminPromo,
  type PromoBackend,
} from "@/lib/admin-api";

function mapDashboardPromo(p: PromoBackend): PromoCampaign {
  return mapBackendPromoToCampaign({
    id_promo: p.id_promo,
    kode: p.kode,
    diskon_persen: p.diskon_persen,
    diskon_nominal: p.diskon_nominal,
    min_pembelian: p.min_pembelian,
    tanggal_berakhir: p.tanggal_berakhir,
    is_active: p.is_active,
  });
}

function parseDiscount(draft: PromoDraft) {
  const rawDiscount = draft.discount.trim();

  if (!rawDiscount) {
    return { diskonPersen: null as number | null, diskonNominal: null as number | null };
  }

  if (rawDiscount.includes("%")) {
    const value = Number(rawDiscount.replace(/[^\d]/g, ""));
    return {
      diskonPersen: Number.isFinite(value) && value > 0 ? value : null,
      diskonNominal: null,
    };
  }

  const value = Number(rawDiscount.replace(/[^\d]/g, ""));
  return {
    diskonPersen: null,
    diskonNominal: Number.isFinite(value) && value > 0 ? value : null,
  };
}

function parseMinimumOrder(draft: PromoDraft) {
  const value = Number(draft.minPembelian.replace(/[^\d]/g, ""));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function usePromoCampaigns() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);

  const refresh = useCallback(async () => {
    try {
      const { kodePromoAktif } = await fetchDashboardHargaPromo();
      setCampaigns(kodePromoAktif.map(mapDashboardPromo));
    } catch {
      setCampaigns([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createCampaign = useCallback(async (draft: PromoDraft) => {
    const { diskonPersen, diskonNominal } = parseDiscount(draft);
    await createAdminPromo({
      kode: draft.code,
      diskonPersen,
      diskonNominal,
      minPembelian: parseMinimumOrder(draft),
      tanggalBerakhir: draft.tanggalBerakhir,
    });
    await refresh();
  }, [refresh]);

  const updateCampaign = useCallback(async (idPromo: string, draft: PromoDraft) => {
    const { diskonPersen, diskonNominal } = parseDiscount(draft);
    await updateAdminPromo(idPromo, {
      kode: draft.code,
      diskonPersen,
      diskonNominal,
      minPembelian: parseMinimumOrder(draft),
      tanggalBerakhir: draft.tanggalBerakhir,
    });
    await refresh();
  }, [refresh]);

  const deleteCampaign = useCallback(async (idPromo: string) => {
    await deleteAdminPromo(idPromo);
    await refresh();
  }, [refresh]);

  return { campaigns, refresh, createCampaign, updateCampaign, deleteCampaign };
}
