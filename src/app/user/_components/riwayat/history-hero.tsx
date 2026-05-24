"use client";

import Link from "next/link";
import { ArrowRight, Clock, Loader2, ReceiptText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchRekomendasiAI, type RekomendasiAIResponse } from "@/lib/user-api";
import type { HistoryMetric } from "./types";

type HistoryHeroProps = {
  metrics: HistoryMetric[];
  totalOrders: number;
};

export function HistoryHero({ metrics, totalOrders }: HistoryHeroProps) {
  const [rekomendasi, setRekomendasi] = useState<RekomendasiAIResponse | null>(null);
  const [loadingRek, setLoadingRek] = useState(true);

  useEffect(() => {
    const CACHE_KEY = 'ls_rekomendasi';
    const CACHE_TTL = 60 * 60 * 1000; // 1 jam
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) {
          setRekomendasi(data);
          setLoadingRek(false);
          return;
        }
      }
    } catch {}

    fetchRekomendasiAI()
      .then((d) => {
        setRekomendasi(d);
        setLoadingRek(false);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: d, ts: Date.now() })); } catch {}
      })
      .catch(() => setLoadingRek(false));
  }, []);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-hidden rounded-[32px] border border-primary-100 dark:border-[var(--odong-border)] bg-primary-50/80 dark:bg-[var(--odong-surface-soft)] p-6 shadow-[0_24px_58px_rgba(0,88,202,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 dark:bg-[var(--odong-surface-strong)] px-3 py-1.5 text-xs font-bold text-primary-700">
              <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
              Riwayat order
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Semua transaksi laundry tersusun rapi.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Cek status terakhir, detail pembayaran, layanan, dan catatan
              order dari satu halaman.
            </p>
          </div>

          <div className="w-full rounded-3xl border border-primary-100 bg-white/80 dark:bg-[var(--odong-surface-strong)] p-4 shadow-[0_12px_26px_rgba(0,88,202,0.07)] lg:max-w-[320px]">
            <p className="text-xs font-semibold text-[var(--odong-muted)]">
              Total tersimpan
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--odong-text)]">
              {totalOrders}
            </p>
            <p className="mt-1 text-sm text-[var(--odong-muted)]">
              order di akun kamu
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="rounded-2xl border border-primary-100 bg-white/75 dark:bg-[var(--odong-surface-strong)] px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary-600"
                    aria-hidden="true"
                  />
                  <p className="text-lg font-extrabold text-[var(--odong-text)]">
                    {metric.value}
                  </p>
                </div>
                <p className="mt-1 text-xs font-bold text-primary-700">
                  {metric.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--odong-muted)]">
                  {metric.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Cepat ulangi order
            {rekomendasi?.source === 'ai' && (
              <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">AI</span>
            )}
          </p>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
          Layanan favorit kamu siap dipesan lagi.
        </h2>

        {loadingRek ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--odong-muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
            Menganalisis riwayat order...
          </div>
        ) : (
          <p className="mt-2 max-h-24 overflow-y-auto text-justify text-sm leading-6 text-[var(--odong-muted)]">
            {rekomendasi?.insight ?? 'Pesan lagi layanan favoritmu dengan mudah.'}
          </p>
        )}

        <div className="mt-5 rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-4">
          {loadingRek ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-32 animate-pulse rounded-lg bg-[var(--odong-border)]" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--odong-border)]" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--odong-muted)]">
                    Terakhir dipesan
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[var(--odong-text)]">
                    {rekomendasi?.rekomendasiLayanan ?? '-'}
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {rekomendasi?.badge ?? 'Favorit'}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--odong-muted)]">
                Estimasi {rekomendasi?.estimasiWaktu ?? '2 hari'} - pickup dari rumah.
              </p>
            </>
          )}
        </div>

        <Link
          href="/user/pesan"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,88,202,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
        >
          Order lagi
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </section>
  );
}
