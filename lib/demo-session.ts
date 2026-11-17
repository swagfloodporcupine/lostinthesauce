import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "vs_session";
const SECRET = process.env.DEMO_SESSION_SECRET ?? "vibeshift-local-demo-session";
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionRole = "vendor" | "planner";

export type DemoProfile = {
  display_name: string;
  phone?: string;
  city?: string;
  bio?: string;
};

export type DemoSession = {
  email: string;
  name: string;
  role: SessionRole;
  iat: number;
  profile?: DemoProfile;
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function setDemoSession(session: DemoSession): Promise<void> {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<DemoSession>;
    if (typeof parsed.email !== "string" || typeof parsed.name !== "string") return null;
    return {
      email: parsed.email,
      name: parsed.name,
      role: parsed.role === "planner" ? "planner" : "vendor",
      iat: typeof parsed.iat === "number" ? parsed.iat : Date.now(),
      profile: parsed.profile,
    };
  } catch {
    return null;
  }
}

export async function clearDemoSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
