import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  href?: string;
  className?: string;
};

export function SectionHeader({
  title,
  actionLabel,
  href = "#",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-8 items-center justify-between gap-4 px-3",
        className,
      )}
    >
      <h2 className="text-lg font-bold leading-7 text-[var(--odong-text)]">
        {title}
      </h2>
      {actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#3d81ff] underline-offset-4 transition hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
