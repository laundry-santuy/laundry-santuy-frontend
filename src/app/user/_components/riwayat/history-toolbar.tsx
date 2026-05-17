import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter, Search, X } from "lucide-react";
import type { HistoryFilter } from "./types";

type HistoryToolbarProps = {
  filters: HistoryFilter[];
  activeFilter: HistoryFilter;
  searchQuery: string;
  resultCount: number;
  onFilterChange: (filter: HistoryFilter) => void;
  onSearchChange: (query: string) => void;
};

export function HistoryToolbar({
  filters,
  activeFilter,
  searchQuery,
  resultCount,
  onFilterChange,
  onSearchChange,
}: HistoryToolbarProps) {
  return (
    <section className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Buka filter riwayat"
            className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--odong-border)] bg-[var(--odong-surface)] text-[var(--odong-text)] shadow-[0_14px_34px_rgba(25,28,29,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary-100 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
              <ListFilter className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="absolute -right-1 -top-1 rounded-full border border-white bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(0,88,202,0.18)]">
              {resultCount}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          sideOffset={12}
          className="w-[min(calc(100vw-32px),560px)] rounded-[28px] border border-[var(--odong-border)] bg-[var(--odong-surface)] p-4 text-[var(--odong-text)] shadow-[0_24px_58px_rgba(25,28,29,0.14)] backdrop-blur-xl sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-extrabold text-[var(--odong-text)]">
                Filter riwayat
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--odong-muted)]">
                {resultCount} order ditemukan
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onFilterChange("Semua");
                onSearchChange("");
              }}
              className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Reset
            </button>
          </div>

          <label className="relative mt-4 block min-w-0">
            <span className="sr-only">Cari riwayat order</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
              aria-hidden="true"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari ID, layanan, outlet..."
              className="h-[52px] w-full rounded-[22px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)] pl-11 pr-12 text-sm font-semibold text-[var(--odong-text)] outline-none transition placeholder:text-[var(--odong-muted-soft)] focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.96]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filters.map((filter) => {
              const active = filter === activeFilter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onFilterChange(filter)}
                  className={cn(
                    "h-11 rounded-[18px] border px-3 text-sm font-extrabold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]",
                    active
                      ? "border-primary-600 bg-primary-600 text-white shadow-[0_10px_20px_rgba(0,88,202,0.16)]"
                      : "border-[var(--odong-border)] bg-[var(--odong-surface-strong)] text-[var(--odong-muted)] hover:border-primary-100 hover:text-primary-700",
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </section>
  );
}
