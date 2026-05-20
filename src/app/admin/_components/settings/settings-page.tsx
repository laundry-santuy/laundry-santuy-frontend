"use client";

import { useMemo, useState } from "react";
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
import { OutletServicesPanel } from "./outlet-services-panel";
import { PromoCodesPanel } from "./promo-codes-panel";
import {
  EmailSettingsPanel,
  SaveStatusCard,
  SecuritySettingsPanel,
} from "./settings-side-panels";

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
        "flex min-h-16 min-w-0 items-start gap-3 rounded-[24px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
        active
          ? "border-primary-100 bg-primary-50 text-primary-700 shadow-[0_12px_24px_rgba(0,88,202,0.08)]"
          : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] hover:bg-primary-50/50",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          active
            ? "bg-[var(--odong-surface-strong)] text-primary-600"
            : "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold leading-tight text-[var(--odong-text)]">
          {label}
        </span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--odong-muted)]">
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
      <span className="text-sm font-extrabold text-[var(--odong-text)]">
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
        <p className="text-xs font-semibold leading-5 text-[var(--odong-muted)]">
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
      <span className="text-sm font-extrabold text-[var(--odong-text)]">
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
        <p className="text-xs font-semibold leading-5 text-[var(--odong-muted)]">
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
    <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4">
      <div className="min-w-0">
        <p className="font-extrabold text-[var(--odong-text)]">{label}</p>
        <p className="mt-1 max-w-[50ch] text-sm leading-6 text-[var(--odong-muted)]">
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
          checked ? "bg-primary-600" : "bg-[var(--odong-surface-soft)]",
        )}
      >
        <span
          className={cn(
            "h-7 w-7 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
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
    <div className="flex min-h-[58px] items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-3">
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
            "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
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
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--odong-surface-strong)] text-primary-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-extrabold text-[var(--odong-text)]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<AdminSettingValues>(defaultAdminSettings);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SettingSectionId>("umum");
  const [outletPanelKey, setOutletPanelKey] = useState(0);
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

  const togglePromoCampaign = (campaignId: string) => {
    const nextCampaigns = promoCampaigns.map((campaign) =>
      campaign.id === campaignId
        ? { ...campaign, active: !campaign.active }
        : campaign,
    );

    setPromoCampaigns(nextCampaigns);
    persistPromoCampaigns(nextCampaigns);
  };

  const saveSettings = () => {
    persistPromoCampaigns();
    setSavedAt(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
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
  const operationalHours = `${settings.openTime} - ${settings.closeTime}`;

  const updateOperationalHours = (value: string) => {
    const [openTime, closeTime] = value.split("-").map((part) => part.trim());

    updateSetting("openTime", openTime || settings.openTime);

    if (closeTime) {
      updateSetting("closeTime", closeTime);
    }
  };

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
                  value={settings.defaultOutlet}
                  onChange={(value) => updateSetting("defaultOutlet", value)}
                />
                <SettingInput
                  className="md:col-span-2"
                  label="Alamat Outlet"
                  value={settings.outletAddress}
                  onChange={(value) => updateSetting("outletAddress", value)}
                />
                <SettingInput
                  className="md:col-span-2"
                  label="Jam Operasional"
                  value={operationalHours}
                  onChange={updateOperationalHours}
                  helper="Format 08:00 - 21:00."
                />
              </div>

              <div className="space-y-4 rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
                  Operasional tambahan
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingInput
                    label="Radius pickup"
                    value={settings.pickupRadiusKm}
                    onChange={(value) => updateSetting("pickupRadiusKm", value)}
                    helper="Gunakan angka desimal, misalnya 4.5."
                  />
                  <SettingInput
                    label="Kapasitas harian"
                    value={settings.dailyCapacityKg}
                    onChange={(value) => updateSetting("dailyCapacityKg", value)}
                    helper="Dalam kilogram laundry."
                  />
                </div>
                <div className="space-y-3">
                  <ToggleSetting
                    label="Auto assign kurir"
                    description="Pesanan baru otomatis diarahkan ke kurir tersedia."
                    checked={settings.autoAssignCourier}
                    onChange={(value) =>
                      updateSetting("autoAssignCourier", value)
                    }
                  />
                  <ToggleSetting
                    label="Pembayaran COD"
                    description="Pelanggan bisa membayar saat laundry diambil."
                    checked={settings.codEnabled}
                    onChange={(value) => updateSetting("codEnabled", value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "harga-promo" ? (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-primary-100 bg-primary-50/70 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-600">
                      Preview promo
                    </p>
                    <h4 className="mt-2 text-xl font-extrabold leading-tight text-[var(--odong-text)]">
                      Hemat {promoDraft.discount || defaultPromoDraft.discount} untuk Express
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
                      Tarif dasar {promoDraft.basePrice || defaultPromoDraft.basePrice} • Express{" "}
                      {promoDraft.expressSurcharge ||
                        defaultPromoDraft.expressSurcharge}{" "}
                      • Minimum order{" "}
                      {promoDraft.minimumOrder || defaultPromoDraft.minimumOrder}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-[22px] bg-[var(--odong-surface-strong)] px-4 py-3 text-right shadow-[0_10px_20px_rgba(0,88,202,0.06)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">
                      Kode
                    </p>
                    <p className="mt-1 font-mono text-lg font-extrabold tracking-wide text-[var(--odong-text)]">
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
                    "rounded-[24px] border px-4 py-3 text-sm font-semibold",
                    promoFeedback.tone === "success"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-rose-100 bg-rose-50 text-rose-600",
                  )}
                >
                  {promoFeedback.message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-[var(--odong-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[var(--odong-muted)]">
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
              <SaveStatusCard
                savedAt={savedAt}
                idleMessage="Perubahan layanan langsung tersimpan ke database."
              />
            </>
          ) : null}

          {isPromoSection ? (
            <>
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
    </div>
  );
}
