"use client";

import { useState } from "react";
import { saveSettings } from "@/lib/actions/taxonomy";

interface SettingsFormProps {
  initial: {
    siteName?: string;
    logo?: string | null;
    defaultSeoTitle?: string | null;
    defaultSeoDescription?: string | null;
    analyticsId?: string | null;
    clarityId?: string | null;
    headerHtml?: string | null;
    headerCss?: string | null;
    footerHtml?: string | null;
    footerCss?: string | null;
    socialLinks?: Record<string, string>;
  };
}

export default function SettingsForm({ initial }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "header_footer" | "preview">("general");

  const [headerHtml, setHeaderHtml] = useState(initial.headerHtml ?? "");
  const [headerCss, setHeaderCss] = useState(initial.headerCss ?? "");
  const [footerHtml, setFooterHtml] = useState(initial.footerHtml ?? "");
  const [footerCss, setFooterCss] = useState(initial.footerCss ?? "");

  const social = initial.socialLinks ?? {};

  return (
    <form action={saveSettings} className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-admin-border gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "general"
              ? "bg-admin-accent text-white shadow"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          ⚙️ General &amp; Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("header_footer")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "header_footer"
              ? "bg-admin-accent text-white shadow"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          🧩 Header &amp; Footer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "preview"
              ? "bg-admin-accent text-white shadow"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          👁️ Preview Header &amp; Footer
        </button>
      </div>

      {/* Tab 1: General & Analytics */}
      {activeTab === "general" && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-white">General &amp; SEO Defaults</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Site name</label>
              <input
                name="siteName"
                defaultValue={initial.siteName ?? "Qreet"}
                className="input"
              />
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input
                name="logo"
                defaultValue={initial.logo ?? ""}
                className="input"
                placeholder="https://cdn.qreet.com/media/logo.svg"
              />
            </div>
          </div>

          <div>
            <label className="label">Default SEO title</label>
            <input
              name="defaultSeoTitle"
              defaultValue={initial.defaultSeoTitle ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className="label">Default meta description</label>
            <textarea
              name="defaultSeoDescription"
              rows={2}
              defaultValue={initial.defaultSeoDescription ?? ""}
              className="input"
            />
          </div>

          {/* Tracking & Analytics */}
          <div className="border-t border-admin-border/60 pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-200">Tracking &amp; Analytics</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Google Analytics / Search Console ID</label>
                <input
                  name="analyticsId"
                  defaultValue={initial.analyticsId ?? ""}
                  className="input font-mono text-xs"
                  placeholder="G-XXXXXXX"
                />
                <p className="mt-1 text-[11px] text-gray-500">Google Analytics measurement ID</p>
              </div>
              <div>
                <label className="label">Microsoft Clarity Project ID</label>
                <input
                  name="clarityId"
                  defaultValue={initial.clarityId ?? ""}
                  className="input font-mono text-xs"
                  placeholder="e.g. k9xyz123"
                />
                <p className="mt-1 text-[11px] text-gray-500">Microsoft Clarity tracking ID</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-admin-border/60 pt-4">
            <p className="label">Social links</p>
            <div className="grid gap-3 md:grid-cols-2">
              {(["twitter", "instagram", "linkedin", "youtube"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-xs capitalize text-gray-500">{k}</span>
                  <input
                    name={`social_${k}`}
                    defaultValue={social[k] ?? ""}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Header & Footer HTML / CSS */}
      <div className={activeTab === "header_footer" ? "space-y-6" : "hidden"}>
        {/* Header section */}
        <section className="card space-y-4">
          <div className="border-b border-admin-border pb-2">
            <h2 className="text-base font-semibold text-white">Global Header</h2>
            <p className="text-xs text-gray-400">
              Custom HTML &amp; CSS inserted at the top of every public page.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label text-xs">Header HTML</label>
              <textarea
                name="headerHtml"
                rows={8}
                value={headerHtml}
                onChange={(e) => setHeaderHtml(e.target.value)}
                placeholder="<header class='site-header'>&#10;  <div class='logo'>...</div>&#10;  <nav>...</nav>&#10;</header>"
                className="input font-mono text-xs leading-relaxed"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label text-xs">Header CSS</label>
              <textarea
                name="headerCss"
                rows={8}
                value={headerCss}
                onChange={(e) => setHeaderCss(e.target.value)}
                placeholder=".site-header { display: flex; justify-content: space-between; padding: 1rem 2rem; background: #0f172a; color: white; }"
                className="input font-mono text-xs leading-relaxed"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* Footer section */}
        <section className="card space-y-4">
          <div className="border-b border-admin-border pb-2">
            <h2 className="text-base font-semibold text-white">Global Footer</h2>
            <p className="text-xs text-gray-400">
              Custom HTML &amp; CSS inserted at the bottom of every public page.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label text-xs">Footer HTML</label>
              <textarea
                name="footerHtml"
                rows={8}
                value={footerHtml}
                onChange={(e) => setFooterHtml(e.target.value)}
                placeholder="<footer class='site-footer'>&#10;  <p>&copy; 2026 Qreet. All rights reserved.</p>&#10;</footer>"
                className="input font-mono text-xs leading-relaxed"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label text-xs">Footer CSS</label>
              <textarea
                name="footerCss"
                rows={8}
                value={footerCss}
                onChange={(e) => setFooterCss(e.target.value)}
                placeholder=".site-footer { text-align: center; padding: 2rem; background: #090d16; color: #94a3b8; }"
                className="input font-mono text-xs leading-relaxed"
                dir="ltr"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Tab 3: Preview */}
      {activeTab === "preview" && (
        <div className="card space-y-6">
          <div className="border-b border-admin-border pb-2">
            <h2 className="text-base font-semibold text-white">Header &amp; Footer Live Preview</h2>
            <p className="text-xs text-gray-400">
              Preview of how the custom header &amp; footer render around page content.
            </p>
          </div>

          <div className="rounded-xl border border-admin-border bg-white text-black overflow-hidden">
            {headerCss && <style dangerouslySetInnerHTML={{ __html: headerCss }} />}
            {footerCss && <style dangerouslySetInnerHTML={{ __html: footerCss }} />}

            {/* Header preview */}
            <div className="border-b border-gray-200">
              {headerHtml ? (
                <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
              ) : (
                <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 italic">
                  No Header HTML provided yet.
                </div>
              )}
            </div>

            {/* Simulated Page Content */}
            <div className="p-8 text-center bg-gray-100 min-h-[160px] flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">[ Page Content Placeholder ]</span>
              <p className="text-xs text-gray-400 mt-1">Your page body content will render here.</p>
            </div>

            {/* Footer preview */}
            <div className="border-t border-gray-200">
              {footerHtml ? (
                <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
              ) : (
                <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 italic">
                  No Footer HTML provided yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button type="submit" className="btn-primary">
          Save Settings
        </button>
      </div>
    </form>
  );
}