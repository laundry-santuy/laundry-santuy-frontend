"use client";

import { cn } from "@/lib/utils";
import { usePromoCampaigns } from "@/hooks/use-promo-campaigns";
import { ChevronLeft, ChevronRight, Copy, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const AUTO_SLIDE_DELAY = 4500;

export function PromoBanner() {
  const { campaigns } = usePromoCampaigns();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);
  const promoItems = useMemo(
    () => campaigns.filter((campaign) => campaign.active),
    [campaigns],
  );
  const promoCount = promoItems.length;
  const safeActiveIndex =
    promoCount > 0 ? Math.min(activeIndex, promoCount - 1) : 0;

  useEffect(() => {
    if (paused || promoCount <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % promoCount);
    }, AUTO_SLIDE_DELAY);

    return () => window.clearInterval(interval);
  }, [paused, promoCount]);

  const goToPrevious = () => {
    if (promoCount <= 1) {
      return;
    }

    setActiveIndex((index) => (index - 1 + promoCount) % promoCount);
  };

  const goToNext = () => {
    if (promoCount <= 1) {
      return;
    }

    setActiveIndex((index) => (index + 1) % promoCount);
  };

  const claimPromo = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setClaimedCode(code);
    } catch {
      setClaimedCode(code);
    }
  };

  const activePromo = promoItems[safeActiveIndex];

  if (!activePromo) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-[24px] border border-primary-100 bg-primary-600 p-4 text-white shadow-[0_18px_38px_rgba(0,88,202,0.18)] sm:p-6"
      aria-label="Carousel promo Laundry Santuy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20" />
      <div className="absolute bottom-[-56px] left-8 h-36 w-36 rounded-full bg-primary-300/35 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {promoItems.map((promo, index) => (
            <button
              key={promo.id}
              type="button"
              aria-label={`Lihat promo ${index + 1}: ${promo.title}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === safeActiveIndex ? "w-7 bg-white" : "w-2.5 bg-white/45",
              )}
            />
          ))}
        </div>

        {promoCount > 1 ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Promo sebelumnya"
              onClick={goToPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Promo berikutnya"
              onClick={goToNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative z-10 mt-5 min-h-[190px] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}
        >
          {promoItems.map((promo) => (
            <article
              key={promo.id}
              className="grid min-w-full gap-5 sm:grid-cols-[minmax(0,1fr)_280px] sm:items-center"
            >
              <div className="min-w-0">
                <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/16 px-3 py-1.5 text-xs font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="truncate">{promo.eyebrow}</span>
                </p>
                <h2 className="mt-4 max-w-xl text-2xl font-extrabold leading-8 tracking-normal sm:text-[28px] sm:leading-9">
                  {promo.title}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/78">
                  {promo.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-white/70">
                  Berlaku hingga {promo.validUntil}
                </p>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-white/24 bg-white/16 p-4 backdrop-blur-md sm:min-h-[168px]">
                <div className="rounded-2xl bg-white px-4 py-3 text-primary-700 shadow-[inset_0_0_0_1px_rgba(0,88,202,0.08)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-500">
                    Kode promo
                  </p>
                  <p className="mt-1 truncate font-mono text-xl font-extrabold tracking-wide sm:text-2xl">
                    {promo.code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => claimPromo(promo.code)}
                  className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,25,69,0.16)] transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98]"
                  aria-label={`Klaim kode promo ${promo.code}`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {claimedCode === promo.code ? "Kode Disalin" : "Klaim Promo"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Promo aktif: {activePromo.title}, kode {activePromo.code}
      </span>
    </section>
  );
}
