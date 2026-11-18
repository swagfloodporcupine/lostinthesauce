// Seed the demo inbox: demo planner + vendor profiles, conversations and messages.
// Idempotent — re-running for the same emails returns the same rows.
//
//   bun supabase/seed/inbox.ts
//   node --import tsx supabase/seed/inbox.ts
//
import { adminClient } from "@/lib/supabase/admin";

// These must match the names produced by app/auth/actions.ts (KNOWN_NAMES) so a
// user logging in as planner@example.com lands on the seeded conversations.
const DEMO_USERS = [
  { email: "planner@example.com", name: "Event Planner", role: "planner" as const },
  { email: "dj@example.com", name: "DJ Cape Town", role: "vendor" as const },
  { email: "sound@example.com", name: "Signal Path Audio", role: "vendor" as const },
];

async function ensureProfile(user: (typeof DEMO_USERS)[number]): Promise<string | null> {
  // 1. Resolve by email first — a user who already signed in (and has a profile)
  //    must keep their existing UUID so conversation history stays attached.
  const { data: byEmail } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const authUser = byEmail?.users.find((u) => u.email?.toLowerCase() === user.email);
  if (authUser?.id) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();
    if (profile?.id) return profile.id;
    // Auth user exists but profile row is missing — fall through and let the
    // trigger recreate it via createUser? Not possible for an existing email, so
    // try to read the profile one more time before giving up.
  }

  // 2. Otherwise look up by display_name (legacy rows from earlier seeds).
  const { data: byName } = await adminClient
    .from("profiles")
    .select("id")
    .eq("display_name", user.name)
    .maybeSingle();
  if (byName?.id) return byName.id;

  // 3. Create the auth user + profile.
  const { data, error } = await adminClient.auth.admin.createUser({
    email: user.email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { display_name: user.name, account_type: user.role },
  });
  if (error || !data?.user) {
    console.error(`[seed] ensureProfile failed for ${user.email}`, error?.message ?? error);
    return null;
  }
  return data.user.id;
}

async function main() {
  const ids: Record<string, string> = {};
  for (const user of DEMO_USERS) {
    const id = await ensureProfile(user);
    if (id) ids[user.email] = id;
    console.log(`[seed] ${user.name} (${user.email}) -> ${id ?? "MISSING"}`);
  }

  const plannerId = ids["planner@example.com"];
  if (!plannerId) {
    console.error("[seed] missing planner, aborting");
    return;
  }

  const threads: Array<{ vendorEmail: string; messages: Array<{ body: string; from: "planner" | "vendor" }> }> = [
    {
      vendorEmail: "dj@example.com",
      messages: [
        { body: "Hi DJ Cape Town, we're finalising the Harbour Lights launch on 19 Dec. Are you still open?", from: "planner" },
        { body: "Yes! That date is open. What time are we talking?", from: "vendor" },
        { body: "7pm to 2am at The Glasshouse, Woodstock. Sound and lighting included?", from: "planner" },
        { body: "Sound is covered by Signal Path. I can bring my own rig for the lighting layer if you want.", from: "vendor" },
        { body: "Great, let's lock it in. Sending the agreement over shortly.", from: "planner" },
      ],
    },
    {
      vendorEmail: "sound@example.com",
      messages: [
        { body: "Hi Signal Path, confirming the Harbour Lights launch PA on 19 Dec. 7pm start.", from: "planner" },
        { body: "Confirmed. We'll be on site from 5pm for line check.", from: "vendor" },
      ],
    },
  ];

  for (const thread of threads) {
    const vendorId = ids[thread.vendorEmail];
    if (!vendorId) continue;

    // Dedupe by (planner_id, vendor_id). The migration's unique constraint is
    // unique(event_id, planner_id, vendor_id, listing_id), but event_id and
    // listing_id are NULL for a standalone thread, and Postgres treats NULLs as
    // distinct — so the constraint never fires for these rows. Match the
    // NULL-safe lookup in lib/messaging/inbox.ts ensureConversation() instead.
    const { data: existing } = await adminClient
      .from("conversations")
      .select("id")
      .eq("planner_id", plannerId)
      .eq("vendor_id", vendorId)
      .maybeSingle();
    let conv = existing;
    if (!conv) {
      const { data: created, error: convErr } = await adminClient
        .from("conversations")
        .insert({ planner_id: plannerId, vendor_id: vendorId, event_id: null, listing_id: null })
        .select("id")
        .single();
      if (convErr || !created) {
        console.error("[seed] conversation insert failed", convErr);
        continue;
      }
      conv = created;
    }

    const { count } = await adminClient
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id);
    if ((count ?? 0) > 0) {
      console.log(`[seed] thread ${thread.vendorEmail} already seeded, skipping`);
      continue;
    }

    const senderId = (from: "planner" | "vendor") =>
      from === "planner" ? plannerId : vendorId;

    // Stagger created_at so the ORDER BY created_at in the API is deterministic
    // (one insert batch otherwise gives every row the same now() timestamp).
    const base = Date.now() - thread.messages.length * 60_000;
    const rows = thread.messages.map((m, i) => ({
      conversation_id: conv.id,
      sender_id: senderId(m.from),
      body: m.body,
      created_at: new Date(base + i * 60_000).toISOString(),
    }));
    const { error: msgErr } = await adminClient.from("messages").insert(rows);
    console.log(
      `[seed] ${thread.vendorEmail}: ${msgErr ? "FAILED" : "seeded " + rows.length + " messages"}`,
      msgErr,
    );
  }
}

main().catch((error) => {
  console.error("[seed] fatal", error);
  process.exit(1);
});
