"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  PencilLine,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getOutletServiceIcon,
  outletServiceIconOptions,
  suggestOutletServiceIconKey,
  type OutletServiceIconKey,
} from "@/lib/outlet-services";
import { ApiError } from "@/lib/api-client";
import {
  backendToOutletService,
  createLayanan,
  deleteLayanan,
  fetchPengaturanOutlet,
  updateLayanan,
  type LayananBackend,
} from "@/lib/admin-api";
import { AdminDialog } from "../admin-dialog";
import { AdminIconButton } from "../admin-table-tools";
import {
  AdminPanel,
  adminControlClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
} from "../admin-page";

// ── Draft types ───────────────────────────────────────────────────────────────

type ServiceDraft = {
  name: string;
  description: string;
  price: string;
  unit: "kg" | "item";
  eta: string;
  badge: string;
  minQuantity: string;
  maxQuantity: string;
  step: string;
  iconKey: OutletServiceIconKey;
  active: boolean;
  applyToAll?: boolean;
};

function emptyDraft(): ServiceDraft {
  return {
    name: "",
    description: "Tambahkan deskripsi singkat untuk layanan ini.",
    price: "7000",
    unit: "kg",
    eta: "2 hari",
    badge: "KILOAN",
    minQuantity: "1",
    maxQuantity: "12",
    step: "0.5",
    iconKey: "shirt",
    active: true,
    applyToAll: false,
  };
}

function draftFromBackend(layanan: LayananBackend): ServiceDraft {
  return {
    name: layanan.namaLayanan,
    description: layanan.deskripsi ?? "Layanan laundry berkualitas.",
    price: String(layanan.harga),
    unit: layanan.satuan,
    eta: layanan.durasi || "2 hari",
    badge: layanan.tipe,
    minQuantity: String(layanan.minQuantity ?? 1),
    maxQuantity: String(layanan.maxQuantity ?? 12),
    step: String(layanan.stepQuantity ?? 0.5),
    iconKey: layanan.iconKey ?? suggestOutletServiceIconKey(layanan.namaLayanan),
    active: layanan.isActive,
  };
}

// ── Small form field components ───────────────────────────────────────────────

function FieldPencil({ multiline = false }: { multiline?: boolean }) {
  return (
    <PencilLine
      className={cn(
        "pointer-events-none absolute right-4 h-4 w-4 text-primary-600",
        multiline ? "top-4" : "top-1/2 -translate-y-1/2",
      )}
      aria-hidden="true"
    />
  );
}

function FieldLabel({
  label,
  helper,
  children,
  className,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-extrabold text-[var(--odong-text)]">
        {label}
      </span>
      {children}
      {helper ? (
        <p className="text-xs font-semibold leading-5 text-[var(--odong-muted)]">
          {helper}
        </p>
      ) : null}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  helper,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  type?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} helper={helper} className={className}>
      <span className="relative block">
        <input
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "any" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(adminControlClass, "pr-12")}
        />
        <FieldPencil />
      </span>
    </FieldLabel>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  helper,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} helper={helper} className={className}>
      <span className="relative block">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(adminControlClass, "h-28 resize-none py-3 pr-12")}
        />
        <FieldPencil multiline />
      </span>
    </FieldLabel>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  helper,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  helper?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} helper={helper} className={className}>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(adminSelectClass, "pr-12")}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <FieldPencil />
      </span>
    </FieldLabel>
  );
}

function SwitchField({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-[24px] border border-primary-100 bg-[var(--odong-surface-muted)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-extrabold leading-tight text-[var(--odong-text)]">
          {label}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted)]">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? "Nonaktifkan" : "Aktifkan"} ${label}`}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
          checked ? "bg-primary-600" : "bg-[var(--odong-surface-soft)]",
        )}
      >
        <span
          className={cn(
            "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] ring-1 ring-white/80 transition",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Main component ────────────────────────────────────────────────────────────

export function OutletServicesPanel() {
  const [backendLayanan, setBackendLayanan] = useState<LayananBackend[]>([]);
  const [loadStatus, setLoadStatus] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => backendLayanan.filter((s) => s.isActive).length,
    [backendLayanan],
  );

  const load = useCallback(() => {
    setLoadStatus("loading");
    setLoadError(null);
    fetchPengaturanOutlet()
      .then((data) => {
        setBackendLayanan(data.layananOutlet);
        setLoadStatus("ready");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setLoadError("Outlet belum terdaftar di database. Pastikan outlet sudah dibuat terlebih dahulu.");
        } else {
          setLoadError(null);
        }
        setLoadStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setFormError(null);
    setSaving(false);
  };

  const startCreate = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setFormError(null);
    setOpen(true);
  };

  const startEdit = (layanan: LayananBackend) => {
    setDraft(draftFromBackend(layanan));
    setEditingId(layanan.id_layanan);
    setFormError(null);
    setOpen(true);
  };

  const handleToggle = async (layanan: LayananBackend) => {
    const toggled = { ...layanan, isActive: !layanan.isActive };
    const nextList = backendLayanan.map((s) =>
      s.id_layanan === layanan.id_layanan ? toggled : s,
    );
    setBackendLayanan(nextList);

    try {
      await updateLayanan(layanan.id_layanan, { is_active: toggled.isActive });
    } catch {
      setBackendLayanan(backendLayanan);
    }
  };

  const handleDelete = async (id: string) => {
    const nextList = backendLayanan.filter((s) => s.id_layanan !== id);
    setBackendLayanan(nextList);
    setConfirmDeleteId(null);

    try {
      await deleteLayanan(id);
    } catch {
      load();
    }
  };

  const submitDraft = async () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const eta = draft.eta.trim() || "2 hari";
    const badge = draft.badge.trim() || "KILOAN";
    const price = Number(draft.price);
    const minQuantity = Number(draft.minQuantity);
    const maxQuantity = Number(draft.maxQuantity);
    const step = Number(draft.step);

    if (!name) { setFormError("Nama layanan harus diisi."); return; }
    if (!description) { setFormError("Deskripsi harus diisi."); return; }
    if (!Number.isFinite(price) || price <= 0) { setFormError("Harga harus berupa angka yang valid."); return; }
    if (!Number.isFinite(minQuantity) || minQuantity <= 0) { setFormError("Minimal jumlah harus lebih dari 0."); return; }
    if (!Number.isFinite(maxQuantity) || maxQuantity < minQuantity) { setFormError("Maksimal harus ≥ minimal."); return; }
    if (!Number.isFinite(step) || step <= 0) { setFormError("Step harus lebih dari 0."); return; }

    setSaving(true);
    setFormError(null);

    const body = {
      nama_layanan: name,
      harga_satuan: Math.round(price),
      satuan: draft.unit,
      tipe: badge,
      durasi: eta,
      deskripsi: description,
      icon_key: draft.iconKey,
      min_quantity: Math.max(minQuantity, 0.5),
      max_quantity: Math.max(maxQuantity, 1),
      step_quantity: Math.max(step, 0.5),
    };

    try {
      if (editingId) {
        await updateLayanan(editingId, body);
        setBackendLayanan((prev) =>
          prev.map((s) =>
            s.id_layanan === editingId
              ? {
                  ...s,
                  namaLayanan: name,
                  harga: Math.round(price),
                  satuan: draft.unit,
                  tipe: badge,
                  durasi: eta,
                  deskripsi: description,
                  iconKey: draft.iconKey,
                  minQuantity: Math.max(minQuantity, 0.5),
                  maxQuantity: Math.max(maxQuantity, 1),
                  stepQuantity: Math.max(step, 0.5),
                }
              : s,
          ),
        );
      } else {
        // include apply_to_all flag when creating
        if (draft.applyToAll) {
          // @ts-ignore - server accepts apply_to_all flag
          body.apply_to_all = true;
        }
        const result = await createLayanan(body);
        const newId = result.data.id_layanan;
        const newService: LayananBackend = {
          id_layanan: newId,
          namaLayanan: name,
          harga: Math.round(price),
          satuan: draft.unit,
          tipe: badge,
          durasi: eta,
          isActive: draft.active,
          deskripsi: description,
          iconKey: draft.iconKey,
          minQuantity: Math.max(minQuantity, 0.5),
          maxQuantity: Math.max(maxQuantity, 1),
          stepQuantity: Math.max(step, 0.5),
        };
        setBackendLayanan((prev) => [...prev, newService]);

        if (!draft.active) {
          await updateLayanan(newId, { is_active: false }).catch(() => {});
        }
      }
      closeDialog();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan layanan.");
    } finally {
      setSaving(false);
    }
  };

  const dialogTitle = editingId
    ? `Edit ${draft.name || "layanan"}`
    : "Tambah layanan";

  const serviceToDelete = confirmDeleteId
    ? backendLayanan.find((s) => s.id_layanan === confirmDeleteId)
    : null;

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loadStatus === "loading") {
    return (
      <AdminPanel
        title="Layanan Outlet"
        description="Memuat data layanan..."
        icon={Sparkles}
      >
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-[24px] bg-[var(--odong-surface-muted)]"
            />
          ))}
        </div>
      </AdminPanel>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (loadStatus === "error") {
    return (
      <AdminPanel
        title="Layanan Outlet"
        description="Gagal memuat data layanan."
        icon={Sparkles}
      >
        <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-5 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-extrabold text-rose-700">
            {loadError ? "Outlet tidak ditemukan" : "Tidak bisa terhubung ke server"}
          </p>
          <p className="mt-1 text-xs text-rose-500">
            {loadError ?? "Cek koneksi atau coba muat ulang halaman."}
          </p>
          <button
            type="button"
            onClick={load}
            className={cn(adminSecondaryButtonClass, "mx-auto mt-4 inline-flex")}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      </AdminPanel>
    );
  }

  // ── Ready ───────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminPanel
        title="Layanan Outlet"
        description={`Kelola layanan yang tersedia di outlet. ${activeCount} layanan aktif.`}
        icon={Sparkles}
        actions={
          <AdminIconButton
            icon={Plus}
            label="Tambah layanan"
            tone="primary"
            onClick={startCreate}
          />
        }
      >
        {backendLayanan.length > 0 ? (
          <div className="space-y-3">
            {backendLayanan.map((layanan) => {
              const service = backendToOutletService(layanan);
              const Icon = getOutletServiceIcon(service.iconKey);
              const isActive = layanan.isActive;

              return (
                <div
                  key={layanan.id_layanan}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-4",
                    !isActive && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(layanan)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[var(--odong-text)]">
                          {layanan.namaLayanan}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold",
                            isActive
                              ? "bg-primary-50 text-primary-700"
                              : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                          )}
                        >
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                        {formatCurrency(layanan.harga)} • {layanan.tipe} • {layanan.durasi || "—"}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <AdminIconButton
                      icon={Trash2}
                      label={`Hapus ${layanan.namaLayanan}`}
                      tone="danger"
                      onClick={() => setConfirmDeleteId(layanan.id_layanan)}
                    />
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${layanan.namaLayanan}`}
                      onClick={() => handleToggle(layanan)}
                      className={cn(
                        "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                        isActive ? "bg-primary-600" : "bg-[var(--odong-surface-soft)]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
                          isActive ? "translate-x-6" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-8 text-center">
            <p className="text-sm font-extrabold text-[var(--odong-text)]">
              Belum ada layanan
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
              Tambahkan layanan pertama lewat tombol plus di pojok kanan atas.
            </p>
            <button
              type="button"
              onClick={startCreate}
              className={cn(adminPrimaryButtonClass, "mx-auto mt-5 inline-flex px-5")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah layanan
            </button>
          </div>
        )}
      </AdminPanel>

      {/* Add / Edit dialog */}
      <AdminDialog
        open={open}
        title={dialogTitle}
        description="Isi detail layanan yang nantinya tampil di halaman user."
        onClose={closeDialog}
        size="lg"
        tone="panel"
      >
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            submitDraft();
          }}
        >
          {formError ? (
            <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nama layanan"
              value={draft.name}
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              className="md:col-span-2"
            />
            <TextareaField
              label="Deskripsi"
              value={draft.description}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              className="md:col-span-2"
            />
            <TextField
              label="Harga (Rp)"
              value={draft.price}
              onChange={(v) => setDraft((d) => ({ ...d, price: v }))}
              type="number"
              helper="Tulis angka tanpa pemisah ribuan."
            />
            <TextField
              label="Estimasi"
              value={draft.eta}
              onChange={(v) => setDraft((d) => ({ ...d, eta: v }))}
              helper="Contoh: 2 hari atau 6 jam."
            />
            <SelectField
              label="Unit"
              value={draft.unit}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  unit: v === "item" ? "item" : "kg",
                }))
              }
              options={[
                { value: "kg", label: "Kilogram" },
                { value: "item", label: "Per item" },
              ]}
            />
            <TextField
              label="Tipe / Badge"
              value={draft.badge}
              onChange={(v) => setDraft((d) => ({ ...d, badge: v }))}
              helper="Contoh: KILOAN, EXPRESS, SATUAN, atau teks bebas."
            />
            <TextField
              label="Minimal"
              value={draft.minQuantity}
              onChange={(v) => setDraft((d) => ({ ...d, minQuantity: v }))}
              type="number"
            />
            <TextField
              label="Maksimal"
              value={draft.maxQuantity}
              onChange={(v) => setDraft((d) => ({ ...d, maxQuantity: v }))}
              type="number"
            />
            <TextField
              label="Step"
              value={draft.step}
              onChange={(v) => setDraft((d) => ({ ...d, step: v }))}
              type="number"
              helper="Contoh: 0.5 untuk kiloan."
            />
            <SelectField
              label="Ikon"
              value={draft.iconKey}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  iconKey:
                    outletServiceIconOptions.find((o) => o.key === v)?.key ??
                    "shirt",
                }))
              }
              options={outletServiceIconOptions.map((o) => ({
                value: o.key,
                label: o.label,
              }))}
              helper="Ikon ini dipakai di kartu layanan halaman user."
            />
            <SwitchField
              label="Aktifkan layanan"
              description="Layanan aktif akan tampil di halaman user."
              checked={draft.active}
              onChange={(v) => setDraft((d) => ({ ...d, active: v }))}
              className="md:col-span-2"
            />
            <SwitchField
              label="Terapkan ke semua outlet"
              description="Buat layanan ini tersedia di semua outlet yang dimiliki admin ini."
              checked={draft.applyToAll ?? false}
              onChange={(v) => setDraft((d) => ({ ...d, applyToAll: v }))}
              className="md:col-span-2"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-primary-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={saving}
              className={adminSecondaryButtonClass}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={adminPrimaryButtonClass}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? "Menyimpan..." : "Simpan layanan"}
            </button>
          </div>
        </form>
      </AdminDialog>

      {/* Confirm delete dialog */}
      <AdminDialog
        open={Boolean(confirmDeleteId)}
        title="Hapus layanan?"
        description={`"${serviceToDelete?.namaLayanan ?? ""}" akan dihapus permanen dari outlet.`}
        onClose={() => setConfirmDeleteId(null)}
        size="sm"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirmDeleteId(null)}
            className={adminSecondaryButtonClass}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[20px] bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Hapus
          </button>
        </div>
      </AdminDialog>
    </>
  );
}
