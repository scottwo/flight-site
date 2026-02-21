"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

export default function DeleteAccountSection() {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");

  const canDelete = confirmation.trim().toUpperCase() === "DELETE";

  const onConfirmDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/private/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Unable to delete account right now.");
        return;
      }

      await signOut({ redirectUrl: "/" });
    } catch {
      setError("Unable to delete account right now.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-red-500/35 bg-[color-mix(in_srgb,var(--panel)_88%,#3f1010)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-red-300">Danger zone</h2>
      <p className="text-sm text-[var(--muted)]">
        Delete your account and all associated data (profile, flights, imports, and aggregates). This cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setConfirmation("");
          setError("");
        }}
        className="rounded-full border border-red-400/60 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/30"
      >
        Delete account
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--text)]">Confirm account deletion</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Type <span className="font-semibold text-[var(--text)]">DELETE</span> to confirm.
            </p>

            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            />

            {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={!canDelete || deleting}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
