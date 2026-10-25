"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";

interface ZipFileItem {
  name: string;
  size: number;
  dir: boolean;
  type: "html" | "css" | "image" | "font" | "js" | "other";
  previewContent?: string;
}

interface SavedZipArchive {
  id: string;
  title: string;
  filename: string;
  date: string;
  fileCount: number;
  files: ZipFileItem[];
}

export default function UniversalZipInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [files, setFiles] = useState<ZipFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<ZipFileItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [savedArchives, setSavedArchives] = useState<SavedZipArchive[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "saved">("current");

  // Load saved ZIP archives from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qreet_saved_zips");
      if (stored) {
        setSavedArchives(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  function saveArchiveToStorage() {
    if (files.length === 0) return;
    const titleToUse = customTitle.trim() || fileName || "Untitled ZIP Package";
    const newArchive: SavedZipArchive = {
      id: `zip-${Date.now()}`,
      title: titleToUse,
      filename: fileName,
      date: new Date().toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileCount: files.length,
      files,
    };

    const updated = [newArchive, ...savedArchives.filter((a) => a.id !== newArchive.id)];
    setSavedArchives(updated);
    try {
      localStorage.setItem("qreet_saved_zips", JSON.stringify(updated.slice(0, 10))); // keep up to 10 archives
      alert(`Archive "${titleToUse}" saved to local library.`);
    } catch (err) {
      alert("ZIP archive exceeds browser memory quota, saved for this session.");
    }
  }

  function loadSavedArchive(archive: SavedZipArchive) {
    setFileName(archive.filename);
    setCustomTitle(archive.title);
    setFiles(archive.files);
    const defaultPreview =
      archive.files.find((f) => !f.dir && (f.type === "html" || f.type === "css")) || archive.files[0];
    setSelectedFile(defaultPreview || null);
    setActiveTab("current");
  }

  function deleteSavedArchive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = savedArchives.filter((a) => a.id !== id);
    setSavedArchives(updated);
    try {
      localStorage.setItem("qreet_saved_zips", JSON.stringify(updated));
    } catch {}
  }

  async function handleZipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024 * 1024) {
      alert(`Selected file (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB) exceeds the 5 GB limit. Please select a ZIP under 5 GB.`);
      return;
    }

    setLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      const items: ZipFileItem[] = [];

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        let type: ZipFileItem["type"] = "other";
        const lower = relativePath.toLowerCase();

        if (lower.endsWith(".html") || lower.endsWith(".htm")) type = "html";
        else if (lower.endsWith(".css")) type = "css";
        else if (lower.match(/\.(png|jpe?g|webp|gif|svg|ico)$/)) type = "image";
        else if (lower.match(/\.(woff2?|ttf|otf|eot)$/)) type = "font";
        else if (lower.match(/\.(js|mjs|ts)$/)) type = "js";

        let previewContent: string | undefined = undefined;
        // Pre-read small text files for preview
        if (!zipEntry.dir && (type === "html" || type === "css" || type === "js")) {
          const text = await zipEntry.async("string");
          previewContent = text.slice(0, 15000); // safety cap
        } else if (!zipEntry.dir && type === "image") {
          const b64 = await zipEntry.async("base64");
          const mime = lower.endsWith(".svg")
            ? "image/svg+xml"
            : lower.endsWith(".png")
            ? "image/png"
            : "image/jpeg";
          previewContent = `data:${mime};base64,${b64}`;
        }

        // JSZip internal uncompressed size estimate
        const uncompressedSize = (zipEntry as unknown as { _data?: { uncompressedSize?: number } })
          ._data?.uncompressedSize || 0;

        items.push({
          name: relativePath,
          size: uncompressedSize,
          dir: zipEntry.dir,
          type,
          previewContent,
        });
      }

      setFiles(items);
      const defaultPreview = items.find((f) => !f.dir && (f.type === "html" || f.type === "css")) || items[0];
      setSelectedFile(defaultPreview || null);
    } catch (err) {
      alert("Failed to parse ZIP file. Please ensure it is a valid .zip archive.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredFiles = files.filter((f) => {
    if (filter === "all") return true;
    return f.type === filter;
  });

  return (
    <>
      {/* Floating Universal Button Visible on ALL Pages */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-admin-accent/50 bg-[#0e101a]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl shadow-admin-accent/30 backdrop-blur-md transition-all hover:scale-105 hover:border-admin-accent hover:bg-admin-accent/20 active:scale-95"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-admin-accent to-fuchsia-500 text-[10px] text-white">
          📦
        </span>
        <span>ZIP Inspector & Viewer</span>
      </button>

      {/* Full Modal Viewer */}
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="zip-inspector-dark relative flex h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-[#0b0d14] text-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-admin-border bg-admin-panel/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent/20 text-sm text-admin-accent border border-admin-accent/30">
                  📦
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">ZIP Contents Inspector & Archive</h3>
                  <p className="text-xs text-gray-400">
                    {fileName ? `Archive: ${fileName} (${files.length} files)` : "Upload, inspect & save ZIP archives in CMS"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-admin-border bg-white/5 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("current")}
                    className={`rounded-md px-3 py-1 font-medium transition ${
                      activeTab === "current" ? "bg-admin-accent text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Current ZIP
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("saved")}
                    className={`rounded-md px-3 py-1 font-medium transition ${
                      activeTab === "saved" ? "bg-admin-accent text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Saved Archives ({savedArchives.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Saved Archives Tab */}
            {activeTab === "saved" ? (
              <div className="flex-1 overflow-y-auto p-6 bg-[#07080d]">
                <h4 className="text-sm font-semibold text-white mb-4">Saved ZIP Archive Packages:</h4>
                {savedArchives.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-admin-border p-12 text-center text-sm text-gray-500">
                    No ZIP archives saved yet. Upload a ZIP file and click "Save ZIP Archive" to store it here.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {savedArchives.map((arc) => (
                      <div
                        key={arc.id}
                        onClick={() => loadSavedArchive(arc)}
                        className="group relative cursor-pointer rounded-xl border border-admin-border bg-admin-panel/40 p-4 transition hover:border-admin-accent hover:bg-admin-panel/80"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-accent/20 text-lg">
                              📦
                            </span>
                            <div>
                              <h5 className="font-semibold text-white group-hover:text-admin-accent transition">
                                {arc.title}
                              </h5>
                              <p className="font-mono text-[11px] text-gray-500">{arc.filename}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => deleteSavedArchive(arc.id, e)}
                            className="rounded p-1 text-gray-500 hover:bg-red-500/20 hover:text-red-400"
                            title="Delete from archive"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-admin-border/50 pt-2.5 text-[11px] text-gray-400 font-mono">
                          <span>{arc.fileCount} files in package</span>
                          <span>{arc.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (

            /* Modal Body */
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Left Sidebar: File list & Uploader */}
              <div className="flex w-full md:w-80 flex-col border-b md:border-b-0 md:border-r border-admin-border bg-[#090a10]">
                {/* Upload bar */}
                <div className="p-4 border-b border-admin-border space-y-2.5">
                  <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-admin-accent/40 bg-admin-accent/5 p-3 text-center cursor-pointer transition hover:bg-admin-accent/10">
                    <span className="text-xs font-semibold text-admin-accent">
                      {loading ? "Reading ZIP..." : "Select or Drop ZIP File"}
                    </span>
                    <span className="mt-1 text-[10px] text-gray-500">.zip packages up to 5GB</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="hidden"
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Package name to save..."
                        className="w-full rounded-lg border border-admin-border bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-admin-accent outline-none"
                      />
                      <button
                        type="button"
                        onClick={saveArchiveToStorage}
                        className="w-full rounded-lg bg-admin-accent/20 border border-admin-accent/50 py-1.5 text-xs font-semibold text-admin-accent hover:bg-admin-accent hover:text-white transition"
                      >
                        💾 Save ZIP to Archive
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter tags */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 border-b border-admin-border bg-white/[0.02]">
                    {(["all", "html", "css", "image", "js"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilter(t)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase transition ${
                          filter === t
                            ? "bg-admin-accent text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tree / List of files */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {files.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">
                      No ZIP archive loaded yet. Upload one above to view its contents.
                    </div>
                  ) : (
                    filteredFiles.map((file, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedFile(file)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                          selectedFile?.name === file.name
                            ? "bg-admin-accent/20 text-admin-accent border border-admin-accent/40"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate pr-2 font-mono">
                          {file.dir ? "📁 " : file.type === "html" ? "🌐 " : file.type === "css" ? "🎨 " : file.type === "image" ? "🖼️ " : "📄 "}
                          {file.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-500">
                          {file.dir ? "dir" : file.type}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Content Area: Code/Image Inspector */}
              <div className="flex flex-1 flex-col overflow-hidden bg-[#07080d]">
                {selectedFile ? (
                  <div className="flex flex-col h-full">
                    {/* File Header */}
                    <div className="flex items-center justify-between border-b border-admin-border px-5 py-3 bg-[#0d0f18]">
                      <span className="font-mono text-xs text-admin-accent truncate">
                        {selectedFile.name}
                      </span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase font-mono text-gray-300">
                        {selectedFile.type}
                      </span>
                    </div>

                    {/* Preview render */}
                    <div className="flex-1 overflow-auto p-4">
                      {selectedFile.dir ? (
                        <div className="flex h-full items-center justify-center text-xs text-gray-500">
                          This entry is a folder directory.
                        </div>
                      ) : selectedFile.type === "image" && selectedFile.previewContent ? (
                        <div className="flex h-full items-center justify-center p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedFile.previewContent}
                            alt={selectedFile.name}
                            className="max-h-full max-w-full rounded-lg border border-white/10 shadow-lg object-contain"
                          />
                        </div>
                      ) : selectedFile.previewContent ? (
                        <pre className="font-mono text-xs leading-relaxed text-gray-200 whitespace-pre-wrap select-text">
                          {selectedFile.previewContent}
                        </pre>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-500">
                          Binary file ({selectedFile.type}). No inline text preview.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8 text-gray-500">
                    <span className="text-4xl mb-3">📦</span>
                    <p className="text-sm font-medium text-gray-300">Select any file from the left to inspect</p>
                    <p className="text-xs text-gray-500 mt-1">
                      HTML, CSS, JavaScript and images are rendered live directly in this viewer.
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
