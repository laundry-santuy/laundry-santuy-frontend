"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultPromoCampaigns,
  loadStoredPromoCampaigns,
  promoCampaignsStorageKey,
  saveStoredPromoCampaigns,
  type PromoCampaign,
} from "@/lib/promo-campaigns";

export function usePromoCampaigns() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>(() =>
    loadStoredPromoCampaigns() ?? defaultPromoCampaigns,
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === promoCampaignsStorageKey) {
        setCampaigns(loadStoredPromoCampaigns());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const persist = useCallback((nextCampaigns?: PromoCampaign[]) => {
    saveStoredPromoCampaigns(nextCampaigns ?? campaigns);
  }, [campaigns]);

  return {
    campaigns,
    setCampaigns,
    persist,
  };
}
