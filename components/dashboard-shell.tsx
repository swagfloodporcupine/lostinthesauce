"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CircleUserRound } from "lucide-react";
import { VendorDashboard } from "@/components/vendor-dashboard";
import { ClientDashboard } from "@/components/client-dashboard";

export type DashboardView = "vendor" | "client";

export function DashboardShell() {
  const [view, setView] = useState<DashboardView>("vendor");

  return (
    <main className="dashboard-shell min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-8">
          <Link className="text-xl font-extrabold tracking-tight text-white" href="/" aria-label="VibeShift home">vibe<span className="text-cyan-400">shift</span></Link>
          <nav className="flex items-center gap-2" aria-label="Dashboard navigation">
            <Link href="/" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-900 hover:text-white"><ArrowUpRight size={14} aria-hidden="true" />Marketplace</Link>
            <span className="hidden h-5 w-px bg-neutral-800 sm:block" />
            <span className="inline-flex items-center gap-1.5 px-2 text-xs text-neutral-300"><CircleUserRound size={15} className="text-cyan-300" aria-hidden="true" /> Demo workspace</span>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-9 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold text-white">Your event desk</h1>
            <p className="mt-2 text-sm text-neutral-400">Bookings, availability and event coordination in one place.</p>
          </div>
          <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-900/70 p-1" role="tablist" aria-label="Dashboard view">
            <button type="button" role="tab" aria-selected={view === "vendor"} onClick={() => setView("vendor")} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold transition ${view === "vendor" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"}`}><BriefcaseBusiness size={14} aria-hidden="true" />Vendor Hub</button>
            <button type="button" role="tab" aria-selected={view === "client"} onClick={() => setView("client")} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold transition ${view === "client" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"}`}><CalendarDays size={14} aria-hidden="true" />Client Events</button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div key={view} role="tabpanel" aria-label={view === "vendor" ? "Vendor Hub" : "Client Events"} className="vs-view">
          {view === "vendor" ? <VendorDashboard /> : <ClientDashboard />}
        </div>
      </div>
    </main>
  );
}