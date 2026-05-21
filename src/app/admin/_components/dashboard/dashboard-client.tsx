"use client";

import { useEffect, useState } from "react";
import { fetchDashboard, type DashboardResponse } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { AdminDashboardPage, type DashboardStatus } from "./dashboard-page";

export function AdminDashboardClient() {
  const [status, setStatus] = useState<DashboardStatus>("loading");
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStatus("loading");
        const data = await fetchDashboard();
        
        if (!data || !data.overview) {
          setStatus("empty");
          return;
        }

        setDashboardData(data);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setStatus("error");
      }
    };

    loadDashboard();
  }, []);

  return (
    <AdminDashboardPage
      status={status}
      dashboardData={dashboardData}
    />
  );
}
