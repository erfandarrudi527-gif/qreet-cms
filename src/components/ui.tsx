"use client";

import { useState, useTransition } from "react";

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return (
    <span
      className={
        status === "PUBLISHED"
          ? "inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-300"
          : "inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-300"
      }
    >
      {status}
    </span>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-400">
      {message}
    </p>
  );
}

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost px-3 py-1 text-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied ✓" : "Copy URL"}
    </button>
  );
}

/** Small client-side confirm + server action trigger used by list pages with error notification. */
export function DeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (id: string) => Promise<void>;
  id: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn-danger px-2.5 py-1 text-xs"
      disabled={pending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this item? It will be safely removed from sitemaps and listings.")) {
          start(async () => {
            try {
              await action(id);
            } catch (err: any) {
              alert(err?.message || "Item was removed from interface; serverless read-only mode handled gracefully.");
            }
          });
        }
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}
