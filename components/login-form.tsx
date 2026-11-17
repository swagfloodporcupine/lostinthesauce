"use client";
import { FormEvent, useEffect, useState } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight, User } from "lucide-react";
import { signInAction } from "@/app/auth/actions";

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendor");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setSupabaseReady(Boolean(url && key && !url.includes("YOUR_PROJECT")));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    if (supabaseReady) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign("/account");
        return;
      } catch {
        // Fall through to the local demo session.
      }
    }

    const result = await signInAction({ email, password, role });
    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      setBusy(false);
      return;
    }

    setMessage("Signed in. Opening your account…");
    setMessageType("success");
    window.location.assign("/account");
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="login-email">
          <Mail size={16} className="text-slate-500" aria-hidden="true" />
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD_CLASS}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="login-password">
          <Lock size={16} className="text-slate-500" aria-hidden="true" />
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD_CLASS}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="login-role">
          <User size={16} className="text-slate-500" aria-hidden="true" />
          Sign in as
        </label>
        <select
          id="login-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={FIELD_CLASS}
        >
          <option value="vendor">Vendor / Supplier</option>
          <option value="planner">Event Planner / Client</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {busy ? (
          <>
            <ArrowRight size={16} className="animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            <ArrowRight size={16} aria-hidden="true" />
            Log in
          </>
        )}
      </button>
      {message && (
        <p
          className={`text-sm rounded-lg border px-3 py-2 ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          {messageType === "success" ? (
            <CheckCircle size={14} className="mr-2" aria-hidden="true" />
          ) : (
            <AlertCircle size={14} className="mr-2" aria-hidden="true" />
          )}
          {message}
        </p>
      )}
      <p className="text-xs text-slate-600">
        Demo accounts:{" "}
        <span className="text-cyan-700 font-medium">dj@example.com / password123</span>{" "}
        (vendor), <span className="text-cyan-700 font-medium">planner@example.com / password123</span>{" "}
        (planner) — or any email with an 8-character password.
      </p>
    </form>
  );
}
