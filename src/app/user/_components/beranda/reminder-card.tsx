import { Plus } from "lucide-react";
import type { Reminder } from "./types";

type ReminderCardProps = {
  reminders: Reminder[];
};

export function ReminderCard({ reminders }: ReminderCardProps) {
  return (
    <aside className="rounded-2xl bg-[var(--odong-surface-strong)] p-4 shadow-[0_18px_40px_rgba(25,28,29,0.04)]">
      <h2 className="text-base font-bold text-[var(--odong-text)]">Pengingat Laundry</h2>
      <div className="mt-3 space-y-2">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <label
              key={reminder.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--odong-surface-soft)] px-3 py-2 transition hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--odong-border)] text-primary-600 focus:ring-primary-300"
                aria-label={`Tandai ${reminder.title}`}
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold leading-4 text-[var(--odong-text)]">
                  {reminder.title}
                </span>
                <span className="block truncate text-[9px] leading-3 text-[var(--odong-muted)]">
                  {reminder.dueDate}
                </span>
              </span>
            </label>
          ))
        ) : (
          <p className="rounded-xl bg-[var(--odong-surface-soft)] px-3 py-4 text-center text-xs text-[var(--odong-muted)]">
            Belum ada pengingat.
          </p>
        )}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Tambah Pengingat
      </button>
    </aside>
  );
}