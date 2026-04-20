// src/app/user/beranda/_components/hero-banner.tsx
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-6 sm:p-8 lg:p-10 text-white">
      <div className="absolute top-4 right-8 opacity-30">
        <Sparkles className="w-16 h-16 sm:w-24 sm:h-24" />
      </div>
      <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase opacity-80 mb-2">
        Laundry Santuy
      </p>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug max-w-md">
        Bersihkan Pakaianmu dengan Layanan Laundry Profesional
      </h2>
      <button className="mt-5 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl">
        Pesan Sekarang
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
