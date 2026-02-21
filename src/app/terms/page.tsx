import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Terms of Service</h1>
        <p className="text-sm text-[var(--muted)]">
          Placeholder terms for the flight-site MVP. Use of this site is subject to updates as features roll out. Keep
          your account secure and only share your public page with trusted audiences.
        </p>
        <Link href="/" className="text-sm font-semibold text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
