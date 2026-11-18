"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { sampleListings } from "@/lib/mock-listings";
import { VendorListingCard } from "@/components/vendor-listing-card";
import { CategoryBar } from "@/components/category-bar";
import { SiteHeader } from "@/components/site-header";
import {
  slugToCategory,
  type CategoryFilter,
  type VendorListing,
} from "@/lib/directory-types";
import { useCrew } from "@/lib/crew-store";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "DJs and Entertainment": "Professional Cape Town club, wedding and festival DJs with verified gear, mixes and transparent rates.",
  "Sound, Lighting and AV": "FOH and monitor engineers, PA systems, live line-checks and acoustics specialists in Cape Town.",
  "Staging and Production": "Stage lighting rigs, moving heads, architectural uplighting, lasers and DMX controllers.",
  "Photography and Videography": "Event photographers and videographers capturing live moments, nightlife, weddings and corporate gatherings.",
  "Venues and Accommodation": "Cape Town event venues, warehouses, rooftops, outdoor lawns and private hire spaces.",
  "Catering and Beverages": "Professional catering, bars, food trucks and beverage services for events across Cape Town.",
  "Furniture and Equipment Rentals": "Furniture, staging, AV equipment and production gear rentals for events.",
  "Decor and Floristry": "Event styling, floral design, draping, and decorative installations.",
  "Event Staffing and Security": "Event crew, security personnel, wait staff, and production teams.",
  "Transport and Logistics": "Event transport, logistics, equipment delivery and crew shuttles.",
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
    return (
      l.category.toLowerCase() === targetCategory.toLowerCase() ||
      l.category.toLowerCase().replaceAll(" ", "-") === category.toLowerCase()
    );
  });

  const description =
    CATEGORY_DESCRIPTIONS[label] ||
    `Browse vetted ${label.toLowerCase()} suppliers, gear lists, and rates in Cape Town.`;

  const { isInCrew, toggleListing } = useCrew();

  return (
    <main className="marketplace-shell min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top Header */}
      <SiteHeader>
        <Link href="/directory" className="text-neutral-300 transition hover:text-white">
          All Categories
        </Link>
        <Link href="/dashboard" className="text-neutral-300 transition hover:text-white">
          Dashboard
        </Link>
        <Link href="/join" className="btn-hero-solid">
          List Your Services
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </SiteHeader>

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
          <div className="vs-list grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing, index) => (
              <div key={listing.id} style={{"--i": index} as React.CSSProperties}>
                <VendorListingCard
                  listing={listing}
                  inCrew={isInCrew(listing.id)}
                  onSelect={() => {}}
                  onToggleCrew={toggleListing}
                />
              </div>
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
