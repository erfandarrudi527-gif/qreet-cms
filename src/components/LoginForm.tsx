"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isRegister) {
      try {
        const res = await fetch("/cms/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed.");
          setLoading(false);
          return;
        }

        setSuccess("Account created successfully! Signing in…");
        // Automatically sign in after register
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        setLoading(false);
        if (loginRes?.error) {
          setIsRegister(false);
          setSuccess("Account registered! Please sign in with your credentials.");
          return;
        }
        window.location.href = "/cms/dashboard";
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || "Failed to connect to server.");
      }
    } else {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (res?.error) {
        setError(res.error.includes("locked") ? res.error : "Invalid email or password.");
        return;
      }
      window.location.href = "/cms/dashboard";
      }
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setIsRegister(false);
            setError("");
            setSuccess("");
          }}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
            !isRegister ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(true);
            setError("");
            setSuccess("");
          }}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
            isRegister ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Erfan Darroudi"
              autoComplete="name"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@qreet.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-900/60 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary relative w-full justify-center overflow-hidden py-2.5 font-medium transition active:scale-[0.99] disabled:opacity-80"
        >
          {loading ? (
            <span className="flex items-center gap-2.5">
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{isRegister ? "Creating account…" : "Signing in…"}</span>
            </span>
          ) : (
            <span>{isRegister ? "Create Account" : "Sign In"}</span>
          )}
        </button>
      </form>
    </div>
  );
}
