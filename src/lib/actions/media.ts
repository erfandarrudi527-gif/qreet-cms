"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveFile, deleteFile, safeFilename } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { assertAdminSession } from "@/lib/security";

export type MediaFormState = { ok: boolean; error?: string; uploaded?: number };

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB per file in v1

export async function uploadMedia(
  _prev: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await assertAdminSession();
  const entries = formData.getAll("files").filter(
    (f): f is File => f instanceof File && f.size > 0
  );
  if (entries.length === 0) return { ok: false, error: "No files selected." };

  let uploaded = 0;
  for (const file of entries) {
    if (file.size > MAX_SIZE) {
      return { ok: false, error: `"${file.name}" is larger than 25 MB.` };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomUUID();
    const stored = await saveFile(`media/${id}-${safeFilename(file.name)}`, buffer);

    let width: number | null = null;
    let height: number | null = null;
    if (file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
      try {
        // dynamic import: node-only, keeps client bundles clean
        const { default: sizeOf } = await import("image-size");
        const dims = sizeOf(buffer);
        width = dims.width ?? null;
        height = dims.height ?? null;
      } catch {
        /* unknown format — leave dimensions empty */
      }
    }

    await prisma.media.create({
      data: {
        filename: safeFilename(file.name),
        url: stored.url,
        mimeType: file.type || "application/octet-stream",
        alt: slugify(file.name),
        width,
        height,
        size: file.size,
      },
    });
    uploaded++;
  }

  revalidatePath("/dashboard/media");
  return { ok: true, uploaded };
}

/** Used by the in-editor MediaPicker modal. */
export async function listMediaForPicker(): Promise<{
  id: string;
  url: string;
  filename: string;
  mimeType: string;
}[]> {
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, url: true, filename: true, mimeType: true },
  });
  return items;
}

/** Extracts the storage key from a media url and deletes file + record. */
export async function deleteMedia(id: string): Promise<void> {
  await assertAdminSession();
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;
  try {
    const pathPart = new URL(media.url, "http://local").pathname;
    // url is either "/uploads/<key>" or "<basePath>/uploads/<key>" — keep the tail
    const key = pathPart.split("/uploads/").pop() ?? "";
    if (key) await deleteFile(key);
  } catch {
    /* external URL (R2) — deletion handled by provider console in v1 */
  }
  await prisma.media.delete({ where: { id } });
  revalidatePath("/dashboard/media");
}
