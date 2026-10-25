import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiKey, serializeSettings } from "@/lib/public-serialize";

export const dynamic = "force-dynamic";

/** GET /api/public/settings — site identity for the public website shell */
export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  return NextResponse.json(serializeSettings(settings));
}
