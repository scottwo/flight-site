import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAlphaFull } from "@/lib/alphaLimit";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  const alphaFull = await isAlphaFull();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
            Your logbook, but{" "}
            <span className="pretty-word-home">
              pretty
              <span className="pretty-spark-home pretty-spark-home-a" aria-hidden="true">*</span>
              <span className="pretty-spark-home pretty-spark-home-b" aria-hidden="true">+</span>
              <span className="pretty-spark-home pretty-spark-home-c" aria-hidden="true">*</span>
            </span>
          </h1>
          <p className="max-w-3xl text-lg text-[var(--muted)]">
            Upload your logbook, pick your style, and publish a polished profile you can share in minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/p/demo"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--panel-muted)]"
            >
              View demo
            </Link>
            {alphaFull ? (
              <Link
                href="/alpha-full"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--panel-muted)]"
              >
                Alpha full (join waitlist)
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-text)] shadow-sm transition hover:opacity-90"
              >
                Sign up
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Instant pilot page",
              desc: "Launch a clean, mobile-friendly profile with your own handle.",
            },
            {
              title: "Importer-ready",
              desc: "Built for flight data from major electronic logbooks.",
            },
            {
              title: "Professional visuals",
              desc: "Show heatmaps, route maps, currency snapshots, and cumulative hours at a glance.",
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
          <span className="text-[var(--muted-2)]">•</span>
          <Link href="/contact" className="hover:text-[var(--text-strong)]">
            Contact
          </Link>
        </footer>
      </div>
    </main>
  );
}
