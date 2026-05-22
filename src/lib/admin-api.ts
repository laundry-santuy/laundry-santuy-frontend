import { apiClient } from './api-client';
import {
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
  deskripsi: string | null;
  iconKey: OutletServiceIconKey | null;
  minQuantity: number;
  maxQuantity: number;
  stepQuantity: number;
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
  semuaOutlet: { id: string; nama: string }[];
};

export type CreateLayananBody = {
  nama_layanan: string;
  satuan: 'kg' | 'item';
  harga_satuan: number;
  tipe: string;
  durasi?: string;
  deskripsi?: string;
  icon_key?: string;
  min_quantity?: number;
  max_quantity?: number;
  step_quantity?: number;
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

export type OperasionalHariIni = {
  pickupQueue: number;
  slaCompliance: number;
  pendingTickets: number;
};

export type OperasiAktif = {
  todayRevenue: number;
  todayTransactions: number;
  ordersInProcess: number;
  lastSync: string;
};

export type DashboardResponse = {
  overview: DashboardOverview;
  operasionalHariIni: OperasionalHariIni;
  operasiAktif: OperasiAktif;
  revenueTrend: RevenueTrendPoint[];
  statusPesanan: StatusPesananItem[];
  topOutlets: TopOutletItem[];
  aktivitasTerbaru: AktivitasTerbaruItem[];
};

// ── Settings API types ────────────────────────────────────────────────────────

export type InformasiAplikasi = {
  namaAplikasi: string;
  tagline: string;
  email: string;
  nomorTelepon: string;
  alamatPusat: string;
};

export type FiturAplikasi = {
  pickupAndDelivery: boolean;
  aiSuggestions: boolean;
  liveTracking: boolean;
  pushNotifications: boolean;
  multiLanguage: boolean;
};

export type PengaturanUmumResponse = {
  informasiAplikasi: InformasiAplikasi;
  fiturAplikasi: FiturAplikasi;
};

export type PengaturanHarga = {
  hargaMinimum: number;
  hargaMaksimum: number;
  biayaAntarJemput: number;
  freeDeliveryMinimum: number;
};

export type KodePromo = {
  id_promo: string;
  kode: string;
  diskonPersen: number;
  diskonNominal: number;
  minPembelian: number;
  tanggalAkhir: string;
};

export type DashboardHargaPromoResponse = {
  pengaturanHarga: PengaturanHarga;
  kodePromoAktif: KodePromo[];
};

export type KeamananAplikasi = {
  twoFactorAuth: boolean;
  passwordExpiry: boolean;
  sessionTimeout: boolean;
  loginAttempts: boolean;
  ipWhitelist: boolean;
};

export type PengaturanBackup = {
  hariBackup: string;
  backupRetention: number;
};

export type PengaturanKeamananResponse = {
  keamananAplikasi: KeamananAplikasi;
  pengaturanBackup: PengaturanBackup;
};

// ── Schema mapping: backend LayananBackend → frontend OutletService ───────────

export function backendToOutletService(backend: LayananBackend): OutletService {
  return {
    id: backend.id_layanan,
    name: backend.namaLayanan,
    description: backend.deskripsi ?? 'Layanan laundry berkualitas.',
    price: backend.harga,
    unit: backend.satuan,
    eta: backend.durasi || '2 hari',
    badge: backend.tipe,
    minQuantity: backend.minQuantity ?? 1,
    maxQuantity: backend.maxQuantity ?? 12,
    step: backend.stepQuantity ?? 0.5,
    iconKey: backend.iconKey ?? suggestOutletServiceIconKey(backend.namaLayanan),
    active: backend.isActive,
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>('/api/admin/dashboard');
}

// ── Manajemen Pesanan (Admin) ───────────────────────────────────────────────

export type ManajemenPesananOrder = {
  id_pesanan: string;
  orderIdUI?: string;
  date?: string | null;
  customer?: { name?: string; initials?: string } | null;
  layanan?: string | null;
  outlet?: string | null;
  berat?: string | null;
  harga?: number | null;
  status?: string | null;
  statusAsli?: string | null;
};

export type ManajemenPesananResponse = {
  summary: { semua: number; pending: number; processing?: number; completed?: number; cancelled?: number };
  orders: ManajemenPesananOrder[];
  pagination: { page: number; limit: number; totalData: number; totalPages: number };
};

export function fetchManajemenPesanan(page = 1, limit = 1000): Promise<ManajemenPesananResponse> {
  return apiClient.get<ManajemenPesananResponse>(`/api/admin/manajemen-pesanan?page=${page}&limit=${limit}`);
}

export function fetchPengaturanOutlet(): Promise<PengaturanOutletResponse> {
  return apiClient.get<PengaturanOutletResponse>('/api/admin/pengaturan-outlet');
}

export function createLayanan(
  body: CreateLayananBody,
): Promise<{ message: string; data: { id_layanan: string } & Record<string, unknown> }> {
  return apiClient.post('/api/layanan', body);
}

export function updatePesananStatus(id: string, status: string): Promise<{ message: string; pesanan?: any }> {
  return apiClient.patch(`/api/admin/pesanan/${id}/status`, { status });
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

// ── Settings API calls ────────────────────────────────────────────────────────

export function fetchPengaturanUmum(): Promise<PengaturanUmumResponse> {
  return apiClient.get<PengaturanUmumResponse>('/api/admin/pengaturan-umum');
}

export function fetchDashboardHargaPromo(): Promise<DashboardHargaPromoResponse> {
  return apiClient.get<DashboardHargaPromoResponse>('/api/admin/dashboard-harga-promo');
}

export function fetchPengaturanKeamanan(): Promise<PengaturanKeamananResponse> {
  return apiClient.get<PengaturanKeamananResponse>('/api/admin/pengaturan-keamanan');
}

export type UpdatePengaturanUmumBody = {
  namaAplikasi?: string;
  tagline?: string;
  email?: string;
  nomorTelepon?: string;
  alamatPusat?: string;
  fiturAplikasi?: Partial<FiturAplikasi>;
};

export function updatePengaturanUmum(body: UpdatePengaturanUmumBody): Promise<{ message: string }> {
  return apiClient.put('/api/admin/pengaturan-umum', body);
}

export type UpdatePengaturanOutletBody = {
  id_outlet?: string | null;
  namaOutlet?: string;
  alamatOutlet?: string;
  email?: string;
  nomorTelepon?: string;
  jamMulai?: string | null;
  jamSelesai?: string | null;
};

export function updatePengaturanOutlet(body: UpdatePengaturanOutletBody): Promise<{ message: string }> {
  return apiClient.put('/api/admin/pengaturan-outlet', body);
}
