import {
  AdminDashboardPage,
  type DashboardStatus,
} from "@/app/admin/_components/dashboard/dashboard-page";

type DashboardPageProps = {
  searchParams?: Promise<{
    state?: string | string[];
  }>;
};

function parseDashboardStatus(state?: string | string[]): DashboardStatus {
  const value = Array.isArray(state) ? state[0] : state;

  if (value === "loading" || value === "empty" || value === "error") {
    return value;
  }

  return "ready";
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  return <AdminDashboardPage status={parseDashboardStatus(params?.state)} />;
}
