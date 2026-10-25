import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DeleteButton, CopyUrlButton } from "@/components/ui";
import { formatBytes, formatDate } from "@/lib/utils";
import { deleteMedia } from "@/lib/actions/media";
import MediaUploader from "@/components/MediaUploader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Media Library</h1>
        <p className="mt-1 text-sm text-slate-600">
          Shared by Pages and Blog. Reference assets in raw HTML as{" "}
          <code className="text-indigo-600 font-mono font-semibold">{`<img src="…" />`}</code>.
        </p>
      </header>

      <MediaUploader />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {items.map((m) => (
          <div key={m.id} className="card flex flex-col gap-2 p-3">
            {m.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.alt} className="h-28 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-lg bg-black/40 text-2xl">
                📄
              </div>
            )}
            <p className="truncate text-xs font-medium text-gray-300" title={m.filename}>
              {m.filename}
            </p>
            <p className="text-[10px] text-gray-600">
              {formatBytes(m.size)}
              {m.width ? ` · ${m.width}×${m.height}` : ""} · {formatDate(m.createdAt)}
            </p>
            <div className="mt-auto flex flex-wrap gap-1">
              <CopyUrlButton url={m.url} />
              <DeleteButton action={deleteMedia} id={m.id} />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-gray-600">
            No media yet — upload files above.
          </p>
        )}
      </div>
    </div>
  );
}
