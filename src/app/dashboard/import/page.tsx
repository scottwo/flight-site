export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import ForeFlightCsvUploadCard from "@/components/ForeFlightCsvUploadCard";
import LogTenTsvUploadCard from "@/components/LogTenTsvUploadCard";
import ThemeScope from "@/components/ThemeScope";
import { prisma } from "@/lib/prisma";
import { toThemeSettings } from "@/lib/theme";

function ImportGuideAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--text)]">
        <span>{title}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-4 w-4 text-[var(--muted)] transition-transform group-open:rotate-180"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div className="mt-3 text-sm text-[var(--muted)]">{children}</div>
    </details>
  );
}

export default async function ImportPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      profile: {
        select: {
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
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Import center</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Import your logbook data</h1>
          <p className="text-sm text-[var(--muted)]">
            Choose an importer below. Expand each guide when you are ready for step-by-step instructions.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">LogTen TSV importer</h2>
          <ImportGuideAccordion title="How to import from LogTen (stub)">
            <p>Replace this with your final LogTen import guide.</p>
            <ul className="mt-2 space-y-1">
              <li>1. Describe exactly where to export TSV/text from LogTen.</li>
              <li>2. List required export options/fields and any format notes.</li>
              <li>3. Explain upload + import steps and expected completion messages.</li>
              <li>4. Add troubleshooting for parse errors, missing airports, and date formats.</li>
            </ul>
          </ImportGuideAccordion>
          <LogTenTsvUploadCard />
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">ForeFlight CSV importer</h2>
          <ImportGuideAccordion title="How to import from ForeFlight (stub)">
            <p>Replace this with your final ForeFlight import guide.</p>
            <ul className="mt-2 space-y-1">
              <li>1. Describe where to export the Logbook CSV in ForeFlight.</li>
              <li>2. Call out required columns and known limitations.</li>
              <li>3. Explain upload + import flow and how long processing usually takes.</li>
              <li>4. Add troubleshooting for missing routes/airports and malformed CSV rows.</li>
            </ul>
          </ImportGuideAccordion>
          <ForeFlightCsvUploadCard />
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">MyFlightbook importer</h2>
          <ImportGuideAccordion title="How to import from MyFlightbook (stub)">
            <p>Replace this with your final MyFlightbook import guide.</p>
            <ul className="mt-2 space-y-1">
              <li>1. Document where users export data from MyFlightbook.</li>
              <li>2. Explain expected file type and required fields.</li>
              <li>3. Note any differences versus LogTen/ForeFlight mappings.</li>
              <li>4. Add troubleshooting and common import errors.</li>
            </ul>
          </ImportGuideAccordion>
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--text)]">Coming soon!</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              MyFlightbook import support is planned but not available yet.
            </p>
          </div>
        </section>

        <div className="flex gap-3">
          <Link
            href="/dashboard/settings"
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
          >
            Back to settings
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </ThemeScope>
  );
}
