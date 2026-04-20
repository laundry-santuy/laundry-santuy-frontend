// src/app/user/beranda/page.tsx
import { GreetingRow } from "./_components/greeting-row";
import { HeroBanner } from "./_components/hero-banner";
import { OrderTracking } from "./_components/order-tracking";
import { RecentOrders } from "./_components/recent-orders";
import { OrderHistory } from "./_components/order-history";
import { LaundryReminder } from "./_components/laundry-reminder";
import { StatisticCard } from "./_components/statistic-card";
import { StaffList } from "./_components/staff-list";

export default function BerandaPage() {
  return (
    <div className="px-[40px] sm:px-6 lg:px-[140px] py-[40px] flex flex-col xl:flex-row gap-6">
      {/* LEFT / MAIN COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <GreetingRow />
        <HeroBanner />
        <OrderTracking />
        <RecentOrders />
        <OrderHistory />
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-full xl:w-80 2xl:w-96 flex flex-col gap-6 shrink-0">
        <LaundryReminder />
        <StatisticCard />
        <StaffList />
      </aside>
    </div>
  );
}
