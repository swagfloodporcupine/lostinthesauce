"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Instagram, MapPin, Plus, Star } from "lucide-react";
import { formatZar, type VendorListing } from "@/lib/directory-types";

type VendorListingCardProps = {
  listing: VendorListing;
  inCrew: boolean;
  onSelect: (listing: VendorListing) => void;
  onToggleCrew: (listing: VendorListing) => void;
};

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

export function VendorListingCard({ listing, inCrew, onSelect, onToggleCrew }: VendorListingCardProps) {
  const gearAndSkills = [...listing.gear, ...listing.tags].slice(0, 3);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="marketplace-listing-card group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 text-left backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40">
      <div className="relative h-40 bg-neutral-200">
        {imageFailed ? (
          <div className="vs-media-fallback" aria-hidden="true" />
        ) : (
          <Image
            src={listing.image}
            alt={`${listing.category} event work in ${listing.area}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/10 to-neutral-950/10" />
        <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-neutral-950/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-100 backdrop-blur">{listing.category}</span>
        {listing.sample && <span className="absolute right-3 top-3 rounded-md border border-neutral-700 bg-neutral-950/75 px-2 py-1 text-[10px] font-semibold text-neutral-300 backdrop-blur">Sample</span>}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-xs font-medium text-white"><MapPin size={13} className="text-cyan-300" aria-hidden="true" />{listing.area}, {listing.locationCode}</span>
        <span className="absolute -bottom-5 left-4 grid size-12 place-items-center overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-800 text-sm font-bold text-white">
          {initials(listing.name)}
          {listing.avatarImage && (
            <Image
              src={listing.avatarImage}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
      </div>
      <div className="p-4 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5"><h3 className="line-clamp-2 text-base font-semibold leading-tight text-white sm:truncate">{listing.name}</h3>{listing.verified && <span className="inline-flex shrink-0 text-amber-200" title="Verified listing"><BadgeCheck size={16} aria-label="Verified listing" /></span>}</div>
            <p className="mt-1 text-xs text-neutral-500">{listing.category}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-neutral-100 tabular-nums">{listing.rateFrom === null ? "Request a quote" : `From ${formatZar(listing.rateFrom)}`}</span>
        </div>
        <p className="listing-summary mt-3 min-h-10 text-sm leading-5 text-neutral-400">{listing.summary}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-300">
          <Star size={14} className="fill-amber-300 text-amber-300" aria-hidden="true" />
          <span className="font-semibold tabular-nums">{listing.rating === null ? "New" : listing.rating.toFixed(1)}</span>
          <span className="text-neutral-500">({listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"})</span>
        </div>
        <div className="mt-3 flex min-h-12 flex-wrap content-start gap-1.5">
          {gearAndSkills.map((item) => <span key={item} className="rounded-md border border-neutral-800 bg-neutral-950/70 px-2 py-1 text-[10px] font-medium text-neutral-400">{item}</span>)}
          {!gearAndSkills.length && <span className="text-xs text-neutral-600">Gear details not added</span>}
        </div>
        <div className="mt-3 flex items-center gap-3">
          {listing.instagram && <a href={`https://instagram.com/${listing.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-cyan-300 transition"><Instagram size={14} aria-hidden="true" />{listing.instagram}</a>}
          {listing.soundcloud && <a href={`https://soundcloud.com/${listing.soundcloud}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-cyan-300 transition"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0m0 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12 6.47 2 12 2m0 2.4c4.19 0 7.6 3.41 7.6 7.6s-3.41 7.6-7.6 7.6-7.6-3.41-7.6-7.6S7.81 12 12 12m-1.7 3.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6m10.7 5.9c0 .5-.4 1-1 1H11.3c-.6 0-1-.4-1-1v-1.8c0-.5.4-1 1-1h9.7c.6 0 1 .4 1 1zm0-3c0 .5-.4 1-1 1H11.3c-.6 0-1-.4-1-1v-1.8c0-.5.4-1 1-1h9.7c.6 0 1 .4 1 1z"/></svg>SoundCloud</a>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-lime-300"><BadgeCheck size={13} aria-hidden="true" />Taking enquiries</span>
          <div className="flex items-center gap-3">
            <Link href={`/vendors/${listing.slug}`} className="text-xs font-semibold text-neutral-300 transition hover:text-white">View profile <span aria-hidden="true">↗</span></Link>
            <button type="button" aria-pressed={inCrew} onClick={() => onToggleCrew(listing)} className={`grid size-8 place-items-center rounded-md border transition ${inCrew ? "border-lime-300/30 bg-lime-300/10 text-lime-200" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:border-cyan-200/60"}`} aria-label={inCrew ? `Remove ${listing.name} from event crew` : `Add ${listing.name} to event crew`} title={inCrew ? "Remove from event crew" : "Add to event crew"}>{inCrew ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}</button>
          </div>
        </div>
      </div>
    </article>
  );
}