"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  Camera,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Music2,
  Search,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { DirectoryFilters } from "@/components/directory-filters";
import { EventCrewBuilder } from "@/components/event-crew-builder";
import { VendorListingCard } from "@/components/vendor-listing-card";
import { VendorProfileDialog } from "@/components/vendor-profile-dialog";
import { CategoryBar } from "@/components/category-bar";
import { HeroStage3D } from "@/components/hero-stage-3d";
import {
  categoryFilters,
  categoryFromValue,
  type CategoryFilter,
  type LiveListing,
  type PriceRange,
  type VendorListing,
} from "@/lib/directory-types";
import { sampleListings } from "@/lib/mock-listings";



function liveToListing(live: LiveListing): VendorListing | null {
  const category = categoryFromValue(live.category);
  if (!category) return null;
  const city = live.city || "Cape Town";
  const winelands = /stellenbosch|paarl|franschhoek/i.test(city);
  const fallbackImage = sampleListings.find((listing) => listing.category === category)?.image ?? sampleListings[0].image;

  return {
    id: live.id,
    slug: live.slug,
    name: live.title,
    category,
    area: city,
    region: winelands ? "Cape Winelands, ZA" : "Cape Town, ZA",
    locationCode: winelands ? "WC" : "CT",
    bio: `${live.displayName || "Local event professional"} · Available for events around ${city}.`,
    summary: `${live.displayName || "Local event professional"} · ${category} based in ${city}.`,
    tags: [category, "Local events"],
    gear: [],
    rateFrom: live.rateFrom,
    rateTo: live.rateTo,
    rateUnit: category === "DJs" ? "set" : "booking",
    image: live.coverImageUrl || fallbackImage,
    avatarImage: live.avatarUrl,
    verified: Boolean(live.verifiedAt),
    rating: null,
    reviewCount: 0,
    unavailableDates: [],
    portfolio: [],
    mixTitle: null,
    techRider: [],
    reviews: [],
    sample: false,
    instagram: null,
    soundcloud: null,
  };
}

function localDateString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function matchesPriceRange(listing: VendorListing, range: PriceRange): boolean {
  if (range === "any") return true;
  if (listing.rateFrom === null) return false;
  if (range === "under-2500") return listing.rateFrom < 2500;
  if (range === "2500-5000") return listing.rateFrom >= 2500 && listing.rateFrom <= 5000;
  if (range === "5000-15000") return listing.rateFrom > 5000 && listing.rateFrom <= 15000;
  return listing.rateFrom > 15000;
}

export default function HomeMarketplace({ liveListings }: { liveListings: LiveListing[] }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [keyword, setKeyword] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [region, setRegion] = useState("Cape Town, ZA");
  const [priceRange, setPriceRange] = useState<PriceRange>("any");
  const [gearQuery, setGearQuery] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [selectedListing, setSelectedListing] = useState<VendorListing | null>(null);
  const [crewListingIds, setCrewListingIds] = useState<string[]>([]);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".appear");
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName && event.target instanceof HTMLElement) event.target.classList.add("is-in");
    };
    els.forEach((el) => el.addEventListener("animationend", onEnd, { once: true }));
    const rafs: number[] = [];
    const check = () => {
      let allDone = true;
      els.forEach((el) => {
        const anims = el.getAnimations();
        const running = anims.some((a) => a.playState === "running");
        if (running) allDone = false;
        if (!el.classList.contains("is-in")) allDone = false;
      });
      if (!allDone && rafs.length < 4) {
        rafs.push(requestAnimationFrame(check));
      } else {
        els.forEach((el) => el.classList.add("is-in"));
        rafs.forEach((id) => cancelAnimationFrame(id));
      }
    };
    rafs.push(requestAnimationFrame(check));
    return () => {
      els.forEach((el) => el.removeEventListener("animationend", onEnd));
      rafs.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  const listings = [...sampleListings, ...liveListings.map(liveToListing).filter((listing): listing is VendorListing => listing !== null)];
  const crewListings = listings.filter((listing) => crewListingIds.includes(listing.id));

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        keywordInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const visibleListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
    const searchable = `${listing.name} ${listing.category} ${listing.summary} ${listing.tags.join(" ")}`.toLowerCase();
    const matchesKeyword = searchable.includes(keyword.trim().toLowerCase());
    const matchesArea = `${listing.area} ${listing.region}`.toLowerCase().includes(areaQuery.trim().toLowerCase());
    const matchesRegion = region === "All South Africa" || listing.region === region;
    const searchableGear = [...listing.gear, ...listing.tags].join(" ").toLowerCase();
    const matchesGear = searchableGear.includes(gearQuery.trim().toLowerCase());
    const matchesAvailability = !availabilityDate || !listing.unavailableDates.includes(availabilityDate);
    return matchesCategory && matchesKeyword && matchesArea && matchesRegion && matchesPriceRange(listing, priceRange) && matchesGear && matchesAvailability;
  });
  const hasActiveFilters = selectedCategory !== "All" || keyword !== "" || areaQuery !== "" || region !== "Cape Town, ZA" || priceRange !== "any" || gearQuery !== "" || availabilityDate !== "";

  function clearFilters() {
    setSelectedCategory("All");
    setKeyword("");
    setAreaQuery("");
    setRegion("Cape Town, ZA");
    setPriceRange("any");
    setGearQuery("");
    setAvailabilityDate("");
  }

  function toggleCrewListing(listing: VendorListing) {
    setCrewListingIds((current) => current.includes(listing.id)
      ? current.filter((id) => id !== listing.id)
      : [...current, listing.id]);
  }

  return (
    <main className="marketplace-shell min-h-screen bg-neutral-950 text-neutral-100">
      <header className="marketplace-header sticky top-0 z-50 border-b border-neutral-800/90 bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto grid min-h-[62px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 lg:px-8">
          <Link className="appear inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white justify-self-start transition hover:opacity-90" style={{"--d":"0.08s"} as React.CSSProperties} href="/" aria-label="VibeShift home">
            <svg className="h-5 w-5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10v4" />
              <path d="M8 6v12" />
              <path d="M12 3v18" />
              <path d="M16 8v8" />
              <path d="M20 11v2" />
            </svg>
            <span>vibe<span className="text-cyan-400">shift</span></span>
          </Link>
          <nav id="site-nav" className="marketplace-nav justify-self-center flex items-center gap-3" aria-label="Primary">
            <Link className="btn-liquid appear" style={{"--d":"0.16s"} as React.CSSProperties} href="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <div className="appear" style={{"--d":"0.28s"} as React.CSSProperties}><EventCrewBuilder listings={crewListings} onRemove={(id) => setCrewListingIds((current) => current.filter((itemId) => itemId !== id))} /></div>
            <Link className="btn-hero-solid appear" style={{"--d":"0.34s"} as React.CSSProperties} href="/join" onClick={closeMenu}>List Your Services<ArrowUpRight size={13} aria-hidden="true" /></Link>
          </nav>
          <div className="justify-self-end flex items-center gap-3">
            <button className="burger" type="button" aria-controls="site-nav" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={toggleMenu}>
              <span className="burger-bar" />
              <span className="burger-bar" />
            </button>
          </div>
        </div>
        <div className="menu-backdrop" onClick={closeMenu} />
      </header>

      <CategoryBar
        activeCategory={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat)}
      />

      <section className="marketplace-hero">
        <HeroStage3D />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="relative z-10">
            <h1 className="appear max-w-3xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl" style={{"--d":"0.42s"} as React.CSSProperties}>Curating your <em className="text-neutral-500">next event</em> with <span className="inline-block">Cape Town&apos;s event crew.</span></h1>
            <p className="appear mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg" style={{"--d":"0.82s"} as React.CSSProperties}>Compare local DJs, sound engineers, production crews and venues by rate, availability and gear.</p>
            <div className="appear hero-actions mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-400" style={{"--d":"1.12s"} as React.CSSProperties}><a className="btn-hero-solid appear inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-cyan-200" style={{"--d":"1.28s"} as React.CSSProperties} href="#directory">Explore the directory</a><Link className="btn-liquid appear inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900/50" style={{"--d":"1.34s"} as React.CSSProperties} href="/join">List your services</Link></div>
          </div>

            <form className="appear relative z-10 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-5" onSubmit={(event) => { event.preventDefault(); window.location.href = "/directory"; }} role="search" style={{"--d":"1.10s"} as React.CSSProperties}>
              <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">Search local suppliers</p><p className="mt-1 text-xs text-neutral-400">Filter by service, sound or suburb.</p></div><span className="rounded-md border border-neutral-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Directory</span></div>
              <label className="mb-3 flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-950/80 px-3"><Search size={17} className="shrink-0 text-cyan-300" aria-hidden="true" /><input ref={keywordInputRef} className="marketplace-input border-0 bg-transparent px-0 focus:shadow-none" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="DJ, sound engineer, venue..." aria-label="Search talent and production" aria-keyshortcuts="Meta+K Control+K" /></label>
              <label className="mb-4 flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-950/80 px-3"><MapPin size={17} className="shrink-0 text-fuchsia-300" aria-hidden="true" /><input className="marketplace-input border-0 bg-transparent px-0 focus:shadow-none" value={areaQuery} onChange={(event) => setAreaQuery(event.target.value)} placeholder="Area or suburb" aria-label="Filter by area or suburb" /></label>
              <button type="submit" className="appear btn-hero-solid inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-neutral-950 transition hover:bg-cyan-200" style={{"--d":"1.28s"} as React.CSSProperties}>Explore the directory<ArrowDown size={16} aria-hidden="true" /></button>
            </form>
        </div>
      </section>

      <section id="directory" className="mx-auto max-w-7xl scroll-mt-32 px-5 py-12 sm:py-16 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-3xl font-semibold text-white sm:text-4xl">Browse local suppliers.</h2><p className="mt-2 text-sm text-neutral-400">Compare profiles by service, rates, gear and area.</p></div>
          <p className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 backdrop-blur-md"><span className="font-semibold text-white">{visibleListings.length}</span> profiles</p>
        </div>

        <DirectoryFilters
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          gearQuery={gearQuery}
          onGearQueryChange={setGearQuery}
          availabilityDate={availabilityDate}
          onAvailabilityDateChange={setAvailabilityDate}
          minDate={localDateString()}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />

        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-400" aria-live="polite"><span>Showing</span><span className="font-semibold text-neutral-200">{selectedCategory === "All" ? "all categories" : selectedCategory}</span>{areaQuery && <span>near <span className="font-semibold text-neutral-200">{areaQuery}</span></span>}{region !== "All South Africa" && <span>in <span className="font-semibold text-neutral-200">{region.replace(", ZA", "")}</span></span>}</div>

        {visibleListings.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleListings.map((listing) => <VendorListingCard key={listing.id} listing={listing} inCrew={crewListingIds.includes(listing.id)} onSelect={setSelectedListing} onToggleCrew={toggleCrewListing} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 px-6 py-16 text-center"><Sparkles className="mx-auto mb-4 text-cyan-300" size={24} aria-hidden="true" /><h3 className="text-lg font-semibold text-white">No matches this time.</h3><p className="mt-2 text-sm text-neutral-400">Try another category, keyword, gear requirement or event date.</p><button type="button" className="mt-5 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-cyan-300/50 hover:text-white" onClick={clearFilters}>Clear filters</button></div>
        )}

        <VendorProfileDialog listing={selectedListing} inCrew={selectedListing ? crewListingIds.includes(selectedListing.id) : false} onClose={() => setSelectedListing(null)} onToggleCrew={toggleCrewListing} />
      </section>

      <section className="stats-footer">
        <div className="stat">
          <Sparkles size={20} className="text-neutral-200" aria-hidden="true" />
          <span>12K+ Cape Town suppliers</span>
        </div>
        <div className="stat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-200" aria-hidden="true"><path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z"/></svg>
          <span>1.5K+ events powered</span>
        </div>
        <div className="stat">
          <svg width="20" height="14" viewBox="0 0 40 22" fill="currentColor" className="text-neutral-200 stat-icon-wide" aria-hidden="true">
            <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
            <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
            <circle cx="16.7" cy="11" r="9.2" fill="#ffffff" />
            <circle cx="16.7" cy="11" r="1.7" fill="#1a1a1a" />
            <path d="M16.7 16.8c2.2-2.5 0-5.7-1.8-5.7s-1.8 3.2-3.9 5.7c0 0 2.2-2.5 1.8-5.7s0-3.9-1.8-5.7c1.8 2.5 3.9 5.7 3.9 5.7s-1.8-3.2-3.9-5.7c0 0-1.8 3.2-3.9 5.7s1.8 3.2 3.9 5.7" fill="#111" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="30.2" cy="11" r="7.2" fill="#f26b1d" />
            <text x="30.2" y="15.1" fontFamily="system-ui, sans-serif" fontSize="12.5" fontWeight="700" fill="#ffffff" textAnchor="middle">V</text>
          </svg>
          <span>4.9 avg vendor rating</span>
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-5 py-7 text-sm text-neutral-500 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><span className="font-bold text-neutral-200">vibe<span className="text-cyan-400">shift</span></span><span>Cape Town event services · Rates, availability and gear</span></div></footer>
    </main>
  );
}