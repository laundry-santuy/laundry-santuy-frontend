"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultPromoCampaigns,
  loadStoredPromoCampaigns,
  promoCampaignsStorageKey,
  saveStoredPromoCampaigns,
  type PromoCampaign,
} from "@/lib/promo-campaigns";
import { fetchPromoAktif, type PromoApiItem } from "@/lib/user-api";

function mapApiPromo(p: PromoApiItem): PromoCampaign {
  const nilaiDiskon = p.diskon_persen
    ? `${p.diskon_persen}%`
    : `Rp${(p.diskon_nominal ?? 0).toLocaleString("id-ID")}`;

  const minBeli =
    p.min_pembelian > 0
      ? `Rp${p.min_pembelian.toLocaleString("id-ID")}`
      : null;

  const tglAkhir = new Date(p.tanggal_berakhir).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    id: p.id,
    eyebrow: "Promo aktif",
    title: `Hemat ${nilaiDiskon} untuk semua layanan`,
    description: minBeli
      ? `Minimum pembelian ${minBeli}. Masukkan kode saat checkout.`
      : "Masukkan kode promo saat checkout.",
    code: p.kode,
    validUntil: tglAkhir,
    basePrice: "Rp0",
    expressSurcharge: "0%",
    minimumOrder: minBeli ?? "Tidak ada minimum",
    discount: nilaiDiskon,
    active: true,
  };
}

export function usePromoCampaigns() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromoAktif()
      .then(({ promos }) => {
        // DB punya promo → pakai data DB
        if (promos.length > 0) {
          setCampaigns(promos.map(mapApiPromo));
        } else {
          // DB kosong → kosongkan, jangan fallback ke dummy
          setCampaigns([]);
        }
      })
      .catch(() => {
        // Gagal fetch (network/auth error) → fallback ke localStorage supaya
        // admin settings page tetap bisa bekerja offline
        setCampaigns(loadStoredPromoCampaigns() ?? defaultPromoCampaigns);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listener localStorage tetap aktif agar admin settings page bisa push update
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === promoCampaignsStorageKey) {
        setCampaigns(loadStoredPromoCampaigns());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persist = useCallback(
    (nextCampaigns?: PromoCampaign[]) => {
      saveStoredPromoCampaigns(nextCampaigns ?? campaigns);
    },
    [campaigns],
  );

  return { campaigns, setCampaigns, persist, loading };
}
