import { AppSidebar } from "@/app/user/_components/sidebar";
import { Topbar } from "@/components/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar accentColor="primary" />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
