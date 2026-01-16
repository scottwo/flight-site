import Link from "next/link";

export const metadata = {
  title: "Pricing | MyPilotPage",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Pricing</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Free during beta</h1>
          <p className="text-sm text-[var(--muted)]">
            Pro features coming soon: custom domains, advanced imports, resume/headshot hosting, and more.
          </p>
        </header>

        <ul className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm text-sm text-[var(--muted)]">
          <li>• Free while we build out pro features</li>
          <li>• Keep your pilot page live and shareable</li>
          <li>• Coming soon: team/recruiter tools, richer snapshots, custom branding</li>
        </ul>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Create your page
          </Link>
          <Link
            href="/p/demo"
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
          >
            View demo
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <Link href="/privacy" className="hover:text-[var(--text-strong)]">
            Privacy
          </Link>
          <span className="text-[var(--muted-2)]">•</span>
          <Link href="/terms" className="hover:text-[var(--text-strong)]">
            Terms
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
