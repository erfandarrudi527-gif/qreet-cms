export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "untitled";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qreet.com";

/**
 * CMS base path — must match `basePath` in next.config.mjs.
 * Derived from NEXT_PUBLIC_APP_URL so server code and the browser bundle agree.
 */
export const BASE_PATH = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "").pathname.replace(/\/+$/, "");
  } catch {
    return "/cms";
  }
})();
