import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type PlaceholderDetail = {
  label: string;
  value: string;
};

type PlaceholderAction = {
  label: string;
  href: string;
  external?: boolean;
};

type DriverPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  details?: PlaceholderDetail[];
  action?: PlaceholderAction;
};

export function DriverPlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  details = [],
  action,
}: DriverPlaceholderPageProps) {
  const actionClassName =
    "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(38,113,238,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]";

  return (
    <section className="rounded-[32px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-6 shadow-[0_18px_46px_rgba(25,28,29,0.07)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-extrabold text-primary-700">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[var(--odong-text)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--odong-muted)] sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-primary-50 text-primary-600">
          <Icon className="h-10 w-10" aria-hidden="true" />
        </div>
      </div>

      {details.length > 0 ? (
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] px-4 py-3"
            >
              <p className="text-xs font-bold text-[var(--odong-muted)]">
                {detail.label}
              </p>
              <p className="mt-1 text-lg font-extrabold text-[var(--odong-text)]">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {action ? (
        <div className="mt-7">
          {action.external ? (
            <a
              href={action.href}
              target="_blank"
              rel="noreferrer"
              className={actionClassName}
            >
              {action.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <Link href={action.href} className={actionClassName}>
              {action.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : null}
    </section>
  );
}
