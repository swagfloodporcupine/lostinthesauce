import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event bookings",
  description: "Review supplier status, event dates and payment progress from your VibeShift client dashboard.",
  robots: { index: false, follow: false },
};

export default function EventsPage() {
  return (
    <main className="account-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          vibe<span>shift</span>
        </Link>
        <Link href="/dashboard">Dashboard</Link>
      </header>
      <section className="account-panel">
        <h1>Track event bookings.</h1>
        <p>Review supplier status, event dates and payment progress from your client dashboard.</p>
        <Link className="button button-primary" href="/dashboard">
          Open Client Events
        </Link>
      </section>
    </main>
  );
}
