"use client";

import { useEffect, useState } from "react";

type Props = {
  initialHeadline: string | null;
};

export default function HeadlineEditor({ initialHeadline }: Props) {
  const [value, setValue] = useState(initialHeadline ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(value.trim() !== (initialHeadline ?? ""));
  }, [value, initialHeadline]);

  const remaining = 120 - value.length;

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/private/profile/headline", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ headline: value }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setMessage(data.error || "Unable to save headline");
        return;
      }
      setMessage("Saved");
    } catch (err) {
      console.error(err);
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--text)]">Headline</label>
        <span className="text-xs text-[var(--muted-2)]">{remaining}/120</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 120))}
        rows={2}
        placeholder="e.g., Safety-first CFII candidate seeking Part 135/121 ops"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-text)] transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save headline"}
        </button>
        {message && <span className="text-xs text-[var(--muted)]">{message}</span>}
      </div>
    </div>
  );
}
