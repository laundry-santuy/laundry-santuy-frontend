// src/app/user/beranda/page.tsx (contoh)
"use client";
import { usePathname } from "next/navigation";

export default function PengaturanPage() {
  const pathname = usePathname();
  return (
    <div className="p-4">
      <p className="text-sm text-gray-500">
        URL aktif: <code>{pathname}</code>
      </p>
      <h1 className="text-xl font-bold">Pengaturan</h1>
    </div>
  );
}
