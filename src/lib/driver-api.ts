import { apiClient } from './api-client';
import type {
  DriverActiveOrder,
  DriverActiveProcessStage,
  DriverHistoryOrder,
  DriverHistoryStats,
  DriverIncomingOrder,
  DriverOrderStatus,
} from '@/app/driver/_components/types';

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatRupiah(value: number): string {
  if (!value) return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatWaktuRelatif(iso: string | null): string {
  if (!iso) return 'Baru saja';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function formatJam(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
}

const stageKeyToFE: Record<string, DriverActiveProcessStage> = {
  menuju_lokasi: 'menuju-lokasi',
  dijemput:      'dijemput',
  di_laundry:    'di-laundry',
  siap_diantar:  'siap-diantar',
  diantar:       'diantar',
};

// ── Pesanan Masuk ─────────────────────────────────────────────────────────────

type RawIncomingOrder = {
  id_pesanan:   string;
  kodePesanan?: string;
  nomorUrut:    number;
  waktuJemput:  string | null;
  status:       string;
  customer:     { nama: string; inisial: string; telepon: string; alamat: string };
  layanan:      { nama: string; estimasiBeratKg: number };
  estimasi:     { jarakKm: number; harga: number };
};

type PesananMasukResponse = {
  stats:    { orderBaru: number; diterima: number; ditolak: number };
  pesanan:  RawIncomingOrder[];
};

function mapIncomingOrder(raw: RawIncomingOrder): DriverIncomingOrder {
  return {
    id:             raw.id_pesanan,
    kodePesanan:    raw.kodePesanan ?? `#LS-${raw.id_pesanan.slice(-3)}`,
    queueNumber:    `#${raw.nomorUrut}`,
    customerName:   raw.customer.nama,
    customerInitials: raw.customer.inisial,
    phone:          raw.customer.telepon,
    address:        raw.customer.alamat,
    pickupTime:     formatJam(raw.waktuJemput),
    service:        raw.layanan.nama,
    estimatedWeight: `~${raw.layanan.estimasiBeratKg} kg`,
    distance:       `~${raw.estimasi.jarakKm} km`,
    estimatedPrice: formatRupiah(raw.estimasi.harga),
    status:         (raw.status as DriverOrderStatus) ?? 'incoming',
  };
}

export async function fetchPesananMasuk() {
  const res = await apiClient.get<PesananMasukResponse>('/api/driver/pesanan-masuk');
  return {
    orders: res.pesanan.map(mapIncomingOrder),
    stats:  res.stats,
  };
}

// ── Pesanan Aktif ─────────────────────────────────────────────────────────────

type RawProgressItem = { key: string; label: string; done: boolean; active: boolean };

type RawActiveOrder = {
  id_pesanan:    string;
  kodePesanan?:  string;
  nomorUrut:     number;
  progress:      RawProgressItem[];
  catatan:       string;
  foto_bukti_url?: string | null;
  customer:      { nama: string; inisial: string; telepon: string; alamat: string };
  layanan:       { nama: string; beratKg: number; waktuJemput: string | null; totalHarga: number };
};

type PesananAktifResponse = { pesanan: RawActiveOrder[] };

function mapActiveOrder(raw: RawActiveOrder): DriverActiveOrder {
  const activeStage  = raw.progress?.find((p) => p.active);
  const currentStage = stageKeyToFE[activeStage?.key ?? 'menuju_lokasi'] ?? 'menuju-lokasi';

  return {
    id:               raw.id_pesanan,
    queueNumber:      `#${raw.nomorUrut}`,
    kodePesanan:      raw.kodePesanan ?? `#LS-${raw.id_pesanan.slice(-3).toUpperCase()}`,
    customerName:     raw.customer.nama,
    customerInitials: raw.customer.inisial,
    phone:            raw.customer.telepon,
    address:          raw.customer.alamat,
    service:          raw.layanan.nama,
    weight:           `${raw.layanan.beratKg} kg`,
    totalPrice:       formatRupiah(raw.layanan.totalHarga),
    pickupTime:       formatJam(raw.layanan.waktuJemput),
    currentStage,
    note:         raw.catatan ?? '',
    fotoBuktiUrl: raw.foto_bukti_url ?? null,
  };
}

export async function fetchPesananAktif() {
  const res = await apiClient.get<PesananAktifResponse>('/api/driver/pesanan-aktif');
  return { orders: res.pesanan.map(mapActiveOrder) };
}

// ── Update Status ─────────────────────────────────────────────────────────────

export async function updatePesananStatus(
  id: string,
  action: 'terima' | 'tolak' | 'advance',
): Promise<{ success: boolean; message: string }> {
  return apiClient.patch(`/api/driver/pesanan/${id}/status`, { action });
}

export async function uploadFotoBukti(
  id_pesanan: string,
  foto_base64: string,
  mime_type = 'image/jpeg',
): Promise<{ success: boolean; message: string; data?: { foto_url: string } }> {
  return apiClient.patch(`/api/driver/pesanan/${id_pesanan}/bukti`, { foto_base64, mime_type });
}

// ── Profil ────────────────────────────────────────────────────────────────────

export type DriverProfilData = {
  profil: {
    id:             string;
    nama:           string;
    username:       string;
    email:          string;
    nomorTelepon:   string;
    alamat:         string;
    jenisKendaraan: string;
    platNomor:      string;
    inisial:        string;
  };
  statistik: {
    totalPesanan:   number;
    pesananSelesai: number;
    pesananAktif:   number;
    totalPendapatan: number;
    pelangganAktif: number;
  };
  aktivitasTerbaru: {
    id:      string;
    tipe:    string;
    pesan:   string;
    waktu:   string | null;
    nominal: number;
    urutan:  number;
  }[];
};

export async function fetchProfilDriver(): Promise<DriverProfilData> {
  return apiClient.get<DriverProfilData>('/api/driver/profil');
}

export async function updateProfilDriver(
  fields: Partial<{ nama: string; nomorTelepon: string; alamat: string; platNomor: string }>,
): Promise<{ success: boolean; message: string }> {
  return apiClient.patch('/api/driver/profil', fields);
}

// ── Notifikasi ────────────────────────────────────────────────────────────────

export type DriverNotifikasi = {
  id:      string;
  tipe:    string;
  pesan:   string;
  waktu:   string | null;
  nominal: number;
};

export async function fetchNotifikasi(): Promise<{ notifikasi: DriverNotifikasi[] }> {
  return apiClient.get<{ notifikasi: DriverNotifikasi[] }>('/api/driver/notifikasi');
}

// ── Riwayat ───────────────────────────────────────────────────────────────────

export type DriverRiwayatResponse = {
  stats: DriverHistoryStats;
  riwayat: DriverHistoryOrder[];
};

export async function fetchRiwayatDriver(params?: {
  q?: string;
  status?: string;
}): Promise<DriverRiwayatResponse> {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '') as [string, string][],
      ).toString()
    : '';
  return apiClient.get<DriverRiwayatResponse>(`/api/driver/riwayat${qs ? `?${qs}` : ''}`);
}

// ── GPS Lokasi ────────────────────────────────────────────────────────────────

export async function updateLokasiKurir(
  lat: number,
  lng: number,
): Promise<{ success: boolean; message: string; skipped?: boolean }> {
  return apiClient.put('/api/driver/lokasi', { lat, lng });
}