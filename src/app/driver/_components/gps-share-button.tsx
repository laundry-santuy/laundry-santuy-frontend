"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Locate, LocateOff, Loader2 } from "lucide-react";
import { updateLokasiKurir } from "@/lib/driver-api";
import { cn } from "@/lib/utils";

type GpsState = "idle" | "requesting" | "active" | "error";

const PUSH_INTERVAL_MS = 5_000;

export function GpsShareButton() {
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [errorMsg, setErrorMsg]  = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const watchIdRef     = useRef<number | null>(null);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef     = useRef<{ lat: number; lng: number } | null>(null);
  const wakeLockRef    = useRef<WakeLockSentinel | null>(null);
  const sharingRef     = useRef(false);

  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false);
        // Re-acquire if still sharing (browser releases lock when tab goes hidden)
        if (sharingRef.current) {
          acquireWakeLock();
        }
      });
    } catch {
      // Not supported or denied — continue without it
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  const pushLocation = useCallback(async () => {
    const pos = lastPosRef.current;
    if (!pos) return;
    try {
      await updateLokasiKurir(pos.lat, pos.lng);
    } catch {
      // silent — keep trying on next tick
    }
  }, []);

  // Re-acquire wake lock when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sharingRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [acquireWakeLock]);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Browser tidak mendukung GPS");
      setGpsState("error");
      return;
    }
    setGpsState("requesting");
    setErrorMsg(null);
    sharingRef.current = true;
    acquireWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        lastPosRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsState("active");
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Izin lokasi ditolak. Aktifkan di pengaturan browser.",
          2: "Posisi tidak tersedia.",
          3: "Permintaan lokasi timeout.",
        };
        setErrorMsg(msgs[err.code] ?? "Gagal mendapatkan lokasi.");
        setGpsState("error");
        stopSharing();
      },
      { enableHighAccuracy: true, maximumAge: 4_000, timeout: 10_000 },
    );

    // Push immediately on first fix, then every PUSH_INTERVAL_MS
    intervalRef.current = setInterval(pushLocation, PUSH_INTERVAL_MS);
  }, [pushLocation, acquireWakeLock]);

  const stopSharing = useCallback(() => {
    sharingRef.current = false;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastPosRef.current = null;
    releaseWakeLock();
    setGpsState("idle");
  }, [releaseWakeLock]);

  // Cleanup on unmount
  useEffect(() => () => { stopSharing(); }, [stopSharing]);

  const handleClick = () => {
    if (gpsState === "active") stopSharing();
    else startSharing();
  };

  const isActive     = gpsState === "active";
  const isRequesting = gpsState === "requesting";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRequesting}
        aria-pressed={isActive}
        aria-label={isActive ? "Hentikan berbagi lokasi GPS" : "Mulai berbagi lokasi GPS"}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
          isActive
            ? "bg-emerald-600 text-white shadow-[0_12px_24px_rgba(22,163,74,0.22)] hover:-translate-y-0.5 hover:bg-emerald-700"
            : isRequesting
              ? "cursor-not-allowed bg-primary-100 text-primary-500"
              : "bg-primary-600 text-white shadow-[0_12px_24px_rgba(0,88,202,0.22)] hover:-translate-y-0.5 hover:bg-primary-700",
        )}
      >
        {isRequesting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isActive ? (
          <LocateOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Locate className="h-4 w-4" aria-hidden="true" />
        )}
        {isRequesting
          ? "Mendapatkan lokasi…"
          : isActive
            ? "Hentikan GPS"
            : "Bagikan Lokasi GPS"}
      </button>

      {isActive && (
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium text-emerald-700">
            Lokasi diperbarui setiap 5 detik
          </p>
          <p className={cn("text-xs font-medium", wakeLockActive ? "text-emerald-600" : "text-amber-500")}>
            {wakeLockActive ? "Layar terjaga aktif" : "Wake lock tidak didukung browser ini"}
          </p>
        </div>
      )}
      {gpsState === "error" && errorMsg && (
        <p className="text-center text-xs font-medium text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
