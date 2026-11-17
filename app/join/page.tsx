import Link from "next/link";
import type { Metadata } from "next";
import { JoinForm } from "@/components/join-form";

export const metadata: Metadata = {
  title: "List your event services in Cape Town",
  description:
    "Create a VibeShift profile and list your DJ, sound, lighting, photo, video or venue services to Cape Town event planners.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "List your event services in Cape Town | VibeShift",
    description:
      "Create a VibeShift profile and list your DJ, sound, lighting, photo, video or venue services to Cape Town event planners.",
    url: "/join",
  },
};

export default function JoinPage() {
  return (
    <main className="auth-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Link className="brand absolute top-6 left-6" href="/">
        vibe<span>shift</span>
      </Link>
      <section className="auth-card w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account.</h1>
        <p className="text-sm text-slate-500 mb-6">Join VibeShift as a vendor or event planner.</p>
        <JoinForm />
        <p className="auth-foot mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
