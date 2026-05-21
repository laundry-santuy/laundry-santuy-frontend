import { apiClient } from './api-client';

// ── Response types ────────────────────────────────────────────────────────────

export type BerandaResponse = {
  profilPengguna: {
    id: string;
    nama: string;
    username: string;
    role: string;
    inisial: string;
  };
  promoHariIni: {
    judul: string;
    deskripsi: string;
    isActive: boolean;
  };
  ringkasan: {
    totalPesanan: number;
    pesananAktif: number;
    pesananSelesai: number;
    totalLayanan: number;
  };
  pesananAktif: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    berat: number;
    total: number;
    status: string;
    eta: string;
    progress: { label: string; completed: boolean }[];
    kurir: {
      nama: string;
      role: string;
      rating: number;
      kendaraan: string;
      noPolisi: string;
    };
  } | null;
  pesananTerbaru: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    berat: number;
    total: number;
    status: string;
    waktu: string | null;
  }[];
};

export type LacakResponse = {
  header: { title: string; subtitle: string };
  pesananAktif: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    berat: number;
    total: number;
    status: string;
    waktu: string | null;
  } | null;
  statusPerjalanan: {
    label: string;
    sublabel: string;
    time: string;
    completed: boolean;
    active: boolean;
  }[];
  detailPesanan: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    namaOutlet: string | null;
    berat: number;
    total: number;
    status: string;
    waktu: string | null;
  } | null;
  infoKurir: {
    inisial: string;
    nama: string;
    rating: number;
    totalOrder: number;
    kendaraan: string;
  } | null;
  alamatPenjemputan: { label: string; alamat: string } | null;
  petaTracking: {
    jarakKm: number;
    estimasiTibaMenit: number;
  } | null;
  riwayatSingkat: {
    id_pesanan: string;
    kodePesanan: string;
    status: string;
    waktu: string | null;
  }[];
  pesan?: string;
};

export type RiwayatResponse = {
  kartuRingkasan: {
    totalPesanan: number;
    selesai: number;
    totalPengeluaran: number;
  };
  riwayat: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    outlet: string;
    berat: number;
    total: number;
    status: string;
    waktu: string | null;
  }[];
};

export type ProfilResponse = {
  profilCard: {
    id: string;
    nama: string;
    username: string;
    email: string;
    noTelepon: string | null;
    alamat: string | null;
    role: string;
    inisial: string;
  };
  statistik: {
    order: number;
    pesananAktif: number;
    pesananSelesai: number;
    rating: number;
  };
  alamatSaya: {
    label: string;
    alamat: string;
    editable: boolean;
  };
};

export type UpdateProfilBody = {
  nama_pengguna?: string;
  no_telepon?: string;
  alamat?: string;
};

export type CreatePesananBody = {
  id_layanan: string;
  id_laundry: string;
  berat: number;
  tanggal_penjemputan?: string;
  waktu_penjemputan?: string;
  catatan?: string;
  alamat_penjemputan?: string;
};

export type CreatePesananResponse = {
  message: string;
  pesanan: {
    id_pesanan: string | null;
    kodePesanan: string | null;
    status: string;
    totalEstimasi: number;
    berat: number;
    layanan: { id_layanan: string; nama: string; harga: number; satuan: string };
    outlet: { id_laundry: string; nama: string; alamat: string | null };
    catatan: string | null;
    alamatPenjemputan: string | null;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function mapBeStatus(status: string): string {
  const s = (status ?? '').toString().toLowerCase().trim();
  if (s.includes('selesai') || s.includes('done') || s.includes('completed')) return 'Selesai';
  if (s.includes('batal') || s.includes('cancel')) return 'Dibatalkan';
  if (s.includes('siap') || s.includes('antar') || s.includes('delivery')) return 'Siap Diambil';
  return 'Diproses';
}

export function formatWaktu(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function formatRupiah(value: number): string {
  if (!value) return 'Rp 0';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

// ── API functions ─────────────────────────────────────────────────────────────

export type PesanLayananItem = {
  id_layanan: string;
  nama: string;
  harga: number;
  satuan: string;
  tipe: string;
  durasi: string;
  id_laundry: string;
  deskripsi: string | null;
  icon_key: string | null;
  min_quantity: number;
  max_quantity: number;
  step_quantity: number;
};

export type PesanResponse = {
  pilihLayanan: {
    items: PesanLayananItem[];
  };
  outletTersedia: {
    id_laundry: string;
    nama: string;
    alamat: string | null;
  }[];
};

export async function fetchBeranda(): Promise<BerandaResponse> {
  return apiClient.get<BerandaResponse>('/api/user/beranda');
}

export async function fetchPesan(): Promise<PesanResponse> {
  return apiClient.get<PesanResponse>('/api/user/pesan');
}

export async function fetchLacak(): Promise<LacakResponse> {
  return apiClient.get<LacakResponse>('/api/user/lacak');
}

export async function fetchRiwayat(params?: {
  status?: string;
  q?: string;
}): Promise<RiwayatResponse> {
  const qs = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null) as [string, string][],
      ).toString()
    : '';
  return apiClient.get<RiwayatResponse>(`/api/user/riwayat${qs ? `?${qs}` : ''}`);
}

export async function fetchProfilUser(): Promise<ProfilResponse> {
  return apiClient.get<ProfilResponse>('/api/user/profil');
}

export async function createPesanan(body: CreatePesananBody): Promise<CreatePesananResponse> {
  return apiClient.post<CreatePesananResponse>('/api/user/pesanan', body);
}

export async function updateProfilUser(body: UpdateProfilBody): Promise<{ message: string; data: unknown }> {
  return apiClient.put('/api/user/profil', body);
}