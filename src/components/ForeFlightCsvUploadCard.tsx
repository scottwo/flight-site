"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

type Job = {
  id: string;
  status: "UPLOADING" | "UPLOADED" | "IMPORTING" | "SUCCEEDED" | "FAILED";
  originalFilename: string | null;
  blobUrl: string | null;
  blobPathname: string | null;
  bytes: number | null;
  error: string | null;
  importedCount?: number | null;
  warnings?: { missingAirportCodes?: string[]; missingAirportCount?: number; skippedRows?: number; note?: string };
  createdAt: string;
  updatedAt: string;
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export default function ForeFlightCsvUploadCard() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetch("/api/private/import/foreflight-csv/latest");
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
      }
    };
    fetchLatest().catch(() => {});
    let interval: NodeJS.Timeout;
    const startPolling = (ms: number) => {
      clearInterval(interval);
      interval = setInterval(fetchLatest, ms);
    };
    const fastStatuses = new Set(["UPLOADING", "IMPORTING"]);
    startPolling(fastStatuses.has(job?.status || "") ? 2000 : 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status]);

  const handleFile = async (file: File) => {
    setMessage(null);
    if (file.size > MAX_BYTES) {
      setMessage("File too large. Please keep it under 25 MB.");
      return;
    }
    const allowedTypes = ["text/csv", "text/plain"];
    const looksCsv = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith(".csv");
    if (!looksCsv) {
      setMessage("Please upload a CSV export from ForeFlight.");
      return;
    }

    setLoading(true);
    try {
      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/private/import/foreflight-csv/upload",
        contentType: file.type || "text/csv",
        clientPayload: JSON.stringify({ hint: "foreflight-csv", originalFilename: file.name }),
      });
      const latest = await fetch("/api/private/import/foreflight-csv/latest");
      if (latest.ok) {
        const data = await latest.json();
        setJob(data.job);
        setMessage("Upload complete.");
      } else {
        setMessage("Uploaded, but could not refresh job status.");
      }
      setTimeout(() => {
        fetch("/api/private/import/foreflight-csv/latest")
          .then((res) => res.json())
          .then((data) => setJob(data.job))
          .catch(() => {});
      }, 500);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triggerImport = async () => {
    setImporting(true);
    setMessage(null);
    try {
      if (!job?.id) {
        setMessage("No upload ready to import.");
        return;
      }

      const res = await fetch("/api/private/import/foreflight-csv/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) {
        setMessage("Import started.");
        setTimeout(() => {
          fetch("/api/private/import/foreflight-csv/latest")
            .then((r) => r.json())
            .then((data) => setJob(data.job))
            .catch(() => {});
        }, 300);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Import failed to start.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Import failed to start.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">ForeFlight CSV Import</h2>
          <p className="text-sm text-[var(--muted)]">Upload your ForeFlight Logbook CSV export.</p>
        </div>
        <label className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)] cursor-pointer">
          {loading ? "Uploading..." : "Choose file"}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      {message && <p className="mt-3 text-sm text-[var(--muted-2)]">{message}</p>}

      {job && (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
          <div className="flex justify-between">
            <span className="font-semibold text-[var(--text)]">Latest job</span>
            <span className="uppercase text-[10px] font-semibold text-[var(--muted-2)]">{job.status}</span>
          </div>
          <div className="mt-2 space-y-1">
            {job.originalFilename && <p>File: {job.originalFilename}</p>}
            {job.bytes != null && <p>Size: {(job.bytes / (1024 * 1024)).toFixed(1)} MB</p>}
            {job.blobUrl && (
              <a href={job.blobUrl} className="text-[var(--accent)] hover:underline">
                Blob URL
              </a>
            )}
            {job.error && <p className="text-red-500">Error: {job.error}</p>}
            {job.status === "SUCCEEDED" && (
              <p className="font-semibold text-[var(--text)]">Imported 0 flights (stub)</p>
            )}
            {job.status === "SUCCEEDED" && (job.warnings?.missingAirportCount ?? 0) > 0 && (
                <div className="mt-3 rounded-xl border border-yellow-300 bg-yellow-50/70 p-3 text-[var(--text)]">
                <p className="text-sm font-semibold text-yellow-800">
                  Some route/remarks airports were not found and were ignored for map legs.
                </p>
                <p className="text-xs text-yellow-900">
                  {(job.warnings?.missingAirportCodes || []).slice(0, 10).join(", ")}
                  {job.warnings?.missingAirportCount && job.warnings?.missingAirportCount > 10
                    ? ` + ${job.warnings?.missingAirportCount - 10} more`
                    : ""}
                </p>
              </div>
            )}
          </div>
          {job.status === "UPLOADED" && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={triggerImport}
                disabled={importing || !job?.id}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-text)] transition hover:opacity-90 disabled:opacity-60"
              >
                {importing ? "Starting..." : "Import now"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
