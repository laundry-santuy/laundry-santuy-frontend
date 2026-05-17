"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  PencilLine,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  createOutletServiceId,
  getOutletServiceIcon,
  outletServiceIconOptions,
  suggestOutletServiceIconKey,
  type OutletService,
  type OutletServiceIconKey,
} from "@/lib/outlet-services";
import { AdminDialog } from "../admin-dialog";
import {
  AdminIconButton,
} from "../admin-table-tools";
import {
  AdminPanel,
  adminControlClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
} from "../admin-page";

type OutletServicesPanelProps = {
  services: OutletService[];
  onChange: (services: OutletService[]) => void;
};

type ServiceDraft = {
  id: string | null;
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
};

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createDraft(service?: OutletService): ServiceDraft {
  return {
    id: service?.id ?? null,
    name: service?.name ?? "",
    description:
      service?.description ?? "Tambahkan deskripsi singkat untuk layanan ini.",
    price: service ? String(service.price) : "7000",
    unit: service?.unit ?? "kg",
    eta: service?.eta ?? "2 hari",
    badge: service?.badge ?? "Baru",
    minQuantity: service ? String(service.minQuantity) : "1",
    maxQuantity: service ? String(service.maxQuantity) : "12",
    step: service ? String(service.step) : "0.5",
    iconKey:
      service?.iconKey ??
      suggestOutletServiceIconKey(service?.name ?? "Layanan Baru"),
    active: service?.active ?? true,
  };
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
  onChange: (value: string) => void;
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
          onChange={(event) => onChange(event.target.value)}
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
  onChange: (value: string) => void;
  helper?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} helper={helper} className={className}>
      <span className="relative block">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  helper?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} helper={helper} className={className}>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(adminSelectClass, "pr-12")}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
  onChange: (value: boolean) => void;
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

export function OutletServicesPanel({
  services,
  onChange,
}: OutletServicesPanelProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(createDraft());
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services],
  );

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setError(null);
  };

  const startCreate = () => {
    setEditingId(null);
    setDraft(createDraft());
    setError(null);
    setOpen(true);
  };

  const startEdit = (service: OutletService) => {
    setEditingId(service.id);
    setDraft(createDraft(service));
    setError(null);
    setOpen(true);
  };

  const updateService = (serviceId: string, updater: (service: OutletService) => OutletService) => {
    onChange(
      services.map((service) => (service.id === serviceId ? updater(service) : service)),
    );
  };

  const toggleService = (serviceId: string) => {
    updateService(serviceId, (service) => ({
      ...service,
      active: !service.active,
    }));
  };

  const submitDraft = () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const eta = draft.eta.trim();
    const badge = draft.badge.trim() || "Baru";
    const price = Number(draft.price);
    const minQuantity = Number(draft.minQuantity);
    const maxQuantity = Number(draft.maxQuantity);
    const step = Number(draft.step);

    if (!name) {
      setError("Nama layanan harus diisi.");
      return;
    }

    if (!description) {
      setError("Deskripsi layanan harus diisi.");
      return;
    }

    if (!eta) {
      setError("Estimasi layanan harus diisi.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Harga harus berupa angka yang valid.");
      return;
    }

    if (!Number.isFinite(minQuantity) || minQuantity <= 0) {
      setError("Minimal jumlah harus lebih dari 0.");
      return;
    }

    if (!Number.isFinite(maxQuantity) || maxQuantity < minQuantity) {
      setError("Maksimal jumlah harus sama atau lebih besar dari minimal.");
      return;
    }

    if (!Number.isFinite(step) || step <= 0) {
      setError("Step harus lebih dari 0.");
      return;
    }

    const nextService: OutletService = {
      id: editingId ?? createOutletServiceId(name),
      name,
      description,
      price: Math.round(price),
      unit: draft.unit,
      eta,
      badge,
      minQuantity: Number(minQuantity.toFixed(2)),
      maxQuantity: Number(maxQuantity.toFixed(2)),
      step: Number(step.toFixed(2)),
      iconKey: draft.iconKey,
      active: draft.active,
    };

    if (editingId) {
      onChange(
        services.map((service) => (service.id === editingId ? nextService : service)),
      );
    } else {
      onChange([...services, nextService]);
    }

    closeDialog();
  };

  const dialogTitle = editingId ? `Edit ${draft.name || "layanan"}` : "Tambah layanan";

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
        {services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => {
              const Icon = getOutletServiceIcon(service.iconKey);
              const serviceActive = service.active;

              return (
                <div
                  key={service.id}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-4",
                    !serviceActive && "opacity-80",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(service)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        serviceActive
                          ? "bg-primary-50 text-primary-600"
                          : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[var(--odong-text)]">
                          {service.name}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold",
                            serviceActive
                              ? "bg-primary-50 text-primary-700"
                              : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                          )}
                        >
                          {serviceActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                        Harga: {formatCurrency(service.price)} • Durasi:{" "}
                        {service.eta}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <AdminIconButton
                      icon={PencilLine}
                      label={`Edit ${service.name}`}
                      tone="neutral"
                      onClick={() => startEdit(service)}
                    />
                    <button
                      type="button"
                      role="switch"
                      aria-checked={serviceActive}
                      aria-label={`${serviceActive ? "Nonaktifkan" : "Aktifkan"} ${service.name}`}
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                        serviceActive
                          ? "bg-primary-600"
                          : "bg-[var(--odong-surface-soft)]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
                          serviceActive ? "translate-x-6" : "translate-x-0",
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
              className={cn(
                adminPrimaryButtonClass,
                "mx-auto mt-5 inline-flex px-5",
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah layanan
            </button>
          </div>
        )}
      </AdminPanel>

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
          onSubmit={(event) => {
            event.preventDefault();
            submitDraft();
          }}
        >
          {error ? (
            <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nama layanan"
              value={draft.name}
              onChange={(value) =>
                setDraft((current) => ({ ...current, name: value }))
              }
              className="md:col-span-2"
            />
            <TextareaField
              label="Deskripsi"
              value={draft.description}
              onChange={(value) =>
                setDraft((current) => ({ ...current, description: value }))
              }
              className="md:col-span-2"
            />
            <TextField
              label="Harga"
              value={draft.price}
              onChange={(value) =>
                setDraft((current) => ({ ...current, price: value }))
              }
              type="number"
              helper="Tulis angka tanpa pemisah ribuan."
            />
            <TextField
              label="Estimasi"
              value={draft.eta}
              onChange={(value) =>
                setDraft((current) => ({ ...current, eta: value }))
              }
              helper="Contoh: 2 hari atau 6 jam."
            />
            <SelectField
              label="Unit"
              value={draft.unit}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  unit: value === "item" ? "item" : "kg",
                }))
              }
              options={[
                { value: "kg", label: "Kilogram" },
                { value: "item", label: "Per item" },
              ]}
            />
            <TextField
              label="Badge"
              value={draft.badge}
              onChange={(value) =>
                setDraft((current) => ({ ...current, badge: value }))
              }
              helper="Contoh: Hemat, Favorit, Baru."
            />
            <TextField
              label="Minimal"
              value={draft.minQuantity}
              onChange={(value) =>
                setDraft((current) => ({ ...current, minQuantity: value }))
              }
              type="number"
            />
            <TextField
              label="Maksimal"
              value={draft.maxQuantity}
              onChange={(value) =>
                setDraft((current) => ({ ...current, maxQuantity: value }))
              }
              type="number"
            />
            <TextField
              label="Step"
              value={draft.step}
              onChange={(value) =>
                setDraft((current) => ({ ...current, step: value }))
              }
              type="number"
              helper="Contoh 0.5 untuk kiloan."
            />
            <SelectField
              label="Ikon"
              value={draft.iconKey}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  iconKey:
                    outletServiceIconOptions.find(
                      (option) => option.key === value,
                    )?.key ?? "shirt",
                }))
              }
              options={outletServiceIconOptions.map((option) => ({
                value: option.key,
                label: option.label,
              }))}
              helper="Ikon ini dipakai di kartu layanan pada halaman user."
            />
            <SwitchField
              label="Aktifkan layanan"
              description="Layanan aktif akan tampil di halaman user."
              checked={draft.active}
              onChange={(value) =>
                setDraft((current) => ({ ...current, active: value }))
              }
              className="md:col-span-2"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-primary-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              className={adminSecondaryButtonClass}
            >
              Batal
            </button>
            <button type="submit" className={adminPrimaryButtonClass}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan layanan
            </button>
          </div>
        </form>
      </AdminDialog>
    </>
  );
}
