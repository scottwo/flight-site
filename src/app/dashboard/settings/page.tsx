export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import HandleEditor from "@/components/HandleEditor";
import HeadlineEditor from "@/components/HeadlineEditor";
import ResumeUploader from "@/components/ResumeUploader";
import ThemeScope from "@/components/ThemeScope";
import ThemeSettingsEditor from "@/components/ThemeSettingsEditor";
import { prisma } from "@/lib/prisma";
import { toThemeSettings } from "@/lib/theme";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      profile: {
        select: {
          handle: true,
          headline: true,
          resumeUrl: true,
          resumeFilename: true,
          themeMode: true,
          themePrimary: true,
          themeSecondary: true,
          themeGuardrails: true,
        },
      },
    },
  });

  const profile = dbUser?.profile ?? null;
  const themeSettings = profile
    ? toThemeSettings({
        themeMode: profile.themeMode,
        themePrimary: profile.themePrimary,
        themeSecondary: profile.themeSecondary,
        themeGuardrails: profile.themeGuardrails,
      })
    : undefined;

  return (
    <ThemeScope settings={themeSettings} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Settings</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Profile settings</h1>
          <p className="text-sm text-[var(--muted)]">
            Stubbed sections for handle, display name, theme, layout, and data import. Editing coming soon.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Profile</h2>
          <p className="text-sm text-[var(--muted)]">Handle and headline.</p>
          {profile ? (
            <div className="space-y-6">
              <HandleEditor initialHandle={profile.handle} />
              <HeadlineEditor initialHeadline={profile.headline} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
              Loading profile...
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Theme</h2>
          <p className="text-sm text-[var(--muted)]">
            Set your style mode and custom primary/secondary colors for your dashboard and public page.
          </p>
          {profile ? (
            <ThemeSettingsEditor
              initialMode={profile.themeMode}
              initialPrimary={profile.themePrimary}
              initialSecondary={profile.themeSecondary}
              initialGuardrails={profile.themeGuardrails}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
              Loading theme settings...
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Layout</h2>
          <p className="text-sm text-[var(--muted)]">Toggles for heatmap, map, fun facts (coming soon).</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Resume</h2>
          <p className="text-sm text-[var(--muted)]">
            Upload your resume so visitors can download it from your public profile.
          </p>
          {profile ? (
            <ResumeUploader
              initialResumeUrl={profile.resumeUrl}
              initialResumeFilename={profile.resumeFilename}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
              Loading resume settings...
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Data import</h2>
          <p className="text-sm text-[var(--muted)]">
            Manage your importers and step-by-step import guides on the dedicated import page.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/dashboard/import"
              className="rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--accent-text)] transition hover:brightness-95"
            >
              Go to import center
            </Link>
          </div>
        </section>

        <DeleteAccountSection />

        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
        >
          Back to dashboard
        </Link>
      </div>
    </ThemeScope>
  );
}
