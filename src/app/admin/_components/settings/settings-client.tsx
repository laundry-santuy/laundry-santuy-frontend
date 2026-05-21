"use client";

import { useEffect, useState } from "react";
import {
  fetchPengaturanUmum,
  fetchPengaturanOutlet,
  fetchDashboardHargaPromo,
  fetchPengaturanKeamanan,
  type PengaturanUmumResponse,
  type PengaturanOutletResponse,
  type DashboardHargaPromoResponse,
  type PengaturanKeamananResponse,
} from "@/lib/admin-api";
import { AdminSettingsPage } from "./settings-page";
import {
  SettingsErrorState,
  SettingsLoadingState,
} from "./settings-states";

export type SettingsData = {
  umum: PengaturanUmumResponse | null;
  outlet: PengaturanOutletResponse | null;
  hargaPromo: DashboardHargaPromoResponse | null;
  keamanan: PengaturanKeamananResponse | null;
};

type SettingsStatus = "loading" | "error" | "ready";

export function AdminSettingsClient() {
  const [status, setStatus] = useState<SettingsStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        setStatus("loading");
        setError(null);

        // Fetch all settings in parallel
        const [umum, outlet, hargaPromo, keamanan] = await Promise.all([
          fetchPengaturanUmum(),
          fetchPengaturanOutlet(),
          fetchDashboardHargaPromo(),
          fetchPengaturanKeamanan(),
        ]);

        setSettingsData({
          umum,
          outlet,
          hargaPromo,
          keamanan,
        });
        setStatus("ready");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat pengaturan";
        setError(message);
        setStatus("error");
      }
    };

    loadAllSettings();
  }, []);

  if (status === "loading") {
    return <SettingsLoadingState />;
  }

  if (status === "error") {
    return <SettingsErrorState error={error} />;
  }

  return <AdminSettingsPage settingsData={settingsData} />;
}
