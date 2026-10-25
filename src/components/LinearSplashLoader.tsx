"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LinearSplashLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  // If user is directly previewing a live page or preview URL, skip the 5-second splash so preview is instant!
  const isPreviewOrLive = pathname?.startsWith("/preview") || pathname?.startsWith("/page") || pathname?.startsWith("/blog") || pathname?.startsWith("/client-view");

  useEffect(() => {
    if (isPreviewOrLive) {
      setShow(false);
      return;
    }

    const startTime = Date.now();
    const duration = 5000; // Exact 5 seconds for dashboard/login

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setFading(true);
        setTimeout(() => setShow(false), 400); // fade duration
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPreviewOrLive]);

  if (!show || isPreviewOrLive) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#f8fafc] transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-500/15 blur-[120px]" />

      {/* Center Outline Typography Box */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* SVG Animated Stroke Draw for QREET */}
        <div className="w-full flex justify-center py-2">
          <svg className="w-72 max-w-full drop-shadow-[0_4px_16px_rgba(99,102,241,0.3)]" viewBox="0 0 300 80">
            <text x="50%" y="65%" textAnchor="middle" className="qreet-svg-draw">
              QREET
            </text>
          </svg>
        </div>

        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Content Management System
        </p>

        {/* 5-Second Linear Progress Bar */}
        <div className="mt-8 w-full max-w-xs">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>INITIALIZING</span>
            <span className="text-slate-800 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
