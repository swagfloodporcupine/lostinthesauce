"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, AudioLines, Check, Instagram, MapPin, Play, Plus, Star, X } from "lucide-react";
import { formatZar, type VendorListing } from "@/lib/directory-types";

type VendorProfileDialogProps = {
  listing: VendorListing | null;
  inCrew: boolean;
  onClose: () => void;
  onToggleCrew: (listing: VendorListing) => void;
};

export function VendorProfileDialog({ listing, inCrew, onClose, onToggleCrew }: VendorProfileDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (listing && !dialog.open) dialog.showModal();
    if (!listing && dialog.open) dialog.close();
  }, [listing]);

  return (
    <dialog
      ref={dialogRef}
      className="marketplace-dialog"
      aria-labelledby="vendor-profile-title"
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      {listing && (
        <article className="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/60">
          <div className="relative h-52 sm:h-64">
            <Image src={listing.image} alt={`${listing.category} work by ${listing.name}`} fill sizes="(max-width: 640px) 100vw, 760px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/15 to-neutral-950/15" />
            <button type="button" aria-label="Close profile" className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg border border-white/15 bg-neutral-950/75 text-white backdrop-blur" onClick={onClose}><X size={17} aria-hidden="true" /></button>
            <div className="absolute bottom-4 left-5 right-5 flex items-end gap-3 sm:left-6 sm:right-6">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-800 text-lg font-bold text-white">
                {listing.avatarImage ? <Image src={listing.avatarImage} alt="" fill sizes="56px" className="object-cover" /> : listing.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">{listing.category}</p>
                <h2 id="vendor-profile-title" className="mt-1 truncate text-2xl font-semibold text-white sm:text-3xl">{listing.name}</h2>
              </div>
              <span className="hidden items-center gap-1 rounded-md border border-neutral-700 bg-neutral-950/70 px-2.5 py-1.5 text-xs text-neutral-200 backdrop-blur sm:inline-flex"><MapPin size={13} className="text-cyan-300" aria-hidden="true" />{listing.area}, {listing.locationCode}</span>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-5">
              <div className="flex items-center gap-2 text-sm text-neutral-300"><Star size={16} className="fill-amber-300 text-amber-300" aria-hidden="true" /><strong>{listing.rating === null ? "New profile" : listing.rating.toFixed(1)}</strong><span className="text-neutral-500">{listing.reviewCount} client reviews</span></div>
              <p className="text-sm font-semibold text-white">{listing.rateFrom === null ? "Request a quote" : `From ${formatZar(listing.rateFrom)} / ${listing.rateUnit}`}</p>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-white">About</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">{listing.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">{listing.tags.map((tag) => <span key={tag} className="rounded-md border border-neutral-800 bg-neutral-950/70 px-2.5 py-1 text-xs text-neutral-300">{tag}</span>)}</div>

              {(listing.instagram || listing.soundcloud) && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  {listing.instagram && <a href={`https://instagram.com/${listing.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-300 hover:text-cyan-300 transition"><Instagram size={14} aria-hidden="true" /><span>{listing.instagram}</span></a>}
                  {listing.soundcloud && <a href={`https://soundcloud.com/${listing.soundcloud}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-300 hover:text-cyan-300 transition">SoundCloud</a>}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Portfolio</h3><span className="text-xs text-neutral-500">{listing.portfolio.length} items</span></div>
              {listing.portfolio.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.portfolio.map((item) => <figure key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                    <Image src={item.image} alt={item.alt} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover" />
                    {item.type === "video" && <figcaption className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-neutral-950/80 px-2 py-1 text-[10px] text-white"><Play size={11} fill="currentColor" aria-hidden="true" />Video</figcaption>}
                  </figure>)}
                </div>
              ) : <p className="rounded-lg border border-dashed border-neutral-700 p-5 text-sm text-neutral-500">Portfolio media has not been added yet.</p>}
            </section>

            {listing.category === "DJs" && (
              <section className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-cyan-200"><AudioLines size={18} aria-hidden="true" /></div>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-white">{listing.mixTitle || "Audio mix preview"}</h3><p className="mt-1 text-xs text-neutral-500">Embedded player placeholder · mix not connected</p></div>
                  {listing.soundcloud && <a href={`https://soundcloud.com/${listing.soundcloud}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0m0 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12 6.47 2 12 2m0 2.4c4.19 0 7.6 3.41 7.6 7.6s-3.41 7.6-7.6 7.6-7.6-3.41-7.6-7.6S7.81 12 12 12m-1.7 3.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6m10.7 5.9c0 .5-.4 1-1 1H11.3c-.6 0-1-.4-1-1v-1.8c0-.5.4-1 1-1h9.7c.6 0 1 .4 1 1zm0-3c0 .5-.4 1-1 1H11.3c-.6 0-1-.4-1-1v-1.8c0-.5.4-1 1-1h9.7c.6 0 1 .4 1 1z"/></svg>SoundCloud</a>}
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-800"><div className="h-full w-1/4 rounded-full bg-cyan-300/50" /></div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold text-white">Gear &amp; tech rider</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {listing.techRider.length ? listing.techRider.map((item) => <div key={item.id} className="flex items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                  <Check size={15} className="mt-0.5 shrink-0 text-lime-300" aria-hidden="true" /><span className="text-xs leading-5 text-neutral-300">{item.label}<span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{item.required ? "Required" : "Preferred"}</span></span>
                </div>) : <p className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-500">Rider specifications have not been added yet.</p>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{listing.gear.map((item) => <span key={item} className="rounded-md bg-neutral-800/80 px-2 py-1 text-[10px] font-medium text-neutral-300">{item}</span>)}</div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Client reviews</h3><span className="text-xs text-neutral-500">{listing.reviewCount} total</span></div>
              {listing.reviews.length ? <div className="grid gap-3">
                {listing.reviews.map((review) => <article key={review.id} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><strong className="text-sm text-neutral-200">{review.name}</strong><span className="text-xs text-neutral-500">{review.clientType}</span></div><time className="text-xs text-neutral-500">{review.date}</time></div>
                  <div className="mt-2 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} className={index < review.rating ? "fill-amber-300 text-amber-300" : "text-neutral-700"} aria-hidden="true" />)}</div>
                  <p className="mt-2 text-sm leading-5 text-neutral-400">{review.comment}</p>
                </article>)}
              </div> : <p className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-500">No client reviews yet.</p>}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-5">
              <p className="text-sm font-semibold text-white">{listing.rateFrom === null ? "Rates available on request" : `From ${formatZar(listing.rateFrom)} / ${listing.rateUnit}`}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" aria-pressed={inCrew} onClick={() => onToggleCrew(listing)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-300/30 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10">{inCrew ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{inCrew ? "Added to event crew" : "Add to event crew"}</button>
                <Link href="/join" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-neutral-950 transition hover:bg-cyan-200">Enquire<ArrowUpRight size={15} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </article>
      )}
    </dialog>
  );
}