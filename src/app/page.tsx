import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
            MyPilotPage
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
            Your public pilot profile, ready in minutes.
          </h1>
          <p className="max-w-3xl text-lg text-[var(--muted)]">
            A modern pilot profile powered by your logbook. Publish a shareable page, keep your flight stats synced, and
            control what recruiters see.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/p/demo"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--panel-muted)]"
            >
              View demo
            </Link>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Instant pilot page",
              desc: "Share a clean, mobile-friendly profile with your handle.",
            },
            {
              title: "Data-ready",
              desc: "Built to ingest your flight stats and show snapshots (coming soon).",
            },
            {
              title: "Clerk auth",
              desc: "Secure sign-in, protected dashboard, and private APIs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-5"
            >
              <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted-2)]">{item.desc}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <Link href="/privacy" className="hover:text-[var(--text-strong)]">
            Privacy
          </Link>
          <span className="text-[var(--muted-2)]">•</span>
          <Link href="/terms" className="hover:text-[var(--text-strong)]">
            Terms
          </Link>
        </footer>
      </div>
    </main>
  );
}
