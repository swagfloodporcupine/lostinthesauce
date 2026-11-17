"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  MessageSquareText,
  PackageCheck,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { BookingAgreementPanel } from "@/components/booking-agreement-panel";
import type { BookingAgreement } from "@/lib/agreement-types";
import { useCrew } from "@/lib/crew-store";
import { formatZar, type VendorListing } from "@/lib/directory-types";

type CrewMessage = {
  id: string;
  sender: "planner" | "vendor";
  text: string;
  time: string;
};

type QuoteDraft = {
  price: string;
  duration: string;
  notes: string;
};

function todayLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function messageTime(): string {
  return new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export function EventCrewBuilder() {
  const { listings, count, removeListing, clear } = useCrew();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, QuoteDraft>>({});
  const [messages, setMessages] = useState<Record<string, CrewMessage[]>>({});
  const [messageRole, setMessageRole] = useState<"planner" | "vendor">("planner");
  const [messageDraft, setMessageDraft] = useState("");
  const [provisioned, setProvisioned] = useState<Record<string, Record<string, boolean>>>({});
  const [proposalSent, setProposalSent] = useState<Record<string, boolean>>({});
  const [agreements, setAgreements] = useState<Record<string, BookingAgreement>>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const activeListing = listings.find((listing) => listing.id === activeListingId) ?? null;
  const activeDraft = activeListing ? quoteDrafts[activeListing.id] : undefined;
  const estimatedTotal = listings.reduce((sum, listing) => sum + (listing.rateFrom ?? 0), 0);
  const pricedCount = listings.filter((listing) => listing.rateFrom !== null).length;

  function beginNegotiation(listing: VendorListing) {
    setActiveListingId(listing.id);
    setQuoteDrafts((current) => current[listing.id] ? current : {
      ...current,
      [listing.id]: { price: String(listing.rateFrom ?? ""), duration: "4", notes: "" },
    });
    setMessages((current) => current[listing.id] ? current : {
      ...current,
      [listing.id]: [{
        id: `${listing.id}-opening`,
        sender: "vendor",
        text: `Thanks for including ${listing.name} in your event crew. Share your event timing and any requirements here.`,
        time: messageTime(),
      }],
    });
  }

  function updateQuoteDraft(field: keyof QuoteDraft, value: string) {
    if (!activeListing) return;
    setQuoteDrafts((current) => ({
      ...current,
      [activeListing.id]: { ...(current[activeListing.id] ?? { price: "", duration: "4", notes: "" }), [field]: value },
    }));
    setProposalSent((current) => ({ ...current, [activeListing.id]: false }));
  }

  function sendProposal() {
    if (!activeListing || !activeDraft) return;
    const price = Number(activeDraft.price);
    const duration = Number(activeDraft.duration);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(duration) || duration <= 0) return;
    const details = [`Revised proposal: ${formatZar(price)} for ${duration} ${duration === 1 ? "hour" : "hours"}.`, activeDraft.notes.trim() ? `Notes: ${activeDraft.notes.trim()}` : ""].filter(Boolean).join(" ");
    setMessages((current) => ({
      ...current,
      [activeListing.id]: [...(current[activeListing.id] ?? []), { id: crypto.randomUUID(), sender: "planner", text: details, time: messageTime() }],
    }));
    setProposalSent((current) => ({ ...current, [activeListing.id]: true }));
  }

  function sendMessage() {
    if (!activeListing || !messageDraft.trim()) return;
    setMessages((current) => ({
      ...current,
      [activeListing.id]: [...(current[activeListing.id] ?? []), { id: crypto.randomUUID(), sender: messageRole, text: messageDraft.trim(), time: messageTime() }],
    }));
    setMessageDraft("");
  }

  function toggleProvision(listingId: string, riderId: string, isProvided: boolean) {
    setProvisioned((current) => ({
      ...current,
      [listingId]: { ...(current[listingId] ?? {}), [riderId]: isProvided },
    }));
  }

  function initialAgreementTerms(listing: VendorListing, draft: QuoteDraft): string {
    const equipment = listing.techRider.length
      ? listing.techRider.map((item) => `- ${item.label}: ${provisioned[listing.id]?.[item.id] ? "Provided on-site" : "Vendor to bring"}`).join("\n")
      : "- No equipment requirements supplied";
    return [
      `Event: ${eventName.trim() || "To be confirmed"}`,
      `Event date: ${eventDate || "To be confirmed"}`,
      `Venue / area: ${eventVenue.trim() || "To be confirmed"}`,
      `Vendor: ${listing.name} (${listing.category})`,
      `Duration: ${draft.duration || "To be agreed"} hours`,
      `Proposed rate: ${draft.price ? formatZar(Number(draft.price)) : "To be agreed"}`,
      `Custom notes: ${draft.notes.trim() || "None"}`,
      "Equipment provision:",
      equipment,
      "",
      "The parties agree to confirm final logistics and any changes in writing before the event.",
    ].join("\n");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="crew-fab"
        aria-haspopup="dialog"
        aria-label={`Open event crew checkout, ${count} ${count === 1 ? "vendor" : "vendors"} selected`}
      >
        <span className="crew-fab__icon" aria-hidden="true">
          <ShoppingBag size={20} />
        </span>
        <span className="crew-fab__label">Event crew</span>
        {count > 0 && (
          <span className="crew-fab__badge" aria-hidden="true">{count}</span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        className="marketplace-dialog marketplace-crew-dialog"
        aria-labelledby="crew-builder-title"
        onClose={() => setIsOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}
      >
        <div className="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-950 shadow-2xl shadow-black/60">
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-800 bg-neutral-950/95 px-5 py-4 backdrop-blur sm:px-6">
            <div>
              <h2 id="crew-builder-title" className="text-xl font-semibold text-white">Event Crew Checkout</h2>
              <p className="mt-1 text-xs text-neutral-500">Plan one crew list, negotiate rates and confirm your event.</p>
            </div>
            <button type="button" aria-label="Close event crew checkout" className="crew-icon-btn grid size-10 shrink-0 place-items-center rounded-lg border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white" onClick={() => setIsOpen(false)}><X size={17} aria-hidden="true" /></button>
          </header>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)]">
            <div className="space-y-5">
              <section className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <h3 className="text-sm font-semibold text-white">Event brief</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-neutral-400 sm:col-span-2">Event name<input className="market-filter-control" value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="e.g. Summer rooftop session" /></label>
                  <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Event date<input className="market-filter-control" type="date" min={todayLocal()} value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></label>
                  <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Venue / area<input className="market-filter-control" value={eventVenue} onChange={(event) => setEventVenue(event.target.value)} placeholder="e.g. The Old Biscuit Mill" /></label>
                </div>
                {(eventName || eventDate || eventVenue) && <p className="mt-3 text-xs text-neutral-500">Brief updates as you type. Add vendors below to complete your crew.</p>}
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Selected crew</h3><span className="text-xs text-neutral-500">{listings.length} {listings.length === 1 ? "vendor" : "vendors"}</span></div>
                {listings.length ? <div className="space-y-3">
                  {listings.map((listing) => (
                    <article key={listing.id} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{listing.category}</p><h4 className="mt-1 truncate text-sm font-semibold text-white">{listing.name}</h4><p className="mt-1 text-xs text-neutral-500">{listing.area}, {listing.locationCode}</p></div>
                        <div className="flex shrink-0 items-center gap-2"><span className="text-xs font-semibold text-neutral-200">{listing.rateFrom === null ? "Quote needed" : `From ${formatZar(listing.rateFrom)}`}</span><button type="button" aria-label={`Remove ${listing.name} from event crew`} onClick={() => removeListing(listing.id)} className="crew-icon-btn grid size-10 place-items-center rounded-md text-neutral-500 transition hover:bg-neutral-800 hover:text-rose-300"><Trash2 size={15} aria-hidden="true" /></button></div>
                      </div>

                      <div className="mt-4 border-t border-neutral-800 pt-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Equipment provision</p>
                        {listing.techRider.length ? <div className="grid gap-2">
                          {listing.techRider.map((item) => {
                            const isProvided = provisioned[listing.id]?.[item.id] ?? false;
                            return <label key={item.id} className="flex cursor-pointer items-start gap-2.5 rounded-md bg-neutral-950/70 px-3 py-2.5">
                              <input type="checkbox" checked={isProvided} onChange={(event) => toggleProvision(listing.id, item.id, event.target.checked)} className="mt-0.5 size-4 accent-cyan-300" />
                              <span className="min-w-0 flex-1 text-xs leading-5 text-neutral-300">{item.label}<span className={`block text-[10px] font-semibold uppercase tracking-wider ${isProvided ? "text-lime-300" : "text-amber-300"}`}>{isProvided ? "Provided on-site" : "Requires vendor to bring"}</span></span>
                            </label>;
                          })}
                        </div> : <p className="text-xs text-neutral-500">No equipment checklist has been supplied for this listing.</p>}
                      </div>

                      <button type="button" onClick={() => beginNegotiation(listing)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 transition hover:border-cyan-300/50 hover:text-cyan-100"><MessageSquareText size={14} aria-hidden="true" />{activeListingId === listing.id ? "Negotiation open" : "Open quote thread"}</button>
                    </article>
                  ))}
                </div> : <div className="rounded-lg border border-dashed border-neutral-700 px-5 py-9 text-center"><PackageCheck className="mx-auto mb-3 text-neutral-600" size={23} aria-hidden="true" /><h4 className="text-sm font-semibold text-neutral-200">Your crew is empty</h4><p className="mt-1 text-xs text-neutral-500">Add a DJ, crew member or venue from any directory card.</p></div>}
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/[.045] p-4">
                <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Package estimate</h3><span className="rounded border border-cyan-300/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">Planning only</span></div>
                <div className="mt-4 flex items-end justify-between gap-3"><span className="text-xs text-neutral-400">Starting rates for {listings.length} vendors</span><strong className="text-xl text-white">{pricedCount ? formatZar(estimatedTotal) : "TBC"}</strong></div>
                <p className="mt-2 text-[10px] leading-4 text-neutral-500">Estimates exclude custom requirements, travel and final vendor quotes.</p>
                {eventName && <p className="mt-3 border-t border-neutral-800 pt-3 text-xs text-neutral-300">{eventName}{eventDate ? ` · ${eventDate}` : ""}{eventVenue ? ` · ${eventVenue}` : ""}</p>}
              </section>

              {activeListing && activeDraft ? (
                <>
                <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50">
                  <div className="border-b border-neutral-800 px-4 py-3"><h3 className="text-sm font-semibold text-white">Quote with {activeListing.name}</h3></div>
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Your proposed rate (R)<input className="market-filter-control" type="number" min="1" step="50" value={activeDraft.price} onChange={(event) => updateQuoteDraft("price", event.target.value)} /></label>
                      <label className="grid gap-1.5 text-xs font-medium text-neutral-400"><span className="inline-flex items-center gap-1"><Clock3 size={12} aria-hidden="true" />Duration (hours)</span><input className="market-filter-control" type="number" min="1" max="24" step="0.5" value={activeDraft.duration} onChange={(event) => updateQuoteDraft("duration", event.target.value)} /></label>
                      <label className="col-span-2 grid gap-1.5 text-xs font-medium text-neutral-400">Custom notes<textarea className="market-filter-control min-h-20 resize-y py-2" value={activeDraft.notes} onChange={(event) => updateQuoteDraft("notes", event.target.value)} placeholder="Set times, load-in, travel or other requirements" /></label>
                    </div>
                    <button type="button" onClick={sendProposal} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200"><Send size={13} aria-hidden="true" />Send revised proposal</button>
                    {proposalSent[activeListing.id] && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-lime-300"><Check size={12} aria-hidden="true" />Proposal added to thread</span>}

                    <div className="border-t border-neutral-800 pt-3">
                      <div className="mb-3 flex items-center justify-between gap-2"><h4 className="text-xs font-semibold text-neutral-200">Messages</h4><div className="flex rounded-md border border-neutral-800 p-0.5" aria-label="Message as">
                        <button type="button" aria-pressed={messageRole === "planner"} onClick={() => setMessageRole("planner")} className={`rounded px-2 py-1 text-[10px] font-semibold ${messageRole === "planner" ? "bg-neutral-700 text-white" : "text-neutral-500"}`}>Planner</button>
                        <button type="button" aria-pressed={messageRole === "vendor"} onClick={() => setMessageRole("vendor")} className={`rounded px-2 py-1 text-[10px] font-semibold ${messageRole === "vendor" ? "bg-neutral-700 text-white" : "text-neutral-500"}`}>Vendor preview</button>
                      </div></div>
                      <div className="mb-3 max-h-44 space-y-2 overflow-y-auto rounded-md bg-neutral-950/75 p-3" aria-live="polite">
                        {(messages[activeListing.id] ?? []).map((message) => <div key={message.id} className={`max-w-[90%] rounded-lg px-3 py-2 ${message.sender === "planner" ? "ml-auto bg-cyan-300/10 text-cyan-50" : "bg-neutral-800 text-neutral-200"}`}>
                          <div className="mb-1 flex items-center justify-between gap-3"><span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">{message.sender === "planner" ? "Planner" : activeListing.name}</span><time className="text-[9px] text-neutral-500">{message.time}</time></div>
                          <p className="whitespace-pre-wrap text-xs leading-5">{message.text}</p>
                        </div>)}
                      </div>
                      <div className="flex items-end gap-2"><textarea aria-label="Write a negotiation message" className="market-filter-control min-h-10 flex-1 resize-y py-2" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder={`Message as ${messageRole === "planner" ? "planner" : "vendor"}`} rows={2} /><button type="button" aria-label="Send message" disabled={!messageDraft.trim()} onClick={sendMessage} className="grid size-10 shrink-0 place-items-center rounded-md bg-neutral-800 text-neutral-100 transition hover:bg-neutral-700 disabled:opacity-40"><Send size={15} aria-hidden="true" /></button></div>
                      <p className="mt-2 text-[10px] text-neutral-600">Conversation is a local draft in this preview.</p>
                    </div>
                  </div>
                </section>
                <BookingAgreementPanel
                  listing={activeListing}
                  agreement={agreements[activeListing.id] ?? null}
                  initialTerms={initialAgreementTerms(activeListing, activeDraft)}
                  bookingAmount={Number(activeDraft.price) || activeListing.rateFrom || 0}
                  eventName={eventName}
                  eventDate={eventDate}
                  eventVenue={eventVenue}
                  durationHours={Number(activeDraft.duration) || 1}
                  onChange={(agreement) => setAgreements((current) => ({ ...current, [activeListing.id]: agreement }))}
                />
                </>
              ) : <div className="rounded-lg border border-dashed border-neutral-800 px-4 py-7 text-center"><MessageSquareText className="mx-auto mb-2 text-neutral-600" size={20} aria-hidden="true" /><p className="text-xs text-neutral-500">Choose a vendor to review their quote and start a conversation.</p></div>}
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 bg-neutral-950 px-5 py-4 sm:px-6">
            <p className="text-xs text-neutral-500">Vendor replies and final rates are confirmed directly with each supplier.</p>
            <div className="flex flex-wrap items-center gap-2">
              {listings.length > 0 && <button type="button" onClick={clear} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-800 px-3 text-xs font-semibold text-neutral-400 hover:border-rose-300/40 hover:text-rose-300"><Trash2 size={13} aria-hidden="true" />Clear crew</button>}
              <button type="button" onClick={() => setIsOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 hover:border-neutral-500"><X size={13} aria-hidden="true" />Close</button>
            </div>
          </footer>
        </div>
      </dialog>
    </>
  );
}
