import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { saveCategory, deleteCategory } from "@/lib/actions/taxonomy";
import { DeleteButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
      </header>

      <form action={saveCategory} className="card grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">New category name</label>
          <input name="name" required className="input" placeholder="Guides" />
        </div>
        <div>
          <label className="label">Slug (optional — derived from name)</label>
          <input name="slug" className="input" placeholder="guides" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <input name="description" className="input" />
        </div>
        <button className="btn-primary justify-self-start">Add Category</button>
      </form>

      <div className="card p-0">
        <ul className="divide-y divide-admin-border">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-200">{c.name}</p>
                <p className="font-mono text-xs text-gray-600">
                  /blog/category/{c.slug} · {c._count?.posts ?? 0} posts
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <details className="relative">
                  <summary className="btn-ghost cursor-pointer px-3 py-1 text-xs">Edit</summary>
                  <form action={saveCategory} className="absolute right-0 z-10 mt-1 w-72 space-y-2 rounded-lg border border-admin-border bg-admin-panel p-3 shadow-xl">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="name" defaultValue={c.name} className="input" />
                    <input name="description" defaultValue={c.description ?? ""} className="input" placeholder="Description" />
                    <input name="seoTitle" defaultValue={c.seoTitle ?? ""} className="input" placeholder="SEO title" />
                    <input name="seoDescription" defaultValue={c.seoDescription ?? ""} className="input" placeholder="SEO description" />
                    <input name="canonicalUrl" defaultValue={c.canonicalUrl ?? ""} className="input" placeholder="Canonical URL (optional)" />
                    <div className="grid grid-cols-2 gap-2">
                      <select name="robotsIndex" defaultValue={c.robotsIndex ? "on" : "off"} className="input">
                        <option value="on">Index</option>
                        <option value="off">Noindex</option>
                      </select>
                      <select name="robotsFollow" defaultValue={c.robotsFollow ? "on" : "off"} className="input">
                        <option value="on">Follow</option>
                        <option value="off">Nofollow</option>
                      </select>
                    </div>
                    <button className="btn-primary w-full justify-center py-1 text-xs">Save</button>
                  </form>
                </details>
                <DeleteButton action={deleteCategory} id={c.id} />
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-5 py-10 text-center text-gray-600">No categories yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
