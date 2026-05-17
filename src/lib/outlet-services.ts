import {
  Bolt,
  Clock,
  CreditCard,
  Leaf,
  Package,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type OutletServiceIconKey =
  | "shirt"
  | "sparkles"
  | "clock"
  | "package"
  | "leaf"
  | "shieldCheck"
  | "truck"
  | "creditCard"
  | "bolt";

export type OutletService = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: "kg" | "item";
  eta: string;
  badge: string;
  minQuantity: number;
  maxQuantity: number;
  step: number;
  iconKey: OutletServiceIconKey;
  active: boolean;
};

export type OutletServiceIconOption = {
  key: OutletServiceIconKey;
  label: string;
  description: string;
};

const serviceIconMap: Record<OutletServiceIconKey, LucideIcon> = {
  shirt: Shirt,
  sparkles: Sparkles,
  clock: Clock,
  package: Package,
  leaf: Leaf,
  shieldCheck: ShieldCheck,
  truck: Truck,
  creditCard: CreditCard,
  bolt: Bolt,
};

export const outletServiceIconOptions: OutletServiceIconOption[] = [
  {
    key: "shirt",
    label: "Pakaian harian",
    description: "Cocok untuk laundry kiloan.",
  },
  {
    key: "sparkles",
    label: "Setrika rapi",
    description: "Baju siap pakai setelah proses selesai.",
  },
  {
    key: "clock",
    label: "Layanan cepat",
    description: "Cocok untuk order prioritas.",
  },
  {
    key: "package",
    label: "Paket besar",
    description: "Seprai, selimut, dan barang tebal.",
  },
  {
    key: "leaf",
    label: "Segar",
    description: "Aroma premium dan finishing ringan.",
  },
  {
    key: "shieldCheck",
    label: "Perawatan khusus",
    description: "Untuk item yang perlu perhatian ekstra.",
  },
  {
    key: "truck",
    label: "Pickup",
    description: "Berfokus ke antar jemput outlet.",
  },
  {
    key: "creditCard",
    label: "Pembayaran",
    description: "Layanan yang terkait transaksi.",
  },
  {
    key: "bolt",
    label: "Serba cepat",
    description: "Layanan dengan prioritas tinggi.",
  },
];

export const defaultOutletServices: OutletService[] = [
  {
    id: "service-cuci-kiloan",
    name: "Cuci Kiloan",
    description: "Pakaian harian dicuci bersih, dikeringkan, lalu dilipat rapi.",
    price: 7000,
    unit: "kg",
    eta: "2-3 hari",
    badge: "Hemat",
    minQuantity: 1,
    maxQuantity: 12,
    step: 0.5,
    iconKey: "shirt",
    active: true,
  },
  {
    id: "service-cuci-setrika",
    name: "Cuci + Setrika",
    description: "Paket favorit untuk pakaian siap pakai dan langsung masuk lemari.",
    price: 10000,
    unit: "kg",
    eta: "2 hari",
    badge: "Favorit",
    minQuantity: 1,
    maxQuantity: 12,
    step: 0.5,
    iconKey: "sparkles",
    active: true,
  },
  {
    id: "service-express",
    name: "Express",
    description: "Laundry prioritas untuk kebutuhan mendadak di hari yang sama.",
    price: 18000,
    unit: "kg",
    eta: "6-12 jam",
    badge: "Cepat",
    minQuantity: 1,
    maxQuantity: 8,
    step: 0.5,
    iconKey: "clock",
    active: true,
  },
  {
    id: "service-bedding-care",
    name: "Bedding Care",
    description: "Perawatan untuk seprai, bed cover, selimut, dan bahan besar.",
    price: 25000,
    unit: "item",
    eta: "2-3 hari",
    badge: "Higienis",
    minQuantity: 1,
    maxQuantity: 6,
    step: 1,
    iconKey: "package",
    active: true,
  },
];

export const outletServicesStorageKey = "laundry-santuy-outlet-services";

export function getOutletServiceIcon(iconKey: OutletServiceIconKey) {
  return serviceIconMap[iconKey] ?? Sparkles;
}

export function suggestOutletServiceIconKey(name: string): OutletServiceIconKey {
  const normalizedName = name.toLowerCase();

  if (
    normalizedName.includes("express") ||
    normalizedName.includes("cepat") ||
    normalizedName.includes("prioritas")
  ) {
    return "clock";
  }

  if (
    normalizedName.includes("setrika") ||
    normalizedName.includes("lipat") ||
    normalizedName.includes("rapi")
  ) {
    return "sparkles";
  }

  if (
    normalizedName.includes("selimut") ||
    normalizedName.includes("bedding") ||
    normalizedName.includes("linen") ||
    normalizedName.includes("karpet")
  ) {
    return "package";
  }

  if (
    normalizedName.includes("sepatu") ||
    normalizedName.includes("tas") ||
    normalizedName.includes("khusus")
  ) {
    return "shieldCheck";
  }

  if (
    normalizedName.includes("kurir") ||
    normalizedName.includes("pickup") ||
    normalizedName.includes("jemput")
  ) {
    return "truck";
  }

  if (
    normalizedName.includes("wangi") ||
    normalizedName.includes("pewangi") ||
    normalizedName.includes("fresh")
  ) {
    return "leaf";
  }

  if (
    normalizedName.includes("bayar") ||
    normalizedName.includes("cash") ||
    normalizedName.includes("cod")
  ) {
    return "creditCard";
  }

  if (normalizedName.includes("petir") || normalizedName.includes("super")) {
    return "bolt";
  }

  return "shirt";
}

export function createOutletServiceId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = Date.now().toString(36);

  return `${slug || "service"}-${stamp}`;
}

function toNumber(value: unknown, fallback: number) {
  const nextValue = Number(value);

  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function sanitizeOutletService(
  input: unknown,
  index: number,
): OutletService | null {
  if (!isRecord(input)) {
    return null;
  }

  const name = toText(input.name, "");

  if (!name) {
    return null;
  }

  const iconKey = outletServiceIconOptions.some(
    (option) => option.key === input.iconKey,
  )
    ? (input.iconKey as OutletServiceIconKey)
    : suggestOutletServiceIconKey(name);

  return {
    id: toText(input.id, createOutletServiceId(`${name}-${index}`)),
    name,
    description: toText(
      input.description,
      "Tambahkan deskripsi singkat untuk layanan ini.",
    ),
    price: Math.max(toNumber(input.price, 0), 0),
    unit: input.unit === "item" ? "item" : "kg",
    eta: toText(input.eta, "2 hari"),
    badge: toText(input.badge, "Baru"),
    minQuantity: Math.max(toNumber(input.minQuantity, 1), 0.5),
    maxQuantity: Math.max(toNumber(input.maxQuantity, 1), 1),
    step: Math.max(toNumber(input.step, 1), 0.5),
    iconKey,
    active: Boolean(input.active ?? true),
  };
}

export function loadStoredOutletServices() {
  if (typeof window === "undefined") {
    return defaultOutletServices;
  }

  try {
    const raw = window.localStorage.getItem(outletServicesStorageKey);

    if (!raw) {
      return defaultOutletServices;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return defaultOutletServices;
    }

    const normalized = parsed
      .map((service, index) => sanitizeOutletService(service, index))
      .filter((service): service is OutletService => Boolean(service));

    return normalized.length > 0 ? normalized : [];
  } catch {
    return defaultOutletServices;
  }
}

export function saveStoredOutletServices(services: OutletService[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    outletServicesStorageKey,
    JSON.stringify(services),
  );
}
