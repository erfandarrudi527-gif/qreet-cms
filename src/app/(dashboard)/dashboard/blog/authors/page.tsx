import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { saveAuthor, deleteAuthor } from "@/lib/actions/taxonomy";
import { DeleteButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Authors" };

export default async function AuthorsPage() {
  let authors: any[] = [];
  try {
    authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  } catch (err) {
    console.error("Failed to load authors:", err);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Authors</h1>
      </header>

      <form action={saveAuthor} className="card grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" required className="input" placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Avatar URL (from Media Library)</label>
          <input name="avatar" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Bio</label>
          <input name="bio" className="input" />
        </div>
        <button className="btn-primary justify-self-start">Add Author</button>
      </form>

      <div className="card p-0">
        <ul className="divide-y divide-admin-border">
          {authors.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-200">{a.name}</p>
                <p className="font-mono text-xs text-gray-600">
                  /blog/author/{a.slug} · {a._count?.posts ?? 0} posts
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <details className="relative">
                  <summary className="btn-ghost cursor-pointer px-3 py-1 text-xs">Edit</summary>
                  <form action={saveAuthor} className="absolute right-0 z-10 mt-1 w-72 space-y-2 rounded-lg border border-admin-border bg-admin-panel p-3 shadow-xl">
                    <input type="hidden" name="id" value={a.id} />
                    <input name="name" defaultValue={a.name} className="input" />
                    <input name="bio" defaultValue={a.bio ?? ""} className="input" placeholder="Bio" />
                    <input name="avatar" defaultValue={a.avatar ?? ""} className="input" placeholder="Avatar URL" />
                    <button className="btn-primary w-full justify-center py-1 text-xs">Save</button>
                  </form>
                </details>
                <DeleteButton action={deleteAuthor} id={a.id} />
              </div>
            </li>
          ))}
          {authors.length === 0 && (
            <li className="px-5 py-10 text-center text-gray-600">No authors yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
