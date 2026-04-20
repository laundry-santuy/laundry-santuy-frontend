// src/app/user/beranda/_components/greeting-row.tsx
"use client";

import { Plus } from "lucide-react";

export function GreetingRow() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = today.getHours();
  const greeting =
    hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-md font-medium text-neutral-400">{formattedDate}</p>
        <h2 className="text-3xl font-bold text-neutral-900">
          {greeting}, Budi Santoso 👋
        </h2>
      </div>
      <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 transition-all shrink-0">
        <Plus className="w-4 h-4" />
        Pesan
      </button>
    </div>
  );
}
