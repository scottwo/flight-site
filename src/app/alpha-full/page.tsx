export default function AlphaFullPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-[var(--text)]">
      <h1 className="text-3xl font-semibold">Alpha is currently full</h1>
      <p className="mt-3 text-[var(--muted)]">
        We’re limiting access while we iterate. Check back soon, or message Scott for access.
      </p>
      <p className="mt-6 text-sm text-[var(--muted)]">
        (Simple placeholder for now; we can add a waitlist form later.)
      </p>
    </div>
  );
}
