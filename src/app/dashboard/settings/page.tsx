export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">Settings</p>
          <h1 className="text-3xl font-semibold text-[#0b1f33]">Profile settings</h1>
          <p className="text-sm text-[#35506c]">
            Stubbed sections for handle, display name, theme, layout, and data import. Editing coming soon.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f33]">Profile</h2>
          <p className="text-sm text-[#35506c]">Handle, display name, headline (to be editable).</p>
          <div className="rounded-2xl border border-dashed border-[#d4e0ec] bg-[#f7fbff] p-4 text-sm text-[#35506c]">
            TODO: add form fields for handle, display name, headline.
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f33]">Theme</h2>
          <p className="text-sm text-[#35506c]">Preset colors and typography (coming soon).</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f33]">Layout</h2>
          <p className="text-sm text-[#35506c]">Toggles for heatmap, map, fun facts (coming soon).</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f33]">Data import</h2>
          <p className="text-sm text-[#35506c]">Upload logbook/resume/headshot (disabled for now).</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {["Upload logbook", "Upload resume", "Upload headshot"].map((label) => (
              <button
                key={label}
                disabled
                className="cursor-not-allowed rounded-full border border-[#d4e0ec] px-4 py-2 font-semibold text-[#9cb6cf]"
              >
                {label} (soon)
              </button>
            ))}
          </div>
        </section>

        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center justify-center rounded-full border border-[#d4e0ec] px-4 py-2 text-sm font-semibold text-[#0f2f4b] transition hover:bg-[#e6eef7]"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
