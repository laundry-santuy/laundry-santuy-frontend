"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number, alamat: string) => void;
};

const DEFAULT_LAT = -7.797068;
const DEFAULT_LNG = 110.370529;

export function AlamatMapPicker({ initialLat, initialLng, onLocationChange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<import("leaflet").Map | null>(null);
  const onChangeRef   = useRef(onLocationChange);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => { onChangeRef.current = onLocationChange; });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initLat = initialLat ?? DEFAULT_LAT;
    const initLng = initialLng ?? DEFAULT_LNG;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      const pinIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="40" height="40" style="filter:drop-shadow(0 3px 8px rgba(37,99,235,0.45))"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const map = L.map(containerRef.current).setView(
        [initLat, initLng],
        initialLat != null ? 16 : 13,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true, icon: pinIcon }).addTo(map);

      const reverseGeocode = async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
            { headers: { "Accept-Language": "id" } },
          );
          const d = await res.json();
          onChangeRef.current(lat, lng, d.display_name ?? "");
        } catch {
          onChangeRef.current(lat, lng, "");
        } finally {
          setGeocoding(false);
        }
      };

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-52 w-full overflow-hidden rounded-2xl border border-[var(--odong-border)]"
      />
      {geocoding && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow backdrop-blur-sm">
          Mencari alamat...
        </div>
      )}
      <p className="mt-1.5 text-center text-[11px] text-[var(--odong-muted)]">
        Klik pada peta atau geser pin untuk menentukan lokasi penjemputan
      </p>
    </div>
  );
}
