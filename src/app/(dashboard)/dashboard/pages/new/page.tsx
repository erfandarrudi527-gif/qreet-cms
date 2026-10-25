import type { Metadata } from "next";
import Link from "next/link";
import PageForm from "@/components/PageForm";
import ZipImportForm from "@/components/ZipImportForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Page" };

export default async function NewPageRoute({
  searchParams,
}: {
  searchParams: { mode?: string } | Promise<{ mode?: string }>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const zipMode = resolvedParams?.mode === "zip";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">New Page</h1>
        <nav className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 text-sm">
          <Link
            href="/dashboard/pages/new"
            className={`rounded-md px-3 py-1 font-semibold transition ${!zipMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Page Editor
          </Link>
          <Link
            href="/dashboard/pages/new?mode=zip"
            className={`rounded-md px-3 py-1 font-semibold transition ${zipMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Import ZIP
          </Link>
        </nav>
      </header>

      {zipMode ? <ZipImportForm /> : <PageForm />}
    </div>
  );
}
