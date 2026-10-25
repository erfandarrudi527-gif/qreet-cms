import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deleteRedirect } from "@/lib/actions/taxonomy";
import { DeleteButton } from "@/components/ui";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [s, redirects] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Site identity, tracking scripts, and global header/footer templates.
        </p>
      </header>

      {/* Settings Form with Tabs */}
      <SettingsForm
        initial={{
          siteName: s?.siteName,
          logo: s?.logo,
          defaultSeoTitle: s?.defaultSeoTitle,
          defaultSeoDescription: s?.defaultSeoDescription,
          analyticsId: s?.analyticsId,
          clarityId: s?.clarityId,
          headerHtml: s?.headerHtml,
          headerCss: s?.headerCss,
          footerHtml: s?.footerHtml,
          footerCss: s?.footerCss,
          socialLinks: (s?.socialLinks as Record<string, string> | null) ?? {},
        }}
      />

      {/* 301 Redirects Table */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">301 Redirects</h2>
            <p className="text-xs text-slate-600 font-medium">
              Automatically created when published blog post or page slugs are changed.
            </p>
          </div>
          <span className="rounded-full bg-admin-bg px-2.5 py-0.5 text-xs text-gray-400">
            {redirects.length} redirects
          </span>
        </div>

        {redirects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-xs text-gray-500">
            No redirects recorded yet. Changing the slug of any published post or page will automatically record a 301 redirect here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-admin-border text-gray-400">
                <tr>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Destination</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {redirects.map((r) => (
                  <tr key={r.id} className="text-gray-300">
                    <td className="py-2.5 font-mono text-xs text-amber-300">{r.source}</td>
                    <td className="py-2.5 font-mono text-xs text-emerald-400">{r.destination}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">
                        {r.statusCode}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <DeleteButton action={deleteRedirect} id={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
