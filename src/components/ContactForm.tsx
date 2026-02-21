"use client";

import { FormEvent, useState } from "react";

type SubmitState =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const SUBJECT_CATEGORIES = [
  { value: "general-question", label: "General question" },
  { value: "feature-suggestion", label: "Feature suggestion" },
  { value: "issue-error", label: "Issue / error" },
  { value: "business-inquiry", label: "Business inquiry" },
  { value: "other", label: "Other" },
] as const;

export default function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ state: "idle" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({ state: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        setSubmitState({
          state: "error",
          message: data?.error || "Could not send your message right now.",
        });
        return;
      }

      form.reset();
      setSubmitState({
        state: "success",
        message: "Message sent. Thanks for the report.",
      });
    } catch {
      setSubmitState({
        state: "error",
        message: "Could not send your message right now.",
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Name</span>
          <input
            name="name"
            required
            maxLength={120}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Category</span>
          <select
            name="subjectCategory"
            defaultValue="general-question"
            required
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            {SUBJECT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Short subject (optional)</span>
          <input
            name="subjectTitle"
            maxLength={200}
            placeholder="e.g. LogTen Pro Import failed with error message"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-[var(--text)]">Message</span>
        <textarea
          name="message"
          required
          rows={7}
          maxLength={5000}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-[var(--text)]">Screenshot (optional)</span>
        <input
          name="attachment"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/heic,image/heif"
          className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-full file:border file:border-[var(--border)] file:bg-[var(--panel-muted)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--text)]"
        />
        <p className="text-xs text-[var(--muted)]">Attach one image up to 5MB.</p>
      </label>

      {/* Honeypot field */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {submitState.state === "success" ? (
        <p className="text-sm font-semibold text-emerald-400">{submitState.message}</p>
      ) : null}
      {submitState.state === "error" ? (
        <p className="text-sm font-semibold text-red-400">{submitState.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitState.state === "sending"}
        className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:opacity-90 disabled:opacity-60"
      >
        {submitState.state === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
