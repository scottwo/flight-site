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
          <ImportGuideAccordion title="How to import from LogTen Pro (Click to Expand)">
            <ul className="mt-2 space-y-1">
              <li>1. (On either Desktop or Mobile) Navigate to the Reports page from the menu</li>
              <li>2. Click “Exporters”</li>
              <li>3. Click “Export Flights (Tab)”</li>
              <li>4. (On Desktop) Click “Generate Report” (On Mobile) Click “Configure Report”</li>
              <li>5. Save somewhere you can retrieve easily</li>
              <li>6. Click “Choose file” under “LogTen TSV importer” on this page</li>
              <li>7. Find the saved export from LogTen Pro and click “Upload”</li>
              <li>8. Once upload is complete, click “Import Now”</li>
              <li>9. If there are errors, send a screenshot through the “Contact” page</li>
            </ul>
          </ImportGuideAccordion>
          <LogTenTsvUploadCard />
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">ForeFlight CSV importer</h2>
          <ImportGuideAccordion title="How to import from ForeFlight (Click to Expand)">
            <p><b>Desktop</b></p>
            <ul className="mt-2 space-y-1">
              <li>1. Log in to ForeFlight and navigate to Logbook</li>
              <li>2. Click “Export” on the top menu</li>
              <li>3. Click “Export” on the page and wait for the CSV to download</li>
              <li>4. Click “Choose file” under “ForeFlight CSV importer” on this page</li>
              <li>5. Find the saved export from ForeFlight and click “Upload”</li>
              <li>6. Once upload is complete, click “Import Now”</li>
              <li>7. If there are errors, send a screenshot through the “Contact” page</li>
            </ul>
            <p><b>Mobile</b></p>
            <ul className="mt-2 space-y-1">
              <li>1. Open ForeFlight app</li>
              <li>2. Navigate to Logbook on the menu (you may need to click “More”)</li>
              <li>3. Click “Settings” at the bottom of the menu</li>
              <li>4. Scroll down to the “Auto-Export” option</li>
              <li>5. Enable it if needed and click “Export Now” to receive an email with the CSV attached</li>
              <li>6. Download the CSV from the email</li>
              <li>7. Click “Choose file” under “ForeFlight CSV importer” on this page</li>
              <li>8. Find the saved export from ForeFlight and click “Upload”</li>
              <li>9. Once upload is complete, click “Import Now”</li>
              <li>10. If there are errors, send a screenshot through the “Contact” page</li>
            </ul>
          </ImportGuideAccordion>
          <ForeFlightCsvUploadCard />
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">MyFlightbook importer</h2>
          <ImportGuideAccordion title="How to import from MyFlightbook">
            <ul className="mt-2 space-y-1">
              <li>(Coming Soon!)</li>
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
