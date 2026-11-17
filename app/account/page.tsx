import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDemoSession } from "@/lib/demo-session";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage supplier requests, availability and event bookings in your VibeShift account.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getDemoSession();

  let supabaseUser: { email?: string | null; name?: string | null; accountType?: "vendor" | "planner" } | null = null;
  let profile: { display_name?: string | null; account_type?: "vendor" | "planner" } | null = null;

  if (!session) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        supabaseUser = {
          email: user.email ?? null,
          name: (user.user_metadata?.display_name as string | undefined) ?? null,
          accountType: (user.user_metadata?.account_type as "vendor" | "planner" | undefined) ?? "planner",
        };

        // Fetch profile from database
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, account_type")
          .eq("id", user.id)
          .single();
        if (profileData) {
          profile = {
            display_name: profileData.display_name,
            account_type: profileData.account_type,
          };
        }
      }
    } catch {
      // Supabase not configured.
    }
  }

  if (!session && !supabaseUser) redirect("/login");

  // Check if profile is incomplete
  // For demo users: check if profile object exists and has display_name
  // For Supabase users: check profile table or user_metadata
  const hasProfile = session?.profile !== undefined || profile !== null || supabaseUser?.name !== null;
  const displayName = session?.profile?.display_name ?? profile?.display_name ?? supabaseUser?.name ?? "";
  const isProfileComplete = hasProfile && displayName.trim().length >= 2;

  // Determine account type for redirect
  const accountType = session?.role ?? profile?.account_type ?? supabaseUser?.accountType ?? "planner";

  // Redirect to profile setup if incomplete (but allow access to setup page itself)
  if (!isProfileComplete) {
    redirect(`/account/setup?type=${accountType}`);
  }

  const name = session?.name ?? supabaseUser?.name ?? "there";
  const email = session?.email ?? supabaseUser?.email ?? "";
  const isPlanner = session?.role === "planner" || accountType === "planner";

  return (
    <main className="account-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          vibe<span>shift</span>
        </Link>
        <Link href="/dashboard">Dashboard</Link>
      </header>
      <section className="account-panel">
        <p className="account-role">{isPlanner ? "Event planner account" : "Vendor account"}</p>
        <h1>Welcome, {name}.</h1>
        <p>
          {email}
          {session ? " · Local demo session (no email verification)." : ""}
        </p>
        <div className="account-grid">
          {isPlanner ? (
            <>
              <div>
                <strong>01</strong>
                <h2>Build an event crew</h2>
                <p>Add DJs, sound, lighting, photo and venue suppliers to one shortlist.</p>
              </div>
              <div>
                <strong>02</strong>
                <h2>Track bookings</h2>
                <p>Follow quote threads, agreements and payment progress per event.</p>
              </div>
              <div>
                <strong>03</strong>
                <h2>Browse the directory</h2>
                <p>Compare Cape Town suppliers by rate, gear and availability.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>01</strong>
                <h2>Publish your listing</h2>
                <p>Show your rates, tech rider and portfolio to Cape Town planners.</p>
              </div>
              <div>
                <strong>02</strong>
                <h2>Manage availability</h2>
                <p>Block dates, answer enquiries and send revised quotes.</p>
              </div>
              <div>
                <strong>03</strong>
                <h2>Close the booking</h2>
                <p>Sign agreements and track deposits in one place.</p>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="button button-primary" href="/dashboard">
            Open dashboard
          </Link>
          <form action="/auth/signout" method="post">
            <button className="button button-quiet">Sign out</button>
          </form>
        </div>
      </section>
    </main>
  );
}
