"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import type * as Leaflet from "leaflet";

import { cn } from "@/lib/utils";

const DEFAULT_CENTER = {
  lat: -6.2088,
  lng: 106.8456,
};

const osmTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const markerSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54" fill="none">
  <path d="M21 52C21 52 40 31.5 40 20.5C40 9.7 31.27 1 21 1C10.73 1 2 9.7 2 20.5C2 31.5 21 52 21 52Z" fill="#0058CA" stroke="white" stroke-width="2"/>
  <circle cx="21" cy="20.5" r="7.5" fill="white"/>
  <circle cx="21" cy="20.5" r="3.5" fill="#0058CA"/>
</svg>
`);

function createOutletMarkerIcon(leaflet: typeof import("leaflet")) {
  return leaflet.divIcon({
    className: "",
    html: `<div style="width:42px;height:54px;filter:drop-shadow(0 8px 18px rgba(0,88,202,0.28));"><img src="data:image/svg+xml;charset=UTF-8,${markerSvg}" alt="" style="display:block;width:42px;height:54px;" /></div>`,
    iconSize: [42, 54],
    iconAnchor: [21, 54],
    popupAnchor: [0, -54],
  });
}

type OutletMapPickerProps = {
  address: string;
  latitude: string;
  longitude: string;
  onAddressChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
};

function formatCoordinate(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(6) : "";
}

function parsePosition(latitude: string, longitude: string) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return DEFAULT_CENTER;
}

async function searchAddress(query: string) {
  const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error("Pencarian alamat gagal.");
  }

  const payload = (await response.json()) as {
    result?: { display_name: string; lat: number; lon: number } | null;
  };

  const result = payload.result;
  if (!result) {
    return null;
  }

  return {
    display_name: result.display_name,
    lat: String(result.lat),
    lon: String(result.lon),
  };
}

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(`/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`);

  if (!response.ok) {
    throw new Error("Reverse geocode gagal.");
  }

  const result = (await response.json()) as { result?: string | null };
  return result.result ?? null;
}

export function OutletMapPicker({
  address,
  latitude,
  longitude,
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange,
}: OutletMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const callbackRef = useRef({
    onAddressChange,
    onLatitudeChange,
    onLongitudeChange,
  });
  const [searchValue, setSearchValue] = useState(address);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  const currentPosition = useMemo(
    () => parsePosition(latitude, longitude),
    [latitude, longitude],
  );

  useEffect(() => {
    setSearchValue(address);
  }, [address]);

  useEffect(() => {
    callbackRef.current = {
      onAddressChange,
      onLatitudeChange,
      onLongitudeChange,
    };
  }, [onAddressChange, onLatitudeChange, onLongitudeChange]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let cancelled = false;
    let observer: ResizeObserver | null = null;

    const initializeMap = async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapContainerRef.current) {
        return;
      }

      const map = leaflet.map(mapContainerRef.current, {
        center: currentPosition,
        attributionControl: false,
        zoom: 16,
        zoomControl: true,
      });

      leaflet.tileLayer(osmTileUrl, {
        attribution: osmTileAttribution,
        maxZoom: 19,
      }).addTo(map);

      const marker = leaflet.marker(currentPosition, {
        draggable: true,
        icon: createOutletMarkerIcon(leaflet),
      }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;
      setLoadingMap(false);

      setTimeout(() => { map.invalidateSize(); }, 50);
      setTimeout(() => { map.invalidateSize(); }, 300);

      observer = new ResizeObserver(() => { map.invalidateSize(); });
      if (mapContainerRef.current) observer.observe(mapContainerRef.current);

      const syncPosition = async (position: { lat: number; lng: number }) => {
        callbackRef.current.onLatitudeChange(String(position.lat));
        callbackRef.current.onLongitudeChange(String(position.lng));
        marker.setLatLng(position);
        map.panTo(position);

        try {
          const label = await reverseGeocode(position.lat, position.lng);
          if (label) {
            callbackRef.current.onAddressChange(label);
            setSearchValue(label);
            setMapError(null);
            return;
          }

          setMapError("Alamat belum ditemukan, tapi koordinat sudah disimpan.");
        } catch {
          setMapError("Alamat belum ditemukan, tapi koordinat sudah disimpan.");
        }
      };

      map.on("click", (event: Leaflet.LeafletMouseEvent) => {
        syncPosition({ lat: event.latlng.lat, lng: event.latlng.lng });
      });

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        syncPosition({ lat: latLng.lat, lng: latLng.lng });
      });
    };

    initializeMap().catch(() => {
      setMapError("Peta gagal dimuat.");
      setLoadingMap(false);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      mapRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) {
      return;
    }

    markerRef.current.setLatLng(currentPosition);
    mapRef.current.panTo(currentPosition);
  }, [currentPosition]);

  const handleSearch = async () => {
    const query = searchValue.trim();
    if (!query) {
      return;
    }

    try {
      const result = await searchAddress(query);
      if (!result) {
        setMapError("Alamat tidak ditemukan di OpenStreetMap.");
        return;
      }

      const nextPosition = {
        lat: Number(result.lat),
        lng: Number(result.lon),
      };

      callbackRef.current.onAddressChange(result.display_name);
      callbackRef.current.onLatitudeChange(String(nextPosition.lat));
      callbackRef.current.onLongitudeChange(String(nextPosition.lng));
      setSearchValue(result.display_name);
      setMapError(null);

      markerRef.current?.setLatLng(nextPosition);
      mapRef.current?.panTo(nextPosition);
      mapRef.current?.setZoom(16);
    } catch (error) {
      setMapError(error instanceof Error ? error.message : "Pencarian alamat gagal.");
    }
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-(--odong-border) bg-(--odong-surface-muted) p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <style jsx global>{`
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-extrabold text-(--odong-text)">
          Cari alamat outlet via OpenStreetMap
        </p>
        <p className="text-xs font-semibold leading-5 text-(--odong-muted)">
          Ketik alamat lalu tekan Enter, atau klik peta untuk memilih titik.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block min-w-0 flex-1 space-y-2">
          <span className="relative block">
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSearch();
                }
              }}
              placeholder="Tulis nama tempat, jalan, atau area"
              className={cn(
                "w-full rounded-[18px] border border-(--odong-border) bg-(--odong-surface-strong) px-4 py-3 text-sm font-medium text-(--odong-text) outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-200",
                "pr-12",
              )}
            />
            <Search
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
              aria-hidden="true"
            />
          </span>
        </label>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-primary-600 px-5 text-sm font-extrabold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
          Cari titik
        </button>
      </div>

      <div className="relative isolate overflow-hidden rounded-3xl border border-(--odong-border) bg-(--odong-surface-strong)">
        <div
          ref={mapContainerRef}
          className="h-88 w-full"
          style={{ position: "relative", zIndex: 0 }}
          aria-label="Peta outlet OpenStreetMap"
        />
        <div className="pointer-events-none absolute bottom-2 left-2 z-[1001] rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium leading-4 text-(--odong-muted) shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <span dangerouslySetInnerHTML={{ __html: osmTileAttribution }} />
        </div>
      </div>

      {loadingMap ? (
        <p className="text-xs font-semibold text-(--odong-muted)">
          Memuat OpenStreetMap...
        </p>
      ) : null}

      {mapError ? (
        <p className="text-xs font-semibold text-rose-600">{mapError}</p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-(--odong-border) bg-(--odong-surface-strong) px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--odong-muted-soft)">
            Alamat terpilih
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-(--odong-text)">
            {address || "Belum ada alamat dipilih"}
          </p>
        </div>
        <div className="rounded-[22px] border border-(--odong-border) bg-(--odong-surface-strong) px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--odong-muted-soft)">
            Koordinat drop point
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-(--odong-text)">
            {formatCoordinate(latitude) || "-"}, {formatCoordinate(longitude) || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
