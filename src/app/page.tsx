import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#1f4b71] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
            Flight deck resumes
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[#0b1f33] sm:text-5xl">
            Your public pilot profile, ready in minutes.
          </h1>
          <p className="max-w-3xl text-lg text-[#35506c]">
            Publish a shareable page, keep your flight stats synced, and control what recruiters see. Sign in with
            Clerk, connect your data, and go live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-[#1f4b71] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#163552] hover:shadow"
            >
              Sign up
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border border-[#9cb6cf] bg-white px-5 py-3 text-sm font-semibold text-[#0f2f4b] transition hover:border-[#7fa0c1] hover:bg-[#f3f7fc]"
            >
              Sign in
            </Link>
            <Link
              href="/p/demo"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#e6eef7] px-5 py-3 text-sm font-semibold text-[#0f2f4b] transition hover:bg-[#d7e4f3]"
            >
              View demo
            </Link>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-[#d4e0ec] bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
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
            <div key={item.title} className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
              <h3 className="text-lg font-semibold text-[#0b1f33]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#4b647c]">{item.desc}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-wrap gap-4 text-sm text-[#35506c]">
          <Link href="/privacy" className="hover:text-[#1f4b71]">
            Privacy
          </Link>
          <span className="text-[#9cb6cf]">•</span>
          <Link href="/terms" className="hover:text-[#1f4b71]">
            Terms
          </Link>
        </footer>
      </div>
    </main>
  );
}
