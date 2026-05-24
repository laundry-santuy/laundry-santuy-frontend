export type PromoCampaign = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  validUntil: string;
  discount: string;
  active: boolean;
  diskonPersen: string;
  diskonNominal: string;
  minPembelian: string;
  tanggalBerakhir: string;
};

export type PromoDraft = {
  code: string;
  discount: string;
  minPembelian: string;
  tanggalBerakhir: string;
};

export const promoCampaignsStorageKey = "laundry-santuy-promo-campaigns";

export const defaultPromoDraft: PromoDraft = {
  code: "SANTUY12",
  discount: "12%",
  minPembelian: "18000",
  tanggalBerakhir: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
};

export const defaultPromoCampaigns: PromoCampaign[] = [
  {
    id: "promo-santuy20",
    eyebrow: "Promo pengguna baru",
    title: "Diskon 20% semua layanan",
    description: "Buat order pertama dan nikmati laundry santai tanpa antre.",
    code: "SANTUY20",
    validUntil: "31 Maret 2026",
    discount: "20%",
    active: true,
    diskonPersen: "20",
    diskonNominal: "",
    minPembelian: "18000",
    tanggalBerakhir: "2026-03-31",
  },
  {
    id: "promo-kilat15",
    eyebrow: "Express deal",
    title: "Hemat Rp15.000 untuk Express",
    description: "Cocok untuk pakaian kerja yang harus siap lebih cepat.",
    code: "KILAT15",
    validUntil: "15 April 2026",
    discount: "Rp15.000",
    active: true,
    diskonPersen: "",
    diskonNominal: "15000",
    minPembelian: "18000",
    tanggalBerakhir: "2026-04-15",
  },
  {
    id: "promo-beddingfree",
    eyebrow: "Bedding care",
    title: "Gratis pickup bedding",
    description: "Seprei dan bed cover dijemput tanpa minimum transaksi.",
    code: "BEDDINGFREE",
    validUntil: "30 April 2026",
    discount: "Gratis pickup",
    active: true,
    diskonPersen: "",
    diskonNominal: "",
    minPembelian: "0",
    tanggalBerakhir: "2026-04-30",
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

function formatPromoDateLabel(value: string) {
  if (!value) return "Aktif sekarang";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Aktif sekarang";

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDiscountLabel(diskonPersen: string, diskonNominal: string) {
  if (diskonPersen) {
    return `${diskonPersen}%`;
  }

  if (diskonNominal) {
    return `Rp${Number(diskonNominal || 0).toLocaleString("id-ID")}`;
  }

  return defaultPromoDraft.discount;
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
  const minimumOrder = draft.minPembelian.trim() || defaultPromoDraft.minPembelian;
  const tanggalBerakhir = draft.tanggalBerakhir.trim() || defaultPromoDraft.tanggalBerakhir;

  return {
    id: buildPromoId(code),
    eyebrow: "Promo aktif",
    title: `Hemat ${discount} untuk Express`,
    description: `Minimum pembelian Rp${Number(minimumOrder || 0).toLocaleString("id-ID")}`,
    code,
    validUntil: formatPromoDateLabel(tanggalBerakhir),
    discount,
    active: true,
    diskonPersen: discount.includes("%") ? discount.replace("%", "") : "",
    diskonNominal: discount.startsWith("Rp") ? discount.replace(/[^\d]/g, "") : "",
    minPembelian: minimumOrder,
    tanggalBerakhir,
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
    discount: toText(input.discount, defaultPromoDraft.discount),
    active: toBoolean(input.active, true),
    diskonPersen: typeof input.diskonPersen === "string" ? input.diskonPersen : typeof input.diskon_persen === "number" ? String(input.diskon_persen) : "",
    diskonNominal: typeof input.diskonNominal === "string" ? input.diskonNominal : typeof input.diskon_nominal === "number" ? String(input.diskon_nominal) : "",
    minPembelian: typeof input.minPembelian === "string" ? input.minPembelian : typeof input.min_pembelian === "number" ? String(input.min_pembelian) : "",
    tanggalBerakhir: toText(input.tanggalBerakhir ?? input.tanggal_berakhir, defaultPromoDraft.tanggalBerakhir),
  };
}

export function mapBackendPromoToCampaign(input: {
  id_promo: string;
  kode: string;
  diskon_persen: number | null;
  diskon_nominal: number | null;
  min_pembelian: number;
  tanggal_berakhir: string | null;
  is_active?: boolean;
}): PromoCampaign {
  const diskonPersen = input.diskon_persen != null ? String(input.diskon_persen) : "";
  const diskonNominal = input.diskon_nominal != null ? String(input.diskon_nominal) : "";
  const minPembelian = input.min_pembelian > 0 ? String(input.min_pembelian) : "";
  const tanggalBerakhir = input.tanggal_berakhir?.slice(0, 10) || defaultPromoDraft.tanggalBerakhir;
  const discount = formatDiscountLabel(diskonPersen, diskonNominal);

  return {
    id: input.id_promo,
    eyebrow: "Promo aktif",
    title: `Hemat ${discount} untuk semua layanan`,
    description: minPembelian
      ? `Minimum pembelian Rp${Number(minPembelian).toLocaleString("id-ID")}. Masukkan kode saat checkout.`
      : "Masukkan kode promo saat checkout.",
    code: input.kode,
    validUntil: formatPromoDateLabel(tanggalBerakhir),
    discount,
    active: input.is_active ?? Boolean(input.tanggal_berakhir),
    diskonPersen,
    diskonNominal,
    minPembelian,
    tanggalBerakhir,
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
