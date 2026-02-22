"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  initialResumeUrl: string | null;
  initialResumeFilename: string | null;
};

export default function ResumeUploader({ initialResumeUrl, initialResumeFilename }: Props) {
  const router = useRouter();
  const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);
  const [resumeFilename, setResumeFilename] = useState(initialResumeFilename);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const hasResume = useMemo(() => Boolean(resumeUrl), [resumeUrl]);

  const uploadResume = async () => {
    if (!file || uploading || removing) return;

    const formData = new FormData();
    formData.set("resume", file);

    setUploading(true);
    setMessage("");
    try {
      const response = await fetch("/api/private/profile/resume", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        resumeUrl?: string;
        resumeFilename?: string;
      };
      if (!response.ok || !data.ok) {
        setMessage(data.error || "Unable to upload resume right now.");
        return;
      }

      setResumeUrl(data.resumeUrl ?? null);
      setResumeFilename(data.resumeFilename ?? file.name);
      setFile(null);
      setMessage("Resume uploaded.");
      router.refresh();
    } catch {
      setMessage("Unable to upload resume right now.");
    } finally {
      setUploading(false);
    }
  };

  const removeResume = async () => {
    if (!hasResume || uploading || removing) return;

    setRemoving(true);
    setMessage("");
    try {
      const response = await fetch("/api/private/profile/resume", {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error || "Unable to remove resume right now.");
        return;
      }
      setResumeUrl(null);
      setResumeFilename(null);
      setMessage("Resume removed.");
      router.refresh();
    } catch {
      setMessage("Unable to remove resume right now.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
        {hasResume ? (
          <p>
            Current resume:{" "}
            <a href={resumeUrl ?? "#"} target="_blank" rel="noreferrer" className="font-semibold text-[var(--accent)] hover:underline">
              {resumeFilename || "View resume"}
            </a>
          </p>
        ) : (
          <p>No resume uploaded yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--text)]" htmlFor="resume-upload-input">
          Upload resume
        </label>
        <input
          id="resume-upload-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-full file:border file:border-[var(--border)] file:bg-[var(--panel)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--text)]"
        />
        <p className="text-xs text-[var(--muted)]">Accepted: PDF, DOC, DOCX, TXT (max 10MB).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={uploadResume}
          disabled={!file || uploading || removing}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload resume"}
        </button>
        {hasResume ? (
          <button
            type="button"
            onClick={removeResume}
            disabled={uploading || removing}
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove resume"}
          </button>
        ) : null}
      </div>

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
