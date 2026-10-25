"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizePageHtml } from "@/lib/sanitize";
import { importPageZip } from "@/lib/zip-import";
import { slugify } from "@/lib/utils";
import { assertAdminSession } from "@/lib/security";

const pageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().nullish(),
  html: z.string().default(""),
  css: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
  canonicalUrl: z.string().nullish(),
  ogTitle: z.string().nullish(),
  ogDescription: z.string().nullish(),
  ogImage: z.string().nullish(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
});

export type PageFormState = { ok: boolean; error?: string; id?: string };

export async function savePage(_prev: PageFormState, formData: FormData): Promise<PageFormState> {
  await assertAdminSession();
  const parsed = pageSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    image: formData.get("image") || null,
    html: formData.get("html") ?? "",
    css: formData.get("css") ?? "",
    status: formData.get("status"),
    // empty optional fields are submitted as "" → store null so they can be cleared
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
    canonicalUrl: formData.get("canonicalUrl") || null,
    ogTitle: formData.get("ogTitle") || null,
    ogDescription: formData.get("ogDescription") || null,
    ogImage: formData.get("ogImage") || null,
    robotsIndex: formData.get("robotsIndex") === "on",
    robotsFollow: formData.get("robotsFollow") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const data = parsed.data;
  const slug = slugify(data.slug);

  // Security boundary: HTML is sanitized at rest, renderer stays isolated.
  const html = sanitizePageHtml(data.html);
  const seo = {
    seoTitle: data.seoTitle, seoDescription: data.seoDescription,
    canonicalUrl: data.canonicalUrl, ogTitle: data.ogTitle,
    ogDescription: data.ogDescription, ogImage: data.ogImage,
    robotsIndex: data.robotsIndex, robotsFollow: data.robotsFollow,
  };

  if (data.id) {
    const prev = await prisma.page.findUnique({ where: { id: data.id } });
    const page = await prisma.page.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug,
        image: data.image,
        html,
        css: data.css,
        status: data.status,
        ...seo,
        publishedAt:
          data.status === "PUBLISHED" ? prev?.publishedAt ?? new Date() : null,
      },
    });

    if (prev && prev.status === "PUBLISHED" && prev.slug !== slug) {
      const source = `/${prev.slug}`;
      const destination = `/${slug}`;
      await prisma.$transaction([
        prisma.redirect.deleteMany({ where: { source: destination } }),
        prisma.redirect.updateMany({ where: { destination: source }, data: { destination } }),
        prisma.redirect.upsert({
          where: { source },
          update: { destination, statusCode: 301 },
          create: { source, destination, statusCode: 301 },
        }),
      ]);
    }

    revalidatePath("/dashboard/pages");
    return { ok: true, id: page.id };
  }

  const exists = await prisma.page.findUnique({ where: { slug } });
  if (exists) return { ok: false, error: `Slug "/${slug}" is already used by another page.` };

  const page = await prisma.page.create({
    data: {
      title: data.title,
      slug,
      image: data.image,
      html,
      css: data.css,
      status: data.status,
      ...seo,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  revalidatePath("/dashboard/pages");
  return { ok: true, id: page.id };
}

export async function importPageFromZip(formData: FormData): Promise<PageFormState> {
  const file = formData.get("zip");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a ZIP file." };
  }
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? title) || "untitled");
  if (!title) return { ok: false, error: "Title is required." };
  if (await prisma.page.findUnique({ where: { slug } })) {
    return { ok: false, error: `Slug "/${slug}" is already used.` };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { html, css, assets } = await importPageZip(buffer, slug);

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        html: sanitizePageHtml(html),
        css,
        status: "DRAFT",
      },
    });

    // Register imported assets in the Media library too.
    for (const a of assets) {
      await prisma.media.create({
        data: {
          filename: a.filename,
          url: a.url,
          mimeType: a.mimeType,
          alt: title,
          size: a.size,
        },
      }).catch(() => { /* duplicate url — skip */ });
    }

    revalidatePath("/dashboard/pages");
    revalidatePath("/dashboard/media");
    return { ok: true, id: page.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to read ZIP." };
  }
}

export async function deletePage(id: string): Promise<void> {
  "use server";
  await assertAdminSession();
  await prisma.page.delete({ where: { id } });
  revalidatePath("/dashboard/pages");
}

export async function saveMediaAlt(id: string, alt: string): Promise<void> {
  await prisma.media.update({ where: { id }, data: { alt } });
  revalidatePath("/dashboard/media");
}
