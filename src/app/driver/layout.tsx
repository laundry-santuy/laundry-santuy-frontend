export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 bg-white shadow p-4">Header</header>
      <main>{children}</main>
      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-3">
        {/* Bottom navigation */}
      </nav>
    </div>
  );
}
