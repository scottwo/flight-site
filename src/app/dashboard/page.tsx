export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

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

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Dashboard</p>
          <h1 className="text-4xl font-semibold text-[var(--text)]">Welcome, {displayName}</h1>
          <p className="text-[var(--muted)]">Manage your pilot profile and public page.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text)]">Public page</h2>
            {handle ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Your public page:{" "}
                <Link href={`/p/${handle}`} className="font-semibold text-[var(--accent)] hover:underline">
                  /p/{handle}
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                We have not created your profile yet. Save settings or hit <code>/api/private/me</code> to bootstrap.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/settings"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Settings
              </Link>
              <Link
                href="/p/me"
                className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
              >
                View my page
              </Link>
              <Link
                href="/p/demo"
                className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
              >
                View demo
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text)]">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li>• Confirm your handle and display name in Settings.</li>
              <li>• Import your flight stats (coming soon).</li>
              <li>• Share your public link with recruiters or crew.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
