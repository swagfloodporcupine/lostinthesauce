import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to VibeShift to manage vendor availability, event bookings and supplier enquiries.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <main className="auth-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Link className="brand absolute top-6 left-6" href="/">
        vibe<span>shift</span>
      </Link>
      <section className="auth-card w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in to VibeShift.</h1>
        <p className="text-sm text-slate-500 mb-6">Welcome back. Enter your details below to sign in.</p>
        <LoginForm />
        <p className="auth-foot mt-6 text-center text-sm text-slate-600">
          New to VibeShift?{" "}
          <Link href="/join" className="text-cyan-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
