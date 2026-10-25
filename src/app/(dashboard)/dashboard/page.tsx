import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [pages, publishedPages, posts, publishedPosts, media, recent] =
    await Promise.all([
      prisma.page.count(),
      prisma.page.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.media.count(),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, status: true },
      }),
    ]);

  const stats = [
    { label: "Pages", total: pages, published: publishedPages, href: "/dashboard/pages", note: "raw HTML/CSS" },
    { label: "Blog posts", total: posts, published: publishedPosts, href: "/dashboard/blog", note: "minimal editor" },
    { label: "Media items", total: media, published: 0, href: "/dashboard/media", note: "storage: local / R2-ready" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Independent content service for qreet.com — no access to the Qreet product database.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card transition hover:border-indigo-500 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{s.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{s.total}</p>
            {s.published > 0 || s.label !== "Media items" ? (
              <p className="mt-1 text-xs text-emerald-600 font-semibold">{s.published} published</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">{s.note}</p>
            )}
          </Link>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Publish pipeline
          </h2>
          <pre className="whitespace-pre-wrap rounded-lg bg-slate-100 p-3 font-mono text-[11px] leading-5 text-slate-800 border border-slate-200">{`CMS DB → CMS API → qreet.com (SSR/SSG)
/api/public/pages/[slug]
/api/public/posts[/{slug}]
/api/public/sitemap.xml · /robots.txt`}</pre>
        </div>
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Recently edited posts
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <Link href={`/dashboard/blog/${p.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                    {p.title}
                  </Link>
                  <span className="text-xs text-slate-500 font-mono">/{p.slug}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
