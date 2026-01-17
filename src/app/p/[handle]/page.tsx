export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type PageProps = {
  params: { handle: string };
};

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const { userId } = await auth();

  if (!handle) {
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { handle },
    include: { user: true },
  });

  if (!profile) {
    notFound();
  }

  const stats = await prisma.profileStats.findUnique({
    where: { userId: profile.user.id },
  });

  const isOwner = userId && profile.user.clerkUserId === userId;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Pilot profile</p>
            <h1 className="text-4xl font-semibold text-[var(--text)]">{profile.displayName}</h1>
            <p className="text-[var(--muted)]">@{profile.handle}</p>
            {profile.headline ? (
              <p className="text-sm text-[var(--muted-2)]">{profile.headline}</p>
            ) : (
              <p className="text-sm text-[var(--muted-2)]">Headline coming soon.</p>
            )}
          </div>
          {isOwner ? (
            <Link
              href="/dashboard/settings"
              className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
            >
              Edit settings
            </Link>
          ) : null}
        </div>

        {stats ? (
          <section className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Totals</h2>
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                <li>Total time: {stats.totalTime.toFixed(1)} hrs</li>
                <li>PIC: {stats.pic.toFixed(1)} hrs</li>
                <li>SIC: {stats.sic.toFixed(1)} hrs</li>
                <li>IFR: {stats.ifr.toFixed(1)} hrs</li>
                <li>Night: {stats.night.toFixed(1)} hrs</li>
                <li>XC: {stats.crossCountry.toFixed(1)} hrs</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Last 90 days</h2>
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                <li>Total: {stats.last90_total.toFixed(1)} hrs</li>
                <li>Landings: {stats.last90_landings}</li>
                <li>IFR: {stats.last90_ifr.toFixed(1)} hrs</li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-sm text-[var(--muted)]">
              Pilot stats will render here once an import has been completed.
            </p>
          </section>
        )}

        <div className="flex gap-3 text-sm text-[var(--muted)]">
          <Link href="/p/demo" className="hover:text-[var(--text-strong)]">
            View demo
          </Link>
          <span className="text-[var(--muted-2)]">•</span>
          <Link href="/" className="hover:text-[var(--text-strong)]">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
