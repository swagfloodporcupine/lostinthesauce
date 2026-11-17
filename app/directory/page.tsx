"use client";

import Link from "next/link";
import { ArrowRight, Music2, Lightbulb, Building2, Camera, Video, Sparkles } from "lucide-react";
import { sampleListings } from "@/lib/mock-listings";
import { VendorListingCard } from "@/components/vendor-listing-card";
import { CategoryBar } from "@/components/category-bar";
import { listingCategories } from "@/lib/directory-types";

const categoryMeta: Record<string, { icon: any; count: number; desc: string; slug: string }> = {
  DJs: {
    icon: Music2,
    count: sampleListings.filter((l) => l.category === "DJs").length,
    desc: "Club, wedding and underground vinyl selectors",
    slug: "djs",
  },
  "Sound Engineers": {
    icon: Lightbulb,
    count: sampleListings.filter((l) => l.category === "Sound Engineers").length,
    desc: "FOH, monitor and live line-check sound techs",
    slug: "sound-engineers",
  },
  Lighting: {
    icon: Building2,
    count: sampleListings.filter((l) => l.category === "Lighting").length,
    desc: "Moving heads, DMX rigging and stage illumination",
    slug: "lighting",
  },
  Photographers: {
    icon: Camera,
    count: sampleListings.filter((l) => l.category === "Photographers").length,
    desc: "Event, crowd and low-light visual photographers",
    slug: "photographers",
  },
  Videographers: {
    icon: Video,
    count: sampleListings.filter((l) => l.category === "Videographers").length,
    desc: "4K recap reels, aftermovies and multicam crews",
    slug: "videographers",
  },
  Venues: {
    icon: Building2,
    count: sampleListings.filter((l) => l.category === "Venues").length,
    desc: "Rooftops, warehouses and outdoor garden spaces",
    slug: "venues",
  },
};

export default function DirectoryPage() {
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
            <Link href="/" className="text-neutral-300 transition hover:text-white">
              Home
            </Link>
            <Link href="/dashboard" className="text-neutral-300 transition hover:text-white">
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
      <CategoryBar activeCategory="All" />

      {/* Directory Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Cape Town Event Directory
            </h1>
            <p className="mt-3 max-w-2xl text-base text-neutral-400">
              Browse verified event talent, sound engineers, production equipment and venues across Cape Town and the Western Cape.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3.5 py-2 text-sm text-neutral-300 backdrop-blur-md">
            <span className="font-semibold text-white">{sampleListings.length}</span> verified suppliers
          </div>
        </div>

        {/* Category Cards Overview */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listingCategories.map((category) => {
            const meta = categoryMeta[category];
            const Icon = meta?.icon || Sparkles;
            const slug = meta?.slug || category.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={category}
                href={`/directory/${slug}`}
                className="group relative rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:border-cyan-400/50 hover:bg-neutral-900/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg border border-neutral-700 bg-neutral-950 text-cyan-400 group-hover:border-cyan-400/40">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-white group-hover:text-cyan-300 transition">
                        {category}
                      </h2>
                      <span className="text-xs text-neutral-400">
                        {meta?.count ?? 0} profiles
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-neutral-400">
                  {meta?.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Suppliers Listing Section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 pb-20 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">All Cape Town Suppliers</h2>
          <span className="text-xs text-neutral-400">Sorted by relevance & rating</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sampleListings.map((listing) => (
            <VendorListingCard
              key={listing.id}
              listing={listing}
              inCrew={false}
              onSelect={() => {}}
              onToggleCrew={() => {}}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
