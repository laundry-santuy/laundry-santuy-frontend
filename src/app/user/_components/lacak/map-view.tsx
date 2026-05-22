"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const osmTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const outletSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" fill="none">
  <path d="M18 44C18 44 34 27 34 17.5C34 8.4 26.8 1 18 1C9.2 1 2 8.4 2 17.5C2 27 18 44 18 44Z" fill="#0058CA" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="17.5" r="6" fill="white"/>
  <circle cx="18" cy="17.5" r="3" fill="#0058CA"/>
</svg>
`);

const kurirSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" fill="none">
  <path d="M18 44C18 44 34 27 34 17.5C34 8.4 26.8 1 18 1C9.2 1 2 8.4 2 17.5C2 27 18 44 18 44Z" fill="#16a34a" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="17.5" r="6" fill="white"/>
  <circle cx="18" cy="17.5" r="3" fill="#16a34a"/>
</svg>
`);

export type MapViewProps = {
  outletLat: number;
  outletLng: number;
  outletName?: string;
  kurirLat?: number | null;
  kurirLng?: number | null;
};

export function MapView({
  outletLat,
  outletLng,
  outletName,
  kurirLat,
  kurirLng,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const kurirMarkerRef = useRef<import("leaflet").Marker | null>(null);

  // Initialize map once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const hasKurir = Boolean(kurirLat && kurirLng);
      const center: [number, number] = hasKurir
        ? [(outletLat + kurirLat!) / 2, (outletLng + kurirLng!) / 2]
        : [outletLat, outletLng];

      const map = L.map(containerRef.current, {
        center,
        zoom: hasKurir ? 14 : 15,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer(osmTileUrl, { maxZoom: 19 }).addTo(map);

      const outletIcon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:46px;filter:drop-shadow(0 6px 14px rgba(0,88,202,0.32));"><img src="data:image/svg+xml;charset=UTF-8,${outletSvg}" style="display:block;width:36px;height:46px;" /></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -46],
      });

      L.marker([outletLat, outletLng], { icon: outletIcon })
        .addTo(map)
        .bindPopup(outletName ?? "Outlet Laundry");

      if (hasKurir) {
        const kurirIcon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:46px;filter:drop-shadow(0 6px 14px rgba(22,163,74,0.32));"><img src="data:image/svg+xml;charset=UTF-8,${kurirSvg}" style="display:block;width:36px;height:46px;" /></div>`,
          iconSize: [36, 46],
          iconAnchor: [18, 46],
          popupAnchor: [0, -46],
        });

        const marker = L.marker([kurirLat!, kurirLng!], { icon: kurirIcon })
          .addTo(map)
          .bindPopup("Posisi kurir");

        kurirMarkerRef.current = marker;

        const bounds = L.latLngBounds(
          [outletLat, outletLng],
          [kurirLat!, kurirLng!],
        ).pad(0.25);
        map.fitBounds(bounds);
      }

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 300);
    };

    init().catch(() => {});

    return () => {
      cancelled = true;
      mapRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      kurirMarkerRef.current = null;
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Update kurir marker position when coords change (real-time tracking)
  useEffect(() => {
    if (!mapRef.current) return;

    if (kurirLat && kurirLng) {
      if (kurirMarkerRef.current) {
        kurirMarkerRef.current.setLatLng([kurirLat, kurirLng]);
      } else {
        // Kurir assigned after map initialized — create marker now
        import("leaflet").then((L) => {
          if (!mapRef.current) return;
          const kurirIcon = L.divIcon({
            className: "",
            html: `<div style="width:36px;height:46px;filter:drop-shadow(0 6px 14px rgba(22,163,74,0.32));"><img src="data:image/svg+xml;charset=UTF-8,${kurirSvg}" style="display:block;width:36px;height:46px;" /></div>`,
            iconSize: [36, 46],
            iconAnchor: [18, 46],
            popupAnchor: [0, -46],
          });
          kurirMarkerRef.current = L.marker([kurirLat, kurirLng], { icon: kurirIcon })
            .addTo(mapRef.current)
            .bindPopup("Posisi kurir");
        }).catch(() => {});
      }
    }
  }, [kurirLat, kurirLng]);

  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] shadow-[0_18px_46px_rgba(25,28,29,0.07)]">
      <div
        ref={containerRef}
        className="h-72 w-full"
        style={{ position: "relative", zIndex: 0 }}
        aria-label="Peta pelacakan pesanan"
      />

      {/* Legend overlay */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-[1001] flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-primary-700 shadow backdrop-blur-sm dark:bg-[var(--odong-surface-strong)]">
          <span className="h-2 w-2 rounded-full bg-primary-600" />
          Outlet
        </span>
        {kurirLat && kurirLng ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow backdrop-blur-sm dark:bg-[var(--odong-surface-strong)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Kurir
          </span>
        ) : null}
      </div>

      {/* Attribution */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1001] rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-[var(--odong-muted)] backdrop-blur-sm">
        © OpenStreetMap
      </div>
    </div>
  );
}

export function MapViewPlaceholder() {
  return (
    <div className="flex h-72 items-center justify-center rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)]">
      <div className="flex flex-col items-center gap-3 text-center px-6">
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
