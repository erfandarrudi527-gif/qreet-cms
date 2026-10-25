import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizePostHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;
    if (!slug) return { title: "Blog" };
    const post = await prisma.post.findUnique({ where: { slug } });
    return {
      title: post?.seoTitle || post?.title || "Blog Post",
      description: post?.seoDescription || post?.excerpt || undefined,
    };
  } catch {
    return { title: "Blog" };
  }
}

/**
 * Public Live Blog Post View (without administrative yellow CMS preview banner)
 */
export default async function PublicLivePostRoute({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  let post: any = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, category: true },
    });
  } catch (err) {
    console.error("PublicLivePostRoute findUnique error:", err);
  }

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  let content = "";
  try {
    content = sanitizePostHtml(post.content);
  } catch {
    content = post.content || "";
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <article className="mx-auto max-w-2xl px-6 py-12">
        {post.category && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {post.category.name}
          </p>
        )}
        <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-neutral-500">
          {post.author?.name ?? "Erfan"} · {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
        {post.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt ?? ""}
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}
        {post.excerpt && (
          <p className="mt-6 border-l-4 border-neutral-200 pl-4 text-lg text-neutral-600">
            {post.excerpt}
          </p>
        )}
        <div
          className="article-body mt-8 space-y-4 leading-8 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:rounded-xl [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </main>
  );
}
