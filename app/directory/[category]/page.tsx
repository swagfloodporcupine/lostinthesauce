"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { sampleListings } from "@/lib/mock-listings";
import { VendorListingCard } from "@/components/vendor-listing-card";
import { CategoryBar } from "@/components/category-bar";
import {
  slugToCategory,
  type CategoryFilter,
  type VendorListing,
} from "@/lib/directory-types";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  DJs: "Professional Cape Town club, wedding and festival DJs with verified gear, mixes and transparent rates.",
  "Sound Engineers": "FOH and monitor engineers, PA systems, live line-checks and acoustics specialists in Cape Town.",
  Lighting: "Stage lighting rigs, moving heads, architectural uplighting, lasers and DMX controllers.",
  Photographers: "Event photographers capturing live moments, nightlife, weddings and corporate gatherings.",
  Videographers: "Cinema-grade event videographers, aftermovies, recap reels and multi-cam recordings.",
  Venues: "Cape Town event venues, warehouses, rooftops, outdoor lawns and private hire spaces.",
  "Photography & Video": "Top visual creators, event photographers and videographers across the Western Cape.",
  "Event Crews": "Turnkey technical and production crews for live music, festivals and corporate productions.",
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const targetCategory = slugToCategory(category) as CategoryFilter | null;
  const label = targetCategory && targetCategory !== "All"
    ? targetCategory
    : category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const listings: VendorListing[] = sampleListings.filter((l) => {
    if (!targetCategory || targetCategory === "All") return true;
    if (targetCategory === ("Photography & Video" as any)) {
      return l.category === "Photographers" || l.category === "Videographers";
    }
    return (
      l.category.toLowerCase() === targetCategory.toLowerCase() ||
      l.category.toLowerCase().replaceAll(" ", "-") === category.toLowerCase()
    );
  });

  const description =
    CATEGORY_DESCRIPTIONS[label] ||
    `Browse vetted ${label.toLowerCase()} suppliers, gear lists, and rates in Cape Town.`;

  return (
    <main className="marketplace-shell min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top Header */}
      <header className="marketplace-header sticky top-0 z-50 border-b border-neutral-800/90 bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 lg:px-8">
          <Link
            className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white transition hover:opacity-90"
            href="/"
            aria-label="VibeShift home"
          >
            <svg
              className="h-5 w-5 text-cyan-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 10v4" />
              <path d="M8 6v12" />
              <path d="M12 3v18" />
              <path d="M16 8v8" />
              <path d="M20 11v2" />
            </svg>
            <span>
              vibe<span className="text-cyan-400">shift</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/directory"
              className="text-neutral-300 transition hover:text-white"
            >
              All Categories
            </Link>
            <Link
              href="/dashboard"
              className="text-neutral-300 transition hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/join"
              className="rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-neutral-950 transition hover:bg-cyan-300"
            >
              List Your Services
            </Link>
          </nav>
        </div>
      </header>

      {/* Interactive Category Bar */}
      <CategoryBar activeCategory={targetCategory ?? "All"} />

      {/* Category Hero / Title */}
      <section className="mx-auto max-w-7xl px-5 pt-10 pb-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to full directory
          </Link>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {label} in Cape Town
            </h1>
            <p className="mt-3 max-w-2xl text-base text-neutral-400">
              {description}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3.5 py-2 text-sm text-neutral-300 backdrop-blur-md">
            <span className="font-semibold text-white">{listings.length}</span>{" "}
            verified profiles
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        {listings.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <VendorListingCard
                key={listing.id}
                listing={listing}
                inCrew={false}
                onSelect={() => {}}
                onToggleCrew={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-16 text-center">
            <Sparkles className="mx-auto mb-4 text-cyan-300" size={24} aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">
              No profiles listed under {label} yet.
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Be the first to list your {label.toLowerCase()} services in Cape Town.
            </p>
            <Link
              href="/join"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-cyan-300"
            >
              List your services
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
