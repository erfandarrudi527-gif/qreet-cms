import JSZip from "jszip";
import { saveFile, safeFilename } from "./storage";
import { slugify as slugifyImport } from "./utils";

/**
 * ZIP page import (architecture note #2 — designer workflow):
 *
 *   about-page.zip
 *   ├── index.html      → Page.html
 *   ├── style.css       → Page.css   (also accepts main.css / styles.css / <page>.css)
 *   ├── images/*.webp   → storage, references rewritten to public URLs
 *   └── fonts/*         → storage, url() references rewritten
 */

export interface ZipPageResult {
  html: string;
  css: string;
  assets: { filename: string; url: string; mimeType: string; size: number }[];
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".css": "text/css",
  ".html": "text/html",
  ".htm": "text/html",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".js": "application/javascript",
  ".json": "application/json",
};

export async function importPageZip(
  zipBuffer: Buffer,
  pageSlug: string
): Promise<ZipPageResult> {
  const zip = await JSZip.loadAsync(zipBuffer);

  // Get all non-directory files ignoring macOS/system metadata
  const allFiles = Object.values(zip.files).filter(
    (f) => !f.dir && !/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db)/i.test(f.name)
  );

  if (allFiles.length === 0) {
    throw new Error("The uploaded ZIP file is empty. Please upload a ZIP containing HTML/CSS or media files.");
  }

  // 1. Locate HTML file(s) - check root index, nested index, or any HTML/HTM
  const htmlFiles = allFiles.filter((f) => /\.(html?)$/i.test(f.name));
  const htmlFile =
    htmlFiles.find((f) => /(^|\/)index\.html?$/i.test(f.name)) ??
    htmlFiles.find((f) => /(^|\/)(home|main|default)\.html?$/i.test(f.name)) ??
    htmlFiles[0];

  // 2. Locate all CSS files
  const cssFiles = allFiles.filter((f) => /\.css$/i.test(f.name));

  // 3. Upload all media/font assets first to construct the URL rewrite map
  const assets: ZipPageResult["assets"] = [];
  const urlMap = new Map<string, string>(); // relative path / filename → public url

  for (const f of allFiles) {
    const lower = f.name.toLowerCase();
    if (lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".css")) {
      continue;
    }
    const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : "";
    const mime = MIME[ext] || "application/octet-stream";

    const data = await f.async("nodebuffer");
    const base = f.name.split("/").pop() ?? "asset";
    const rel = `pages/${pageSlug}/${slugifyImport(pageSlug)}-${safeFilename(base)}`;
    const stored = await saveFile(rel, data);

    urlMap.set(base, stored.url);
    urlMap.set(f.name, stored.url);
    urlMap.set(f.name.replace(/^\.\//, ""), stored.url);
    if (f.name.includes("/")) {
      const sub = f.name.slice(f.name.indexOf("/") + 1);
      urlMap.set(sub, stored.url);
    }

    assets.push({ filename: base, url: stored.url, mimeType: mime, size: data.length });
  }

  // 4. Extract or generate HTML
  let html = "";
  if (htmlFile) {
    html = await htmlFile.async("string");
  } else {
    // If ZIP contains only images/assets without an HTML file, generate a clean responsive layout
    const imgItems = assets
      .filter((a) => a.mimeType.startsWith("image/"))
      .map(
        (a) =>
          `<div class="media-preview-card my-4">\n  <img src="${a.url}" alt="${a.filename}" class="max-w-full h-auto rounded-xl shadow-md" />\n</div>`
      )
      .join("\n");

    html = `<section class="imported-page-wrapper p-6">\n  <h1 class="text-3xl font-bold mb-4">${pageSlug}</h1>\n  ${
      imgItems || `<p class="text-gray-500">Page imported successfully from ZIP.</p>`
    }\n</section>`;
  }

  // 5. Extract and combine CSS from all CSS files
  let css = "";
  if (cssFiles.length > 0) {
    const cssContents = await Promise.all(cssFiles.map((f) => f.async("string")));
    css = cssContents.join("\n\n");
  }

  // 6. Rewrite asset references in HTML & CSS
  html = rewriteRefs(html, urlMap);
  if (css) {
    css = rewriteCssUrls(css, urlMap);
  }

  return { html, css, assets };
}

/** Rewrite src="images/hero.webp" / href="hero.webp" style references. */
function rewriteRefs(html: string, map: Map<string, string>): string {
  return html.replace(
    /(src|href|poster)=(["'])([^"']+)\2/gi,
    (match, attr, quote, ref: string) => {
      if (/^(https?:|data:|#|\/\/)/i.test(ref)) return match;
      const clean = ref.replace(/^\.\//, "");
      const url = map.get(clean) ?? map.get(clean.split("/").pop() ?? "");
      return url ? `${attr}=${quote}${url}${quote}` : match;
    }
  );
}

/** Rewrite url(images/hero.webp) inside CSS. */
function rewriteCssUrls(css: string, map: Map<string, string>): string {
  return css.replace(
    /url\((["']?)([^"')]+)\1\)/gi,
    (match, quote, ref: string) => {
      if (/^(https?:|data:)/i.test(ref)) return match;
      const clean = ref.replace(/^\.\//, "");
      const url = map.get(clean) ?? map.get(clean.split("/").pop() ?? "");
      return url ? `url(${quote}${url}${quote})` : match;
    }
  );
}
