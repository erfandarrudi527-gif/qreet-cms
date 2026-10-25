"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/pages", label: "Pages", icon: "▤" },
  { href: "/dashboard/pages/new?mode=zip", label: "Import ZIP", icon: "📦" },
  { href: "/dashboard/blog", label: "Blog", icon: "✎" },
  { href: "/dashboard/blog/categories", label: "Categories", icon: "⚑" },
  { href: "/dashboard/blog/authors", label: "Authors", icon: "☺" },
  { href: "/dashboard/media", label: "Media", icon: "▣" },
  { href: "/dashboard/admins", label: "Admins & Users", icon: "🛡️" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

export default function ResponsiveDashboardLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Top Navigation Bar */}
      <div className="flex h-16 w-full items-center justify-between border-b border-admin-border bg-admin-panel/90 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/20">
            Q
          </span>
          <div>
            <span className="block text-sm font-bold text-slate-900">Qreet CMS</span>
            <span className="block text-[10px] text-slate-500 font-mono">cms.qreet.com</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-admin-border bg-white/5 text-gray-200 transition hover:bg-white/10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-admin-bg/95 p-6 backdrop-blur md:hidden">
          <div className="flex items-center justify-between pb-6">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-accent font-bold text-white">
                Q
              </span>
              <span className="text-base font-semibold text-white">Qreet CMS</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1.5 pt-2">
            {NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-medium transition ${
                    isActive
                      ? "bg-admin-accent text-white shadow-md shadow-admin-accent/20"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {userEmail && (
            <div className="mt-auto border-t border-admin-border pt-4">
              <p className="mb-2 truncate text-xs text-gray-400">{userEmail}</p>
              <ThemeToggle />
              <SignOutButton />
            </div>
          )}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 md:flex shadow-sm">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white shadow-lg shadow-indigo-500/25">
            Q
          </span>
          <div>
            <span className="block text-sm font-extrabold tracking-wide text-slate-900">Qreet CMS</span>
            <span className="block text-[11px] text-slate-500 font-mono">cms.qreet.com</span>
          </div>
        </Link>

        <nav className="space-y-1.5">
          {NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {userEmail && (
          <div className="mt-auto border-t border-slate-200 pt-4">
            <p className="mb-2 truncate px-3 text-xs text-slate-500 font-mono">{userEmail}</p>
            <ThemeToggle />
            <SignOutButton />
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
