"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchProfilDriver, type DriverProfilData } from "@/lib/driver-api";

type DriverProfileContextValue = {
  data: DriverProfilData | null;
  isLoading: boolean;
};

const DriverProfileContext = createContext<DriverProfileContextValue>({
  data: null,
  isLoading: true,
});

export function DriverProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData]         = useState<DriverProfilData | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setLoading(false);
      return;
    }

    fetchProfilDriver()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DriverProfileContext.Provider value={{ data, isLoading }}>
      {children}
    </DriverProfileContext.Provider>
  );
}

export function useDriverProfile() {
  return useContext(DriverProfileContext);
}