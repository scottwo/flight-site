import Link from "next/link";

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Pricing</p>
          <h1 className="text-4xl font-semibold text-[var(--text)]">A career profile that stays ready when opportunity calls.</h1>
          <p className="text-sm text-[var(--muted)]">
            Start free while you build. Founding pilots can lock in the complete Career package for $49 per year.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-7 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted-2)]">Free</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--text)]">$0</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Build privately and explore the product.</p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li>Private career profile</li>
              <li>One logbook import</li>
              <li>Visitor-view preview</li>
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-[var(--accent)] bg-[var(--panel)] p-7 shadow-sm">
            <p className="text-sm font-semibold text-[var(--accent)]">Founding Career</p>
            <div className="mt-2 flex items-end gap-2"><p className="text-4xl font-semibold text-[var(--text)]">$49</p><p className="pb-1 text-sm text-[var(--muted)]">/ year</p></div>
            <p className="mt-2 text-sm text-[var(--muted)]">Founding price stays locked while your subscription remains active.</p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li>Published career profile with section privacy</li>
              <li>Ongoing logbook updates</li>
              <li>Recruiter PDF snapshot and resume hosting</li>
              <li>Career history, qualifications, availability, and contact actions</li>
            </ul>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:opacity-90"
          >
            Start building privately
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
          <Link href="/contact" className="hover:text-[var(--text-strong)]">
            Contact
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
