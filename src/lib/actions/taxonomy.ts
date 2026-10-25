"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { assertAdminSession } from "@/lib/security";

// ── Categories ────────────────────────────────────────────────────
export async function saveCategory(formData: FormData): Promise<void> {
  await assertAdminSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(String(formData.get("slug") ?? name));
  const description = String(formData.get("description") ?? "");
  const seoTitle = String(formData.get("seoTitle") ?? "") || null;
  const seoDescription = String(formData.get("seoDescription") ?? "") || null;
  const canonicalUrl = String(formData.get("canonicalUrl") ?? "") || null;
  // the edit form submits "on" | "off"; fields missing entirely (create form) default to on
  const robotsIndex = formData.get("robotsIndex") !== "off";
  const robotsFollow = formData.get("robotsFollow") !== "off";

  if (id) {
    await prisma.category.update({
      where: { id },
      data: { name, slug, description, seoTitle, seoDescription, canonicalUrl, robotsIndex, robotsFollow },
    });
  } else {
    await prisma.category.create({
      data: { name, slug, description, seoTitle, seoDescription, canonicalUrl, robotsIndex, robotsFollow },
    });
  }
  revalidatePath("/dashboard/blog/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  "use server";
  await prisma.category.delete({ where: { id } });
  revalidatePath("/dashboard/blog/categories");
}

// ── Authors ───────────────────────────────────────────────────────
export async function saveAuthor(formData: FormData): Promise<void> {
  await assertAdminSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(String(formData.get("slug") ?? name));
  const bio = String(formData.get("bio") ?? "");
  const avatar = String(formData.get("avatar") ?? "") || null;

  if (id) {
    await prisma.author.update({ where: { id }, data: { name, slug, bio, avatar } });
  } else {
    await prisma.author.create({ data: { name, slug, bio, avatar } });
  }
  revalidatePath("/dashboard/blog/authors");
}

export async function deleteAuthor(id: string): Promise<void> {
  "use server";
  await assertAdminSession();
  await prisma.author.delete({ where: { id } });
  revalidatePath("/dashboard/blog/authors");
}

// ── Settings (singleton row id = 1) ───────────────────────────────
export async function saveSettings(formData: FormData): Promise<void> {
  await assertAdminSession();
  const socialLinks = {
    twitter: String(formData.get("social_twitter") ?? ""),
    instagram: String(formData.get("social_instagram") ?? ""),
    linkedin: String(formData.get("social_linkedin") ?? ""),
    youtube: String(formData.get("social_youtube") ?? ""),
  };
  const data = {
    siteName: String(formData.get("siteName") ?? "Qreet"),
    logo: String(formData.get("logo") ?? "") || null,
    defaultSeoTitle: String(formData.get("defaultSeoTitle") ?? "") || null,
    defaultSeoDescription: String(formData.get("defaultSeoDescription") ?? "") || null,
    analyticsId: String(formData.get("analyticsId") ?? "") || null,
    clarityId: String(formData.get("clarityId") ?? "") || null,
    headerHtml: String(formData.get("headerHtml") ?? ""),
    headerCss: String(formData.get("headerCss") ?? ""),
    footerHtml: String(formData.get("footerHtml") ?? ""),
    footerCss: String(formData.get("footerCss") ?? ""),
    socialLinks,
  };

  await prisma.setting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePath("/dashboard/settings");
}

export async function deleteRedirect(id: string): Promise<void> {
  await assertAdminSession();
  await prisma.redirect.delete({ where: { id } });
  revalidatePath("/dashboard/settings");
}
