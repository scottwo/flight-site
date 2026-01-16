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

  const isOwner = userId && profile.user.clerkUserId === userId;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-12">
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

        <section className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-sm text-[var(--muted)]">
            Pilot stats will render here from snapshots. This is a placeholder until data import is wired.
          </p>
        </section>

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
