import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePageHtml } from "@/lib/sanitize";
import { scopeCss, pageScopeSelector } from "@/lib/css-scope";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawSlug = resolvedParams?.slug;
    if (!rawSlug) return { title: "Preview", robots: { index: false, follow: false } };
    const decodedSlug = decodeURIComponent(rawSlug);
    const cleanSlug = decodedSlug.replace(/\.html?$/i, "");
    const page =
      (await prisma.page.findUnique({ where: { slug: decodedSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: cleanSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: rawSlug } }));
    return {
      title: page ? `${page.title} (Preview)` : "Preview",
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

/**
 * Isolated Page Renderer pipeline:
 *   CMS DB (raw HTML + CSS) → sanitize → namespace CSS → scoped render
 * The admin panel itself never renders this HTML.
 */
export default async function PreviewPageRoute({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams?.slug;
  if (!rawSlug) notFound();

  const decodedSlug = decodeURIComponent(rawSlug);
  const cleanSlug = decodedSlug.replace(/\.html?$/i, "");

  let page: any = null;
  try {
    page =
      (await prisma.page.findUnique({ where: { slug: decodedSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: cleanSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: rawSlug } }));
  } catch (err) {
    console.error("PreviewPageRoute findUnique error:", err);
  }
  if (!page) notFound();

  let safeHtml = page.html || "";
  let scope = `[data-page="${page.slug}"]`;
  let scopedCss = page.css || "";
  try {
    safeHtml = sanitizePageHtml(page.html);
  } catch {}
  try {
    scope = pageScopeSelector(page.slug);
    scopedCss = scopeCss(page.css, scope);
  } catch {}

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-amber-100 px-4 py-2 text-xs">
        <span>
          CMS preview — <b>{page.title}</b> · status: {page.status} · will publish at{" "}
          <code>qreet.com/{page.slug}</code>
        </span>
        <Link href={`/dashboard/pages/${page.id}`} className="font-medium text-amber-800 underline">
          Back to editor
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `${scope}{display:block}\n${scopedCss}` }} />
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
      {safeHtml && (
        <div
          className="qreet-page"
          data-page={page.slug}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      )}
    </main>
  );
}
