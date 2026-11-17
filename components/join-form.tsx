"use client";
import { FormEvent, useState } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight, User } from "lucide-react";
import { signUpAction } from "@/app/auth/actions";

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500";

export function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendor");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseReady = Boolean(url && key && !url.includes("YOUR_PROJECT"));

    if (supabaseReady) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name, account_type: role } },
        });
        if (error) throw error;
        setMessage("Account created. Check your email to confirm before signing in.");
        setMessageType("success");
        setBusy(false);
        return;
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Unable to create account.");
        setMessageType("error");
        setBusy(false);
        return;
      }
    }

    const result = await signUpAction({ name, email, password, role });
    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      setBusy(false);
      return;
    }

    setMessage("Account created. Opening your account…");
    setMessageType("success");
    window.location.assign("/account");
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="join-name">
          <User size={16} className="text-slate-500" aria-hidden="true" />
          Your name
        </label>
        <input
          id="join-name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
          placeholder="Jane Doe"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="join-email">
          <Mail size={16} className="text-slate-500" aria-hidden="true" />
          Email address
        </label>
        <input
          id="join-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD_CLASS}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="join-password">
          <Lock size={16} className="text-slate-500" aria-hidden="true" />
          Password
        </label>
        <input
          id="join-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD_CLASS}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900" htmlFor="join-role">
          <User size={16} className="text-slate-500" aria-hidden="true" />
          I&apos;m joining as
        </label>
        <select
          id="join-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={FIELD_CLASS}
        >
          <option value="vendor">A vendor / supplier</option>
          <option value="planner">An event planner / client</option>
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
            Creating account…
          </>
        ) : (
          <>
            <ArrowRight size={16} aria-hidden="true" />
            Create account
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
          role={messageType === "success" ? "status" : "alert"}
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
        Local demo mode: no email verification, the session is kept in a signed cookie. Any email with an
        8-character password works.
      </p>
    </form>
  );
}
