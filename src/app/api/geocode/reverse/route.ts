import { NextResponse } from "next/server";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

function buildReadableAddress(payload: {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}) {
  if (payload.display_name) {
    return payload.display_name;
  }

  const address = payload.address;
  const parts = [
    address?.road || address?.pedestrian,
    address?.suburb || address?.neighbourhood,
    address?.city || address?.town || address?.municipality,
    address?.county,
    address?.state,
    address?.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat")?.trim();
  const lng = searchParams.get("lng")?.trim();

  if (!lat || !lng) {
    return NextResponse.json({ error: "Koordinat wajib diisi." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1&accept-language=id`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "LaundrySantuy/1.0 (+https://laundrysantuy.local)",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Reverse geocode gagal." }, { status: 502 });
    }

    const payload = (await response.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        pedestrian?: string;
        suburb?: string;
        neighbourhood?: string;
        city?: string;
        town?: string;
        municipality?: string;
        county?: string;
        state?: string;
        country?: string;
      };
    };

    return NextResponse.json({
      result: buildReadableAddress(payload),
    });
  } catch {
    return NextResponse.json({ error: "Reverse geocode gagal." }, { status: 502 });
  }
}
