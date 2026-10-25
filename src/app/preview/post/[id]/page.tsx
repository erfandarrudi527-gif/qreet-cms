import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePostHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    if (!id) return { title: "Preview", robots: { index: false, follow: false } };
    const post = await prisma.post.findUnique({ where: { id } });
    return {
      title: post ? `${post.title} (Preview)` : "Preview",
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

/** cms.qreet.com/preview/post/abc123 — token-style preview before publish. */
export default async function PreviewPostRoute({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id) notFound();

  let post: any = null;
  try {
    post = await prisma.post.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
  } catch (err) {
    console.error("PreviewPostRoute findUnique error:", err);
  }
  if (!post) notFound();

  let content = "";
  try {
    content = sanitizePostHtml(post.content);
  } catch {
    content = post.content || "";
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-amber-100 px-4 py-2 text-xs">
        <span>
          CMS preview — status: <b>{post.status}</b> · will publish at{" "}
          <code>qreet.com/blog/{post.slug}</code>
        </span>
        <Link href={`/dashboard/blog/${post.id}`} className="font-medium text-amber-800 underline">
          Back to editor
        </Link>
      </div>

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
