import { apiClient } from './api-client';
import {
  saveStoredOutletServices,
  suggestOutletServiceIconKey,
  type OutletService,
  type OutletServiceIconKey,
} from './outlet-services';

// ── Backend response types ────────────────────────────────────────────────────

export type LayananBackend = {
  id_layanan: string;
  namaLayanan: string;
  harga: number;
  satuan: 'kg' | 'item';
  tipe: string;
  durasi: string;
  isActive: boolean;
};

export type PengaturanOutletResponse = {
  pengaturanOutlet: {
    id_outlet: string;
    namaOutlet: string;
    alamatOutlet: string;
    jamMulai: string | null;
    jamSelesai: string | null;
  };
  layananOutlet: LayananBackend[];
};

export type CreateLayananBody = {
  nama_layanan: string;
  satuan: 'kg' | 'item';
  harga_satuan: number;
  tipe: string;
  durasi?: string;
};

export type UpdateLayananBody = Partial<CreateLayananBody> & {
  is_active?: boolean;
};

// ── Dashboard API types ───────────────────────────────────────────────────────

export type DashboardOverview = {
  totalRevenue: number;
  totalPesanan: number;
  pelangganAktif: number;
  totalOutlet: number;
};

export type RevenueTrendPoint = {
  month: string;
  revenue: number;
};

export type StatusPesananItem = {
  status: string;
  count: number;
};

export type TopOutletItem = {
  rank: number;
  name: string;
  orders: number;
  revenue: number;
};

export type AktivitasTerbaruItem = {
  id: string;
  pesan: string;
  waktu: string;
  harga: number;
};

export type DashboardResponse = {
  overview: DashboardOverview;
  revenueTrend: RevenueTrendPoint[];
  statusPesanan: StatusPesananItem[];
  topOutlets: TopOutletItem[];
  aktivitasTerbaru: AktivitasTerbaruItem[];
};

// ── Service metadata stored in localStorage for fields not in the DB ──────────

export type ServiceMeta = {
  description: string;
  iconKey: OutletServiceIconKey;
  minQuantity: number;
  maxQuantity: number;
  step: number;
};

const SERVICE_META_KEY = 'laundry-santuy-service-meta';

export function loadServiceMeta(): Record<string, ServiceMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SERVICE_META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ServiceMeta>) : {};
  } catch {
    return {};
  }
}

export function saveServiceMeta(meta: Record<string, ServiceMeta>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SERVICE_META_KEY, JSON.stringify(meta));
}

export function upsertServiceMeta(id: string, meta: ServiceMeta): Record<string, ServiceMeta> {
  const all = loadServiceMeta();
  const next = { ...all, [id]: meta };
  saveServiceMeta(next);
  return next;
}

export function removeServiceMeta(id: string): Record<string, ServiceMeta> {
  const all = loadServiceMeta();
  const next = { ...all };
  delete next[id];
  saveServiceMeta(next);
  return next;
}

// ── Schema mapping: backend LayananBackend → frontend OutletService ───────────

export function backendToOutletService(
  backend: LayananBackend,
  meta?: ServiceMeta,
): OutletService {
  return {
    id: backend.id_layanan,
    name: backend.namaLayanan,
    description: meta?.description ?? 'Layanan laundry berkualitas.',
    price: backend.harga,
    unit: backend.satuan,
    eta: backend.durasi || '2 hari',
    badge: backend.tipe,
    minQuantity: meta?.minQuantity ?? 1,
    maxQuantity: meta?.maxQuantity ?? 12,
    step: meta?.step ?? 0.5,
    iconKey: meta?.iconKey ?? suggestOutletServiceIconKey(backend.namaLayanan),
    active: backend.isActive,
  };
}

export function syncServicesToLocalStorage(
  backendList: LayananBackend[],
  meta: Record<string, ServiceMeta>,
): void {
  const converted = backendList.map((s) =>
    backendToOutletService(s, meta[s.id_layanan]),
  );
  saveStoredOutletServices(converted);
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>('/api/admin/dashboard');
}

export function fetchPengaturanOutlet(): Promise<PengaturanOutletResponse> {
  return apiClient.get<PengaturanOutletResponse>('/api/admin/pengaturan-outlet');
}

export function createLayanan(
  body: CreateLayananBody,
): Promise<{ message: string; data: { id_layanan: string } & Record<string, unknown> }> {
  return apiClient.post('/api/layanan', body);
}

export function updateLayanan(
  id: string,
  body: UpdateLayananBody,
): Promise<{ message: string }> {
  return apiClient.put(`/api/layanan/${id}`, body);
}

export function deleteLayanan(id: string): Promise<{ message: string }> {
  return apiClient.del(`/api/layanan/${id}`);
}
