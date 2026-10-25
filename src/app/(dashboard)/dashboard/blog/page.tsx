import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge, DeleteButton } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { deletePost } from "@/lib/actions/posts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog" };

export default async function BlogListPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true } }, category: { select: { name: true } } },
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Blog</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage blog articles and insights with structured rich editing
          </p>
        </div>
        <Link href="/dashboard/blog/new" className="btn-primary self-start sm:self-auto">New Post</Link>
      </header>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-admin-border text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Author</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-white/[.02]">
                <td className="px-5 py-3">
                  <span className="font-medium text-gray-200">{p.title}</span>
                  <span className="block font-mono text-xs text-gray-600">/blog/{p.slug}</span>
                </td>
                <td className="px-5 py-3 text-gray-400">{p.author?.name ?? "Erfan"}</td>
                <td className="px-5 py-3 text-gray-400">{p.category?.name ?? "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3 text-gray-500">{formatDate(p.publishedAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5 sm:gap-2">
                    <Link href={`/preview/post/${p.id}`} target="_blank" className="btn-ghost px-2.5 py-1 text-xs">
                      Preview
                    </Link>
                    {p.status === "PUBLISHED" && (
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="btn-ghost px-2.5 py-1 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        Live ↗
                      </Link>
                    )}
                    <Link href={`/dashboard/blog/${p.id}`} className="btn-ghost px-2.5 py-1 text-xs">
                      Edit
                    </Link>
                    <DeleteButton action={deletePost} id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-600">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
