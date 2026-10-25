import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    if (!rawSlug) return { title: "Page" };
    const decodedSlug = decodeURIComponent(rawSlug);
    const cleanSlug = decodedSlug.replace(/\.html?$/i, "");
    const page =
      (await prisma.page.findUnique({ where: { slug: decodedSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: cleanSlug } })) ??
      (await prisma.page.findUnique({ where: { slug: rawSlug } }));
    return {
      title: page?.seoTitle || page?.title || "Page",
      description: page?.seoDescription || undefined,
    };
  } catch {
    return { title: "Page" };
  }
}

/**
 * Public Live Page View (qreet-cms.vercel.app/cms/page/[slug] or /[slug])
 * Clean view for users and clients without the administrative yellow CMS banner.
 */
export default async function PublicLivePageRoute({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
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
    console.error("PublicLivePageRoute findUnique error:", err);
  }

  if (!page) {
    notFound();
  }

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
