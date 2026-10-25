import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey, serializePage } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/** GET /api/public/pages/[slug] — published page payload for qreet.com */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || page.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializePage(page), {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=3600" },
  });
}
