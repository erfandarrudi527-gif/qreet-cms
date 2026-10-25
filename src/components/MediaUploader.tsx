"use client";

import { useFormState } from "react-dom";
import { uploadMedia } from "@/lib/actions/media";
import { FormError } from "@/components/ui";

export default function MediaUploader() {
  const [state, formAction, pending] = useFormState(uploadMedia, { ok: false });

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label">Upload to Media Library</label>
        <input
          type="file"
          name="files"
          multiple
          accept="image/*,video/*,.svg,.woff,.woff2,.ttf,.otf"
          className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-admin-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-admin-accentSoft"
        />
        <p className="mt-2 text-xs text-gray-600">
          Max 25 MB per file. Stored in CMS-owned storage (local in dev, R2/S3 in prod).
        </p>
      </div>
      <FormError message={state.error} />
      {state.ok && (
        <p className="text-sm text-emerald-400">Uploaded {state.uploaded} file(s).</p>
      )}
      <button disabled={pending} className="btn-primary">
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
