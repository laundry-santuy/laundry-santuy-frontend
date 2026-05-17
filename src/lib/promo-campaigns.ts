export type PromoCampaign = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  validUntil: string;
  basePrice: string;
  expressSurcharge: string;
  minimumOrder: string;
  discount: string;
  active: boolean;
};

export type PromoDraft = {
  basePrice: string;
  expressSurcharge: string;
  minimumOrder: string;
  code: string;
  discount: string;
  active: boolean;
};

export const promoCampaignsStorageKey = "laundry-santuy-promo-campaigns";

export const defaultPromoDraft: PromoDraft = {
  basePrice: "Rp 7.500",
  expressSurcharge: "35%",
  minimumOrder: "Rp 18.000",
  code: "SANTUY12",
  discount: "12%",
  active: true,
};

export const defaultPromoCampaigns: PromoCampaign[] = [
  {
    id: "promo-santuy20",
    eyebrow: "Promo pengguna baru",
    title: "Diskon 20% semua layanan",
    description: "Buat order pertama dan nikmati laundry santai tanpa antre.",
    code: "SANTUY20",
    validUntil: "31 Maret 2026",
    basePrice: "Rp 7.500",
    expressSurcharge: "35%",
    minimumOrder: "Rp 18.000",
    discount: "20%",
    active: true,
  },
  {
    id: "promo-kilat15",
    eyebrow: "Express deal",
    title: "Hemat Rp15.000 untuk Express",
    description: "Cocok untuk pakaian kerja yang harus siap lebih cepat.",
    code: "KILAT15",
    validUntil: "15 April 2026",
    basePrice: "Rp 7.500",
    expressSurcharge: "35%",
    minimumOrder: "Rp 18.000",
    discount: "Rp15.000",
    active: true,
  },
  {
    id: "promo-beddingfree",
    eyebrow: "Bedding care",
    title: "Gratis pickup bedding",
    description: "Seprei dan bed cover dijemput tanpa minimum transaksi.",
    code: "BEDDINGFREE",
    validUntil: "30 April 2026",
    basePrice: "Rp 7.500",
    expressSurcharge: "35%",
    minimumOrder: "Rp 18.000",
    discount: "Gratis pickup",
    active: true,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function buildPromoId(code: string) {
  const slug = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "promo"}-${Date.now().toString(36)}`;
}

export function createPromoCampaignFromDraft(draft: PromoDraft): PromoCampaign {
  const code = draft.code.trim().toUpperCase() || defaultPromoDraft.code;
  const discount = draft.discount.trim() || defaultPromoDraft.discount;
  const basePrice = draft.basePrice.trim() || defaultPromoDraft.basePrice;
  const expressSurcharge =
    draft.expressSurcharge.trim() || defaultPromoDraft.expressSurcharge;
  const minimumOrder = draft.minimumOrder.trim() || defaultPromoDraft.minimumOrder;

  return {
    id: buildPromoId(code),
    eyebrow: "Promo aktif",
    title: `Hemat ${discount} untuk Express`,
    description: `Tarif dasar ${basePrice} • Express ${expressSurcharge} • Minimum order ${minimumOrder}`,
    code,
    validUntil: "Aktif sekarang",
    basePrice,
    expressSurcharge,
    minimumOrder,
    discount,
    active: draft.active,
  };
}

export function sanitizePromoCampaign(
  input: unknown,
  index: number,
): PromoCampaign | null {
  if (!isRecord(input)) {
    return null;
  }

  const code = toText(input.code, "");

  if (!code) {
    return null;
  }

  return {
    id: toText(input.id, buildPromoId(`${code}-${index}`)),
    eyebrow: toText(input.eyebrow, "Promo aktif"),
    title: toText(input.title, `Promo ${code}`),
    description: toText(
      input.description,
      "Promo aktif siap ditampilkan di beranda user.",
    ),
    code,
    validUntil: toText(input.validUntil, "Aktif sekarang"),
    basePrice: toText(input.basePrice, defaultPromoDraft.basePrice),
    expressSurcharge: toText(
      input.expressSurcharge,
      defaultPromoDraft.expressSurcharge,
    ),
    minimumOrder: toText(input.minimumOrder, defaultPromoDraft.minimumOrder),
    discount: toText(input.discount, defaultPromoDraft.discount),
    active: toBoolean(input.active, true),
  };
}

export function loadStoredPromoCampaigns() {
  if (typeof window === "undefined") {
    return defaultPromoCampaigns;
  }

  try {
    const raw = window.localStorage.getItem(promoCampaignsStorageKey);

    if (!raw) {
      return defaultPromoCampaigns;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return defaultPromoCampaigns;
    }

    const normalized = parsed
      .map((campaign, index) => sanitizePromoCampaign(campaign, index))
      .filter((campaign): campaign is PromoCampaign => Boolean(campaign));

    return normalized.length > 0 ? normalized : defaultPromoCampaigns;
  } catch {
    return defaultPromoCampaigns;
  }
}

export function saveStoredPromoCampaigns(campaigns: PromoCampaign[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    promoCampaignsStorageKey,
    JSON.stringify(campaigns),
  );
}
