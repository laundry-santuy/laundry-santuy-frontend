"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Bike,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  PencilLine,
  Phone,
  Sparkles,
  TrendingUp,
  UsersRound,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  DriverProfileEmptyState,
  DriverProfileErrorState,
  DriverProfileLoadingState,
} from "./profile-states";
import type { DriverPageStatus } from "../types";
import {
  fetchProfilDriver,
  formatRupiah,
  formatWaktuRelatif,
  updateProfilDriver,
  type DriverProfilData,
} from "@/lib/driver-api";
import { useDriverToast } from "@/hooks/use-driver-toast";
import { DriverToastList } from "@/components/ui/driver-toast";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function DisplayField({
  label,
  value,
  icon: Icon,
  fullWidth,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("space-y-2", fullWidth && "md:col-span-2")}>
      <p className="text-sm font-bold text-[var(--odong-text)]">{label}</p>
      <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 shadow-[0_8px_18px_rgba(25,28,29,0.03)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-[var(--odong-muted)] sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  icon: Icon,
  fullWidth,
  fieldKey,
  onSave,
  isSaving,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  fullWidth?: boolean;
  fieldKey: string;
  onSave: (key: string, val: string) => Promise<void>;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const handleSave = async () => {
    if (draft.trim() === value) { setEditing(false); return; }
    await onSave(fieldKey, draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className={cn("space-y-2", fullWidth && "md:col-span-2")}>
      <p className="text-sm font-bold text-[var(--odong-text)]">{label}</p>
      {editing ? (
        <div className="rounded-2xl border border-primary-300 bg-[var(--odong-surface-strong)] px-4 py-3 shadow-[0_8px_18px_rgba(0,88,202,0.07)]">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--odong-text)] outline-none sm:text-base"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 rounded-full border border-[var(--odong-border)] px-3 text-xs font-bold text-[var(--odong-muted)] transition hover:bg-[var(--odong-surface-muted)] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 rounded-full bg-primary-600 px-3 text-xs font-bold text-white shadow-[0_4px_10px_rgba(0,88,202,0.20)] transition hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3 pr-12 shadow-[0_8px_18px_rgba(25,28,29,0.03)]">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-[var(--odong-text)] sm:text-base">
              {value}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Edit ${label}`}
            onClick={() => { setDraft(value); setEditing(true); }}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary-100 bg-white/80 text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
          >
            <PencilLine className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

type StatTone = "primary" | "emerald" | "tertiary";

const statCardTone: Record<StatTone, { icon: string; line: string }> = {
  primary:  { icon: "bg-primary-500 text-white",  line: "text-primary-600"  },
  emerald:  { icon: "bg-emerald-500 text-white",  line: "text-emerald-600"  },
  tertiary: { icon: "bg-tertiary-500 text-white", line: "text-tertiary-600" },
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: StatTone;
}) {
  return (
    <article className="rounded-[30px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--odong-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            statCardTone[tone].icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className={cn("mt-4 inline-flex items-center gap-2 text-sm font-bold", statCardTone[tone].line)}>
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        {description}
      </p>
    </article>
  );
}

type ActivityTone = "success" | "warning" | "primary";

const activityTone: Record<ActivityTone, { icon: string; value: string }> = {
  success: { icon: "bg-emerald-50 text-emerald-600", value: "text-[var(--odong-text)]" },
  warning: { icon: "bg-amber-50 text-amber-600",     value: "text-[var(--odong-text)]" },
  primary: { icon: "bg-primary-50 text-primary-600", value: "text-[var(--odong-text)]" },
};

function ActivityRow({
  title,
  time,
  rightValue,
  rightCaption,
  icon: Icon,
  tone,
}: {
  title: string;
  time: string;
  icon: LucideIcon;
  rightValue?: string;
  rightCaption?: string;
  tone: ActivityTone;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-4 shadow-[0_14px_34px_rgba(25,28,29,0.045)] transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            activityTone[tone].icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[var(--odong-text)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">{time}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-end gap-3 sm:flex-col sm:items-end">
        {rightValue ? (
          <div className="text-right">
            <p className={cn("text-base font-extrabold", activityTone[tone].value)}>
              {rightValue}
            </p>
            {rightCaption ? (
              <p className="text-sm text-[var(--odong-muted)]">{rightCaption}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DriverProfilePage() {
  const [data, setData]             = useState<DriverProfilData | null>(null);
  const [pageStatus, setPageStatus] = useState<DriverPageStatus>("loading");
  const [isSaving, setIsSaving]     = useState(false);
  const { toasts, toast, dismiss }  = useDriverToast();

  useEffect(() => {
    let cancelled = false;
    setPageStatus("loading");

    fetchProfilDriver()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setPageStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setPageStatus("error");
      });

    return () => { cancelled = true; };
  }, []);

  const handleSaveField = async (fieldKey: string, value: string) => {
    setIsSaving(true);
    try {
      const res = await updateProfilDriver({ [fieldKey]: value });
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, profil: { ...prev.profil, [fieldKey]: value } };
      });
      toast(res.message, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan perubahan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const accountFields = useMemo(() => {
    if (!data) return [];
    const { profil } = data;
    return [
      { label: "Nama Akun",       value: profil.nama,           icon: UserRound,  fullWidth: true, editable: true,  fieldKey: "nama"          },
      { label: "Email",           value: profil.email,          icon: Mail,                        editable: false                              },
      { label: "Nomor Telepon",   value: profil.nomorTelepon,   icon: Phone,                       editable: true,  fieldKey: "nomorTelepon"  },
      { label: "Alamat",          value: profil.alamat,         icon: MapPin,     fullWidth: true, editable: true,  fieldKey: "alamat"        },
      { label: "Jenis Kendaraan", value: profil.jenisKendaraan, icon: Bike,                        editable: false                              },
      { label: "Plat Nomor",      value: profil.platNomor,      icon: BadgeCheck,                  editable: true,  fieldKey: "platNomor"     },
    ];
  }, [data]);

  const profileStats = useMemo(() => {
    if (!data) return [];
    const { statistik } = data;
    return [
      {
        label:       "Total Pesanan",
        value:       statistik.totalPesanan.toString(),
        description: `${statistik.pesananSelesai} selesai`,
        icon:        PackageCheck,
        tone:        "primary"  as const,
      },
      {
        label:       "Total Pendapatan",
        value:       formatRupiah(statistik.totalPendapatan),
        description: `dari ${statistik.pesananSelesai} order selesai`,
        icon:        CircleDollarSign,
        tone:        "emerald"  as const,
      },
      {
        label:       "Pelanggan Aktif",
        value:       statistik.pelangganAktif.toString(),
        description: `dari ${statistik.totalPesanan} total order`,
        icon:        UsersRound,
        tone:        "tertiary" as const,
      },
    ];
  }, [data]);

  const recentActivities = useMemo(() => {
    if (!data) return [];
    return data.aktivitasTerbaru.map((a) => ({
      id:           a.id,
      title:        a.pesan,
      time:         formatWaktuRelatif(a.waktu),
      icon:         a.tipe === "order_selesai" ? CheckCircle2 : Bell,
      rightValue:   a.nominal > 0 ? formatRupiah(a.nominal) : undefined,
      rightCaption: a.tipe === "order_selesai" ? "Selesai" : "Aktivitas",
      tone:         (a.tipe === "order_selesai" ? "success" : "primary") as ActivityTone,
    }));
  }, [data]);

  if (pageStatus === "loading") return <DriverProfileLoadingState />;
  if (pageStatus === "error")   return <DriverProfileErrorState />;
  if (pageStatus === "empty" || !data) return <DriverProfileEmptyState />;

  const { profil } = data;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px]">
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      <div className="relative z-10 space-y-5 pb-24 sm:pb-28">
        <section>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/90 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-[0_8px_18px_rgba(0,88,202,0.07)] backdrop-blur-xl">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Driver profile
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
              Profil Driver
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
              Informasi dan statistik performa Anda
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 text-center shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-7">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-4xl font-extrabold text-white shadow-[0_18px_32px_rgba(0,88,202,0.22)] sm:h-36 sm:w-36">
              {profil.inisial}
            </div>

            <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[var(--odong-text)]">
              {profil.nama}
            </h2>
            <p className="mt-2 text-sm font-medium text-[var(--odong-muted)]">
              {profil.email}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </div>

            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-3xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
              <div className="border-r border-[var(--odong-border)] px-4 py-4">
                <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                  {data.statistik.totalPesanan}
                </p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">
                  Total Order
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="text-2xl font-extrabold text-[var(--odong-text)]">
                  {data.statistik.pesananSelesai}
                </p>
                <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--odong-muted)]">
                  Selesai
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-5 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-700">
                  Informasi Akun
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[var(--odong-text)]">
                  Data driver dan kendaraan.
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <PencilLine className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {accountFields.map((field) =>
                field.editable ? (
                  <EditableField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    icon={field.icon}
                    fullWidth={"fullWidth" in field ? field.fullWidth : undefined}
                    fieldKey={field.fieldKey!}
                    onSave={handleSaveField}
                    isSaving={isSaving}
                  />
                ) : (
                  <DisplayField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    icon={field.icon}
                    fullWidth={"fullWidth" in field ? field.fullWidth : undefined}
                  />
                ),
              )}
            </div>
          </article>
        </section>

        <section className="space-y-3">
          <SectionHeader
            icon={Sparkles}
            title="Statistik Keseluruhan"
            description="Ringkasan performa driver selama periode berjalan."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {profileStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            icon={Clock3}
            title="Aktivitas Terbaru"
            description="Riwayat singkat kerja driver yang terakhir dikerjakan."
          />
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <ActivityRow key={activity.id} {...activity} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--odong-muted)]">
              Belum ada aktivitas terbaru.
            </p>
          )}
        </section>

        <Link
          href="/auth/login/driver"
          className="group flex items-center justify-between gap-4 rounded-[28px] border border-rose-100 bg-rose-50/80 p-5 text-left shadow-[0_14px_34px_rgba(220,38,38,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 active:scale-[0.99]"
        >
          <span className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-extrabold text-rose-600">
                Keluar
              </span>
              <span className="mt-1 block text-sm leading-6 text-rose-500">
                Keluar dari akun Anda
              </span>
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-rose-500 transition group-hover:text-rose-700">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>

        <span className="sr-only" aria-live="polite">
          Profil {profil.nama} terbuka.
        </span>
      </div>

      <DriverToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}