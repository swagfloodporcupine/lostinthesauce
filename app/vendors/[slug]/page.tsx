import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ImageIcon,
  Instagram,
  MapPin,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sampleListings } from "@/lib/mock-listings";
import { formatZar, type PortfolioItem, type TechRiderItem } from "@/lib/directory-types";
import { siteUrl } from "@/lib/site";
import { VendorMediaKit } from "@/components/vendor-media-kit";
import { SiteHeader } from "@/components/site-header";
import { DEPOSIT_RATE, QUOTE_VALID_DAYS } from "@/lib/vendor-documents";

export const dynamic = "force-dynamic";

type VendorProfile = {
  title: string;
  category: string;
  displayName: string;
  city: string;
  bio: string;
  rateFrom: number | null;
  rateTo: number | null;
  rateUnit: string;
  coverImageUrl: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  gear: string[];
  tags: string[];
  techRider: TechRiderItem[];
  portfolio: PortfolioItem[];
  instagram: string | null;
  sample: boolean;
};

async function loadVendor(slug: string): Promise<VendorProfile | null> {
  let title = "";
  let category = "";
  let displayName = "VibeShift Vendor";
  let city = "Cape Town";
  let bio = "";
  let rateFrom: number | null = null;
  let rateTo: number | null = null;
  let rateUnit = "booking";
  let coverImageUrl = "";
  let verified = true;
  let rating = 4.9;
  let reviewCount = 24;
  let gear: string[] = [];
  let tags: string[] = [];
  let techRider: TechRiderItem[] = [];
  let portfolio: PortfolioItem[] = [];
  let instagram: string | null = null;
  let sample = false;

  try {
    const supabase = await createClient();
    const { data: vendor } = await supabase
      .from("vendor_listings")
      .select("id,profile_id,title,category,description,city,rate_from,rate_to,cover_image_url,verified_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (vendor) {
      title = vendor.title;
      category = vendor.category.replaceAll("_", " ");
      city = vendor.city ?? "Cape Town";
      bio = vendor.description ?? "";
      rateFrom = vendor.rate_from;
      rateTo = vendor.rate_to;
      coverImageUrl = vendor.cover_image_url ?? "";
      verified = Boolean(vendor.verified_at);

      const { data: profile } = await supabase
        .from("public_vendor_profiles")
        .select("display_name,avatar_url")
        .eq("id", vendor.profile_id)
        .maybeSingle();

      if (profile?.display_name) displayName = profile.display_name;

      const { data: media } = await supabase
        .from("vendor_media")
        .select("id,media_url,media_type,caption,sort_order")
        .eq("listing_id", vendor.id)
        .eq("media_type", "image")
        .order("sort_order");

      if (media?.length) {
        portfolio = media.map((item, index) => ({
          id: item.id,
          image: item.media_url,
          alt: item.caption || `${vendor.title} portfolio image ${index + 1}`,
          type: "image" as const,
        }));
      }
    }
  } catch {}

  // Fallback to sample listings if not in database
  if (!title) {
    const found = sampleListings.find((s) => s.slug === slug);
    if (!found) return null;
    title = found.name;
    category = found.category;
    displayName = found.name;
    city = `${found.area}, ${found.locationCode}`;
    bio = found.bio;
    rateFrom = found.rateFrom;
    rateTo = found.rateTo;
    rateUnit = found.rateUnit;
    coverImageUrl = found.image;
    verified = found.verified ?? true;
    rating = found.rating ?? 4.9;
    reviewCount = found.reviewCount;
    gear = found.gear;
    tags = found.tags;
    techRider = found.techRider;
    portfolio = found.portfolio.filter((item) => item.type === "image");
    instagram = found.instagram;
    sample = found.sample;
  }

  return {
    title,
    category,
    displayName,
    city,
    bio,
    rateFrom,
    rateTo,
    rateUnit,
    coverImageUrl,
    verified,
    rating,
    reviewCount,
    gear,
    tags,
    techRider,
    portfolio,
    instagram,
    sample,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await loadVendor(slug);
  if (!vendor) {
    return { title: "Profile not found", robots: { index: false, follow: true } };
  }

  const title = `${vendor.title} — ${vendor.category} in ${vendor.city}`;
  const description = (
    vendor.bio ||
    `${vendor.displayName} · ${vendor.category} in ${vendor.city}. Compare starting rates, availability and gear on VibeShift.`
  ).slice(0, 158);

  return {
    title,
    description,
    alternates: { canonical: `/vendors/${slug}` },
    openGraph: {
      type: "profile",
      title: `${title} | VibeShift`,
      description,
      url: `/vendors/${slug}`,
      ...(vendor.coverImageUrl.startsWith("http")
        ? { images: [{ url: vendor.coverImageUrl, alt: `${vendor.title} — ${vendor.category} in ${vendor.city}` }] }
        : {}),
    },
  };
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await loadVendor(slug);
  if (!vendor) notFound();

  const {
    title,
    category,
    city,
    bio,
    rateFrom,
    rateTo,
    rateUnit,
    coverImageUrl,
    verified,
    rating,
    reviewCount,
    gear,
    tags,
    techRider,
    portfolio,
    instagram,
    sample,
  } = vendor;

  const depositFrom = rateFrom ? Math.round(rateFrom * DEPOSIT_RATE) : null;

  const vendorSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: title,
    url: `${siteUrl}/vendors/${slug}`,
    description: bio || undefined,
    image: coverImageUrl || undefined,
    areaServed: city,
    ...(rateFrom ? { priceRange: `R${rateFrom}+` } : {}),
    ...(rateFrom ? { offers: { "@type": "Offer", priceCurrency: "ZAR", price: rateFrom, url: `${siteUrl}/vendors/${slug}` } } : {}),
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: Math.max(reviewCount, 1),
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <main className="marketplace-shell min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <SiteHeader>
        <Link href="/directory" className="text-neutral-300 transition hover:text-white">
          Directory
        </Link>
        <Link href="/dashboard" className="text-neutral-300 transition hover:text-white">
          Dashboard
        </Link>
        <Link href="/join" className="btn-hero-solid">
          List Your Services
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </SiteHeader>

      {/* Profile Container */}
      <article className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(vendorSchema) }}
        />
        <div className="mb-6">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to directory
          </Link>
        </div>

        {/* Cover image */}
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 sm:h-80">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          ) : (
            <div className="grid h-full place-items-center bg-neutral-900 text-neutral-600">
              No cover image
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-100">
                {category}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                  <BadgeCheck size={13} aria-hidden="true" />
                  Verified
                </span>
              )}
              {sample && (
                <span className="rounded-md border border-neutral-700 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                  Sample profile
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-400">
              <MapPin size={14} className="text-cyan-400" aria-hidden="true" />
              {city}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2">
            <Star size={15} className="fill-amber-300 text-amber-300" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-xl font-bold text-white">About</h2>
            <p className="mt-3 text-base leading-7 text-neutral-400">
              {bio || "This supplier has not added an extended bio yet."}
            </p>

            {/* Rate card */}
            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-xl font-bold text-white">Rate card</h2>
                <span className="text-xs text-neutral-500">Indicative · confirmed per booking</span>
              </div>
              <dl className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
                {[
                  { label: "Starting rate", value: rateFrom ? formatZar(rateFrom) : "Request a quote" },
                  {
                    label: "Typical range",
                    value: rateFrom && rateTo ? `${formatZar(rateFrom)} – ${formatZar(rateTo)}` : rateFrom ? `${formatZar(rateFrom)}+` : "Quoted per brief",
                  },
                  { label: "Billed per", value: rateUnit || "booking" },
                  {
                    label: `Deposit to secure (${Math.round(DEPOSIT_RATE * 100)}%)`,
                    value: depositFrom ? formatZar(depositFrom) : "Agreed with quote",
                  },
                  { label: "Quote validity", value: `${QUOTE_VALID_DAYS} days` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 border-b border-neutral-800 px-4 py-3 last:border-b-0"
                  >
                    <dt className="text-xs text-neutral-400">{row.label}</dt>
                    <dd className="text-right text-sm font-semibold text-neutral-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                Rates exclude travel, extra hours and equipment hire unless stated. Generate a dated quote from the media kit for a client.
              </p>
            </section>

            {/* Gear & tech rider */}
            {(gear.length > 0 || techRider.length > 0) && (
              <section className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">Gear &amp; tech rider</h2>
                  <span className="text-xs text-neutral-500">
                    {gear.length ? `${gear.length} items owned` : "Rider only"}
                  </span>
                </div>

                {gear.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {gear.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-400"
                      >
                        <Check size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {techRider.length > 0 && (
                  <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                    <h3 className="text-sm font-semibold text-white">Technical rider</h3>
                    <ul className="mt-3 space-y-2">
                      {techRider.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-2 last:border-b-0 last:pb-0">
                          <span className="text-xs leading-5 text-neutral-400">{item.label}</span>
                          <span
                            className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              item.required
                                ? "border-amber-300/20 text-amber-200"
                                : "border-neutral-700 text-neutral-400"
                            }`}
                          >
                            {item.required ? "Required" : "Optional"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[10px] leading-4 text-neutral-500">
                      Items marked required must be supplied by the venue or confirmed with the supplier before the event.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Gallery */}
            {portfolio.length > 0 && (
              <section className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-xl font-bold text-white">
                    <ImageIcon size={17} className="text-cyan-400" aria-hidden="true" />
                    Gallery
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {portfolio.length} {portfolio.length === 1 ? "image" : "images"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((item, index) => (
                    <figure
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40"
                    >
                      <a
                        href={item.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-[4/3] overflow-hidden bg-neutral-900"
                      >
                        <Image
                          src={item.image}
                          alt={item.alt || `${title} portfolio image ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </a>
                      <figcaption className="px-3 py-2 text-[10px] font-medium text-neutral-500">
                        {item.alt}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {tags.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  Specialties
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing, booking and media kit */}
          <div className="space-y-4 h-fit">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                Indicative rates
              </h3>
              <p className="mt-2 text-2xl font-bold text-white">
                {rateFrom ? formatZar(rateFrom) : "Request a quote"}
                {rateTo ? ` – ${formatZar(rateTo)}` : rateFrom ? "+" : ""}
              </p>
              {rateFrom && <p className="mt-1 text-xs text-neutral-500">per {rateUnit || "booking"}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                Rates vary depending on event duration, date &amp; sound equipment needed.
              </p>

              <div className="my-5 border-t border-neutral-800 pt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <Star size={16} className="fill-amber-300 text-amber-300" aria-hidden="true" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-neutral-500">({reviewCount} reviews)</span>
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-neutral-500">
                  <CalendarClock size={12} aria-hidden="true" />
                  {depositFrom ? `${formatZar(depositFrom)} deposit secures the date` : "Deposit agreed with quote"}
                </p>
              </div>

              <Link
                href="/join"
                className="inline-flex w-full items-center justify-center rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-neutral-950 transition hover:bg-cyan-300"
              >
                Enquire About Availability
              </Link>

              {instagram && (
                <a
                  href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950/80 px-4 py-2.5 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/50 hover:text-white"
                >
                  <Instagram size={14} aria-hidden="true" />
                  Instagram @{instagram.replace(/^@/, "")}
                </a>
              )}
            </div>

            <VendorMediaKit
              vendor={{
                name: title,
                category,
                area: city.includes(",") ? city.split(",")[0].trim() : city,
                locationCode: city.includes("CT") ? "CT" : "WC",
                rateFrom,
                rateTo,
                rateUnit,
                instagram,
                gear,
                techRider,
              }}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
