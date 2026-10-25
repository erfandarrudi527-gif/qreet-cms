"use client";

import { useState, useRef } from "react";
import { listMediaForPicker, uploadMedia } from "@/lib/actions/media";

type MediaItem = { id: string; url: string; filename: string; mimeType: string };

/**
 * Small modal on top of the CMS Media Library, used by the blog editor
 * (insert image) and the featured-image field. Returns a public URL.
 */
export default function MediaPicker({
  onSelect,
  triggerLabel = "Media Library",
}: {
  onSelect: (url: string) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "url">("library");
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadItems() {
    setItems(await listMediaForPicker());
  }

  async function show() {
    setOpen(true);
    if (!items) await loadItems();
  }

  function pick(url: string) {
    onSelect(url);
    setOpen(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await uploadMedia({ ok: false }, formData);
      if (res.ok) {
        await loadItems();
      } else {
        setUploadError(res.error || "Upload failed");
      }
    } catch {
      setUploadError("An error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <button type="button" onClick={show} className="btn-ghost px-3 py-1 text-xs">
        {triggerLabel}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-admin-border bg-admin-panel flex flex-col p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-admin-border pb-3">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-white">Media Manager</h3>
                <div className="flex rounded-lg bg-admin-bg p-1 border border-admin-border text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("library")}
                    className={`px-3 py-1 font-medium rounded-md transition ${
                      activeTab === "library"
                        ? "bg-admin-accent text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    📁 Library &amp; Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`px-3 py-1 font-medium rounded-md transition ${
                      activeTab === "url"
                        ? "bg-admin-accent text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🔗 External URL
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tab 1: Library & Local System Upload */}
            {activeTab === "library" && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Upload bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-admin-border bg-black/20 p-3">
                  <div>
                    <span className="text-xs font-medium text-white block">Upload Local File</span>
                    <span className="text-[11px] text-gray-400 block">Select image, video (MP4/WebM), audio, or PDF from your computer</span>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      id="media-picker-file-input"
                    />
                    <label
                      htmlFor="media-picker-file-input"
                      className={`btn-primary cursor-pointer px-3 py-1.5 text-xs ${
                        uploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploading ? "Uploading..." : "📤 Browse Files..."}
                    </label>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400 font-medium px-1">{uploadError}</p>
                )}

                {/* Grid */}
                {!items ? (
                  <p className="py-8 text-center text-sm text-gray-500">Loading media files…</p>
                ) : items.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 space-y-2">
                    <p className="text-sm">No media files found.</p>
                    <p className="text-xs">Click "Browse Files" above to upload your first image or video.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {items.map((m) => {
                      const isVideo = m.mimeType.startsWith("video/") || m.url.match(/\.(mp4|webm|ogg)$/i);
                      const isAudio = m.mimeType.startsWith("audio/") || m.url.match(/\.(mp3|wav|ogg)$/i);
                      const isPdf = m.mimeType === "application/pdf" || m.url.match(/\.pdf$/i);

                      return (
                        <button
                          key={m.id}
                          type="button"
                          title={m.filename}
                          onClick={() => pick(m.url)}
                          className="group overflow-hidden rounded-lg border border-admin-border hover:border-admin-accent flex flex-col items-center bg-black/30 p-2 transition text-left"
                        >
                          {isVideo ? (
                            <div className="flex h-24 w-full items-center justify-center rounded bg-gray-900 text-3xl text-gray-400">
                              🎬
                            </div>
                          ) : isAudio ? (
                            <div className="flex h-24 w-full items-center justify-center rounded bg-gray-900 text-3xl text-gray-400">
                              🎵
                            </div>
                          ) : isPdf ? (
                            <div className="flex h-24 w-full items-center justify-center rounded bg-gray-900 text-3xl text-gray-400">
                              📄
                            </div>
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={m.url}
                              alt={m.filename}
                              className="h-24 w-full object-cover transition group-hover:opacity-90 rounded"
                            />
                          )}
                          <span className="block w-full truncate pt-2 text-[11px] text-gray-300 font-medium">
                            {m.filename}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: External URL */}
            {activeTab === "url" && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="label text-xs">Direct Media / CDN URL</label>
                  <div className="flex gap-2">
                    <input
                      className="input font-mono text-xs"
                      placeholder="https://cdn.example.com/video.mp4"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!manualUrl.trim()}
                      onClick={() => pick(manualUrl.trim())}
                      className="btn-primary shrink-0 px-4 py-2 text-xs"
                    >
                      Insert URL
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Paste a direct HTTP/HTTPS link to an image, video file, or hosted PDF document.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
