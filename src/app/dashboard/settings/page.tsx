export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogTenTsvUploadCard from "@/components/LogTenTsvUploadCard";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <LogTenTsvUploadCard />
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Settings</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Profile settings</h1>
          <p className="text-sm text-[var(--muted)]">
            Stubbed sections for handle, display name, theme, layout, and data import. Editing coming soon.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Profile</h2>
          <p className="text-sm text-[var(--muted)]">Handle, display name, headline (to be editable).</p>
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
            TODO: add form fields for handle, display name, headline.
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Theme</h2>
          <p className="text-sm text-[var(--muted)]">Preset colors and typography (coming soon).</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Layout</h2>
          <p className="text-sm text-[var(--muted)]">Toggles for heatmap, map, fun facts (coming soon).</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Data import</h2>
          <p className="text-sm text-[var(--muted)]">Upload logbook/resume/headshot (disabled for now).</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {["Upload logbook", "Upload resume", "Upload headshot"].map((label) => (
              <button
                key={label}
                disabled
                className="cursor-not-allowed rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 font-semibold text-[var(--muted-2)]"
              >
                {label} (soon)
              </button>
            ))}
          </div>
        </section>

        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
