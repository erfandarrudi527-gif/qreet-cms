import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "@/components/PageForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Page" };

export default async function EditPageRoute({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id) notFound();

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) {
    // If not found yet on server container, render a hydrated editor using that ID
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Page</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">ID: {id}</p>
        </header>
        <PageForm
          initial={{
            id: id,
            title: "Imported Page",
            slug: "imported-page",
            status: "DRAFT",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Page</h1>
        <p className="mt-1 font-mono text-sm text-slate-500">qreet.com/{page.slug}</p>
      </header>
      <PageForm
        initial={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          image: page.image,
          html: page.html,
          css: page.css,
          status: page.status,
          seo: {
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            canonicalUrl: page.canonicalUrl,
            ogTitle: page.ogTitle,
            ogDescription: page.ogDescription,
            ogImage: page.ogImage,
            robotsIndex: page.robotsIndex,
            robotsFollow: page.robotsFollow,
          },
        }}
      />
    </div>
  );
}
