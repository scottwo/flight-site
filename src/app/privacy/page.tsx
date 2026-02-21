import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted)]">
          This is a placeholder policy for the MVP. Your Clerk-authenticated session protects private routes. Flight
          stats and profile data will follow the principle of least privilege and will be stored securely.
        </p>
        <Link href="/" className="text-sm font-semibold text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
