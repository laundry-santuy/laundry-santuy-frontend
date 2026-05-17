import { AdminShell } from "./_components/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tambahkan redirect/guard di sini (cek session role === 'admin')
  return <AdminShell>{children}</AdminShell>;
}
