"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bolt,
  Building2,
  CreditCard,
  Globe2,
  Mail,
  PencilLine,
  Plus,
  Save,
  Shield,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  createPromoCampaignFromDraft,
  defaultPromoCampaigns,
  defaultPromoDraft,
  type PromoCampaign,
  type PromoDraft,
} from "@/lib/promo-campaigns";
import { usePromoCampaigns } from "@/hooks/use-promo-campaigns";
import { defaultAdminSettings } from "../data";
import type { AdminSettingValues } from "../types";
import {
  AdminMetricStrip,
  AdminPageHeader,
  AdminPanel,
  adminControlClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
} from "../admin-page";
import { AdminDialog } from "../admin-dialog";
import { OutletServicesPanel } from "./outlet-services-panel";
import {
  createPengaturanOutlet,
  deletePengaturanOutlet,
  updatePengaturanUmum,
  updatePengaturanHarga,
  updatePengaturanOutlet,
  uploadQrisOutlet,
  type OutletBackend,
} from "@/lib/admin-api";
import { PromoCodesPanel } from "./promo-codes-panel";
import { AddonManagementPanel } from "./addon-panel";
import {
  EmailSettingsPanel,
  SaveStatusCard,
  SecuritySettingsPanel,
} from "./settings-side-panels";
import type { SettingsData } from "./settings-client";
import { OutletMapPicker } from "./outlet-map-picker";

type SettingSectionId =
  | "umum"
  | "outlet"
  | "harga-promo"
  | "email"
  | "keamanan";

type SettingSection = {
  id: SettingSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const settingSections: SettingSection[] = [
  {
    id: "umum",
    label: "Umum",
    description: "Identitas bisnis dan jam operasional.",
    icon: Building2,
  },
  {
    id: "outlet",
    label: "Outlet",
    description: "Outlet utama, radius, dan kapasitas.",
    icon: Store,
  },
  {
    id: "harga-promo",
    label: "Harga & Promo",
    description: "Tarif dasar, express, dan kode promo.",
    icon: CreditCard,
  },
  {
    id: "email",
    label: "Email",
    description: "Pengirim notifikasi dan server email.",
    icon: Mail,
  },
  {
    id: "keamanan",
    label: "Keamanan",
    description: "Akses akun, sesi, dan autentikasi.",
    icon: Shield,
  },
];

type AdminFeatureSettingKey =
  | "pickupDeliveryEnabled"
  | "aiSuggestionsEnabled"
  | "liveTrackingEnabled"
  | "pushNotificationsEnabled"
  | "multiLanguageEnabled";

const appFeatureSettings: Array<{
  key: AdminFeatureSettingKey;
  label: string;
  description: string;
}> = [
  {
    key: "pickupDeliveryEnabled",
    label: "Pickup & Delivery",
    description: "Layanan antar jemput",
  },
  {
    key: "aiSuggestionsEnabled",
    label: "AI Suggestions",
    description: "Rekomendasi layanan otomatis",
  },
  {
    key: "liveTrackingEnabled",
    label: "Live Tracking",
    description: "Lacak kurir secara real-time",
  },
  {
    key: "pushNotificationsEnabled",
    label: "Push Notifications",
    description: "Notifikasi ke aplikasi mobile",
  },
  {
    key: "multiLanguageEnabled",
    label: "Multi-language",
    description: "Dukungan beberapa bahasa",
  },
];

function SectionLabel({
  id,
  label,
  icon: Icon,
  description,
  active,
  onClick,
}: SettingSection & {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`settings-tab-${id}`}
      aria-pressed={active}
      className={cn(
        "flex min-h-16 min-w-0 items-start gap-3 rounded-3xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
        active
          ? "border-primary-100 bg-primary-50 text-primary-700 shadow-[0_12px_24px_rgba(0,88,202,0.08)]"
          : "border-(--odong-border) bg-(--odong-surface-strong) text-(--odong-muted) hover:bg-primary-50/50",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          active
            ? "bg-(--odong-surface-strong) text-primary-600"
            : "bg-(--odong-surface-muted) text-(--odong-muted)",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold leading-tight text-(--odong-text)">
          {label}
        </span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-(--odong-muted)">
          {description}
        </span>
      </span>
    </button>
  );
}

function SettingInput({
  id,
  label,
  value,
  type = "text",
  onChange,
  helper,
  className,
}: {
  id?: string;
  label: string;
  value: string;
  type?: string;
  helper?: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-extrabold text-(--odong-text)">
        {label}
      </span>
      <span className="relative block">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(adminControlClass, "pr-12")}
        />
        <PencilLine
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
          aria-hidden="true"
        />
      </span>
      {helper ? (
        <p className="text-xs font-semibold leading-5 text-(--odong-muted)">
          {helper}
        </p>
      ) : null}
    </label>
  );
}

function SettingSelect({
  id,
  label,
  value,
  options,
  onChange,
  helper,
  className,
}: {
  id?: string;
  label: string;
  value: string;
  options: string[];
  helper?: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-extrabold text-(--odong-text)">
        {label}
      </span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(adminSelectClass, "pr-12")}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <PencilLine
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
          aria-hidden="true"
        />
      </span>
      {helper ? (
        <p className="text-xs font-semibold leading-5 text-(--odong-muted)">
          {helper}
        </p>
      ) : null}
    </label>
  );
}

function ToggleSetting({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id?: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-(--odong-border) bg-(--odong-surface-muted) p-4">
      <div className="min-w-0">
        <p className="font-extrabold text-(--odong-text)">{label}</p>
        <p className="mt-1 max-w-[50ch] text-sm leading-6 text-(--odong-muted)">
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? "Nonaktifkan" : "Aktifkan"} ${label}`}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-9 w-16 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
          checked ? "bg-primary-600" : "bg-(--odong-surface-soft)",
        )}
      >
        <span
          className={cn(
            "h-7 w-7 rounded-full bg-(--odong-surface-strong) shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
            checked ? "translate-x-7" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function FeatureToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-14.5 items-center justify-between gap-4 rounded-3xl border border-(--odong-border) bg-(--odong-surface-muted) px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-extrabold leading-tight text-(--odong-text)">
          {label}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-(--odong-muted)">
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
          checked ? "bg-primary-600" : "bg-(--odong-surface-soft)",
        )}
      >
        <span
          className={cn(
            "h-6 w-6 rounded-full bg-(--odong-surface-strong) shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function SectionHint({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[28px] border border-primary-100 bg-primary-50/70 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--odong-surface-strong) text-primary-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-extrabold text-(--odong-text)">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-(--odong-muted)">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function outletToSettings(outlet: OutletBackend): Partial<AdminSettingValues> {
  return {
    defaultOutlet: outlet.namaOutlet || defaultAdminSettings.defaultOutlet,
    outletAddress: outlet.alamatOutlet || defaultAdminSettings.outletAddress,
    outletEmail: outlet.email || defaultAdminSettings.outletEmail,
    outletPhone: outlet.nomorTelepon || defaultAdminSettings.outletPhone,
    outletLatitude:
      outlet.latitude != null
        ? String(outlet.latitude)
        : defaultAdminSettings.outletLatitude,
    outletLongitude:
      outlet.longitude != null
        ? String(outlet.longitude)
        : defaultAdminSettings.outletLongitude,
    openTime: outlet.jamMulai || defaultAdminSettings.openTime,
    closeTime: outlet.jamSelesai || defaultAdminSettings.closeTime,
  };
}

type OutletDraft = {
  namaOutlet: string;
  alamatOutlet: string;
  email: string;
  nomorTelepon: string;
  latitude: string;
  longitude: string;
  jamMulai: string;
  jamSelesai: string;
  isTutupSementara: boolean;
  maxKapasitas: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  qrisUrl: string;
};

function emptyOutletDraft(): OutletDraft {
  return {
    namaOutlet: "",
    alamatOutlet: "",
    email: "",
    nomorTelepon: "",
    latitude: "",
    longitude: "",
    jamMulai: defaultAdminSettings.openTime,
    jamSelesai: defaultAdminSettings.closeTime,
    isTutupSementara: false,
    maxKapasitas: "20",
    namaBank: "",
    nomorRekening: "",
    atasNama: "",
    qrisUrl: "",
  };
}

function outletDraftFromBackend(outlet: OutletBackend): OutletDraft {
  return {
    namaOutlet: outlet.namaOutlet ?? "",
    alamatOutlet: outlet.alamatOutlet ?? "",
    email: outlet.email ?? "",
    nomorTelepon: outlet.nomorTelepon ?? "",
    latitude: outlet.latitude != null ? String(outlet.latitude) : "",
    longitude: outlet.longitude != null ? String(outlet.longitude) : "",
    jamMulai: outlet.jamMulai ?? defaultAdminSettings.openTime,
    jamSelesai: outlet.jamSelesai ?? defaultAdminSettings.closeTime,
    isTutupSementara: outlet.isTutupSementara ?? false,
    maxKapasitas: String(outlet.maxKapasitas ?? 20),
    namaBank: outlet.namaBank ?? "",
    nomorRekening: outlet.nomorRekening ?? "",
    atasNama: outlet.atasNama ?? "",
    qrisUrl: outlet.qrisUrl ?? "",
  };
}

export function AdminSettingsPage({
  settingsData,
}: {
  settingsData?: SettingsData | null;
}) {
  // Initialize settings from real data or use defaults
  const getInitialSettings = (): AdminSettingValues => {
    if (!settingsData?.umum || !settingsData?.outlet) {
      return defaultAdminSettings;
    }

    const umum = settingsData.umum;
    const outlet = settingsData.outlet;
    const hargaPromo = settingsData.hargaPromo;
    const keamanan = settingsData.keamanan;

    return {
      ...defaultAdminSettings,
      // General settings
      businessName: umum.informasiAplikasi?.namaAplikasi || defaultAdminSettings.businessName,
      tagline: umum.informasiAplikasi?.tagline || defaultAdminSettings.tagline,
      supportEmail: umum.informasiAplikasi?.email || defaultAdminSettings.supportEmail,
      supportPhone: umum.informasiAplikasi?.nomorTelepon || defaultAdminSettings.supportPhone,
      headquartersAddress: umum.informasiAplikasi?.alamatPusat || defaultAdminSettings.headquartersAddress,
      pickupDeliveryEnabled: umum.fiturAplikasi?.pickupAndDelivery ?? defaultAdminSettings.pickupDeliveryEnabled,
      aiSuggestionsEnabled: umum.fiturAplikasi?.aiSuggestions ?? defaultAdminSettings.aiSuggestionsEnabled,
      liveTrackingEnabled: umum.fiturAplikasi?.liveTracking ?? defaultAdminSettings.liveTrackingEnabled,
      pushNotificationsEnabled: umum.fiturAplikasi?.pushNotifications ?? defaultAdminSettings.pushNotificationsEnabled,
      multiLanguageEnabled: umum.fiturAplikasi?.multiLanguage ?? defaultAdminSettings.multiLanguageEnabled,

      // Outlet settings
      defaultOutlet: outlet.pengaturanOutlet?.namaOutlet || defaultAdminSettings.defaultOutlet,
      outletAddress: outlet.pengaturanOutlet?.alamatOutlet || defaultAdminSettings.outletAddress,
      outletEmail: outlet.pengaturanOutlet?.email || defaultAdminSettings.outletEmail,
      outletPhone: outlet.pengaturanOutlet?.nomorTelepon || defaultAdminSettings.outletPhone,
      outletLatitude:
        outlet.pengaturanOutlet?.latitude != null
          ? String(outlet.pengaturanOutlet.latitude)
          : defaultAdminSettings.outletLatitude,
      outletLongitude:
        outlet.pengaturanOutlet?.longitude != null
          ? String(outlet.pengaturanOutlet.longitude)
          : defaultAdminSettings.outletLongitude,
      openTime: outlet.pengaturanOutlet?.jamMulai || defaultAdminSettings.openTime,
      closeTime: outlet.pengaturanOutlet?.jamSelesai || defaultAdminSettings.closeTime,

      // Pricing settings
      minimumOrder: hargaPromo?.pengaturanHarga?.hargaMinimum.toString() || defaultAdminSettings.minimumOrder,
      pricePerKg: hargaPromo?.pengaturanHarga?.hargaMaksimum.toString() || defaultAdminSettings.pricePerKg,
      expressSurcharge: hargaPromo?.pengaturanHarga?.biayaAntarJemput.toString() || defaultAdminSettings.expressSurcharge,
      biayaAntarJemput: hargaPromo?.pengaturanHarga?.biayaAntarJemput?.toString() || defaultAdminSettings.biayaAntarJemput,
      estimasiPickup: hargaPromo?.pengaturanHarga?.estimasiPickup || defaultAdminSettings.estimasiPickup,

      // Security settings
      twoFactorRequired: keamanan?.keamananAplikasi?.twoFactorAuth ?? defaultAdminSettings.twoFactorRequired,
      sessionTimeoutMinutes: keamanan?.pengaturanBackup?.backupRetention.toString() || defaultAdminSettings.sessionTimeoutMinutes,
    };
  };

  const [settings, setSettings] =
    useState<AdminSettingValues>(getInitialSettings());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<SettingSectionId>("umum");
  const [outletRecords, setOutletRecords] = useState<OutletBackend[]>([]);
  const [outletDraft, setOutletDraft] = useState<OutletDraft>(emptyOutletDraft());
  const [editOutletDraft, setEditOutletDraft] = useState<OutletDraft | null>(null);
  const [editOutletId, setEditOutletId] = useState<string | null>(null);
  const [deleteOutletId, setDeleteOutletId] = useState<string | null>(null);
  const [outletPanelKey, setOutletPanelKey] = useState(0);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisPreviewError, setQrisPreviewError] = useState<string | null>(null);
  const [qrisPreviewWarning, setQrisPreviewWarning] = useState<string | null>(null);
  const [qrisUploading, setQrisUploading] = useState(false);
  const [qrisUploadError, setQrisUploadError] = useState<string | null>(null);
  const qrisUploadPromiseRef = useRef<Promise<void> | null>(null);
  const [promoDraft, setPromoDraft] =
    useState<PromoDraft>(defaultPromoDraft);
  const [promoFeedback, setPromoFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const {
    campaigns: promoCampaigns,
    setCampaigns: setPromoCampaigns,
    persist: persistPromoCampaigns,
  } = usePromoCampaigns();

  const activeSectionMeta = useMemo(
    () => settingSections.find((section) => section.id === activeSection),
    [activeSection],
  );
  const activePromoCount = useMemo(
    () => promoCampaigns.filter((campaign) => campaign.active).length,
    [promoCampaigns],
  );
  const latestActivePromo = promoCampaigns.find((campaign) => campaign.active);
  const previousQrisPreviewRef = useRef<string | null>(null);

  const inspectQrisPreview = (imageElement: HTMLImageElement) => {
    try {
      const canvas = document.createElement("canvas");
      const sampleSize = 24;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(imageElement, 0, 0, sampleSize, sampleSize);
      const { data } = context.getImageData(0, 0, sampleSize, sampleSize);

      let brightnessTotal = 0;
      let transparentPixels = 0;
      const pixelCount = data.length / 4;

      for (let index = 0; index < data.length; index += 4) {
        const red = data[index] ?? 0;
        const green = data[index + 1] ?? 0;
        const blue = data[index + 2] ?? 0;
        const alpha = data[index + 3] ?? 0;

        if (alpha < 24) {
          transparentPixels += 1;
          continue;
        }

        brightnessTotal += (red + green + blue) / 3;
      }

      const visiblePixels = Math.max(pixelCount - transparentPixels, 1);
      const averageBrightness = brightnessTotal / visiblePixels;
      const transparencyRatio = transparentPixels / pixelCount;

      if (transparencyRatio > 0.7 || averageBrightness > 235) {
        setQrisPreviewWarning("Gambar QRIS terlihat terlalu terang atau transparan. Pastikan file berisi QR hitam yang jelas.");
      } else {
        setQrisPreviewWarning(null);
      }
    } catch {
      setQrisPreviewWarning(null);
    }
  };

  useEffect(() => {
    const previousPreview = previousQrisPreviewRef.current;
    previousQrisPreviewRef.current = qrisPreview;

    return () => {
      if (previousPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreview);
      }
    };
  }, [qrisPreview]);

  const outletList = outletRecords;

  useEffect(() => {
    setSettings(getInitialSettings());
  }, [settingsData]);

  useEffect(() => {
    setOutletRecords(settingsData?.outlet?.semuaOutlet ?? []);
  }, [settingsData]);

  const updateSetting = <Key extends keyof AdminSettingValues>(
    key: Key,
    value: AdminSettingValues[Key],
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  const updatePromoDraft = <Key extends keyof PromoDraft>(
    key: Key,
    value: PromoDraft[Key],
  ) => {
    setPromoDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
    setPromoFeedback(null);
  };

  const focusSettingField = (fieldId: string) => {
    document.getElementById(fieldId)?.focus();
  };

  const addPromoCampaign = () => {
    if (!promoDraft.code.trim()) {
      setPromoFeedback({
        tone: "error",
        message: "Kode promo harus diisi sebelum ditambahkan.",
      });
      return;
    }

    const nextCampaign = createPromoCampaignFromDraft(promoDraft);
    const nextCampaigns = [
      nextCampaign,
      ...promoCampaigns.filter(
        (campaign) => campaign.code.toUpperCase() !== nextCampaign.code,
      ),
    ];

    setPromoCampaigns(nextCampaigns);
    persistPromoCampaigns(nextCampaigns);
    setPromoDraft(defaultPromoDraft);
    setPromoFeedback({
      tone: "success",
      message: nextCampaign.active
        ? `Kode ${nextCampaign.code} berhasil masuk ke daftar promo aktif.`
        : `Kode ${nextCampaign.code} tersimpan sebagai promo nonaktif.`,
    });
  };

  const editPromoCampaign = (campaign: PromoCampaign) => {
    setPromoDraft({
      basePrice: campaign.basePrice,
      expressSurcharge: campaign.expressSurcharge,
      minimumOrder: campaign.minimumOrder,
      code: campaign.code,
      discount: campaign.discount,
      active: campaign.active,
    });
    setPromoFeedback({
      tone: "success",
      message: `Kode ${campaign.code} siap diedit di panel kiri.`,
    });
    focusSettingField("settings-promo-code");
  };

  const handleOpenEditOutlet = (outlet: OutletBackend) => {
    setEditOutletId(outlet.id_outlet);
    setEditOutletDraft(outletDraftFromBackend(outlet));
    setQrisFile(null);
    setQrisPreview(null);
    setQrisPreviewError(null);
    setQrisPreviewWarning(null);
    setQrisUploading(false);
    setQrisUploadError(null);
    setSaveFeedback(null);
  };

  const uploadQrisFile = async (file: File, outletId: string) => {
    setQrisUploading(true);
    setQrisUploadError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResult = await uploadQrisOutlet(outletId, base64);
      const nextQrisUrl = uploadResult.qrisUrl;

      setEditOutletDraft((current) => (current ? { ...current, qrisUrl: nextQrisUrl } : current));
      setOutletRecords((current) =>
        current.map((outlet) =>
          outlet.id_outlet === outletId
            ? { ...outlet, qrisUrl: nextQrisUrl }
            : outlet,
        ),
      );
      setQrisFile(null);
      setQrisPreview(null);
      setQrisPreviewError(null);
      setQrisPreviewWarning(null);
      setSaveFeedback({ tone: "success", message: "QRIS berhasil disimpan ke database." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan QRIS.";
      setQrisUploadError(message);
      setSaveFeedback({ tone: "error", message });
    } finally {
      setQrisUploading(false);
    }
  };

  const handleCreateOutlet = async () => {
    const name = outletDraft.namaOutlet.trim();

    if (!name) {
      setSaveFeedback({ tone: "error", message: "Nama outlet harus diisi." });
      return;
    }

    try {
      const result = await createPengaturanOutlet({
        namaOutlet: name,
        alamatOutlet: outletDraft.alamatOutlet,
        email: outletDraft.email,
        nomorTelepon: outletDraft.nomorTelepon,
        latitude: outletDraft.latitude ? Number(outletDraft.latitude) : null,
        longitude: outletDraft.longitude ? Number(outletDraft.longitude) : null,
        jamMulai: outletDraft.jamMulai,
        jamSelesai: outletDraft.jamSelesai,
        maxKapasitas: outletDraft.maxKapasitas ? Number(outletDraft.maxKapasitas) : 20,
        namaBank: outletDraft.namaBank || null,
        nomorRekening: outletDraft.nomorRekening || null,
        atasNama: outletDraft.atasNama || null,
      });

      const nextOutlet = result.pengaturanOutlet;
      setOutletRecords((current) => [...current, nextOutlet]);
      setOutletDraft(emptyOutletDraft());
      setSaveFeedback({ tone: "success", message: "Outlet berhasil ditambahkan." });
      setOutletPanelKey((key) => key + 1);
    } catch (error) {
      setSaveFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Gagal menambahkan outlet.",
      });
    }
  };

  const handleSaveEditOutlet = async () => {
    if (!editOutletId || !editOutletDraft) {
      return;
    }

    const name = editOutletDraft.namaOutlet.trim();
    if (!name) {
      setSaveFeedback({ tone: "error", message: "Nama outlet harus diisi." });
      return;
    }

    try {
      await qrisUploadPromiseRef.current;
      await updatePengaturanOutlet({
        id_outlet: editOutletId,
        namaOutlet: name,
        alamatOutlet: editOutletDraft.alamatOutlet,
        email: editOutletDraft.email,
        nomorTelepon: editOutletDraft.nomorTelepon,
        latitude: editOutletDraft.latitude ? Number(editOutletDraft.latitude) : null,
        longitude: editOutletDraft.longitude ? Number(editOutletDraft.longitude) : null,
        jamMulai: editOutletDraft.jamMulai,
        jamSelesai: editOutletDraft.jamSelesai,
        isTutupSementara: editOutletDraft.isTutupSementara,
        maxKapasitas: editOutletDraft.maxKapasitas ? Number(editOutletDraft.maxKapasitas) : 20,
        namaBank: editOutletDraft.namaBank || null,
        nomorRekening: editOutletDraft.nomorRekening || null,
        atasNama: editOutletDraft.atasNama || null,
      });

      let newQrisUrl = editOutletDraft.qrisUrl;
      if (qrisFile && editOutletId) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(qrisFile);
        });
        const uploadResult = await uploadQrisOutlet(editOutletId, base64);
        newQrisUrl = uploadResult.qrisUrl;
      }

      setOutletRecords((current) =>
        current.map((outlet) =>
          outlet.id_outlet === editOutletId
            ? {
                ...outlet,
                namaOutlet: editOutletDraft.namaOutlet,
                alamatOutlet: editOutletDraft.alamatOutlet,
                email: editOutletDraft.email,
                nomorTelepon: editOutletDraft.nomorTelepon,
                latitude: editOutletDraft.latitude ? Number(editOutletDraft.latitude) : null,
                longitude: editOutletDraft.longitude ? Number(editOutletDraft.longitude) : null,
                jamMulai: editOutletDraft.jamMulai,
                jamSelesai: editOutletDraft.jamSelesai,
                isTutupSementara: editOutletDraft.isTutupSementara,
                maxKapasitas: editOutletDraft.maxKapasitas ? Number(editOutletDraft.maxKapasitas) : 20,
                namaBank: editOutletDraft.namaBank || null,
                nomorRekening: editOutletDraft.nomorRekening || null,
                atasNama: editOutletDraft.atasNama || null,
                qrisUrl: newQrisUrl || null,
              }
            : outlet,
        ),
      );
      setEditOutletDraft(null);
      setEditOutletId(null);
      setQrisFile(null);
      setQrisPreview(null);
      setQrisPreviewError(null);
      setQrisPreviewWarning(null);
      setSaveFeedback({ tone: "success", message: "Outlet berhasil diperbarui." });
      setOutletPanelKey((key) => key + 1);
    } catch (error) {
      setSaveFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Gagal menyimpan outlet.",
      });
    }
  };

  const handleDeleteOutlet = async (idOutlet: string) => {
    try {
      await deletePengaturanOutlet(idOutlet);

      const remainingOutlets = outletList.filter((outlet) => outlet.id_outlet !== idOutlet);
      setOutletRecords(remainingOutlets);
      if (editOutletId === idOutlet) {
        setEditOutletId(null);
        setEditOutletDraft(null);
      }

      setDeleteOutletId(null);
      setOutletPanelKey((key) => key + 1);
      setSaveFeedback({ tone: "success", message: "Outlet berhasil dihapus." });
    } catch (error) {
      setDeleteOutletId(null);
      setSaveFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Gagal menghapus outlet.",
      });
    }
  };

  const togglePromoCampaign = (campaignId: string) => {
    const nextCampaigns = promoCampaigns.map((campaign) =>
      campaign.id === campaignId
        ? { ...campaign, active: !campaign.active }
        : campaign,
    );

    setPromoCampaigns(nextCampaigns);
    persistPromoCampaigns(nextCampaigns);
  };

  const saveSettings = async () => {
    setSaveFeedback(null);

    try {
      // persist promo campaigns locally
      persistPromoCampaigns();

      // Prepare payloads
      const umumPayload = {
        namaAplikasi: settings.businessName,
        tagline: settings.tagline,
        email: settings.supportEmail,
        nomorTelepon: settings.supportPhone,
        alamatPusat: settings.headquartersAddress,
        fiturAplikasi: {
          pickupAndDelivery: settings.pickupDeliveryEnabled,
          aiSuggestions: settings.aiSuggestionsEnabled,
          liveTracking: settings.liveTrackingEnabled,
          pushNotifications: settings.pushNotificationsEnabled,
          multiLanguage: settings.multiLanguageEnabled,
        },
      };

      await updatePengaturanUmum(umumPayload);

      await updatePengaturanHarga({
        biayaAntarJemput: Number(settings.biayaAntarJemput) || 0,
        estimasiPickup: settings.estimasiPickup,
      });

      setOutletPanelKey((key) => key + 1);

      setSavedAt(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setSaveFeedback({ tone: "success", message: "Pengaturan umum berhasil disimpan." });
      setPromoFeedback({ tone: "success", message: "Pengaturan berhasil disimpan." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan pengaturan";
      setSaveFeedback({ tone: "error", message });
      setPromoFeedback({ tone: "error", message });
    }
  };

  const resetSettings = () => {
    setSettings(defaultAdminSettings);
    setOutletPanelKey((k) => k + 1);
    setPromoCampaigns(defaultPromoCampaigns);
    persistPromoCampaigns(defaultPromoCampaigns);
    setPromoDraft(defaultPromoDraft);
    setPromoFeedback(null);
    setSavedAt(null);
    setActiveSection("umum");
  };

  const isGeneralSection = activeSection === "umum";
  const isOutletSection = activeSection === "outlet";
  const isPromoSection = activeSection === "harga-promo";
  const isEmailSection = activeSection === "email";
  const isSecuritySection = activeSection === "keamanan";
  const mainPanelTitle = isGeneralSection
    ? "Informasi Aplikasi"
    : isOutletSection
      ? "Pengaturan Outlet"
    : activeSectionMeta?.label ?? "Pengaturan";
  const mainPanelDescription = isGeneralSection
    ? "Detail inti aplikasi yang tampil di panel admin dan kanal pelanggan."
    : isOutletSection
      ? "Kelola outlet, kontak, dan operasional harian."
    : activeSectionMeta?.description;
  const mainPanelIcon = isGeneralSection ? Globe2 : activeSectionMeta?.icon;
  const hasWideSidePanel =
    isOutletSection || isPromoSection || isEmailSection || isSecuritySection;
  const settingsGridClass = hasWideSidePanel
    ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
    : "xl:grid-cols-[minmax(0,1fr)_340px]";

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Pengaturan"
        title="Atur operasional dasar"
        description="Semua pengaturan ada di satu halaman, dibagi per bagian supaya lebih cepat dicari dan lebih rapi dipakai."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetSettings}
              className={adminSecondaryButtonClass}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={saveSettings}
              className={adminPrimaryButtonClass}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan perubahan
            </button>
          </div>
        }
      />

      <AdminMetricStrip
        items={[
          {
            label: "Nama bisnis",
            value: settings.businessName,
            caption: "Tampil di seluruh panel",
            icon: Building2,
          },
          {
            label: "Harga dasar",
            value: settings.pricePerKg,
            caption: "Per kilogram",
            icon: CreditCard,
            tone: "primary",
          },
          {
            label: "Promo aktif",
            value: activePromoCount > 0 ? `${activePromoCount} kode` : "Tidak",
            caption: latestActivePromo
              ? latestActivePromo.code
              : "Belum ada kode aktif",
            icon: Sparkles,
            tone: activePromoCount > 0 ? "success" : "muted",
          },
          {
            label: "Keamanan",
            value: settings.twoFactorRequired ? "2FA aktif" : "2FA nonaktif",
            caption: `${settings.sessionTimeoutMinutes} menit sesi`,
            icon: Shield,
            tone: settings.twoFactorRequired ? "success" : "warning",
          },
        ]}
      />

      {saveFeedback ? (
        <div
          className={cn(
            "rounded-3xl border px-4 py-3 text-sm font-semibold",
            saveFeedback.tone === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-600",
          )}
        >
          {saveFeedback.message}
        </div>
      ) : null}

      <div
        aria-label="Bagian pengaturan"
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      >
        {settingSections.map((section) => (
          <SectionLabel
            key={section.id}
            {...section}
            active={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </div>

      <section className={cn("grid gap-5", settingsGridClass)}>
        <AdminPanel
          title={mainPanelTitle}
          description={mainPanelDescription}
          icon={mainPanelIcon}
        >
          {activeSection === "umum" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput
                  className="md:col-span-2"
                  label="Nama Aplikasi"
                  value={settings.businessName}
                  onChange={(value) => updateSetting("businessName", value)}
                />
                <SettingInput
                  className="md:col-span-2"
                  label="Tagline"
                  value={settings.tagline}
                  onChange={(value) => updateSetting("tagline", value)}
                />
                <SettingInput
                  label="Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(value) => updateSetting("supportEmail", value)}
                />
                <SettingInput
                  label="Nomor Telepon"
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(value) => updateSetting("supportPhone", value)}
                />
                <SettingInput
                  className="md:col-span-2"
                  label="Alamat Pusat"
                  value={settings.headquartersAddress}
                  onChange={(value) =>
                    updateSetting("headquartersAddress", value)
                  }
                />
              </div>
            </div>
          ) : null}

          {activeSection === "outlet" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput
                  className="md:col-span-2"
                  label="Nama Outlet"
                  value={outletDraft.namaOutlet}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, namaOutlet: value }))
                  }
                />
                <div className="md:col-span-2">
                  <OutletMapPicker
                    address={outletDraft.alamatOutlet}
                    latitude={outletDraft.latitude}
                    longitude={outletDraft.longitude}
                    onAddressChange={(value) =>
                      setOutletDraft((current) => ({ ...current, alamatOutlet: value }))
                    }
                    onLatitudeChange={(value) =>
                      setOutletDraft((current) => ({ ...current, latitude: value }))
                    }
                    onLongitudeChange={(value) =>
                      setOutletDraft((current) => ({ ...current, longitude: value }))
                    }
                  />
                </div>
                <SettingInput
                  label="Email Outlet"
                  type="email"
                  value={outletDraft.email}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, email: value }))
                  }
                />
                <SettingInput
                  label="Nomor Telepon Outlet"
                  type="tel"
                  value={outletDraft.nomorTelepon}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, nomorTelepon: value }))
                  }
                />
                <SettingInput
                  label="Jam Buka"
                  value={outletDraft.jamMulai}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, jamMulai: value }))
                  }
                  helper="Format 08:00."
                />
                <SettingInput
                  label="Jam Tutup"
                  value={outletDraft.jamSelesai}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, jamSelesai: value }))
                  }
                  helper="Format 21:00."
                />
                <SettingInput
                  label="Kapasitas Harian"
                  type="number"
                  value={outletDraft.maxKapasitas}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, maxKapasitas: value }))
                  }
                  helper="Maks. pesanan per hari di outlet ini."
                />
                <SettingInput
                  label="Nama Bank"
                  value={outletDraft.namaBank}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, namaBank: value }))
                  }
                  helper='Contoh: BCA, BRI, Mandiri.'
                />
                <SettingInput
                  label="Nomor Rekening"
                  value={outletDraft.nomorRekening}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, nomorRekening: value }))
                  }
                />
                <SettingInput
                  className="md:col-span-2"
                  label="Atas Nama"
                  value={outletDraft.atasNama}
                  onChange={(value) =>
                    setOutletDraft((current) => ({ ...current, atasNama: value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-(--odong-border) pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-(--odong-muted)">
                  Form ini hanya untuk menambah outlet baru. Edit outlet lama
                  dilakukan lewat popup di daftar outlet.
                </p>
                <button
                  type="button"
                  onClick={() => void handleCreateOutlet()}
                  className={adminPrimaryButtonClass}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Tambah outlet
                </button>
              </div>
            </div>
          ) : null}

          {activeSection === "harga-promo" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput
                  id="settings-biaya-antar-jemput"
                  label="Biaya Antar Jemput (Rp)"
                  value={settings.biayaAntarJemput}
                  onChange={(value) => updateSetting("biayaAntarJemput", value)}
                  helper="Biaya pickup & delivery per pesanan."
                />
                <SettingInput
                  id="settings-estimasi-pickup"
                  label="Estimasi Pickup"
                  value={settings.estimasiPickup}
                  onChange={(value) => updateSetting("estimasiPickup", value)}
                  helper='Contoh: "2 jam", "30 menit".'
                />
              </div>

              <div className="rounded-[28px] border border-primary-100 bg-primary-50/70 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-600">
                      Preview promo
                    </p>
                    <h4 className="mt-2 text-xl font-extrabold leading-tight text-(--odong-text)">
                      Hemat {promoDraft.discount || defaultPromoDraft.discount} untuk Express
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-(--odong-muted)">
                      Tarif dasar {promoDraft.basePrice || defaultPromoDraft.basePrice} • Express{" "}
                      {promoDraft.expressSurcharge ||
                        defaultPromoDraft.expressSurcharge}{" "}
                      • Minimum order{" "}
                      {promoDraft.minimumOrder || defaultPromoDraft.minimumOrder}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-[22px] bg-(--odong-surface-strong) px-4 py-3 text-right shadow-[0_10px_20px_rgba(0,88,202,0.06)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">
                      Kode
                    </p>
                    <p className="mt-1 font-mono text-lg font-extrabold tracking-wide text-(--odong-text)">
                      {(promoDraft.code || defaultPromoDraft.code).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput
                  id="settings-price-per-kg"
                  label="Harga per kg"
                  value={promoDraft.basePrice}
                  onChange={(value) => updatePromoDraft("basePrice", value)}
                  helper="Harga dasar untuk layanan reguler."
                />
                <SettingInput
                  id="settings-express-surcharge"
                  label="Surcharge express"
                  value={promoDraft.expressSurcharge}
                  onChange={(value) =>
                    updatePromoDraft("expressSurcharge", value)
                  }
                  helper="Persentase tambahan untuk layanan express."
                />
                <SettingInput
                  id="settings-minimum-order"
                  label="Minimum order"
                  value={promoDraft.minimumOrder}
                  onChange={(value) => updatePromoDraft("minimumOrder", value)}
                />
                <SettingInput
                  id="settings-promo-code"
                  label="Kode promo"
                  value={promoDraft.code}
                  onChange={(value) => updatePromoDraft("code", value)}
                />
                <SettingInput
                  id="settings-promo-discount"
                  label="Diskon promo"
                  value={promoDraft.discount}
                  onChange={(value) => updatePromoDraft("discount", value)}
                />
                <SettingSelect
                  id="settings-promo-status"
                  label="Status promo"
                  value={promoDraft.active ? "Aktif" : "Nonaktif"}
                  options={["Aktif", "Nonaktif"]}
                  onChange={(value) =>
                    updatePromoDraft("active", value === "Aktif")
                  }
                />
              </div>

              {promoFeedback ? (
                <div
                  className={cn(
                    "rounded-3xl border px-4 py-3 text-sm font-semibold",
                    promoFeedback.tone === "success"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-rose-100 bg-rose-50 text-rose-600",
                  )}
                >
                  {promoFeedback.message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-(--odong-border) pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-(--odong-muted)">
                  Klik tambahkan untuk memasukkan preview ini ke daftar kode
                  promo aktif di kanan.
                </p>
                <button
                  type="button"
                  onClick={addPromoCampaign}
                  className={adminPrimaryButtonClass}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Tambahkan
                </button>
              </div>
            </div>
          ) : null}

          {activeSection === "email" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput
                  id="settings-sender-name"
                  label="Nama pengirim"
                  value={settings.senderName}
                  onChange={(value) => updateSetting("senderName", value)}
                />
                <SettingInput
                  id="settings-sender-email"
                  label="Email pengirim"
                  value={settings.senderEmail}
                  onChange={(value) => updateSetting("senderEmail", value)}
                />
                <SettingInput
                  id="settings-smtp-host"
                  label="SMTP host"
                  value={settings.smtpHost}
                  onChange={(value) => updateSetting("smtpHost", value)}
                />
                <SettingInput
                  id="settings-ops-email"
                  label="Email operasional"
                  value={settings.opsEmail}
                  onChange={(value) => updateSetting("opsEmail", value)}
                />
              </div>

              <ToggleSetting
                id="settings-daily-summary-email"
                label="Kirim ringkasan harian"
                description="Kirim email ringkasan aktivitas ke tim operasional setiap sore."
                checked={settings.dailySummaryEmail}
                onChange={(value) => updateSetting("dailySummaryEmail", value)}
              />
            </div>
          ) : null}

          {activeSection === "keamanan" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingSelect
                  id="settings-session-timeout"
                  label="Timeout sesi"
                  value={settings.sessionTimeoutMinutes}
                  options={["30", "45", "60", "90"]}
                  onChange={(value) =>
                    updateSetting("sessionTimeoutMinutes", value)
                  }
                  helper="Sesi akan berakhir jika tidak ada aktivitas."
                />
                <SettingSelect
                  id="settings-login-attempts"
                  label="Batas percobaan login"
                  value={settings.loginAttemptLimit}
                  options={["3", "5", "7", "10"]}
                  onChange={(value) =>
                    updateSetting("loginAttemptLimit", value)
                  }
                  helper="Membantu membatasi percobaan masuk yang mencurigakan."
                />
              </div>

              <ToggleSetting
                id="settings-two-factor"
                label="Wajib 2FA"
                description="Akun admin perlu verifikasi tambahan saat login."
                checked={settings.twoFactorRequired}
                onChange={(value) => updateSetting("twoFactorRequired", value)}
              />

              <SectionHint
                title="Keamanan akun"
                description="Pengaturan ini membantu menjaga akses admin tetap terkontrol tanpa mengubah alur kerja utama."
                icon={Shield}
              />
            </div>
          ) : null}
        </AdminPanel>

        <aside className="space-y-5">
          {isOutletSection ? (
            <>
              <OutletServicesPanel key={outletPanelKey} />
              <AdminPanel
                title="Daftar Outlet"
                description="Klik edit untuk mengubah outlet tertentu lewat popup, atau hapus jika sudah tidak dipakai."
                icon={Store}
              >
                {outletList.length > 0 ? (
                  <div className="space-y-3">
                    {outletList.map((outlet) => {
                      return (
                        <div
                          key={outlet.id_outlet ?? outlet.namaOutlet}
                          className="rounded-3xl border border-(--odong-border) bg-(--odong-surface-muted) px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold text-(--odong-text)">
                                {outlet.namaOutlet || "Outlet tanpa nama"}
                              </p>
                              <p className="mt-1 wrap-break-word text-xs font-semibold leading-5 text-(--odong-muted)">
                                {outlet.alamatOutlet || "Alamat belum diisi"}
                              </p>
                              <p className="mt-1 text-xs font-semibold leading-5 text-(--odong-muted-soft)">
                                {outlet.email || "Email belum diisi"} • {outlet.nomorTelepon || "Telepon belum diisi"}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-(--odong-muted)">
                                <span>
                                  Jam: {outlet.jamMulai || "--:--"} - {outlet.jamSelesai || "--:--"}
                                </span>
                                <button
                                  type="button"
                                  title={outlet.isTutupSementara ? "Buka outlet" : "Tutup sementara"}
                                  onClick={() => void (async () => {
                                    try {
                                      await updatePengaturanOutlet({ id_outlet: outlet.id_outlet, isTutupSementara: !outlet.isTutupSementara });
                                      setOutletRecords((prev) => prev.map((o) =>
                                        o.id_outlet === outlet.id_outlet
                                          ? { ...o, isTutupSementara: !outlet.isTutupSementara }
                                          : o
                                      ));
                                    } catch {
                                      setSaveFeedback({ tone: "error", message: "Gagal mengubah status outlet." });
                                    }
                                  })()}
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                                    outlet.isTutupSementara
                                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                                  )}
                                >
                                  {outlet.isTutupSementara ? "Tutup Sementara" : "Buka"}
                                </button>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditOutlet(outlet)}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 px-3 text-xs font-bold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteOutletId(outlet.id_outlet)}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-(--odong-border) bg-(--odong-surface-muted) p-6 text-center">
                    <p className="text-sm font-extrabold text-(--odong-text)">
                      Belum ada outlet di database
                    </p>
                    <p className="mt-2 text-sm leading-6 text-(--odong-muted)">
                      Outlet akan muncul di sini setelah tersimpan di database.
                    </p>
                  </div>
                )}
              </AdminPanel>
              <SaveStatusCard
                savedAt={savedAt}
                idleMessage="Perubahan outlet langsung tersimpan setelah ditambahkan, diedit, atau dihapus."
              />
            </>
          ) : null}

          {isPromoSection ? (
            <>
              <AddonManagementPanel />
              <PromoCodesPanel
                campaigns={promoCampaigns}
                onEdit={editPromoCampaign}
                onToggle={togglePromoCampaign}
              />
              <SaveStatusCard
                savedAt={savedAt}
                idleMessage="Promo yang ditambahkan langsung tampil di daftar aktif."
              />
            </>
          ) : null}

          {isGeneralSection ? (
            <>
              <AdminPanel
                title="Fitur Aplikasi"
                description="Aktifkan atau nonaktifkan fitur utama aplikasi."
                icon={Bolt}
              >
                <div className="space-y-3">
                  {appFeatureSettings.map((feature) => (
                    <FeatureToggleSetting
                      key={feature.key}
                      label={feature.label}
                      description={feature.description}
                      checked={settings[feature.key]}
                      onChange={(value) => updateSetting(feature.key, value)}
                    />
                  ))}
                </div>
              </AdminPanel>
              <SaveStatusCard savedAt={savedAt} />
            </>
          ) : null}

          {isEmailSection ? (
            <>
              <EmailSettingsPanel
                settings={settings}
                onFocusField={focusSettingField}
                onToggleDailySummary={() =>
                  updateSetting("dailySummaryEmail", !settings.dailySummaryEmail)
                }
              />
              <SaveStatusCard savedAt={savedAt} />
            </>
          ) : null}

          {isSecuritySection ? (
            <>
              <SecuritySettingsPanel
                settings={settings}
                onFocusField={focusSettingField}
                onToggleTwoFactor={() =>
                  updateSetting("twoFactorRequired", !settings.twoFactorRequired)
                }
              />
              <SaveStatusCard savedAt={savedAt} />
            </>
          ) : null}
        </aside>
      </section>

      <AdminDialog
        open={Boolean(editOutletId && editOutletDraft)}
        title="Edit Data Outlet"
        description="Perbarui informasi outlet ini. Perubahan tidak memengaruhi outlet lain."
        onClose={() => {
          setEditOutletId(null);
          setEditOutletDraft(null);
        }}
        size="lg"
      >
        {editOutletDraft ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <SettingInput
                className="md:col-span-2"
                label="Nama Outlet"
                value={editOutletDraft.namaOutlet}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, namaOutlet: value } : current,
                  )
                }
              />
              <div className="md:col-span-2">
                <OutletMapPicker
                  address={editOutletDraft.alamatOutlet}
                  latitude={editOutletDraft.latitude}
                  longitude={editOutletDraft.longitude}
                  onAddressChange={(value) =>
                    setEditOutletDraft((current) =>
                      current ? { ...current, alamatOutlet: value } : current,
                    )
                  }
                  onLatitudeChange={(value) =>
                    setEditOutletDraft((current) =>
                      current ? { ...current, latitude: value } : current,
                    )
                  }
                  onLongitudeChange={(value) =>
                    setEditOutletDraft((current) =>
                      current ? { ...current, longitude: value } : current,
                    )
                  }
                />
              </div>
              <SettingInput
                label="Email Outlet"
                type="email"
                value={editOutletDraft.email}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, email: value } : current,
                  )
                }
              />
              <SettingInput
                label="Nomor Telepon Outlet"
                type="tel"
                value={editOutletDraft.nomorTelepon}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, nomorTelepon: value } : current,
                  )
                }
              />
              <SettingInput
                label="Jam Buka"
                value={editOutletDraft.jamMulai}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, jamMulai: value } : current,
                  )
                }
              />
              <SettingInput
                label="Jam Tutup"
                value={editOutletDraft.jamSelesai}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, jamSelesai: value } : current,
                  )
                }
              />
              <SettingInput
                label="Kapasitas Harian"
                type="number"
                value={editOutletDraft.maxKapasitas}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, maxKapasitas: value } : current,
                  )
                }
                helper="Maks. pesanan per hari."
              />
              <SettingInput
                label="Nama Bank"
                value={editOutletDraft.namaBank}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, namaBank: value } : current,
                  )
                }
                helper='Contoh: BCA, BRI, Mandiri.'
              />
              <SettingInput
                label="Nomor Rekening"
                value={editOutletDraft.nomorRekening}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, nomorRekening: value } : current,
                  )
                }
              />
              <SettingInput
                className="md:col-span-2"
                label="Atas Nama"
                value={editOutletDraft.atasNama}
                onChange={(value) =>
                  setEditOutletDraft((current) =>
                    current ? { ...current, atasNama: value } : current,
                  )
                }
              />
            </div>

            {/* QRIS Upload */}
            <div className="space-y-3">
              <p className="text-sm font-extrabold text-(--odong-text)">Upload QRIS</p>
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-(--odong-border) bg-(--odong-surface-muted) p-5 transition hover:border-primary-300 hover:bg-primary-50/40">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setQrisFile(file);
                    setQrisPreviewError(null);
                    setQrisPreviewWarning(null);
                    setQrisPreview(URL.createObjectURL(file));
                    setQrisUploadError(null);
                    if (editOutletId) {
                      const uploadPromise = uploadQrisFile(file, editOutletId);
                      qrisUploadPromiseRef.current = uploadPromise;
                      void uploadPromise.finally(() => {
                        if (qrisUploadPromiseRef.current === uploadPromise) {
                          qrisUploadPromiseRef.current = null;
                        }
                      });
                    }
                  }}
                />
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-[28px] border border-(--odong-border) bg-(--odong-surface-strong) p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                  {qrisPreview || editOutletDraft.qrisUrl ? (
                    qrisPreviewError ? (
                      <div className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-(--odong-border) bg-(--odong-surface-muted) px-4 text-center text-(--odong-text)">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                          <Upload className="h-6 w-6" />
                        </span>
                        <p className="text-sm font-bold text-(--odong-text)">Preview QRIS gagal dimuat</p>
                        <p className="max-w-55 text-xs font-semibold text-(--odong-muted)">
                          Silakan pilih ulang file gambar, atau cek URL QRIS yang tersimpan.
                        </p>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrisPreview ?? editOutletDraft.qrisUrl ?? ""}
                        alt="Preview QRIS"
                        className="h-48 w-48 rounded-2xl bg-white object-contain p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        onError={() => setQrisPreviewError("Preview QRIS gagal dimuat")}
                        onLoad={(event) => {
                          setQrisPreviewError(null);
                          inspectQrisPreview(event.currentTarget);
                        }}
                      />
                    )
                  ) : (
                    <span className="flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 text-slate-300">
                      <span className="flex flex-col items-center gap-3 text-center">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm font-semibold">Belum ada gambar QRIS</span>
                      </span>
                    </span>
                  )}
                  {qrisPreview || editOutletDraft.qrisUrl ? (
                    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {qrisUploading ? "Menyimpan QRIS..." : "QRIS siap dipakai"}
                    </div>
                  ) : null}
                  {qrisPreviewWarning ? (
                    <p className="max-w-55 text-center text-[11px] font-semibold text-amber-200">
                      {qrisPreviewWarning}
                    </p>
                  ) : null}
                  {qrisUploadError ? (
                    <p className="max-w-55 text-center text-[11px] font-semibold text-rose-200">
                      {qrisUploadError}
                    </p>
                  ) : null}
                </div>
                <div className="text-center">
                  <p className="text-sm font-extrabold text-(--odong-text)">
                    {qrisFile ? qrisFile.name : "Klik untuk pilih gambar QRIS"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-(--odong-muted)">
                    PNG, JPG, atau WebP. Gambar akan disimpan ke Supabase Storage.
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-(--odong-muted)">
                    Pratinjau memakai latar gelap agar QR terlihat jelas.
                  </p>
                </div>
              </label>
            </div>

            <ToggleSetting
              label="Tutup Sementara"
              description="Outlet tidak akan muncul sebagai pilihan pelanggan saat pickup dijadwalkan."
              checked={editOutletDraft.isTutupSementara}
              onChange={(value) =>
                setEditOutletDraft((current) =>
                  current ? { ...current, isTutupSementara: value } : current,
                )
              }
            />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditOutletId(null);
                  setEditOutletDraft(null);
                }}
                className={adminSecondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEditOutlet()}
                className={adminPrimaryButtonClass}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        ) : null}
      </AdminDialog>

      <AdminDialog
        open={Boolean(deleteOutletId)}
        title="Hapus outlet?"
        description="Outlet yang dihapus akan ikut menghapus layanan yang menempel padanya. Tindakan ini tidak bisa dibatalkan."
        onClose={() => setDeleteOutletId(null)}
        size="sm"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setDeleteOutletId(null)}
            className={adminSecondaryButtonClass}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => deleteOutletId && void handleDeleteOutlet(deleteOutletId)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[20px] bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 active:scale-[0.98]"
          >
            Hapus outlet
          </button>
        </div>
      </AdminDialog>
    </div>
  );
}
