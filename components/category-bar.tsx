"use client";

import Link from "next/link";
import {
  Sparkles,
  Music2,
  Utensils,
  Building2,
  Camera,
  AudioWaveform,
  Clapperboard,
  Armchair,
  Flower,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import {
  categoryFilters,
  categoryToSlug,
  type CategoryFilter,
} from "@/lib/directory-types";

export const categoryIcons: Record<CategoryFilter, LucideIcon> = {
  All: Sparkles,
  "DJs and Entertainment": Music2,
  "Venues and Accommodation": Building2,
  "Catering and Beverages": Utensils,
  "Photography and Videography": Camera,
  "Sound, Lighting and AV": AudioWaveform,
  "Staging and Production": Clapperboard,
  "Furniture and Equipment Rentals": Armchair,
  "Decor and Floristry": Flower,
  "Event Staffing and Security": ShieldCheck,
  "Transport and Logistics": Truck,
};

export function getCategoryHref(category: CategoryFilter): string {
  if (category === "All") return "/directory";
  const slug = categoryToSlug(category);
  return `/directory/${slug}`;
}

type CategoryBarProps = {
  activeCategory?: CategoryFilter;
  onSelect?: (category: CategoryFilter) => void;
  className?: string;
};

export function CategoryBar({
  activeCategory = "All",
  onSelect,
  className = "",
}: CategoryBarProps) {
  return (
    <div className={`border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm ${className}`}>
      <nav
        className="marketplace-filter-scroll mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8"
        aria-label="Talent and supplier categories"
      >
        {categoryFilters.map((category) => {
          const Icon = categoryIcons[category];
          const active = activeCategory === category;
          const href = getCategoryHref(category);

          return (
            <Link
              key={category}
              href={href}
              onClick={() => {
                if (onSelect) onSelect(category);
              }}
              aria-current={active ? "page" : undefined}
              className={`category-chip inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${
                active
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                  : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-100"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{category}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
