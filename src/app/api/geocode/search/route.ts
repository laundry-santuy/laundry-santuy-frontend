import { NextResponse } from "next/server";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

async function searchOnce(query: string) {
  const response = await fetch(
    `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=id`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "LaundrySantuy/1.0 (+https://laundrysantuy.local)",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    category?: string;
    type?: string;
    address?: {
      road?: string;
      pedestrian?: string;
      city?: string;
      town?: string;
      municipality?: string;
      state?: string;
      country?: string;
    };
  }>;

  return payload;
}

function scoreResult(
  result: NonNullable<Awaited<ReturnType<typeof searchOnce>>>[number],
  query: string,
) {
  const displayName = result.display_name.toLowerCase();
  const address = result.address;
  const city = `${address?.city || address?.town || address?.municipality || ""}`.toLowerCase();
  const road = `${address?.road || address?.pedestrian || ""}`.toLowerCase();
  const category = `${result.category || ""}`.toLowerCase();
  const type = `${result.type || ""}`.toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;

  if (displayName.includes(queryLower)) score += 20;
  if (road.includes(queryLower)) score += 35;
  if (road.includes("jalan") || road.includes("jl")) score += 10;
  if (city.includes("yogyakarta")) score += 50;
  if (displayName.includes("yogyakarta")) score += 20;
  if (displayName.includes("jakarta")) score += 10;
  if (category === "highway" || category === "place") score += 30;
  if (
    type === "road" ||
    type === "pedestrian" ||
    type === "residential" ||
    type === "service"
  ) {
    score += 30;
  }
  if (category === "amenity" || category === "tourism" || category === "shop") {
    score -= 20;
  }

  return score;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Query alamat wajib diisi." }, { status: 400 });
  }

  try {
    const attempts = [
      query,
      `${query}, Indonesia`,
      `${query}, Yogyakarta, Indonesia`,
      `${query}, Jakarta, Indonesia`,
    ];

    let candidates = [] as NonNullable<Awaited<ReturnType<typeof searchOnce>>>;
    for (const attempt of attempts) {
      const fetched = await searchOnce(attempt);
      if (fetched?.length) {
        candidates = candidates.concat(fetched);
      }
    }

    const uniqueCandidates = candidates.filter((result, index, array) => {
      const key = `${result.lat}:${result.lon}`;
      return array.findIndex((item) => `${item.lat}:${item.lon}` === key) === index;
    });

    const result = uniqueCandidates
      .map((candidate) => ({
        candidate,
        score: scoreResult(candidate, query),
      }))
      .sort((left, right) => right.score - left.score)[0]?.candidate;

    if (!result) {
      return NextResponse.json({ result: null });
    }

    return NextResponse.json({
      result: {
        display_name: result.display_name,
        lat: Number(result.lat),
        lon: Number(result.lon),
      },
    });
  } catch {
    return NextResponse.json({ error: "Pencarian alamat gagal." }, { status: 502 });
  }
}
