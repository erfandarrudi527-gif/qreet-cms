"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { FormError } from "@/components/ui";
import { sanitizePageHtml } from "@/lib/sanitize";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
};

export default function ZipImportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState<string>();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (title && !slugTouched) {
        setSlug(
          title
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
            .replace(/^-|-$/g, "")
        );
      }
    }, 200);
    return () => clearTimeout(t);
  }, [title, slugTouched]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError("Please select a valid ZIP file.");
      return;
    }

    // Limit uploaded ZIP file size to 5 GB (client-side extraction handles large archives)
    const MAX_ZIP_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
    if (file.size > MAX_ZIP_BYTES) {
      setError(`File size (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB) exceeds the 5 GB upload limit. Please upload a ZIP under 5 GB.`);
      return;
    }

    if (!title.trim()) {
      setError("Page title is required.");
      return;
    }

    setLoading(true);

    try {
      setStatusMsg("Reading and unpacking ZIP package in browser...");
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);

      const allFiles = Object.values(zip.files).filter(
        (f) => !f.dir && !/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db)/i.test(f.name)
      );

      if (allFiles.length === 0) {
        throw new Error("ZIP archive is empty or contains no valid files.");
      }

      setStatusMsg(`Found ${allFiles.length} files. Extracting template & styles...`);

      // 1. Locate HTML file(s)
      const htmlFiles = allFiles.filter((f) => /\.(html?)$/i.test(f.name));
      const htmlFile =
        htmlFiles.find((f) => /(^|\/)index\.html?$/i.test(f.name)) ??
        htmlFiles.find((f) => /(^|\/)(home|main|default)\.html?$/i.test(f.name)) ??
        htmlFiles[0];

      // 2. Locate CSS files
      const cssFiles = allFiles.filter((f) => /\.css$/i.test(f.name));

      // 3. Extract and convert assets (images, fonts, media)
      setStatusMsg("Optimizing images and embedded assets...");
      const assets: Array<{ filename: string; url: string; mimeType: string; size: number }> = [];
      const urlMap = new Map<string, string>();

      // Filter non-html/non-css assets
      const mediaCandidates = allFiles.filter((f) => {
        const lower = f.name.toLowerCase();
        return !lower.endsWith(".html") && !lower.endsWith(".htm") && !lower.endsWith(".css");
      });

      // Extract up to 20 images and convert to Base64 data URLs
      for (const f of mediaCandidates) {
        if (assets.length >= 20) break;

        const lower = f.name.toLowerCase();
        const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : "";
        const mime = MIME[ext] || "application/octet-stream";
        const base = f.name.split("/").pop() ?? "asset";

        if (mime.startsWith("image/") || mime.startsWith("font/")) {
          try {
            const b64 = await f.async("base64");
            const dataUrl = `data:${mime};base64,${b64}`;
            urlMap.set(base, dataUrl);
            urlMap.set(f.name, dataUrl);
            urlMap.set(f.name.replace(/^\.\//, ""), dataUrl);
            if (f.name.includes("/")) {
              const parts = f.name.split("/");
              urlMap.set(parts.slice(-1)[0], dataUrl);
              urlMap.set(parts.slice(-2).join("/"), dataUrl);
            }
            assets.push({ filename: base, url: dataUrl, mimeType: mime, size: b64.length });
          } catch {
            // skip problematic asset
          }
        }
      }

      // 4. Extract HTML content
      let html = "";
      if (htmlFile) {
        html = await htmlFile.async("string");
      } else {
        const imgTags = assets
          .filter((a) => a.mimeType.startsWith("image/"))
          .map(
            (a) =>
              `<div class="my-4"><img src="${a.url}" alt="${a.filename}" class="max-w-full h-auto rounded-xl shadow" /></div>`
          )
          .join("\n");
        html = `<section class="p-6"><h1 class="text-3xl font-bold mb-4">${title}</h1>${imgTags}</section>`;
      }
      html = sanitizePageHtml(html);

      // 5. Extract CSS content (take the primary style.css / index.css or first 3 stylesheets)
      let css = "";
      if (cssFiles.length > 0) {
        const primaryCss =
          cssFiles.find((f) => /(^|\/)(style|styles|main|index)\.css$/i.test(f.name)) ??
          cssFiles[0];
        const otherCss = cssFiles.filter((f) => f.name !== primaryCss.name).slice(0, 2);
        const selectedCssFiles = [primaryCss, ...otherCss];
        const cssParts = await Promise.all(selectedCssFiles.map((f) => f.async("string")));
        css = cssParts.join("\n\n").slice(0, 250000); // 250KB cap
      }

      // 6. Rewrite HTML references to point to assets
      html = html.replace(
        /(src|href|poster)=(["'])([^"']+)\2/gi,
        (match, attr, quote, ref: string) => {
          if (/^(https?:|data:|#|\/\/)/i.test(ref)) return match;
          const clean = ref.replace(/^(\.\/|\/)+/, "");
          const fileName = clean.split("/").pop() ?? "";
          const targetUrl =
            urlMap.get(clean) ??
            urlMap.get(fileName) ??
            urlMap.get(clean.toLowerCase()) ??
            urlMap.get(fileName.toLowerCase()) ??
            Array.from(urlMap.entries()).find(([k]) => k.endsWith(fileName) || fileName.endsWith(k))?.[1];
          return targetUrl ? `${attr}=${quote}${targetUrl}${quote}` : match;
        }
      );

      // Also replace background-image and CSS url occurrences
      urlMap.forEach((dataUrl, originalKey) => {
        if (originalKey.length > 2) {
          const baseKey = originalKey.split("/").pop() ?? "";
          html = html.split(`"${originalKey}"`).join(`"${dataUrl}"`);
          html = html.split(`'${originalKey}'`).join(`'${dataUrl}'`);
          if (baseKey) {
            html = html.split(`"${baseKey}"`).join(`"${dataUrl}"`);
            html = html.split(`'${baseKey}'`).join(`'${dataUrl}'`);
          }
        }
      });

      if (css) {
        css = css.replace(/url\((["']?)([^"')]+)\1\)/gi, (match, quote, ref: string) => {
          if (/^(https?:|data:)/i.test(ref)) return match;
          const clean = ref.replace(/^(\.\/|\/)+/, "");
          const fileName = clean.split("/").pop() ?? "";
          const targetUrl =
            urlMap.get(clean) ??
            urlMap.get(fileName) ??
            urlMap.get(clean.toLowerCase()) ??
            urlMap.get(fileName.toLowerCase());
          return targetUrl ? `url(${quote}${targetUrl}${quote})` : match;
        });
      }

      setStatusMsg("Saving page to CMS database...");

      const payloadAssets = assets.slice(0, 5);

      const pagePayload = {
        id: `page-${Date.now()}`,
        title,
        slug: slug || title,
        html: html.slice(0, 600000), // 600KB cap
        css,
        assets: payloadAssets,
      };

      // 1. Immediately backup page to browser storage with its full HTML/CSS so it is guaranteed visible on dashboard & preview
      try {
        const local = localStorage.getItem("qreet_client_pages");
        const existingPages = local ? JSON.parse(local) : [];
        const newLocalPage = {
          id: pagePayload.id,
          title: pagePayload.title,
          slug: pagePayload.slug,
          html: pagePayload.html,
          css: pagePayload.css,
          status: "PUBLISHED",
          updatedAt: new Date().toISOString(),
        };
        const updatedLocal = [newLocalPage, ...existingPages.filter((x: any) => x.slug !== newLocalPage.slug && x.id !== newLocalPage.id)];
        localStorage.setItem("qreet_client_pages", JSON.stringify(updatedLocal));
      } catch {
        // ignore
      }

      // 2. Send extracted page payload to server API
      const res = await fetch("/cms/api/pages/import-client-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagePayload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        if (text.includes("Request Entity Too Large") || res.status === 413) {
          throw new Error("Extracted package content is too large for serverless payload. Please upload a lighter ZIP.");
        }
        throw new Error(text.slice(0, 150) || "Server returned non-JSON response.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save imported page.");
      }

      setStatusMsg("Page imported successfully! Redirecting to pages list...");
      // Hard redirect to force a clean server-side re-render of pages list
      window.location.href = "/cms/dashboard/pages";
    } catch (err: any) {
      console.error("ZIP Import error:", err);
      setError(err?.message || "Failed to process ZIP package.");
      setLoading(false);
      setStatusMsg("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Page Title</label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="About Qreet"
          />
        </div>
        <div>
          <label className="label">Slug</label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="input"
            placeholder="about"
          />
        </div>
      </div>
      <div>
        <label className="label">ZIP file</label>
        <input
          type="file"
          name="zip"
          accept=".zip"
          required
          disabled={loading}
          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-slate-600 font-medium">
          Upload web bundle ZIP up to 5 GB (HTML templates, CSS styles, images, and fonts will be automatically extracted and linked).
        </p>
        <button
          type="button"
          onClick={() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            localStorage.removeItem("qreet_client_pages");
            window.location.reload();
          }}
          className="text-[11px] text-slate-500 hover:text-red-600 underline ml-auto block font-medium"
        >
          Reset Local Cache
        </button>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2.5 rounded-lg border border-purple-900/60 bg-purple-950/40 p-3 text-xs text-purple-300">
          <svg className="h-4 w-4 animate-spin text-admin-accent shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{statusMsg}</span>
        </div>
      )}

      <FormError message={error} />

      <button disabled={loading} type="submit" className="btn-primary">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Importing & Unpacking...</span>
          </span>
        ) : (
          "Import ZIP"
        )}
      </button>
    </form>
  );
}
