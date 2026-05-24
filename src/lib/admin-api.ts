import { apiClient } from './api-client';
import {
  suggestOutletServiceIconKey,
  type OutletService,
  type OutletServiceIconKey,
} from './outlet-services';

function withCacheBuster(path: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}_ts=${Date.now()}`;
}

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

export type OutletBackend = {
  id_outlet: string | null;
  namaOutlet: string;
  alamatOutlet: string;
  email: string;
  nomorTelepon: string;
  latitude: number | null;
  longitude: number | null;
  jamMulai: string | null;
  jamSelesai: string | null;
  isTutupSementara: boolean;
  maxKapasitas: number;
  namaBank: string | null;
  nomorRekening: string | null;
  atasNama: string | null;
  qrisUrl: string | null;
};

export type PengaturanOutletResponse = {
  pengaturanOutlet: OutletBackend;
  semuaOutlet: OutletBackend[];
  layananOutlet: LayananBackend[];
};

export type ManajemenUserItem = {
  id: string;
  nama: string;
  inisial?: string;
  role: string;
  roleKey?: 'ADMIN' | 'KURIR' | 'PELANGGAN';
  email: string;
  nomorTelepon: string;
  infoLain: string;
  tanggalGabung: string;
  status: string;
};

export type ManajemenUserResponse = {
  summary: {
    semua: number;
    pelanggan: number;
    admin: number;
    kurir: number;
  };
  users: ManajemenUserItem[];
  pagination: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
};

export type AdminProfilResponse = {
  profil: {
    id: string;
    nama: string;
    email: string;
    role: string;
    outletUtamaId: string | null;
    outletUtama: string;
    inisial: string;
  };
  stats: {
    orders: number;
    ratings: number;
  };
  alamatSaya: Array<{
    id: string;
    nama: string;
    alamatLengkap: string;
  }>;
};

export type CreateManajemenUserBody = {
  name: string;
  email: string;
  role: 'Admin' | 'Kurir' | 'Pelanggan';
  password: string;
  nomorTelepon?: string;
};

export type UpdateManajemenUserBody = {
  name?: string;
  email?: string;
  role?: 'Admin' | 'Kurir' | 'Pelanggan';
  nomorTelepon?: string;
};

export type UpdateAdminProfilBody = {
  nama?: string;
  email?: string;
  outletUtamaId?: string | null;
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
  apply_to_all?: boolean;
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
  estimasiPickup: string;
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

export function fetchManajemenUser(page = 1, limit = 1000): Promise<ManajemenUserResponse> {
  return apiClient.get<ManajemenUserResponse>(`/api/admin/manajemen-user?page=${page}&limit=${limit}`);
}

export function createManajemenUser(body: CreateManajemenUserBody): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/api/admin/manajemen-user', body);
}

export function updateManajemenUser(id: string, body: UpdateManajemenUserBody): Promise<{ message: string }> {
  return apiClient.patch<{ message: string }>(`/api/admin/manajemen-user/${id}`, body);
}

export function deleteManajemenUser(id: string): Promise<{ message: string }> {
  return apiClient.del<{ message: string }>(`/api/admin/manajemen-user/${id}`);
}

export function fetchProfilAdmin(): Promise<AdminProfilResponse> {
  return apiClient.get<AdminProfilResponse>('/api/admin/profil');
}

export function updateProfilAdmin(body: UpdateAdminProfilBody): Promise<{ message: string }> {
  return apiClient.put<{ message: string }>('/api/admin/profil', body);
}

// ── Manajemen Pesanan (Admin) ───────────────────────────────────────────────

export type ManajemenPesananOrder = {
  id_pesanan: string;
  kodePesanan?: string;
  orderIdUI?: string;
  date?: string | null;
  customer?: { name?: string; initials?: string } | null;
  layanan?: string | null;
  outlet?: string | null;
  berat?: string | null;
  harga?: number | null;
  status?: string | null;
  statusAsli?: string | null;
  statusPembayaran?: string | null;
  fotoBuktiUrl?: string | null;
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
  return apiClient.get<PengaturanOutletResponse>(withCacheBuster('/api/admin/pengaturan-outlet'));
}

export function createLayanan(
  body: CreateLayananBody,
): Promise<{ message: string; data: { id_layanan: string } & Record<string, unknown> }> {
  return apiClient.post('/api/layanan', body);
}

export function updatePesananStatus(id: string, status: string): Promise<{ message: string; pesanan?: any }> {
  return apiClient.patch(`/api/admin/pesanan/${id}/status`, { status });
}

export type CreatePesananAdminBody = {
  id_pengguna: string;
  id_layanan: string;
  id_laundry: string;
  harga_total?: number;
  status?: string;
};

export function createPesananAdmin(body: CreatePesananAdminBody): Promise<{ message: string; pesanan?: any }> {
  return apiClient.post('/api/admin/pesanan', body);
}

export function deletePesananAdmin(id: string): Promise<{ message: string }> {
  return apiClient.del(`/api/admin/pesanan/${id}`);
}

export function konfirmasiPembayaran(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.patch(`/api/admin/pesanan/${id}/konfirmasi-pembayaran`, {});
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
  return apiClient.get<PengaturanUmumResponse>(withCacheBuster('/api/admin/pengaturan-umum'));
}

export function fetchDashboardHargaPromo(): Promise<DashboardHargaPromoResponse> {
  return apiClient.get<DashboardHargaPromoResponse>(withCacheBuster('/api/admin/dashboard-harga-promo'));
}

export function fetchPengaturanKeamanan(): Promise<PengaturanKeamananResponse> {
  return apiClient.get<PengaturanKeamananResponse>(withCacheBuster('/api/admin/pengaturan-keamanan'));
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

export type UpdatePengaturanHargaBody = {
  biayaAntarJemput?: number;
  estimasiPickup?: string;
};

export function updatePengaturanHarga(body: UpdatePengaturanHargaBody): Promise<{ message: string }> {
  return apiClient.put('/api/admin/pengaturan-harga', body);
}

export type UpdatePengaturanOutletBody = {
  id_outlet?: string | null;
  namaOutlet?: string;
  alamatOutlet?: string;
  email?: string;
  nomorTelepon?: string;
  latitude?: number | null;
  longitude?: number | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  isTutupSementara?: boolean;
  maxKapasitas?: number;
  namaBank?: string | null;
  nomorRekening?: string | null;
  atasNama?: string | null;
};

export function updatePengaturanOutlet(body: UpdatePengaturanOutletBody): Promise<{ message: string }> {
  return apiClient.put('/api/admin/pengaturan-outlet', body);
}

export type CreatePengaturanOutletBody = {
  namaOutlet: string;
  alamatOutlet?: string;
  email?: string;
  nomorTelepon?: string;
  latitude?: number | null;
  longitude?: number | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  maxKapasitas?: number;
  namaBank?: string | null;
  nomorRekening?: string | null;
  atasNama?: string | null;
};

export function createPengaturanOutlet(body: CreatePengaturanOutletBody): Promise<{ message: string; pengaturanOutlet: OutletBackend }> {
  return apiClient.post('/api/admin/pengaturan-outlet', body);
}

export function deletePengaturanOutlet(idOutlet: string): Promise<{ message: string }> {
  return apiClient.del(`/api/admin/pengaturan-outlet/${idOutlet}`);
}

export function uploadQrisOutlet(idOutlet: string, imageBase64: string): Promise<{ qrisUrl: string }> {
  return apiClient.post<{ qrisUrl: string }>(`/api/admin/pengaturan-outlet/${idOutlet}/upload-qris`, { imageBase64 });
}

// ── Add-on management ─────────────────────────────────────────────────────────

export type AdminAddonItem = {
  id_addon: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  icon_key: string | null;
  is_active: boolean;
};

export type CreateAdminAddonBody = {
  nama: string;
  deskripsi?: string;
  harga?: number;
  icon_key?: string;
};

export type UpdateAdminAddonBody = Partial<CreateAdminAddonBody> & { is_active?: boolean };

export function fetchAdminAddonList(): Promise<{ addons: AdminAddonItem[] }> {
  return apiClient.get<{ addons: AdminAddonItem[] }>(withCacheBuster('/api/admin/addon'));
}

export function createAdminAddon(body: CreateAdminAddonBody): Promise<{ message: string; addon: AdminAddonItem }> {
  return apiClient.post<{ message: string; addon: AdminAddonItem }>('/api/admin/addon', body);
}

export function updateAdminAddon(id: string, body: UpdateAdminAddonBody): Promise<{ message: string; addon: AdminAddonItem }> {
  return apiClient.put<{ message: string; addon: AdminAddonItem }>(`/api/admin/addon/${id}`, body);
}

export function deleteAdminAddon(id: string): Promise<{ message: string }> {
  return apiClient.del<{ message: string }>(`/api/admin/addon/${id}`);
}
