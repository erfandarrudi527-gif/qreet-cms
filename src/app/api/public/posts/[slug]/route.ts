import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey, serializePost } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/** GET /api/public/posts/[slug] — full published post for SSR/SSG on qreet.com */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, category: true },
  });
  if (!post || post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializePost(post), {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=3600" },
  });
}
