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
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">Pilot profile</p>
            <h1 className="text-4xl font-semibold text-[#0b1f33]">{profile.displayName}</h1>
            <p className="text-[#35506c]">@{profile.handle}</p>
            {profile.headline ? (
              <p className="text-sm text-[#4b647c]">{profile.headline}</p>
            ) : (
              <p className="text-sm text-[#9cb6cf]">Headline coming soon.</p>
            )}
          </div>
          {isOwner ? (
            <Link
              href="/dashboard/settings"
              className="rounded-full border border-[#d4e0ec] px-4 py-2 text-sm font-semibold text-[#0f2f4b] transition hover:bg-[#e6eef7]"
            >
              Edit settings
            </Link>
          ) : null}
        </div>

        <section className="rounded-3xl border border-dashed border-[#d4e0ec] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#35506c]">
            Pilot stats will render here from snapshots. This is a placeholder until data import is wired.
          </p>
        </section>

        <div className="flex gap-3 text-sm text-[#35506c]">
          <Link href="/p/demo" className="hover:text-[#1f4b71]">
            View demo
          </Link>
          <span className="text-[#9cb6cf]">•</span>
          <Link href="/" className="hover:text-[#1f4b71]">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
