import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in · Qreet CMS" };

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-admin-accent/20 blur-[120px]"></div>
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-indigo-600/15 blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-xl font-black text-white shadow-xl shadow-indigo-500/25">
            Q
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Qreet CMS</h1>
          <p className="mt-1.5 text-xs font-semibold text-slate-600">
            High-Performance Content Management
          </p>
        </div>
        <div className="card shadow-xl border-slate-200 bg-white">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          Separate from Qreet product accounts (app.qreet.com)
        </p>
      </div>
    </main>
  );
}
