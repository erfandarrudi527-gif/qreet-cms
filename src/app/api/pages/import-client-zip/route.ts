import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importPageZip } from "@/lib/zip-import";
import { sanitizePageHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, slug, html, css, assets } = body;

    if (!title) {
      return NextResponse.json({ error: "Page title is required." }, { status: 400 });
    }

    const cleanSlug = slugify(String(slug || title) || "untitled");

    const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "/${cleanSlug}" is already in use. Please choose a different slug.` },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        id: id || `page-${Date.now()}`,
        title,
        slug: cleanSlug,
        html: sanitizePageHtml(html || ""),
        css: css || "",
        status: "DRAFT",
      },
    });

    if (Array.isArray(assets)) {
      for (const a of assets) {
        await prisma.media
          .create({
            data: {
              filename: a.filename,
              url: a.url,
              mimeType: a.mimeType,
              alt: title,
              size: a.size || 0,
            },
          })
          .catch(() => {});
      }
    }

    return NextResponse.json({ ok: true, id: page.id });
  } catch (err: any) {
    console.error("API create page from client zip error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save imported page." },
      { status: 500 }
    );
  }
}
