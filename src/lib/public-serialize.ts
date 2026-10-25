import { NextRequest } from "next/server";
import type { Page, Post, Author, Category, Setting } from "@prisma/client";
import { sanitizePageHtml } from "./sanitize";
import { scopeCss, pageScopeSelector } from "./css-scope";

/**
 * CMS → Public Website boundary (architecture note #6).
 *
 * qreet.com fetches READY-TO-RENDER payloads: the page HTML is sanitized
 * and its CSS already namespaced, so the public site only has to drop the
 * payload into `<div class="qreet-page" data-page="…">`.
 */

export function checkApiKey(req: NextRequest): boolean {
  const required = process.env.CMS_PUBLIC_API_KEY;
  if (!required) return true; // open in dev
  return req.headers.get("x-cms-api-key") === required;
}

type PageWithSetting = Page;

export function serializePage(page: PageWithSetting) {
  const scope = pageScopeSelector(page.slug);
  return {
    kind: "page",
    title: page.title,
    slug: page.slug,
    image: (page as any).image ?? null,
    status: page.status,
    // isolated-render payload
    html: sanitizePageHtml(page.html),
    css: scopeCss(page.css, scope),
    scopeSelector: scope,
    seo: {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription,
      canonical: page.canonicalUrl ?? `https://qreet.com/${page.slug}`,
      og: {
        title: page.ogTitle ?? page.seoTitle ?? page.title,
        description: page.ogDescription ?? page.seoDescription,
        image: page.ogImage ?? (page as any).image ?? null,
      },
      robots: `${page.robotsIndex ? "index" : "noindex"},${page.robotsFollow ? "follow" : "nofollow"}`,
    },
    publishedAt: page.publishedAt?.toISOString() ?? null,
    updatedAt: page.updatedAt.toISOString(),
  };
}

type PostFull = Post & { author: Author; category: Category | null };

export function serializePost(post: PostFull) {
  return {
    kind: "post",
    title: post.title,
    slug: post.slug,
    url: `https://qreet.com/blog/${post.slug}`,
    status: post.status,
    excerpt: post.excerpt,
    content: post.content, // sanitized again on save; render as-is
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    author: {
      name: post.author.name,
      slug: post.author.slug,
      bio: post.author.bio,
      avatar: post.author.avatar,
    },
    category: post.category
      ? { name: post.category.name, slug: post.category.slug }
      : null,
    seo: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      canonical: post.canonicalUrl ?? `https://qreet.com/blog/${post.slug}`,
      og: {
        title: post.ogTitle ?? post.seoTitle ?? post.title,
        description: post.ogDescription ?? post.seoDescription,
        image: post.ogImage ?? post.featuredImage,
      },
      robots: `${post.robotsIndex ? "index" : "noindex"},${post.robotsFollow ? "follow" : "nofollow"}`,
    },
    // JSON-LD, BlogPosting (architecture note #7)
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription ?? post.excerpt,
      image: post.ogImage ?? post.featuredImage,
      author: { "@type": "Person", name: post.author.name },
      datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
      dateModified: post.updatedAt.toISOString(),
    },
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function serializeSettings(s: Setting | null) {
  return {
    siteName: s?.siteName ?? "Qreet",
    logo: s?.logo,
    defaultSeo: {
      title: s?.defaultSeoTitle,
      description: s?.defaultSeoDescription,
    },
    analyticsId: s?.analyticsId,
    clarityId: s?.clarityId ?? null,
    header: {
      html: s?.headerHtml ?? "",
      css: s?.headerCss ?? "",
    },
    footer: {
      html: s?.footerHtml ?? "",
      css: s?.footerCss ?? "",
    },
    socialLinks: s?.socialLinks ?? {},
  };
}
