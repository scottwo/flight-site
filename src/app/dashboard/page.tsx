export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import ThemeScope from "@/components/ThemeScope";
import { prisma } from "@/lib/prisma";
import { toThemeSettings } from "@/lib/theme";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { profile: true },
  });

  const displayName = user?.profile?.displayName ?? "Pilot";
  const handle = user?.profile?.handle;
  const themeSettings = user?.profile
    ? toThemeSettings({
        themeMode: user.profile.themeMode,
        themePrimary: user.profile.themePrimary,
        themeSecondary: user.profile.themeSecondary,
        themeGuardrails: user.profile.themeGuardrails,
      })
    : undefined;

  return (
    <ThemeScope settings={themeSettings} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Dashboard</p>
          <h1 className="text-4xl font-semibold text-[var(--text)]">Welcome, {displayName}</h1>
          <p className="text-[var(--muted)]">Build a recruiter-ready career profile and publish only what you choose.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text)]">Career profile</h2>
            {handle ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {user?.profile?.isPublished ? "Published at: " : "Private preview: "}
                <Link href={`/p/${handle}`} className="font-semibold text-[var(--accent)] hover:underline">
                  /p/{handle}
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Your private profile is being prepared.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/settings"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:brightness-95"
              >
                Settings
              </Link>
              <Link
                href="/dashboard/import"
                className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
              >
                Import data
              </Link>
              <Link
                href="/p/me"
                className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
              >
                Preview visitor view
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text)]">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li>1. Add your role, base, qualifications, and availability.</li>
              <li>2. Import your logbook and review the supported totals.</li>
              <li>3. Choose which sensitive sections can be public.</li>
              <li>4. Preview the visitor view, then publish when ready.</li>
            </ul>
          </div>
        </section>
      </div>
    </ThemeScope>
  );
}
