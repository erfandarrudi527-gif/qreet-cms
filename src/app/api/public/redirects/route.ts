import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/** GET /api/public/redirects — list of 301 redirects for qreet.com */
export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const redirects = await prisma.redirect.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      source: true,
      destination: true,
      statusCode: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(redirects, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
