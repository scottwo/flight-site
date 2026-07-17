"use client";

import { FormEvent, useState } from "react";

type InitialValues = {
  displayName: string;
  currentRole: string | null;
  homeBase: string | null;
  availability: string | null;
  contactEmail: string | null;
  certificates: string[];
  typeRatings: string[];
  medical: string | null;
  workAuthorization: string | null;
  careerHistory: unknown;
  isPublished: boolean;
  showQualifications: boolean;
  showAvailability: boolean;
  showContact: boolean;
  showCareerHistory: boolean;
  showStats: boolean;
  showRecentExperience: boolean;
  showRoutes: boolean;
  showActivity: boolean;
  showResume: boolean;
};

const VISIBILITY_FIELDS = [
  ["showQualifications", "Qualifications", "Certificates, type ratings, medical, and work authorization"],
  ["showAvailability", "Availability", "Your job-search or start-date status"],
  ["showContact", "Contact action", "A direct email button for recruiters"],
  ["showCareerHistory", "Career history", "Professional roles and employers"],
  ["showStats", "Flight-time totals", "Headline logbook metrics and cumulative hours"],
  ["showRecentExperience", "Recent experience", "Landing and IFR activity without regulatory conclusions"],
  ["showRoutes", "Routes", "Route map and most-flown airports"],
  ["showActivity", "Detailed activity", "Heatmap, facts, and recent flight dates"],
  ["showResume", "Resume", "Your uploaded resume download"],
] as const;

export default function CareerProfileEditor({ initialValues, handle }: { initialValues: InitialValues; handle: string }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    for (const [field] of VISIBILITY_FIELDS) body[field] = form.has(field) ? "true" : "false";
    body.isPublished = form.has("isPublished") ? "true" : "false";

    try {
      const response = await fetch("/api/private/profile/career", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to save profile");
      setMessage("Career profile and privacy settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]";
  const careerHistory = Array.isArray(initialValues.careerHistory)
    ? initialValues.careerHistory.map((item) => {
        const role = item && typeof item === "object" && "role" in item ? String(item.role ?? "") : "";
        const employer = item && typeof item === "object" && "employer" in item ? String(item.employer ?? "") : "";
        const dates = item && typeof item === "object" && "dates" in item ? String(item.dates ?? "") : "";
        const summary = item && typeof item === "object" && "summary" in item ? String(item.summary ?? "") : "";
        return [role, employer, dates, summary].join(" | ");
      }).join("\n")
    : "";

  return (
    <form onSubmit={save} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["displayName", "Display name", initialValues.displayName],
          ["currentRole", "Current role", initialValues.currentRole ?? ""],
          ["homeBase", "Home base / location", initialValues.homeBase ?? ""],
          ["availability", "Availability", initialValues.availability ?? ""],
          ["contactEmail", "Recruiter contact email", initialValues.contactEmail ?? ""],
          ["medical", "Medical", initialValues.medical ?? ""],
          ["workAuthorization", "Work authorization", initialValues.workAuthorization ?? ""],
        ].map(([name, label, value]) => (
          <label key={name} className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
            <input name={name} defaultValue={value} maxLength={160} className={inputClass} />
          </label>
        ))}
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--text)]">Certificates and ratings</span>
          <input name="certificates" defaultValue={initialValues.certificates.join(", ")} className={inputClass} placeholder="ATP, CFI, CFII" />
          <span className="block text-xs text-[var(--muted)]">Separate items with commas.</span>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--text)]">Aircraft type ratings</span>
          <input name="typeRatings" defaultValue={initialValues.typeRatings.join(", ")} className={inputClass} placeholder="CL-65, EMB-145" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--text)]">Career history</span>
          <textarea name="careerHistory" defaultValue={careerHistory} rows={5} className={inputClass} placeholder="Captain | Example Air | 2023 - Present | Part 121 PIC experience" />
          <span className="block text-xs text-[var(--muted)]">One role per line: role | employer | dates | short summary.</span>
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">Public sections</h3>
          <p className="text-sm text-[var(--muted)]">Every section starts private. Routes and recent dates can reveal sensitive travel patterns.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {VISIBILITY_FIELDS.map(([field, label, description]) => (
            <label key={field} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <input type="checkbox" name={field} defaultChecked={initialValues[field]} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
              <span>
                <span className="block text-sm font-semibold text-[var(--text)]">{label}</span>
                <span className="block text-xs leading-5 text-[var(--muted)]">{description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-5">
        <label className="flex gap-3">
          <input type="checkbox" name="isPublished" defaultChecked={initialValues.isPublished} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          <span>
            <span className="block text-sm font-semibold text-[var(--text)]">Publish my profile</span>
            <span className="block text-xs leading-5 text-[var(--muted)]">Until enabled, only you can preview this page. Turning it off removes the public profile and social preview.</span>
          </span>
        </label>
        <a href={`/p/${handle}`} className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline">Preview visitor view</a>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] disabled:opacity-60">
          {saving ? "Saving..." : "Save career profile"}
        </button>
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      </div>
    </form>
  );
}
