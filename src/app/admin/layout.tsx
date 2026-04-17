export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tambahkan redirect/guard di sini (cek session role === 'admin')
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
