import { CalendarDays, RotateCcw, Wrench } from "lucide-react";
import type { PriceRange } from "@/lib/directory-types";

type DirectoryFiltersProps = {
  priceRange: PriceRange;
  onPriceRangeChange: (value: PriceRange) => void;
  gearQuery: string;
  onGearQueryChange: (value: string) => void;
  availabilityDate: string;
  onAvailabilityDateChange: (value: string) => void;
  minDate: string;
  hasActiveFilters: boolean;
  onClear: () => void;
};

export function DirectoryFilters({
  priceRange,
  onPriceRangeChange,
  gearQuery,
  onGearQueryChange,
  availabilityDate,
  onAvailabilityDateChange,
  minDate,
  hasActiveFilters,
  onClear,
}: DirectoryFiltersProps) {
  return (
    <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Refine your search</h3>
          <p className="mt-1 text-xs text-neutral-500">Narrow by rate, kit or event date.</p>
        </div>
        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={onClear}
          className="inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-neutral-800 px-3 text-xs font-semibold text-neutral-300 transition hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={14} aria-hidden="true" />Reset filters
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-xs font-medium text-neutral-400">
          Price range
          <select className="market-filter-control" value={priceRange} onChange={(event) => onPriceRangeChange(event.target.value as PriceRange)}>
            <option value="any">Any starting rate</option>
            <option value="under-2500">Under R2,500</option>
            <option value="2500-5000">R2,500 - R5,000</option>
            <option value="5000-15000">R5,000 - R15,000</option>
            <option value="over-15000">R15,000+</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-neutral-400">
          <span className="inline-flex items-center gap-1.5"><Wrench size={13} aria-hidden="true" />Gear or skill</span>
          <input className="market-filter-control" type="search" value={gearQuery} onChange={(event) => onGearQueryChange(event.target.value)} placeholder="Pioneer DJ, RCF, Sony FX3..." />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-neutral-400">
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} aria-hidden="true" />Available on</span>
          <input className="market-filter-control" type="date" min={minDate} value={availabilityDate} onChange={(event) => onAvailabilityDateChange(event.target.value)} />
        </label>
      </div>
    </div>
  );
}