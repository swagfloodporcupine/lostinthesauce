import { adminClient } from "@/lib/supabase/admin";
import { getDemoSession } from "@/lib/demo-session";

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  role: "planner" | "vendor";
  profileId: string;
};

// Resolve the current desk user from the demo-session cookie, bridging it to a
// stable Supabase auth user + profiles row. Idempotent: re-running for the same
// email returns the same UUID, so a planner can hop between devices without
// losing their conversation history.
export async function getAuthedUser(): Promise<AuthedUser | null> {
  const session = await getDemoSession();
  if (!session) return null;

  const email = session.email.trim().toLowerCase();

  // 1. Resolve by auth email first. The demo session is keyed on email; the
  //    profile row shares its UUID with auth.users(id), so an existing account
  //    must keep its real UUID even when the cookie's display_name differs from
  //    the stored profile (e.g. KNOWN_NAMES rewrites dj@example.com).

  // Fetch the auth user by email, then the profile by that user's id.
  const { data: auth } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = auth?.users.find((u) => u.email?.toLowerCase() === email);

  if (authUser?.id) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, display_name, account_type")
      .eq("id", authUser.id)
      .maybeSingle();
    if (profile?.id) {
      return {
        id: profile.id,
        email,
        name: session.name,
        role: session.role,
        profileId: profile.id,
      };
    }
    // Auth user exists but profile row is missing — fall through to createUser
    // (safe: an email can only be created once, so this is the rare repair case).
  }

  // 2. Fall back to a display_name match (legacy / pre-email accounts).
  const { data: existing } = await adminClient
    .from("profiles")
    .select("id, display_name, account_type")
    .ilike("display_name", session.name)
    .limit(50);
  const match =
    existing?.find((p) => p.display_name.toLowerCase() === session.name.toLowerCase()) ??
    existing?.find((p) => p.display_name.toLowerCase().includes(session.name.toLowerCase()));
  if (match) {
    return {
      id: match.id,
      email,
      name: session.name,
      role: session.role,
      profileId: match.id,
    };
  }

  // 3. No profile yet — materialise an auth user + profile so inbox writes work.
  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { display_name: session.name, account_type: session.role },
  });
  if (createErr || !created?.user) {
    console.error("[messaging/identity] createUser failed", createErr);
    return null;
  }

  // handle_new_user() trigger auto-creates the profile row; confirm it.
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("id", created.user.id)
    .maybeSingle();

  return {
    id: created.user.id,
    email,
    name: session.name,
    role: session.role,
    profileId: profile?.id ?? created.user.id,
  };
}
