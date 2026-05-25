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
  type KodePromo,
} from "@/lib/admin-api";

function mapDashboardPromo(p: KodePromo): PromoCampaign {
  const diskonPersen = p.diskon_persen ?? p.diskonPersen;
  const diskonNominal = p.diskon_nominal ?? p.diskonNominal;
  const minPembelian = p.min_pembelian ?? p.minPembelian;
  const tanggalBerakhir = p.tanggal_berakhir ?? p.tanggalAkhir;
  const isActive = p.is_active ?? p.isActive;

  return mapBackendPromoToCampaign({
    id_promo: p.id_promo,
    kode: p.kode,
    diskon_persen: diskonPersen ?? null,
    diskon_nominal: diskonNominal ?? null,
    min_pembelian: minPembelian ?? 0,
    tanggal_berakhir: tanggalBerakhir ?? null,
    is_active: isActive,
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

function validatePromoDraft(draft: PromoDraft) {
  const rawDiscount = draft.discount.trim();

  if (!rawDiscount) {
    return "Diskon promo wajib diisi.";
  }

  if (rawDiscount.includes("%")) {
    const value = Number(rawDiscount.replace(/[^\d]/g, ""));

    if (!Number.isFinite(value) || value <= 0) {
      return "Diskon persen harus berupa angka yang valid.";
    }

    if (value > 100) {
      return "Diskon persen maksimal 100%.";
    }
  }

  return null;
}

export function usePromoCampaigns() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const { kodePromoAktif } = await fetchDashboardHargaPromo();
      setCampaigns(kodePromoAktif.map(mapDashboardPromo));
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createCampaign = useCallback(async (draft: PromoDraft) => {
    const validationError = validatePromoDraft(draft);

    if (validationError) {
      throw new Error(validationError);
    }

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
    const validationError = validatePromoDraft(draft);

    if (validationError) {
      throw new Error(validationError);
    }

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

  return { campaigns, loading, refresh, createCampaign, updateCampaign, deleteCampaign };
}
