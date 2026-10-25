"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { savePost, type PostFormState } from "@/lib/actions/posts";
import { slugify } from "@/lib/utils";
import { FormError } from "@/components/ui";
import SeoFields from "@/components/SeoFields";
import TiptapEditor from "@/components/TiptapEditor";
import MediaPicker from "@/components/MediaPicker";

const initialState: PostFormState = { ok: false };

export type PostSeoInitial = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
};

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  authorId: string;
  categoryId?: string | null;
  status: "DRAFT" | "PUBLISHED";
  seo?: PostSeoInitial;
};

type Option = { id: string; name: string };

export default function PostForm({
  initial,
  authors,
  categories,
}: {
  initial?: PostFormData;
  authors: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useFormState(savePost, initialState);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // editing an existing post starts "touched" so the slug is never overwritten
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.id));
  const [featured, setFeatured] = useState(initial?.featuredImage ?? "");
  const [featuredAlt, setFeaturedAlt] = useState(initial?.featuredImageAlt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

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
    if (state.ok && state.id) router.push(`/dashboard/blog/${state.id}?saved=1`);
  }, [state, router]);

  // keep deriving the slug from the title until the slug is edited manually
  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="status" id="post-status" value={initial?.status ?? "DRAFT"} />
      <input type="hidden" name="featuredImage" value={featured} />

      <section className="card space-y-4">
        <div>
          <label className="label" htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="input text-base"
            placeholder="How QR Codes Can Improve Customer Experience"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="post-slug">Slug</label>
            <div className="flex items-center gap-1">
              <span className="shrink-0 text-sm text-gray-600">/blog/</span>
              <input
                id="post-slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Author</label>
            <select name="authorId" required className="input" defaultValue={initial?.authorId}>
              <option value="">— select —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="categoryId" className="input" defaultValue={initial?.categoryId ?? ""}>
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Featured Image</label>
          <div className="flex items-center gap-3">
            {featured ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured} alt="" className="h-14 w-24 rounded-lg border border-admin-border object-cover" />
            ) : (
              <span className="text-sm text-gray-600">No image</span>
            )}
            <MediaPicker onSelect={setFeatured} triggerLabel="Pick image" />
            {featured && (
              <button type="button" onClick={() => setFeatured("")} className="text-xs text-gray-500 hover:text-white">
                Remove
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="label">Featured image alt text</label>
          <input
            name="featuredImageAlt"
            value={featuredAlt}
            onChange={(e) => setFeaturedAlt(e.target.value)}
            className="input"
            placeholder="Short description of the image (accessibility + SEO)"
          />
        </div>
        <div>
          <label className="label">Excerpt</label>
          <textarea name="excerpt" rows={2} defaultValue={initial?.excerpt} className="input" />
        </div>
      </section>

      <section className="card">
        <label className="label">Content</label>
        <TiptapEditor name="content" initialContent={initial?.content} onUpdate={setContent} />
      </section>

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
        ogImage={ogImage}
        setOgImage={setOgImage}
        mainTitle={title}
        slug={`/blog/${slug}`}
        content={content}
        featuredImageAlt={featured ? featuredAlt : undefined}
      />

      <FormError message={state.error} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary"
          onClick={() => (document.getElementById("post-status") as HTMLInputElement).value = "DRAFT"}
        >
          {pending ? "Saving…" : "Save Draft"}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary bg-emerald-600 hover:bg-emerald-500"
          onClick={() => (document.getElementById("post-status") as HTMLInputElement).value = "PUBLISHED"}
        >
          Publish
        </button>
        {initial?.id && (
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/preview/post/${initial.id}`}
            target="_blank"
            className="btn-ghost"
          >
            Preview
          </a>
        )}
      </div>
    </form>
  );
}
