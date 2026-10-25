import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/PostForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostRoute({ params }: { params: { id: string } }) {
  const [post, authors, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id: params.id } }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Post</h1>
        <p className="mt-1 font-mono text-sm text-slate-500">qreet.com/blog/{post.slug}</p>
      </header>
      <PostForm
        authors={authors}
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage,
          featuredImageAlt: post.featuredImageAlt,
          authorId: post.authorId,
          categoryId: post.categoryId,
          status: post.status,
          seo: {
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            canonicalUrl: post.canonicalUrl,
            ogTitle: post.ogTitle,
            ogDescription: post.ogDescription,
            ogImage: post.ogImage,
            robotsIndex: post.robotsIndex,
            robotsFollow: post.robotsFollow,
          },
        }}
      />
    </div>
  );
}
