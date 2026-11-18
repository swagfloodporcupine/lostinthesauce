import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "[supabase/admin] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
  );
}

// Service-role client. Bypasses RLS on purpose: the platform inbox bridges
// the demo-session cookie (HMAC-signed, not Supabase Auth) to real auth users,
// and every inbox read/write must work for whichever role is at the desk.
export const adminClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});