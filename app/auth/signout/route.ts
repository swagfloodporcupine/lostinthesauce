import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clearDemoSession } from "@/lib/demo-session";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // No Supabase project configured: the demo session is the only auth.
  }
  await clearDemoSession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
