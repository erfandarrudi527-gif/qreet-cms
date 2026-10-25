"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setCoords({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f8fafc] px-6 select-none font-sans text-slate-900">
      {/* Dynamic Interactive Ambient Mesh Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25] transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: mounted
            ? `perspective(1000px) rotateX(${coords.y * -6}deg) rotateY(${coords.x * 6}deg)`
            : "none",
        }}
      />

      {/* Deep Radial Glow Lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[160px] transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${coords.x * 30}px, ${coords.y * 30}px)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-violet-500/15 blur-[150px] transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${coords.x * -25}px, ${coords.y * -25}px)`,
        }}
      />

      {/* Main 3D Interactive Card Stage */}
      <div
        className="relative z-10 flex flex-col items-center text-center max-w-xl transition-transform duration-300 ease-out"
        style={{
          transform: mounted
            ? `perspective(1200px) rotateX(${coords.y * -4}deg) rotateY(${coords.x * 4}deg)`
            : "none",
        }}
      >
        {/* Holographic Glowing 404 Display */}
        <div className="relative mb-6">
          <span className="font-mono text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-indigo-900 to-indigo-600 drop-shadow-[0_4px_20px_rgba(99,102,241,0.25)] sm:text-9xl">
            404
          </span>
          <div className="absolute inset-x-0 -bottom-2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#818cf8]" />
        </div>

        {/* Live Status Chip */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-600 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
            SYSTEM_EXCEPTION // ROUTE_DESYNCHRONIZED
          </span>
        </div>

        {/* Heading & Context */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Content Node Not Located
        </h1>

        <p className="mt-3.5 text-sm text-slate-600 leading-relaxed max-w-md">
          The requested route is detached or unindexed on the live cluster. Verify the slug URL or navigate back to the operational interface.
        </p>

        {/* Interactive Command Terminal Log (Light Neumorphic Card) */}
        <div className="mt-6 w-full max-w-md rounded-xl border border-slate-200 bg-white/90 p-3.5 text-left font-mono text-xs text-slate-600 shadow-xl">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 text-[10px] text-slate-400">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-2 font-medium">qreet_kernel_diagnostics.sh</span>
          </div>
          <p className="text-slate-700">&gt; probing route cluster... [404 NULL]</p>
          <p className="text-indigo-600 font-medium">&gt; isolated renderer active: standalone fallback mode</p>
          <p className="text-emerald-600 font-medium">&gt; suggested action: return to dashboard</p>
        </div>

        {/* Primary Interactive Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition"
          >
            <span className="relative z-10">Return to Dashboard</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/dashboard/pages"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition shadow-sm"
          >
            View Pages Database
          </Link>
        </div>

        {/* Footer Identity Breadcrumb */}
        <div className="mt-12 flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>QREET CONTENT ENGINE</span>
          <span>•</span>
          <span>ISOLATED ROUTE RUNTIME</span>
        </div>
      </div>
    </div>
  );
}
