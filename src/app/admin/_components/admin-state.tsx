import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";

type AdminStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

function AdminStateCard({
  title,
  description,
  icon: Icon = Inbox,
}: AdminStateProps) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] p-8 text-center shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
      <div className="max-w-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-[var(--odong-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--odong-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function AdminEmptyState({ title, description }: AdminStateProps) {
  return (
    <AdminStateCard
      title={title}
      description={description}
      icon={Inbox}
    />
  );
}

export function AdminErrorState({ title, description }: AdminStateProps) {
  return (
    <AdminStateCard
      title={title}
      description={description}
      icon={AlertTriangle}
    />
  );
}

export function AdminLoadingState() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] shadow-[0_18px_48px_rgba(25,28,29,0.06)]">
      <div className="flex animate-pulse items-center gap-3 border-b border-[var(--odong-border)] bg-[var(--odong-surface-soft)] px-5 py-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-200">
          <LoaderCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <div className="h-4 w-40 rounded-full bg-primary-100/80" />
          <div className="h-3 w-24 rounded-full bg-primary-100/60" />
        </div>
      </div>

      <div className="divide-y divide-[var(--odong-border)]">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="grid animate-pulse gap-4 px-5 py-4 md:grid-cols-[minmax(0,1.8fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_120px]"
          >
            <div className="space-y-2">
              <div className="h-4 w-44 max-w-full rounded-full bg-[var(--odong-surface-muted)]" />
              <div className="h-3 w-28 max-w-full rounded-full bg-[var(--odong-surface-muted)]" />
            </div>
            <div className="h-4 w-24 rounded-full bg-[var(--odong-surface-muted)]" />
            <div className="h-4 w-28 rounded-full bg-[var(--odong-surface-muted)]" />
            <div className="h-9 w-full rounded-2xl bg-primary-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
