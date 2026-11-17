"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Eye, MessageSquareText, ToggleLeft, ToggleRight } from "lucide-react";
import { formatZar } from "@/lib/directory-types";

type BookingRequest = {
  id: string;
  client: string;
  event: string;
  date: string;
  area: string;
  amount: number;
  status: "New inquiry" | "Quote sent" | "Confirmed";
};

type Payout = {
  id: string;
  booking: string;
  amount: number;
  date: string;
  status: "Paid" | "Processing";
};

const initialRequests: BookingRequest[] = [
  { id: "req-1", client: "Harbour Lights Events", event: "Summer launch", date: "2026-12-19", area: "Woodstock", amount: 3500, status: "New inquiry" },
  { id: "req-2", client: "The Glasshouse", event: "Friday late set", date: "2026-12-05", area: "Woodstock", amount: 2800, status: "Quote sent" },
  { id: "req-3", client: "Northline Studio", event: "Brand gathering", date: "2026-11-28", area: "City Bowl", amount: 2500, status: "Confirmed" },
];

const initialPayouts: Payout[] = [
  { id: "pay-1", booking: "Northline Studio · Brand gathering", amount: 2500, date: "2026-11-28", status: "Processing" },
  { id: "pay-2", booking: "Sunday Sessions · Sea Point", amount: 3200, date: "2026-11-08", status: "Paid" },
  { id: "pay-3", booking: "Rooftop Social · City Bowl", amount: 1800, date: "2026-10-24", status: "Paid" },
];

function localDateKey(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function dateLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export function VendorDashboard() {
  const [acceptingRequests, setAcceptingRequests] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>(["2026-11-21", "2026-11-29"]);
  const [requests, setRequests] = useState(initialRequests);
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [viewCount, setViewCount] = useState(1284);
  const [inquiryCount] = useState(23);
  const [payouts] = useState(initialPayouts);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = firstDay.getDay();
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthLabel = month.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
  const conversionRate = viewCount ? (inquiryCount / viewCount) * 100 : 0;
  const pendingPayout = payouts.filter((payout) => payout.status === "Processing").reduce((total, payout) => total + payout.amount, 0);

  function toggleDate(day: number) {
    const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), day));
    setBlockedDates((current) => current.includes(date) ? current.filter((value) => value !== date) : [...current, date]);
  }

  function updateRequestStatus(id: string, status: BookingRequest["status"]) {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
  }

  return (
    <div className="space-y-7">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-md sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100">AV</span><div><h2 className="font-semibold text-white">Amara Venn</h2><p className="text-xs text-neutral-500">DJ · Woodstock, Cape Town</p></div></div>
          <button type="button" role="switch" aria-checked={acceptingRequests} onClick={() => setAcceptingRequests((current) => !current)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${acceptingRequests ? "border-lime-300/25 bg-lime-300/[.06] text-lime-200" : "border-neutral-700 bg-neutral-950/60 text-neutral-300"}`}><span className={`size-2 rounded-full ${acceptingRequests ? "bg-lime-300" : "bg-neutral-500"}`} />{acceptingRequests ? "Accepting booking requests" : "Requests paused"}{acceptingRequests ? <ToggleRight size={17} aria-hidden="true" /> : <ToggleLeft size={17} aria-hidden="true" />}</button>
        </div>
      </section>

      <section aria-label="Profile analytics" className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="flex items-center gap-2 text-xs text-neutral-400"><Eye size={14} className="text-cyan-300" aria-hidden="true" />Profile views · 30 days</p><p className="mt-3 text-2xl font-semibold text-white">{viewCount.toLocaleString("en-ZA")}</p><p className="mt-1 inline-flex items-center gap-1 text-[10px] text-lime-300"><ArrowUpRight size={12} aria-hidden="true" />12% vs last month</p></article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="flex items-center gap-2 text-xs text-neutral-400"><MessageSquareText size={14} className="text-cyan-300" aria-hidden="true" />Inquiry conversion</p><p className="mt-3 text-2xl font-semibold text-white">{conversionRate.toFixed(1)}%</p><p className="mt-1 text-[10px] text-neutral-500">{inquiryCount} inquiries from {viewCount.toLocaleString("en-ZA")} profile views</p></article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"><p className="flex items-center gap-2 text-xs text-neutral-400"><ArrowDownRight size={14} className="text-cyan-300" aria-hidden="true" />Next payout</p><p className="mt-3 text-2xl font-semibold text-white">{formatZar(pendingPayout)}</p><p className="mt-1 text-[10px] text-neutral-500">Processing from 1 confirmed booking</p></article>
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,.85fr)]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Booking requests</h2></div><span className="text-xs text-neutral-500">{requests.length} active</span></div>
          <div className="divide-y divide-neutral-800 border-y border-neutral-800">
            {requests.map((request) => <article key={request.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-white">{request.client}</h3><span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${request.status === "Confirmed" ? "border-lime-300/20 text-lime-200" : request.status === "Quote sent" ? "border-cyan-300/20 text-cyan-200" : "border-amber-300/20 text-amber-200"}`}>{request.status}</span></div><p className="mt-1 text-xs text-neutral-400">{request.event} · {dateLabel(request.date)} · {request.area}</p></div>
              <div className="flex items-center justify-between gap-3 sm:justify-end"><strong className="text-sm text-neutral-200">{formatZar(request.amount)}</strong><select aria-label={`Update status for ${request.client}`} value={request.status} onChange={(event) => updateRequestStatus(request.id, event.target.value as BookingRequest["status"])} className="market-dashboard-select"><option>New inquiry</option><option>Quote sent</option><option>Confirmed</option></select></div>
            </article>)}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Availability calendar</h2></div><span className="text-[10px] text-neutral-500">Select available days to block</span></div>
          <div className="mb-3 flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="grid size-8 place-items-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"><ChevronLeft size={16} aria-hidden="true" /></button><h3 className="text-sm font-semibold text-neutral-200">{monthLabel}</h3><button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="grid size-8 place-items-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"><ChevronRight size={16} aria-hidden="true" /></button></div>
          <div className="grid grid-cols-7 gap-1 text-center">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="py-1 text-[9px] font-bold text-neutral-600">{day}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: dayCount }, (_, index) => {
            const day = index + 1;
            const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), day));
            const isPast = date < localDateKey(new Date());
            const isBlocked = blockedDates.includes(date);
            const isBooked = requests.some((request) => request.date === date && request.status === "Confirmed");
            return <button key={date} type="button" disabled={isPast || isBooked} aria-label={`${date}${isBooked ? ", booked" : isBlocked ? ", blocked" : ", available"}`} aria-pressed={isBlocked} title={isBooked ? "Confirmed booking" : isBlocked ? "Blocked" : "Available"} onClick={() => toggleDate(day)} className={`aspect-square rounded-md text-[10px] transition disabled:cursor-not-allowed disabled:opacity-30 ${isBooked ? "bg-cyan-300/15 text-cyan-100" : isBlocked ? "bg-rose-400/15 text-rose-200 ring-1 ring-rose-300/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}>{day}</button>;
          })}</div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-800 pt-3 text-[10px] text-neutral-500"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-cyan-300/60" />Booked</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-300/70" />Blocked</span><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-neutral-600" />Available</span></div>
          <p className="mt-2 text-[10px] text-neutral-600">{blockedDates.length} dates blocked in this demo calendar.</p>
        </section>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Payout tracker</h2></div><span className="text-xs text-neutral-500">Demo amounts · settlement managed outside VibeShift</span></div>
        <div className="overflow-x-auto border-y border-neutral-800"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr className="text-[9px] uppercase tracking-wider text-neutral-600"><th className="py-3 font-semibold">Booking</th><th className="py-3 font-semibold">Expected / paid</th><th className="py-3 font-semibold">Date</th><th className="py-3 text-right font-semibold">Status</th></tr></thead><tbody className="divide-y divide-neutral-800">{payouts.map((payout) => <tr key={payout.id}><td className="py-3 font-medium text-neutral-300">{payout.booking}</td><td className="py-3 text-neutral-200">{formatZar(payout.amount)}</td><td className="py-3 text-neutral-500">{dateLabel(payout.date)}</td><td className="py-3 text-right"><span className={`rounded border px-2 py-1 text-[9px] font-bold uppercase ${payout.status === "Paid" ? "border-lime-300/20 text-lime-200" : "border-amber-300/20 text-amber-200"}`}>{payout.status}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}