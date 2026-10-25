import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/PostForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Post" };

export default async function NewPostPage() {
  const [authors, categories] = await Promise.all([
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">New Post</h1>
      </header>
      <PostForm authors={authors} categories={categories} />
    </div>
  );
}
