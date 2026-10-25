import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PagesClientList from "@/components/PagesClientList";

export const dynamic = "force-dynamic";

export default async function PagesListPage() {
  let pages: any[] = [];
  try {
    pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  } catch (err) {
    console.error("Failed to load pages:", err);
  }

  const serialized = (pages || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.image,
    status: p.status,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Pages</h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Raw HTML/CSS — no page builder. CSS is namespaced at render time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/pages/new?mode=zip" className="btn-ghost text-xs sm:text-sm">Import ZIP</Link>
          <Link href="/dashboard/pages/new" className="btn-primary text-xs sm:text-sm">New Page</Link>
        </div>
      </header>

      <PagesClientList serverPages={serialized} />
    </div>
  );
}
