"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultOutletServices,
  loadStoredOutletServices,
  outletServicesStorageKey,
  saveStoredOutletServices,
  type OutletService,
} from "@/lib/outlet-services";

export function useOutletServices() {
  const [services, setServices] = useState<OutletService[]>(
    () => loadStoredOutletServices() ?? defaultOutletServices,
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === outletServicesStorageKey) {
        setServices(loadStoredOutletServices());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const persist = useCallback(() => {
    saveStoredOutletServices(services);
  }, [services]);

  return {
    services,
    setServices,
    persist,
  };
}
