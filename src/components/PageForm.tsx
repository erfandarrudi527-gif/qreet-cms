"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { savePage, type PageFormState } from "@/lib/actions/pages";
import { FormError } from "@/components/ui";
import SeoFields from "@/components/SeoFields";
import MediaPicker from "@/components/MediaPicker";

const initialState: PageFormState = { ok: false };

export type PageSeoInitial = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
};

export type PageFormData = {
  id?: string;
  title: string;
  slug: string;
  image?: string | null;
  html?: string;
  css?: string;
  status: "DRAFT" | "PUBLISHED";
  seo?: PageSeoInitial;
};

export default function PageForm({ initial }: { initial?: PageFormData }) {
  const router = useRouter();
  const [state, formAction, pending] = useFormState(savePage, initialState);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [html, setHtml] = useState(initial?.html ?? "");
  const [css, setCss] = useState(initial?.css ?? "");

  // If page was imported on the client and is in localStorage, hydrate its full content
  useEffect(() => {
    if (!initial?.id) return;
    try {
      const local = localStorage.getItem("qreet_client_pages");
      if (local) {
        const pages = JSON.parse(local);
        const match = pages.find((p: any) => p.id === initial.id || p.slug === initial.slug);
        if (match) {
          if (match.title && !initial.title) setTitle(match.title);
          if (match.slug && !initial.slug) setSlug(match.slug);
          if (match.html) setHtml(match.html);
          if (match.css) setCss(match.css);
          if (match.image) setImage(match.image);
        }
      }
    } catch {
      // ignore
    }
  }, [initial]);

  const [activeTab, setActiveTab] = useState<"html" | "css" | "image" | "preview">("html");

  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Insert media HTML tag into HTML editor at cursor position
  const handleInsertMediaToHtml = (url: string) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    const isAudio = url.match(/\.(mp3|wav|ogg)$/i);
    const isPdf = url.match(/\.pdf$/i);

    let tag = `<img src="${url}" alt="${title || "Media"}" class="max-w-full h-auto rounded-xl shadow-md my-4" />`;
    if (isVideo) {
      tag = `<video src="${url}" controls class="max-w-full h-auto rounded-xl shadow-md my-4"></video>`;
    } else if (isAudio) {
      tag = `<audio src="${url}" controls class="w-full my-4"></audio>`;
    } else if (isPdf) {
      tag = `<iframe src="${url}" class="w-full h-96 rounded-xl border border-gray-300 my-4"></iframe>`;
    }

    const textarea = htmlTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newHtml = html.substring(0, start) + tag + html.substring(end);
      setHtml(newHtml);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setHtml((prev) => prev + "\n" + tag);
    }
  };

  const seo = initial?.seo ?? {};
  const [seoTitle, setSeoTitle] = useState(seo.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(seo.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(seo.canonicalUrl ?? "");
  const [isIndex, setIsIndex] = useState(seo.robotsIndex ?? true);
  const [isFollow, setIsFollow] = useState(seo.robotsFollow ?? true);
  const [ogTitle, setOgTitle] = useState(seo.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(seo.ogDescription ?? "");
  const [ogImage, setOgImage] = useState(seo.ogImage ?? "");

  useEffect(() => {
    if (state.ok && state.id) router.push(`/dashboard/pages/${state.id}?saved=1`);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="status" id="page-status" value={initial?.status ?? "DRAFT"} />

      {/* Main Title and Slug */}
      <section className="card space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Page Title</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="About Us"
            />
          </div>
          <div>
            <label className="label">URL Slug</label>
            <div className="flex items-center gap-1" dir="ltr">
              <span className="text-sm text-gray-500">qreet.ir/</span>
              <input
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input"
                placeholder="about"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Unified Editor: HTML, CSS & Media */}
      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Page Content &amp; Design (HTML, CSS &amp; Media)</h3>
            <p className="text-xs text-slate-600 font-medium">
              Manage raw HTML content, scoped CSS styles, images, videos, and documents.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("html")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "html"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📄 HTML
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("css")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "css"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎨 CSS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("image")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "image"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📁 Media &amp; Header ({image ? "Set" : "Empty"})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👁️ Live Preview
            </button>
          </div>
        </div>

        {/* Hidden inputs to guarantee form submission */}
        <input type="hidden" name="html" value={html} />
        <input type="hidden" name="css" value={css} />
        <input type="hidden" name="image" value={image} />

        {/* Tab 1: HTML Editor with Media Insertion */}
        {activeTab === "html" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label text-xs font-medium text-gray-300">
                Custom HTML Code
              </label>
              <div className="flex items-center gap-2">
                <MediaPicker
                  onSelect={handleInsertMediaToHtml}
                  triggerLabel="📎 Insert Media (Image, Video, Doc) into HTML"
                />
              </div>
            </div>
            <textarea
              ref={htmlTextareaRef}
              rows={12}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<section className='hero'>&#10;  <h1>Hello World</h1>&#10;  <p>Your page content goes here...</p>&#10;</section>"
              className="input font-mono text-xs leading-relaxed"
              dir="ltr"
            />
            <p className="text-[11px] text-gray-500">
              💡 Click <b>"Insert Media into HTML"</b> to embed images, videos, audio, or document links from your media library into your HTML code.
            </p>
          </div>
        )}

        {/* Tab 2: CSS Editor */}
        {activeTab === "css" && (
          <div className="space-y-3">
            <label className="label text-xs font-medium text-gray-300">
              Custom Scoped CSS
            </label>
            <textarea
              rows={12}
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".hero { padding: 2rem; background: #f8fafc; }&#10;h1 { color: #0f172a; font-size: 2rem; }"
              className="input font-mono text-xs leading-relaxed"
              dir="ltr"
            />
            <p className="text-[11px] text-gray-500">
              💡 Your CSS is automatically scoped to this page's selector so it won't affect other pages.
            </p>
          </div>
        )}

        {/* Tab 3: Featured Page Image */}
        {activeTab === "image" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-medium text-gray-200">Featured Page Image</h4>
                <p className="text-[11px] text-gray-400">
                  This image is displayed at the top of the page and used for social media previews (OG Image).
                </p>
              </div>
              <MediaPicker onSelect={setImage} triggerLabel="Select from Media" />
            </div>

            {image ? (
              <div className="relative overflow-hidden rounded-xl border border-admin-border bg-black/40 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={title || "Page preview"}
                    className="max-h-52 rounded-lg border border-admin-border object-contain shadow-md sm:max-w-xs"
                  />
                  <div className="space-y-3">
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-gray-400">Image URL:</span>
                      <p className="max-w-md truncate font-mono text-gray-300" dir="ltr">
                        {image}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MediaPicker onSelect={setImage} triggerLabel="Change Image" />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="btn-danger px-3 py-1 text-xs"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-admin-border bg-admin-bg/40 py-8 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl text-gray-400">
                  🖼️
                </div>
                <p className="text-xs font-medium text-gray-300">No featured image set for this page</p>
                <div className="mt-3">
                  <MediaPicker onSelect={setImage} triggerLabel="Select Image from Media Library" />
                </div>
              </div>
            )}

            <div>
              <label className="label text-xs">Direct Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="input font-mono text-xs"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Live Preview */}
        {activeTab === "preview" && (
          <div className="space-y-3 rounded-xl border border-admin-border bg-white p-4 text-black">
            <div className="border-b border-gray-200 pb-2 text-xs font-semibold text-gray-500">
              CMS Live Preview
            </div>
            {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
            {image && (
              <div className="my-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="max-h-60 rounded-lg object-contain shadow"
                />
              </div>
            )}
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="py-6 text-center text-xs italic text-gray-400">
                No HTML content entered yet.
              </p>
            )}
          </div>
        )}
      </section>

      {/* SEO Settings */}
      <SeoFields
        seoTitle={seoTitle}
        setSeoTitle={setSeoTitle}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        canonicalUrl={canonicalUrl}
        setCanonicalUrl={setCanonicalUrl}
        isIndex={isIndex}
        setIsIndex={setIsIndex}
        isFollow={isFollow}
        setIsFollow={setIsFollow}
        ogTitle={ogTitle}
        setOgTitle={setOgTitle}
        ogDescription={ogDescription}
        setOgDescription={setOgDescription}
        ogImage={ogImage || image}
        setOgImage={setOgImage}
        mainTitle={title}
        slug={`/${slug}`}
        content={html}
      />

      <FormError message={state.error} />

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary"
          onClick={() => {
            const el = document.getElementById("page-status") as HTMLInputElement;
            if (el) el.value = "DRAFT";
          }}
        >
          {pending ? "Saving..." : "Save Draft"}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary bg-emerald-600 hover:bg-emerald-500"
          onClick={() => {
            const el = document.getElementById("page-status") as HTMLInputElement;
            if (el) el.value = "PUBLISHED";
          }}
        >
          Publish
        </button>
        {initial?.slug && (
          <Link
            href={`/client-view?slug=${encodeURIComponent(slug || initial.slug)}`}
            target="_blank"
            className="btn-ghost"
          >
            Preview
          </Link>
        )}
        {initial?.slug && (
          <Link
            href={`/client-view?slug=${encodeURIComponent(slug || initial.slug)}`}
            target="_blank"
            className="btn-ghost text-emerald-400 hover:text-emerald-300"
          >
            View Live Site ↗
          </Link>
        )}
      </div>
    </form>
  );
}
