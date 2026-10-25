import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/** GET /api/public/posts?page=1&pageSize=10 — published posts listing */
export async function GET(
  req: NextRequest
) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("pageSize") ?? 10)));
  const category = req.nextUrl.searchParams.get("category");

  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category: { slug: category } } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: true, category: true },
    }),
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    items: posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      url: `https://qreet.com/blog/${p.slug}`,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      author: p.author.name,
      category: p.category?.name ?? null,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
  });
}
