import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laundry Santuy",
  description: "Layanan laundry jemput antar yang bersih, rapi, dan santuy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
