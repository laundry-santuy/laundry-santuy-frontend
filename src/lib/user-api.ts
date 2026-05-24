import { apiClient } from './api-client';

// ── Response types ────────────────────────────────────────────────────────────

export type BerandaResponse = {
  profilPengguna: {
    id: string;
    nama: string;
    username: string;
    role: string;
    inisial: string;
    alamat: string | null;
  };
  promoHariIni: {
    judul: string;
    deskripsi: string;
    isActive: boolean;
  } | null;
  statsBeranda: {
    ratingKurir: number | null;
    estimasiPickup: string;
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
    metodePembayaran: string | null;
    statusPembayaran: string | null;
    progress: { label: string; completed: boolean }[];
    kurir: {
      nama: string;
      role: string;
      rating: number;
      kendaraan: string;
      noPolisi: string;
      noTelepon: string | null;
      canCall: boolean;
      canChat: boolean;
    } | null;
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
  layananPopuler: {
    id_layanan: string;
    nama: string;
    harga: number;
    satuan: string;
    tipe: string;
    durasi: string | null;
    deskripsi: string | null;
    icon_key: string | null;
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
    id: string;
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
    outletLat?: number | null;
    outletLng?: number | null;
    kurirLat?: number | null;
    kurirLng?: number | null;
    userLat?: number | null;
    userLng?: number | null;
  } | null;
  semuaPesananAktif: {
    id_pesanan: string;
    kodePesanan: string;
    namaLayanan: string;
    status: string;
    berat: number;
    total: number;
    waktu: string | null;
    progress: number;
  }[];
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
    waktuJemput: string | null;
    catatan: string | null;
    alamatPenjemputan: string | null;
    metodePembayaran: string | null;
    namaKurir: string | null;
    statusPembayaran: string | null;
    fotoBuktiUrl: string | null;
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
  metode_pembayaran?: string;
  addon_ids?: string[];
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
  if (!value) return 'Rp0';
  return `Rp${value.toLocaleString('id-ID')}`;
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

export type AddonTersediaItem = {
  id_addon: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  icon_key: string | null;
};

export type PesanResponse = {
  pilihLayanan: {
    items: PesanLayananItem[];
  };
  outletTersedia: {
    id_laundry: string;
    nama: string;
    alamat: string | null;
    jarak_km: number | null;
    jam_mulai: string | null;
    jam_selesai: string | null;
    jam_operasional: string | null;
    is_open: boolean;
    is_tutup_sementara: boolean;
    jumlah_kurir: number;
    kapasitas_persen: number;
    sisa_kapasitas: number;
    max_kapasitas: number;
    nama_bank: string | null;
    nomor_rekening: string | null;
    atas_nama: string | null;
    qris_url: string | null;
  }[];
  addonTersedia: AddonTersediaItem[];
  alamatPickupUser: string | null;
  infoPickup: {
    estimasiPickup: string;
    biayaPickup: number;
    minGratisPickup: number;
  };
};

export type PromoApiItem = {
  id: string;
  kode: string;
  diskon_persen: number | null;
  diskon_nominal: number | null;
  min_pembelian: number;
  tanggal_berakhir: string;
};

export type PromoAktifResponse = {
  promos: PromoApiItem[];
};

export async function fetchBeranda(): Promise<BerandaResponse> {
  return apiClient.get<BerandaResponse>('/api/user/beranda');
}

export async function konfirmasiBayarUser(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.patch(`/api/user/pesanan/${id}/konfirmasi-bayar`, {});
}

export type RekomendasiAIResponse = {
  rekomendasiLayanan: string;
  badge: string;
  insight: string;
  estimasiWaktu: string;
  source: 'ai' | 'fallback';
};

export async function fetchRekomendasiAI(): Promise<RekomendasiAIResponse> {
  return apiClient.get<RekomendasiAIResponse>('/api/user/rekomendasi');
}

export async function fetchPromoAktif(): Promise<PromoAktifResponse> {
  return apiClient.get<PromoAktifResponse>('/api/user/promo');
}

export async function fetchPesan(): Promise<PesanResponse> {
  return apiClient.get<PesanResponse>('/api/user/pesan');
}

export async function fetchLacak(id_pesanan?: string): Promise<LacakResponse> {
  const qs = id_pesanan ? `?id_pesanan=${encodeURIComponent(id_pesanan)}` : '';
  return apiClient.get<LacakResponse>(`/api/user/lacak${qs}`);
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

export type AlamatItem = {
  id: string;
  label: string;
  alamat: string;
  lat: number | null;
  lng: number | null;
  is_utama: boolean;
};

export type AlamatListResponse = { alamat: AlamatItem[] };

export async function fetchAlamatList(): Promise<AlamatListResponse> {
  return apiClient.get<AlamatListResponse>('/api/user/alamat');
}

export async function addAlamat(body: { label: string; alamat: string; lat?: number | null; lng?: number | null; is_utama?: boolean }): Promise<{ message: string; data: AlamatItem }> {
  return apiClient.post<{ message: string; data: AlamatItem }>('/api/user/alamat', body);
}

export async function updateAlamat(id: string, body: { label: string; alamat: string; lat?: number | null; lng?: number | null }): Promise<{ message: string; data: AlamatItem }> {
  return apiClient.put<{ message: string; data: AlamatItem }>(`/api/user/alamat/${id}`, body);
}

export async function deleteAlamat(id: string): Promise<{ message: string }> {
  return apiClient.del<{ message: string }>(`/api/user/alamat/${id}`);
}

export async function setAlamatUtama(id: string): Promise<{ message: string }> {
  return apiClient.put<{ message: string }>(`/api/user/alamat/${id}/utama`, {});
}

export type EtaAIResponse = {
  id_pesanan: string;
  estimasiMenit: number;
  label: string;
  status: string;
  source: 'ai';
  faktor: { peak: number; speed: number };
};

export async function fetchEtaAI(id_pesanan: string): Promise<EtaAIResponse> {
  return apiClient.get<EtaAIResponse>(`/api/user/eta/${id_pesanan}`);
}

export type KurirPosisiResponse = {
  lat: number | null;
  lng: number | null;
  updatedAt: string | null;
};

export async function fetchKurirPosisi(id_kurir: string): Promise<KurirPosisiResponse> {
  return apiClient.get<KurirPosisiResponse>(`/api/user/kurir-posisi/${id_kurir}`);
}