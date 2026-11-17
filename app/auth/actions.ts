"use server";

import { redirect } from "next/navigation";
import { clearDemoSession, getDemoSession, setDemoSession, type SessionRole } from "@/lib/demo-session";
import { createClient } from "@/lib/supabase/server";

export type AuthOutcome = { ok: boolean; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const KNOWN_NAMES: Record<string, string> = {
  "dj@example.com": "DJ Cape Town",
  "planner@example.com": "Event Planner",
};

function normaliseRole(role: string): SessionRole {
  return role === "planner" ? "planner" : "vendor";
}

export async function signUpAction(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthOutcome> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (name.length < 2) return { ok: false, message: "Please add your name." };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (input.password.length < 8) return { ok: false, message: "Use at least 8 characters for your password." };

  await setDemoSession({ name, email, role: normaliseRole(input.role), iat: Date.now() });
  return { ok: true, message: "Account created." };
}

export async function signInAction(input: {
  email: string;
  password: string;
  role: string;
}): Promise<AuthOutcome> {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (input.password.length < 8) return { ok: false, message: "Use at least 8 characters for your password." };

  const name =
    KNOWN_NAMES[email] ??
    email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  await setDemoSession({ name, email, role: normaliseRole(input.role), iat: Date.now() });
  return { ok: true, message: "Signed in." };
}

export async function updateProfile(input: {
  display_name: string;
  phone?: string;
  city?: string;
  bio?: string;
}): Promise<AuthOutcome> {
  const display_name = input.display_name.trim();
  if (display_name.length < 2) return { ok: false, message: "Please provide a valid display name." };

  // Try demo session first
  const session = await getDemoSession();
  if (session) {
    await setDemoSession({
      ...session,
      name: display_name,
      profile: {
        display_name,
        phone: input.phone?.trim() || "",
        city: input.city?.trim() || "",
        bio: input.bio?.trim() || "",
      },
    });
  }

  // Also update Supabase profile if configured
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        display_name,
        phone: input.phone?.trim() || null,
        city: input.city?.trim() || null,
        bio: input.bio?.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    } else if (!session) {
      return { ok: false, message: "Not signed in." };
    }
  } catch {
    // Supabase not configured or error - demo session update is enough if we have one
    if (!session) return { ok: false, message: "Not signed in." };
  }

  return { ok: true, message: "Profile saved." };
}
