"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizePostHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import { assertAdminSession } from "@/lib/security";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  featuredImage: z.string().nullish(),
  featuredImageAlt: z.string().nullish(),
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().optional(),
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

export type PostFormState = { ok: boolean; error?: string; id?: string };

export async function savePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await assertAdminSession();
  const parsed = postSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    // empty optional fields are submitted as "" → store null so they can be cleared
    featuredImage: formData.get("featuredImage") || null,
    featuredImageAlt: formData.get("featuredImageAlt") || null,
    authorId: formData.get("authorId"),
    categoryId: formData.get("categoryId") || undefined,
    status: formData.get("status"),
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
  // Even though Tiptap output is structured, sanitize again at the boundary.
  const content = sanitizePostHtml(data.content);
  // update: "— none —" disconnects the relation; create: omitted → null
  const category = data.categoryId ? { connect: { id: data.categoryId } } : undefined;

  if (data.id) {
    const prev = await prisma.post.findUnique({ where: { id: data.id } });
    const post = await prisma.post.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content,
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt,
        author: { connect: { id: data.authorId } },
        category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        robotsIndex: data.robotsIndex,
        robotsFollow: data.robotsFollow,
        publishedAt:
          data.status === "PUBLISHED" ? prev?.publishedAt ?? new Date() : null,
      },
    });

    // A published post changed its slug → record a 301 redirect from the old
    // path so qreet.com keeps forwarding visitors and link equity.
    if (prev && prev.status === "PUBLISHED" && prev.slug !== slug) {
      const source = `/blog/${prev.slug}`;
      const destination = `/blog/${slug}`;
      await prisma.$transaction([
        // the new slug is live again — a redirect sourced there is now stale
        prisma.redirect.deleteMany({ where: { source: destination } }),
        // keep chains flat: rows pointing at the old slug now point at the new one
        prisma.redirect.updateMany({ where: { destination: source }, data: { destination } }),
        prisma.redirect.upsert({
          where: { source },
          update: { destination, statusCode: 301 },
          create: { source, destination, statusCode: 301 },
        }),
      ]);
    }

    revalidatePath("/dashboard/blog");
    return { ok: true, id: post.id };
  }

  if (await prisma.post.findUnique({ where: { slug } })) {
    return { ok: false, error: `Slug "/${slug}" is already used by another post.` };
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content,
      featuredImage: data.featuredImage,
      featuredImageAlt: data.featuredImageAlt,
      author: { connect: { id: data.authorId } },
      category,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      robotsIndex: data.robotsIndex,
      robotsFollow: data.robotsFollow,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  revalidatePath("/dashboard/blog");
  return { ok: true, id: post.id };
}

export async function deletePost(id: string): Promise<void> {
  "use server";
  await assertAdminSession();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/dashboard/blog");
}
