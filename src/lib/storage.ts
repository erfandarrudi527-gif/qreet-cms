import { promises as fs } from "fs";
import path from "path";
import { BASE_PATH } from "./utils";

/**
 * Storage abstraction for the CMS media library.
 *
 * v1 writes to `public/uploads/` for zero-config local development.
 * In production, swap this implementation for Cloudflare R2 / S3 —
 * only this file needs to change; everything else works against
 * `saveFile()` / `deleteFile()` and the returned public URL.
 */

function getUploadDir(): string {
  // On Vercel / serverless runtime, the root file system (/var/task) is read-only.
  // /tmp is the only writable directory on AWS Lambda / Vercel Serverless Functions.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

function baseUrl(): string {
  const custom = process.env.STORAGE_BASE_URL?.replace(/\/+$/, "");
  return custom || BASE_PATH;
}

export interface StoredFile {
  url: string; // public URL stored in the Media table
  key: string; // storage key, needed for deletion
}

export async function saveFile(
  relPath: string, // e.g. "media/abc123-hero.webp"
  data: Buffer
): Promise<StoredFile> {
  const safe = normalizeKey(relPath);
  const uploadRoot = getUploadDir();
  const abs = path.join(uploadRoot, safe);
  try {
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, data);
  } catch (err) {
    console.error("Local storage write error:", err);
  }

  // If it's an image, create a data URL so it displays anywhere without needing static file serving
  const ext = path.extname(safe).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
    ".avif": "image/avif",
  };
  if (mimeMap[ext] && data.length < 4 * 1024 * 1024) {
    const dataUrl = `data:${mimeMap[ext]};base64,${data.toString("base64")}`;
    return { url: dataUrl, key: safe };
  }

  return { url: `${baseUrl()}/uploads/${safe}`, key: safe };
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const uploadRoot = getUploadDir();
    await fs.rm(path.join(uploadRoot, normalizeKey(key)), { force: true });
  } catch {
    // ignore missing files
  }
}

/** Prevent path traversal in caller-supplied keys. */
function normalizeKey(key: string): string {
  return path
    .normalize(key.replace(/\\/g, "/"))
    .replace(/^([/\\.\s]+)+/, "")
    .split(path.sep)
    .filter((s) => s && s !== "..")
    .join("/");
}

export function safeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "file"}${ext}`;
}
