import { NextRequest, NextResponse } from "next/server";
import { checkApiKey } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/robots.txt — ready-to-serve robots file for qreet.com.
 * Disallows indexing of everything except the published content paths,
 * which the public site governs itself.
 */
export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return new NextResponse("Invalid API key", { status: 401 });
  }
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qreet.com";

  const txt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /preview
Disallow: /api

Sitemap: ${SITE}/sitemap.xml
`;
  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
