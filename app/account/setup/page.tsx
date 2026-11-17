"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle, Loader2, User, Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { updateProfile } from "@/app/auth/actions";

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

const LABEL_CLASS = "block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2";

export default function ProfileSetupPage() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [accountType, setAccountType] = useState<"vendor" | "planner">("vendor");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "vendor" || type === "planner") setAccountType(type);
  }, []);

  const isComplete = displayName.trim().length >= 2;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isComplete) return;
    setBusy(true);
    setMessage("");

    try {
      const result = await updateProfile({ display_name: displayName, phone, city, bio });
      if (!result.ok) {
        setMessage(result.message);
        setMessageType("error");
        setBusy(false);
        return;
      }
      setMessage("Profile saved. Redirecting…");
      setMessageType("success");
      window.location.assign("/account");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setBusy(false);
    }
  }

  if (!mounted) {
    return (
      <main className="auth-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="auth-card w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6" />
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <section className="auth-card w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Set up your profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            {accountType === "vendor"
              ? "Add your details so event planners can find and book you."
              : "Add your details to start building event crews."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="display-name" className={LABEL_CLASS}>
              <User size={16} className="text-slate-500" aria-hidden="true" />
              Display name <span className="text-blue-600 text-sm font-normal">*</span>
            </label>
            <input
              id="display-name"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={FIELD_CLASS}
              placeholder="Jane Doe"
              autoComplete="name"
              disabled={busy}
            />
            <p className="text-xs text-slate-500">How you&apos;ll appear on bookings and messages.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={LABEL_CLASS}>
              <Phone size={16} className="text-slate-500" aria-hidden="true" />
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={FIELD_CLASS}
              placeholder="+27 82 123 4567"
              autoComplete="tel"
              disabled={busy}
            />
            <p className="text-xs text-slate-500">Used for urgent booking coordination (never shared publicly).</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className={LABEL_CLASS}>
              <MapPin size={16} className="text-slate-500" aria-hidden="true" />
              City / Area
            </label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={FIELD_CLASS}
              placeholder="Cape Town, Western Cape"
              autoComplete="address-level2"
              disabled={busy}
            />
            <p className="text-xs text-slate-500">Helps planners find local suppliers.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className={LABEL_CLASS}>
              <MessageSquare size={16} className="text-slate-500" aria-hidden="true" />
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={FIELD_CLASS + " resize-none"}
              placeholder={accountType === "vendor"
                ? "Tell planners about your experience, gear, and style…"
                : "Describe the types of events you plan and what you&apos;re looking for…"}
              maxLength={500}
              disabled={busy}
            />
            <p className="text-xs text-slate-500 text-right">{bio.length}/500</p>
          </div>

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

          <button
            type="submit"
            disabled={busy || !isComplete}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <ArrowRight size={18} aria-hidden="true" />
                Save & continue to dashboard
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            You can edit this anytime from your account settings.
          </p>
        </form>
      </section>
    </main>
  );
}