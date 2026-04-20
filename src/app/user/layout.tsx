import { UserSidebar } from "@/app/user/_components/sidebar";
import { Topbar } from "@/components/topbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <UserSidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Topbar
          title="Beranda"
          subtitle="Halo!!"
          accentColor="primary"
          user={{
            name: "Budi Santoso",
            role: "Pelanggan",
            initials: "BS",
          }}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
