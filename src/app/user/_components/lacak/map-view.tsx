"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const OSM_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// ── SVG marker definitions ────────────────────────────────────────────────────

const outletSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" fill="none">
  <path d="M18 44C18 44 34 27 34 17.5C34 8.4 26.8 1 18 1C9.2 1 2 8.4 2 17.5C2 27 18 44 18 44Z" fill="#0058CA" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="17.5" r="6" fill="white"/>
  <circle cx="18" cy="17.5" r="3" fill="#0058CA"/>
</svg>
`);

const userSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" fill="none">
  <path d="M18 44C18 44 34 27 34 17.5C34 8.4 26.8 1 18 1C9.2 1 2 8.4 2 17.5C2 27 18 44 18 44Z" fill="#16a34a" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="17.5" r="6" fill="white"/>
  <path d="M18 12a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 9c3.87 0 5.5 1.94 5.5 2.5v.5h-11v-.5c0-.56 1.63-2.5 5.5-2.5z" fill="#16a34a"/>
</svg>
`);

const driverSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" fill="none">
  <path d="M18 44C18 44 34 27 34 17.5C34 8.4 26.8 1 18 1C9.2 1 2 8.4 2 17.5C2 27 18 44 18 44Z" fill="#7c3aed" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="17.5" r="6" fill="white"/>
  <path d="M11 20h14v1.5a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1V20zm1.5-4h11l1.5 4H11l1.5-4zm2-2.5h7l.5 1.5h-8l.5-1.5z" fill="#7c3aed"/>
</svg>
`);

// ── Helper ────────────────────────────────────────────────────────────────────

function makeDivIcon(
  L: typeof import("leaflet"),
  svg: string,
  shadow: string,
) {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:46px;filter:drop-shadow(0 6px 14px ${shadow});"><img src="data:image/svg+xml;charset=UTF-8,${svg}" style="display:block;width:36px;height:46px;" /></div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MapViewProps = {
  outletLat: number;
  outletLng: number;
  outletName?: string;
  userLat?: number | null;
  userLng?: number | null;
  driverLat?: number | null;
  driverLng?: number | null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MapView({
  outletLat,
  outletLng,
  outletName,
  userLat,
  userLng,
  driverLat,
  driverLng,
}: MapViewProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<import("leaflet").Map | null>(null);
  const driverMarkerRef = useRef<import("leaflet").Marker | null>(null);

  // ── Initialize map once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    const init = async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [outletLat, outletLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer(OSM_TILE, { maxZoom: 19 }).addTo(map);

      // Outlet marker (blue)
      L.marker([outletLat, outletLng], {
        icon: makeDivIcon(L, outletSvg, "rgba(0,88,202,0.32)"),
      })
        .addTo(map)
        .bindPopup(outletName ?? "Outlet Laundry");

      const bounds = L.latLngBounds([[outletLat, outletLng]]);

      // User/home marker (green)
      if (userLat && userLng) {
        L.marker([userLat, userLng], {
          icon: makeDivIcon(L, userSvg, "rgba(22,163,74,0.32)"),
        })
          .addTo(map)
          .bindPopup("Lokasi penjemputan");
        bounds.extend([userLat, userLng]);
      }

      // Driver marker (violet)
      if (driverLat && driverLng) {
        const marker = L.marker([driverLat, driverLng], {
          icon: makeDivIcon(L, driverSvg, "rgba(124,58,237,0.32)"),
        })
          .addTo(map)
          .bindPopup("Posisi kurir");
        driverMarkerRef.current = marker;
        bounds.extend([driverLat, driverLng]);
      }

      // Fit all visible markers with padding
      if (bounds.isValid() && (userLat || driverLat)) {
        map.fitBounds(bounds.pad(0.25));
      }

      mapRef.current = map;

      // Dual invalidateSize to survive dialog/animation timing
      setTimeout(() => { if (mapRef.current) map.invalidateSize(); }, 50);
      setTimeout(() => { if (mapRef.current) map.invalidateSize(); }, 300);

      // Track container resize — use outer `ro` so cleanup can disconnect it
      if (containerRef.current && !cancelled) {
        ro = new ResizeObserver(() => { if (mapRef.current) map.invalidateSize(); });
        ro.observe(containerRef.current);
      }
    };

    init().catch(() => {});

    return () => {
      cancelled = true;
      ro?.disconnect();
      ro = null;
      mapRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      driverMarkerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time driver position update ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (driverLat && driverLng) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverLat, driverLng]);
      } else {
        // Driver assigned after map initialised — lazy-create marker
        import("leaflet").then((L) => {
          if (!mapRef.current) return;
          driverMarkerRef.current = L.marker([driverLat, driverLng], {
            icon: makeDivIcon(L, driverSvg, "rgba(124,58,237,0.32)"),
          })
            .addTo(mapRef.current)
            .bindPopup("Posisi kurir");
        }).catch(() => {});
      }
    }
  }, [driverLat, driverLng]);

  // ── Render ────────────────────────────────────────────────────────────────

  const hasDriver = Boolean(driverLat && driverLng);
  const hasUser   = Boolean(userLat   && userLng);

  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] shadow-[0_18px_46px_rgba(25,28,29,0.07)]">
      <div
        ref={containerRef}
        className="h-72 w-full"
        style={{ position: "relative", zIndex: 0 }}
        aria-label="Peta pelacakan pesanan real-time"
      />

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-[1001] flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-blue-700 shadow backdrop-blur-sm dark:bg-[var(--odong-surface-strong)]">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Outlet
        </span>
        {hasUser && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow backdrop-blur-sm dark:bg-[var(--odong-surface-strong)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Rumah
          </span>
        )}
        {hasDriver && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-violet-700 shadow backdrop-blur-sm dark:bg-[var(--odong-surface-strong)]">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
            Kurir
          </span>
        )}
      </div>

      {/* Attribution */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1001] rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-[var(--odong-muted)] backdrop-blur-sm">
        © OpenStreetMap
      </div>
    </div>
  );
}

// ── Placeholder when outlet coords are unavailable ────────────────────────────

export function MapViewPlaceholder() {
  return (
    <div className="flex h-72 items-center justify-center rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)]">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
          <MapPin className="h-6 w-6" />
        </span>
        <p className="text-sm font-extrabold text-[var(--odong-text)]">
          Peta belum tersedia
        </p>
        <p className="max-w-[26ch] text-xs leading-5 text-[var(--odong-muted)]">
          Koordinat outlet belum dikonfigurasi. Hubungi admin untuk mengatur titik outlet di halaman pengaturan.
        </p>
      </div>
    </div>
  );
}
