"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, DeleteButton } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { deletePage } from "@/lib/actions/pages";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

export default function PagesClientList({ serverPages }: { serverPages: any[] }) {
  const [pages, setPages] = useState<PageRow[]>(() => {
    return (serverPages || []).map((p) => ({
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      image: p.image,
      status: p.status,
      updatedAt: String(p.updatedAt),
    }));
  });

  // Also sync client-side imported pages from browser storage
  useEffect(() => {
    try {
      const local = localStorage.getItem("qreet_client_pages");
      if (local) {
        const clientPages: PageRow[] = JSON.parse(local);
        setPages((prev) => {
          const map = new Map<string, PageRow>();
          // local pages take priority on top
          clientPages.forEach((p) => map.set(p.slug, p));
          prev.forEach((p) => {
            if (!map.has(p.slug)) map.set(p.slug, p);
          });
          return Array.from(map.values());
        });
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-admin-border text-left text-xs uppercase tracking-wide text-slate-700 bg-slate-100/60 font-bold">
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Updated</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">
          {pages.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-9 w-12 shrink-0 rounded border border-admin-border object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-100 text-[10px] text-slate-500 font-medium">
                      No img
                    </div>
                  )}
                  <span className="truncate">{p.title}</span>
                </div>
              </td>
              <td className="px-5 py-3 font-mono text-xs text-slate-600 font-medium">/{p.slug}</td>
              <td className="px-5 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-5 py-3 text-slate-600 text-xs">{formatDate(p.updatedAt)}</td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1.5 sm:gap-2">
                  <Link href={`/client-view?slug=${encodeURIComponent(p.slug)}`} className="btn-ghost px-2.5 py-1 text-xs" target="_blank">
                    Preview
                  </Link>
                  <Link
                    href={`/client-view?slug=${encodeURIComponent(p.slug)}`}
                    className="btn-ghost px-2.5 py-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    target="_blank"
                  >
                    Live ↗
                  </Link>
                  <Link href={`/dashboard/pages/${encodeURIComponent(p.id)}`} className="btn-ghost px-2.5 py-1 text-xs">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Are you sure you want to remove ${p.title}?`)) return;
                      try {
                        const local = localStorage.getItem("qreet_client_pages");
                        if (local) {
                          const list = JSON.parse(local).filter((x: any) => x.slug !== p.slug && x.id !== p.id);
                          localStorage.setItem("qreet_client_pages", JSON.stringify(list));
                        }
                      } catch {}
                      deletePage(p.id).then(() => window.location.reload());
                    }}
                    className="btn-ghost px-2.5 py-1 text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {pages.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-gray-600">
                No pages yet. Create one or import a ZIP.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
