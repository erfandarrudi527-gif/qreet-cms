import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/sitemap.xml — ready-to-serve sitemap built from all
 * published content. qreet.com can proxy this directly.
 */
export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return new NextResponse("Invalid API key", { status: 401 });
  }
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qreet.com";

  const [pages, posts] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLISHED", robotsIndex: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", robotsIndex: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entry = (loc: string, lastmod: Date) =>
    `  <url><loc>${loc}</loc><lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod></url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => entry(`${SITE}/${p.slug}`, p.updatedAt)).join("\n")}
${posts.map((p) => entry(`${SITE}/blog/${p.slug}`, p.updatedAt)).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
