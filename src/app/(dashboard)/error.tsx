"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="card max-w-md p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl font-bold text-amber-400">
          !
        </div>
        <h2 className="text-xl font-bold text-white">An unexpected error occurred</h2>
        <p className="mt-2 text-sm text-gray-400">
          The application encountered a runtime issue while loading this section. You can retry or return to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary px-5 py-2 text-sm"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="btn-ghost px-5 py-2 text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
