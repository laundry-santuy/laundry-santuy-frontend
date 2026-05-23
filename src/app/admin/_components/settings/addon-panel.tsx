"use client";

import { useEffect, useState } from "react";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchAdminAddonList,
  createAdminAddon,
  updateAdminAddon,
  deleteAdminAddon,
  type AdminAddonItem,
} from "@/lib/admin-api";
import {
  AdminPanel,
  adminControlClass,
  adminSelectClass,
  adminPrimaryButtonClass,
} from "../admin-page";

const ICON_OPTIONS = [
  { key: "leaf",          label: "Pewangi / Aroma" },
  { key: "shield",        label: "Perlindungan" },
  { key: "truck",         label: "Pengiriman" },
  { key: "badge-percent", label: "Promo / Diskon" },
  { key: "sparkles",      label: "Premium" },
  { key: "star",          label: "Bintang" },
  { key: "package",       label: "Paket" },
  { key: "wind",          label: "Angin / Segar" },
];

const EMPTY_DRAFT = { nama: "", deskripsi: "", harga: "", icon_key: "sparkles" };

export function AddonManagementPanel() {
  const [addons, setAddons] = useState<AdminAddonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminAddonList()
      .then((r) => setAddons(r.addons))
      .catch(() => setFeedback({ tone: "error", message: "Gagal memuat add-on." }))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!draft.nama.trim()) {
      setFeedback({ tone: "error", message: "Nama add-on wajib diisi." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const result = await createAdminAddon({
        nama: draft.nama.trim(),
        deskripsi: draft.deskripsi || undefined,
        harga: Number(draft.harga) || 0,
        icon_key: draft.icon_key,
      });
      setAddons((prev) => [...prev, result.addon]);
      setDraft(EMPTY_DRAFT);
      setFeedback({ tone: "success", message: `"${result.addon.nama}" berhasil ditambahkan.` });
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Gagal menambahkan add-on." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (addon: AdminAddonItem) => {
    try {
      const result = await updateAdminAddon(addon.id_addon, { is_active: !addon.is_active });
      setAddons((prev) => prev.map((a) => (a.id_addon === addon.id_addon ? result.addon : a)));
    } catch {
      setFeedback({ tone: "error", message: "Gagal memperbarui status." });
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    try {
      await deleteAdminAddon(id);
      setAddons((prev) => prev.filter((a) => a.id_addon !== id));
      setFeedback({ tone: "success", message: `"${nama}" berhasil dihapus.` });
    } catch {
      setFeedback({ tone: "error", message: "Gagal menghapus add-on." });
    }
  };

  return (
    <AdminPanel
      title="Add-on Tersedia"
      description="Add-on aktif akan tampil di halaman order pelanggan."
      icon={PackagePlus}
    >
      <div className="space-y-3">
        {/* Form tambah */}
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Nama add-on"
            value={draft.nama}
            onChange={(e) => setDraft((d) => ({ ...d, nama: e.target.value }))}
            className={cn(adminControlClass, "sm:col-span-2")}
          />
          <input
            placeholder="Deskripsi singkat (opsional)"
            value={draft.deskripsi}
            onChange={(e) => setDraft((d) => ({ ...d, deskripsi: e.target.value }))}
            className={adminControlClass}
          />
          <input
            type="number"
            min={0}
            placeholder="Harga (Rp, 0 = Gratis)"
            value={draft.harga}
            onChange={(e) => setDraft((d) => ({ ...d, harga: e.target.value }))}
            className={adminControlClass}
          />
          <select
            value={draft.icon_key}
            onChange={(e) => setDraft((d) => ({ ...d, icon_key: e.target.value }))}
            className={cn(adminSelectClass, "sm:col-span-2")}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void handleCreate()}
          className={cn(adminPrimaryButtonClass, "w-full justify-center")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {saving ? "Menyimpan…" : "Tambah add-on"}
        </button>

        {feedback && (
          <p
            className={cn(
              "rounded-2xl border px-3 py-2 text-xs font-semibold",
              feedback.tone === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-600",
            )}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {/* Daftar */}
      <div className="mt-4">
        {loading ? (
          <p className="text-xs text-[var(--odong-muted)]">Memuat…</p>
        ) : addons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4 text-center">
            <p className="text-xs font-semibold text-[var(--odong-muted)]">
              Belum ada add-on. Tambahkan di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--odong-border)] overflow-hidden rounded-2xl border border-[var(--odong-border)]">
            {addons.map((addon) => (
              <div
                key={addon.id_addon}
                className="flex items-center justify-between gap-3 bg-[var(--odong-surface-muted)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    {addon.nama}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--odong-muted)]">
                    {addon.harga > 0
                      ? `Rp${addon.harga.toLocaleString("id-ID")}`
                      : "Gratis"}
                    {addon.deskripsi ? ` · ${addon.deskripsi}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {/* toggle aktif/nonaktif */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={addon.is_active}
                    aria-label={`${addon.is_active ? "Nonaktifkan" : "Aktifkan"} ${addon.nama}`}
                    onClick={() => void handleToggle(addon)}
                    className={cn(
                      "flex h-7 w-12 items-center rounded-full p-0.5 transition",
                      addon.is_active ? "bg-primary-600" : "bg-[var(--odong-surface-soft)]",
                    )}
                  >
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_4px_8px_rgba(25,28,29,0.12)] transition",
                        addon.is_active ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                  {/* hapus */}
                  <button
                    type="button"
                    aria-label={`Hapus ${addon.nama}`}
                    onClick={() => void handleDelete(addon.id_addon, addon.nama)}
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPanel>
  );
}
