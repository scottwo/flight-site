"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken"; message?: string }
  | { state: "invalid"; message: string };

function normalizeLocal(input: string) {
  return input.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "");
}

export default function HandleEditor({ initialHandle }: { initialHandle: string }) {
  const router = useRouter();
  const [savedHandle, setSavedHandle] = useState(initialHandle);
  const [value, setValue] = useState(initialHandle);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [saving, setSaving] = useState(false);
  const normalized = useMemo(() => normalizeLocal(value), [value]);

  useEffect(() => {
    let abort = false;
    if (!normalized || normalized === savedHandle) {
      setStatus({ state: "idle" });
      return;
    }
    setStatus({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/private/profile/handle/check?handle=${encodeURIComponent(normalized)}`);
        const data = await res.json();
        if (abort) return;
        if (!res.ok || data.ok === false) {
          setStatus({ state: "invalid", message: data.error || "Invalid handle" });
          return;
        }
        setStatus(data.available ? { state: "available" } : { state: "taken", message: "Handle already taken" });
      } catch {
        if (!abort) setStatus({ state: "invalid", message: "Check failed" });
      }
    }, 300);
    return () => {
      abort = true;
      clearTimeout(t);
    };
  }, [normalized, savedHandle]);

  const canSave = normalized !== savedHandle && status.state === "available" && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch("/api/private/profile/handle", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: normalized }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setStatus({ state: res.status === 409 ? "taken" : "invalid", message: data.error || "Save failed" });
        return;
      }
      setSavedHandle(normalized);
      setValue(normalized);
      setStatus({ state: "idle" });
      router.refresh();
    } catch {
      setStatus({ state: "invalid", message: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const statusDisplay = (() => {
    switch (status.state) {
      case "checking":
        return <span className="text-xs text-[var(--muted-2)]">Checking…</span>;
      case "available":
        return <span className="text-xs font-semibold text-emerald-500">✓ Available</span>;
      case "taken":
        return <span className="text-xs font-semibold text-red-500">✕ {status.message || "Taken"}</span>;
      case "invalid":
        return <span className="text-xs font-semibold text-red-500">✕ {status.message}</span>;
      default:
        return <span className="text-xs text-[var(--muted-2)]">Your page: /p/{normalized || savedHandle}</span>;
    }
  })();

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text)]">Public URL handle</label>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          />
          <p className="text-xs text-[var(--muted)]">Your page will be /p/{normalized || savedHandle}</p>
        </div>
        <div className="min-w-[96px] text-right">{statusDisplay}</div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-text)] transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save handle"}
      </button>
    </div>
  );
}
