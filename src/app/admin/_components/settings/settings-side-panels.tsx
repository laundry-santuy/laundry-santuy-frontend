import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Check,
  Clock3,
  Globe2,
  KeyRound,
  Mail,
  PencilLine,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AdminPanel } from "../admin-page";
import { AdminIconButton } from "../admin-table-tools";
import type { AdminSettingValues } from "../types";

type SettingsSidePanelItem = {
  title: string;
  description: string;
  value: string;
  status: string;
  active: boolean;
  icon: LucideIcon;
  editLabel: string;
  onEdit: () => void;
  onToggle?: () => void;
};

function SettingsSideListPanel({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: SettingsSidePanelItem[];
}) {
  return (
    <AdminPanel title={title} description={description} icon={icon}>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={cn(
                "flex items-center justify-between gap-4 rounded-[24px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-4",
                !item.active && "opacity-80",
              )}
            >
              <button
                type="button"
                onClick={item.onEdit}
                className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    item.active
                      ? "bg-primary-50 text-primary-600"
                      : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-[var(--odong-text)]">
                      {item.title}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        item.active
                          ? "bg-primary-50 text-primary-700"
                          : "bg-[var(--odong-surface-soft)] text-[var(--odong-muted)]",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-xs font-semibold leading-5 text-[var(--odong-muted)]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--odong-muted-soft)]">
                    {item.description}
                  </p>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <AdminIconButton
                  icon={PencilLine}
                  label={item.editLabel}
                  tone="neutral"
                  onClick={item.onEdit}
                />
                {item.onToggle ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.active}
                    aria-label={`${item.active ? "Nonaktifkan" : "Aktifkan"} ${item.title}`}
                    onClick={item.onToggle}
                    className={cn(
                      "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                      item.active
                        ? "bg-primary-600"
                        : "bg-[var(--odong-surface-soft)]",
                    )}
                  >
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full bg-[var(--odong-surface-strong)] shadow-[0_8px_16px_rgba(25,28,29,0.12)] transition",
                        item.active ? "translate-x-6" : "translate-x-0",
                      )}
                    />
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </AdminPanel>
  );
}

export function EmailSettingsPanel({
  settings,
  onFocusField,
  onToggleDailySummary,
}: {
  settings: AdminSettingValues;
  onFocusField: (fieldId: string) => void;
  onToggleDailySummary: () => void;
}) {
  const items: SettingsSidePanelItem[] = [
    {
      title: settings.senderName,
      value: settings.senderEmail,
      description: "Identitas pengirim untuk notifikasi transaksi.",
      status: settings.senderEmail ? "Aktif" : "Perlu email",
      active: Boolean(settings.senderEmail),
      icon: Mail,
      editLabel: "Edit email pengirim",
      onEdit: () => onFocusField("settings-sender-email"),
    },
    {
      title: "SMTP utama",
      value: settings.smtpHost,
      description: "Server pengiriman email aplikasi.",
      status: settings.smtpHost ? "Terhubung" : "Perlu host",
      active: Boolean(settings.smtpHost),
      icon: Globe2,
      editLabel: "Edit SMTP host",
      onEdit: () => onFocusField("settings-smtp-host"),
    },
    {
      title: "Email operasional",
      value: settings.opsEmail,
      description: settings.dailySummaryEmail
        ? "Ringkasan harian aktif untuk tim operasional."
        : "Ringkasan harian sedang nonaktif.",
      status: settings.dailySummaryEmail ? "Ringkasan aktif" : "Nonaktif",
      active: settings.dailySummaryEmail,
      icon: Bell,
      editLabel: "Edit email operasional",
      onEdit: () => onFocusField("settings-ops-email"),
      onToggle: onToggleDailySummary,
    },
  ];

  return (
    <SettingsSideListPanel
      title="Kanal Email"
      description={`${items.filter((item) => item.active).length} kanal siap dipakai untuk notifikasi.`}
      icon={Mail}
      items={items}
    />
  );
}

export function SecuritySettingsPanel({
  settings,
  onFocusField,
  onToggleTwoFactor,
}: {
  settings: AdminSettingValues;
  onFocusField: (fieldId: string) => void;
  onToggleTwoFactor: () => void;
}) {
  const items: SettingsSidePanelItem[] = [
    {
      title: "Two-factor authentication",
      value: settings.twoFactorRequired ? "Wajib untuk admin" : "Belum wajib",
      description: "Lapisan verifikasi tambahan saat login.",
      status: settings.twoFactorRequired ? "Aktif" : "Nonaktif",
      active: settings.twoFactorRequired,
      icon: ShieldCheck,
      editLabel: "Edit 2FA",
      onEdit: () => onFocusField("settings-two-factor"),
      onToggle: onToggleTwoFactor,
    },
    {
      title: "Timeout sesi",
      value: `${settings.sessionTimeoutMinutes} menit tanpa aktivitas`,
      description: "Sesi admin otomatis berakhir saat idle.",
      status: "Terkontrol",
      active: true,
      icon: Clock3,
      editLabel: "Edit timeout sesi",
      onEdit: () => onFocusField("settings-session-timeout"),
    },
    {
      title: "Batas percobaan login",
      value: `${settings.loginAttemptLimit} kali sebelum dibatasi`,
      description: "Menahan percobaan akses yang berulang.",
      status: "Aktif",
      active: true,
      icon: KeyRound,
      editLabel: "Edit batas percobaan login",
      onEdit: () => onFocusField("settings-login-attempts"),
    },
  ];

  return (
    <SettingsSideListPanel
      title="Kontrol Keamanan"
      description="Ringkasan aturan akses yang sedang berlaku."
      icon={ShieldCheck}
      items={items}
    />
  );
}

export function SaveStatusCard({
  savedAt,
  idleMessage = "Belum ada perubahan yang disimpan di sesi ini.",
}: {
  savedAt: string | null;
  idleMessage?: string;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-5 shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
      <div className="flex items-start gap-3">
        {savedAt ? (
          <Check
            className="mt-1 h-5 w-5 shrink-0 text-emerald-600"
            aria-hidden="true"
          />
        ) : (
          <Clock3
            className="mt-1 h-5 w-5 shrink-0 text-primary-600"
            aria-hidden="true"
          />
        )}
        <div>
          <p className="font-extrabold text-[var(--odong-text)]">
            Status simpan
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
            {savedAt
              ? `Perubahan terakhir tersimpan pukul ${savedAt}.`
              : idleMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
