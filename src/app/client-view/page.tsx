"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ClientViewPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      // First check local browser imported pages
      const local = localStorage.getItem("qreet_client_pages");
      if (local) {
        const pages = JSON.parse(local);
        const decoded = decodeURIComponent(slug);
        const found = pages.find(
          (p: any) =>
            p.slug === slug ||
            p.slug === decoded ||
            decodeURIComponent(p.slug) === decoded ||
            p.slug.replace(/\.html?$/i, "") === slug.replace(/\.html?$/i, "") ||
            p.id === slug
        );
        if (found) {
          setPage(found);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Otherwise fetch from public server API
    const cleanSlug = slug.replace(/\.html?$/i, "");
    fetch(`/cms/api/public/pages/${encodeURIComponent(cleanSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setPage(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800 font-mono text-sm">
        Loading preview...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-3 text-slate-600">Page not found for slug: <span className="font-mono text-indigo-600 font-semibold">{slug}</span></p>
        <Link href="/dashboard/pages" className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow">
          Back to Pages
        </Link>
      </div>
    );
  }

  // Check if page contains full standalone HTML structure (<!DOCTYPE or <html> or <head>)
  const isFullHtml = /<!DOCTYPE|<html|<head|<body/i.test(page.html || "");

  if (isFullHtml) {
    // Render full standalone HTML directly in an isolated fullscreen iframe so all JS/CSS/Images render without React interference
    const fullDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${page.css ? `<style>${page.css}</style>` : ""}
      </head>
      <body>
        ${page.html}
      </body>
      </html>
    `;

    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
        {/* Top Minimal Admin Banner */}
        <div className="h-9 shrink-0 flex items-center justify-between border-b border-slate-200 bg-amber-50 px-4 text-xs text-amber-900 z-50">
          <span>
            CMS Live Preview — <b>{page.title}</b> · Slug: <code>/{page.slug}</code>
          </span>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/pages/${encodeURIComponent(page.id || page.slug)}`} className="font-medium underline hover:text-amber-700">
              Edit Page
            </Link>
            <span>|</span>
            <Link href="/dashboard/pages" className="font-medium underline hover:text-amber-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        <iframe
          srcDoc={fullDocument}
          title={page.title}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top Bar Banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
        <span>
          CMS Live Preview — <b>{page.title}</b> · slug: <code>/{page.slug}</code>
        </span>
        <Link href="/dashboard/pages" className="font-medium underline hover:text-amber-700">
          Back to Dashboard
        </Link>
      </div>

      {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}

      {page.image && (
        <div className="mx-auto flex max-w-5xl justify-center p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.image}
            alt={page.title}
            className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
          />
        </div>
      )}

      {page.html ? (
        <div
          className="qreet-page p-6"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      ) : (
        <div className="p-8 text-center text-slate-500">
          No HTML content in this page.
        </div>
      )}
    </main>
  );
}
