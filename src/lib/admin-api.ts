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
