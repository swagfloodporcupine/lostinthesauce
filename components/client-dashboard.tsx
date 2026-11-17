"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Check, ChevronRight, MessageCircle, Star } from "lucide-react";
import { formatZar } from "@/lib/directory-types";

type EventBooking = {
  id: string;
  vendor: string;
  category: string;
  date: string;
  amount: number;
  status: "Confirmed" | "Deposit paid" | "Awaiting vendor";
  whatsappContext: string;
};

type ClientEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  bookings: EventBooking[];
};

const initialEvents: ClientEvent[] = [
  {
    id: "event-harbour-lights",
    title: "Harbour Lights Launch",
    date: "2026-12-19",
    venue: "The Glasshouse · Woodstock",
    bookings: [
      { id: "booking-amara", vendor: "Amara Venn", category: "DJ", date: "2026-12-19", amount: 3500, status: "Deposit paid", whatsappContext: "Harbour Lights Launch at The Glasshouse on 19 Dec 2026" },
      { id: "booking-signal", vendor: "Signal Path Audio", category: "Sound engineer", date: "2026-12-19", amount: 4800, status: "Confirmed", whatsappContext: "Harbour Lights Launch sound setup at The Glasshouse on 19 Dec 2026" },
    ],
  },
  {
    id: "event-studio-supper",
    title: "Studio Supper Club",
    date: "2027-01-23",
    venue: "City Bowl · Cape Town",
    bookings: [
      { id: "booking-mila", vendor: "Mila Jacobs Photo", category: "Photographer", date: "2027-01-23", amount: 4200, status: "Awaiting vendor", whatsappContext: "Studio Supper Club photography booking in the City Bowl on 23 Jan 2027" },
    ],
  },
];

const completedEvent = { id: "event-sunroom", title: "Sunroom Sessions", date: "2026-10-25", venue: "Sea Point Pavilion", vendor: "Luca Ferreira" };

function displayDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function whatsappHref(booking: EventBooking): string {
  const text = `Hi ${booking.vendor}, I'm following up about ${booking.whatsappContext}. Could you confirm the latest details?`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ClientDashboard() {
  const [events] = useState(initialEvents);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const bookingCount = events.reduce((total, event) => total + event.bookings.length, 0);
  const totalEstimated = events.flatMap((event) => event.bookings).reduce((total, booking) => total + booking.amount, 0);
  const pendingCount = events.flatMap((event) => event.bookings).filter((booking) => booking.status === "Awaiting vendor").length;

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewRating || !reviewText.trim()) return;
    setReviewSubmitted(true);
    setReviewOpen(false);
  }

  return (
    <div className="space-y-8">
      <section aria-label="Client event overview" className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-xs text-neutral-400">Upcoming events</p><p className="mt-3 text-2xl font-semibold text-white">{events.length}</p><p className="mt-1 text-[10px] text-neutral-500">Next: {displayDate(events[0].date)}</p></article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-xs text-neutral-400">Active bookings</p><p className="mt-3 text-2xl font-semibold text-white">{bookingCount}</p><p className="mt-1 text-[10px] text-neutral-500">{pendingCount} awaiting a vendor reply</p></article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-xs text-neutral-400">Estimated supplier spend</p><p className="mt-3 text-2xl font-semibold text-white">{formatZar(totalEstimated)}</p><p className="mt-1 text-[10px] text-neutral-500">Starting quotes · excluding any applicable VAT</p></article>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Upcoming event timelines</h2></div><span className="text-xs text-neutral-500">Demo booking activity</span></div>
        <div className="space-y-6">
          {events.map((event) => <article key={event.id} className="border-t border-neutral-800 pt-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold text-white">{event.title}</h3><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500"><CalendarDays size={13} className="text-cyan-300" aria-hidden="true" />{displayDate(event.date)} · {event.venue}</p></div><span className="text-xs font-semibold text-neutral-300">{event.bookings.length} {event.bookings.length === 1 ? "supplier" : "suppliers"}</span></div>
            <ol className="space-y-0">
              {event.bookings.map((booking, index) => <li key={booking.id} className="grid grid-cols-[20px_1fr] gap-3">
                <div className="flex flex-col items-center"><span className={`mt-1 size-2.5 rounded-full ${booking.status === "Confirmed" || booking.status === "Deposit paid" ? "bg-lime-300" : "bg-amber-300"}`} />{index < event.bookings.length - 1 && <span className="my-1 min-h-8 w-px flex-1 bg-neutral-800" />}</div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold text-neutral-100">{booking.vendor}</h4><span className="text-[10px] text-neutral-600">{booking.category}</span></div><p className="mt-1 text-[10px] text-neutral-500">{displayDate(booking.date)} · {formatZar(booking.amount)} estimated</p></div>
                  <div className="flex items-center gap-2"><span className={`rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${booking.status === "Awaiting vendor" ? "border-amber-300/20 text-amber-200" : booking.status === "Deposit paid" ? "border-cyan-300/20 text-cyan-200" : "border-lime-300/20 text-lime-200"}`}>{booking.status}</span><a href={whatsappHref(booking)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-lime-300/20 bg-lime-300/[.05] px-2.5 text-[10px] font-semibold text-lime-100 transition hover:border-lime-300/40 hover:bg-lime-300/10"><MessageCircle size={13} aria-hidden="true" />Chat via WhatsApp<ArrowUpRight size={11} aria-hidden="true" /></a></div>
                </div>
              </li>)}
            </ol>
            <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-neutral-600"><span className="inline-flex items-center gap-1"><Check size={11} />Booking timeline</span><span>WhatsApp opens a pre-filled message draft; confirm vendor contact details before sending.</span></div>
          </article>)}
        </div>
      </section>

      <section className="border-t border-neutral-800 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-white">Review {completedEvent.vendor}</h2><p className="mt-1 text-xs text-neutral-500">Share feedback after {completedEvent.title}.</p></div>
          {reviewSubmitted ? <span className="inline-flex items-center gap-2 rounded-lg border border-lime-300/20 px-3 py-2 text-xs font-semibold text-lime-200"><Check size={14} aria-hidden="true" />Review saved in this demo</span> : <button type="button" onClick={() => setReviewOpen((current) => !current)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 transition hover:border-cyan-300/40 hover:text-white">{reviewOpen ? "Close review" : "Leave a review"}<ChevronRight size={14} aria-hidden="true" /></button>}
        </div>
        {reviewOpen && !reviewSubmitted && <form onSubmit={submitReview} className="mt-4 max-w-2xl space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <fieldset><legend className="mb-2 text-xs font-semibold text-neutral-300">Your rating</legend><div className="flex gap-1">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} star${rating === 1 ? "" : "s"}`} aria-pressed={reviewRating === rating} onClick={() => setReviewRating(rating)} className={`grid size-9 place-items-center rounded-md border ${reviewRating >= rating ? "border-amber-300/30 text-amber-300" : "border-neutral-800 text-neutral-600"}`}><Star size={15} className={reviewRating >= rating ? "fill-amber-300" : ""} aria-hidden="true" /></button>)}</div></fieldset>
          <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Review<textarea required minLength={8} maxLength={1000} value={reviewText} onChange={(event) => setReviewText(event.target.value)} className="market-filter-control min-h-24 resize-y py-2" placeholder="How did the booking and performance go?" /></label>
          <div className="flex items-center justify-between gap-3"><p className="text-[9px] text-neutral-600">Review is saved in this browser demo only.</p><button type="submit" disabled={!reviewRating || reviewText.trim().length < 8} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-bold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40">Save review</button></div>
        </form>}
      </section>
    </div>
  );
}