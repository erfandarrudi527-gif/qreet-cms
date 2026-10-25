"use client";

import React from "react";
import { SITE_URL } from "@/lib/utils";

export interface SeoFieldsProps {
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  canonicalUrl: string;
  setCanonicalUrl: (val: string) => void;
  isIndex: boolean;
  setIsIndex: (val: boolean) => void;
  isFollow: boolean;
  setIsFollow: (val: boolean) => void;
  ogTitle: string;
  setOgTitle: (val: string) => void;
  ogDescription: string;
  setOgDescription: (val: string) => void;
  ogImage: string;
  setOgImage: (val: string) => void;
  // Helpful details for SEO analysis
  mainTitle?: string;
  slug?: string;
  content?: string;
  featuredImageAlt?: string;
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

export function SeoFields({
  seoTitle,
  setSeoTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  isIndex,
  setIsIndex,
  isFollow,
  setIsFollow,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  mainTitle = "",
  slug = "",
  content = "",
  featuredImageAlt = "",
}: SeoFieldsProps) {
  const displayTitle = seoTitle.trim() || mainTitle.trim() || "Page Title";
  const displayDesc =
    metaDescription.trim() ||
    "Page meta description will appear here. Fill out the description field to preview how it looks on Google search results.";

  const normalizedSlug = slug.replace(/^\/+/, "");

  // SEO Analysis & Warnings
  const warnings: string[] = [];
  if (displayTitle.length > 0 && displayTitle.length < 30) {
    warnings.push(`Title is short (${displayTitle.length} chars). At least 30 characters recommended.`);
  }
  if (displayTitle.length > 60) {
    warnings.push(`Title is long (${displayTitle.length} chars) and may be truncated on Google.`);
  }
  if (metaDescription.length > 0 && metaDescription.length < 70) {
    warnings.push(`Meta description is short (${metaDescription.length} chars). At least 70 characters recommended.`);
  }
  if (metaDescription.length > 160) {
    warnings.push(`Meta description exceeds 160 characters (${metaDescription.length} chars).`);
  }
  if (!isIndex) {
    warnings.push("⚠️ Page is set to noindex and will not be indexed by search engines.");
  }
  if (!isFollow) {
    warnings.push("⚠️ Page links are set to nofollow.");
  }
  const words = countWords(content);
  if (words > 0 && words < 300) {
    warnings.push(`⚠️ Page content is thin (~${words} words). At least 300 words recommended.`);
  }
  if (featuredImageAlt !== undefined && featuredImageAlt.trim() === "") {
    warnings.push("⚠️ Featured image is missing alternative text (Alt text).");
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between border-b border-admin-border pb-3">
        <h3 className="text-base font-semibold text-white">SEO &amp; Metadata Settings</h3>
        <span className="text-xs text-gray-400">SERP &amp; OpenGraph</span>
      </div>

      {/* SERP Preview */}
      <div className="space-y-3 rounded-xl border border-admin-border bg-admin-bg/80 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Google Search Results Preview (SERP Preview)
        </h4>

        {/* Google Card Preview */}
        <div className="max-w-xl rounded-lg border border-gray-700 bg-[#202124] p-3 shadow-md">
          <div className="mb-1 truncate text-xs text-[#bdc1c6]" dir="ltr">
            {SITE_URL} › {normalizedSlug || "your-slug"}
          </div>
          <div className="cursor-pointer truncate text-lg font-medium leading-snug text-[#8ab4f8] hover:underline">
            {displayTitle}
          </div>
          <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#bdc1c6]">
            {displayDesc}
          </div>
        </div>

        {/* Warnings and Recommendations */}
        {warnings.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-lg border border-amber-900/50 bg-amber-950/40 p-3 text-xs text-amber-200">
            <span className="block font-bold">SEO Recommendations &amp; Warnings:</span>
            {warnings.map((w, idx) => (
              <div key={idx} className="leading-relaxed">
                • {w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Input Fields */}
      <div className="grid grid-cols-1 gap-4">
        {/* SEO Title */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label mb-0">SEO Title</label>
            <span className={`text-xs ${seoTitle.length > 60 ? "text-red-400 font-semibold" : "text-gray-400"}`}>
              {seoTitle.length}/60
            </span>
          </div>
          <input
            type="text"
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={mainTitle || "Custom SEO Title (defaults to main title if empty)"}
            className="input"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label mb-0">Meta Description</label>
            <span className={`text-xs ${metaDescription.length > 160 ? "text-red-400 font-semibold" : "text-gray-400"}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            name="seoDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief summary for search engine snippet..."
            rows={3}
            className="input !font-sans !text-sm"
          />
        </div>

        {/* Canonical URL */}
        <div>
          <label className="label">Canonical URL</label>
          <input
            type="url"
            name="canonicalUrl"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://qreet.ir/..."
            className="input"
            dir="ltr"
          />
        </div>

        {/* OpenGraph Social Media Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">OpenGraph Title (OG Title)</label>
            <input
              type="text"
              name="ogTitle"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder={seoTitle || mainTitle || "OG Title"}
              className="input"
            />
          </div>
          <div>
            <label className="label">OpenGraph Image URL (OG Image)</label>
            <input
              type="url"
              name="ogImage"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://..."
              className="input"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="label">OpenGraph Description (OG Description)</label>
          <input
            type="text"
            name="ogDescription"
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            placeholder={metaDescription || "OG Description"}
            className="input"
          />
        </div>

        {/* Robots Directives */}
        <div className="flex flex-wrap gap-6 pt-2 text-sm text-gray-300">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="robotsIndex"
              checked={isIndex}
              onChange={(e) => setIsIndex(e.target.checked)}
              className="accent-admin-accent h-4 w-4"
            />
            <span>Allow Indexing (Index)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="robotsFollow"
              checked={isFollow}
              onChange={(e) => setIsFollow(e.target.checked)}
              className="accent-admin-accent h-4 w-4"
            />
            <span>Follow Links (Follow)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SeoFields;
