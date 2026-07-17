import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAlphaFull } from "@/lib/alphaLimit";

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  const alphaFull = await isAlphaFull();

  return (
    <main className="landing-shell min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <section className="relative isolate">
        <div className="landing-grid pointer-events-none absolute inset-0 -z-20" />
        <div className="landing-glow pointer-events-none absolute -right-40 -top-32 -z-10 h-[620px] w-[620px] rounded-full" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_10%,var(--panel))] px-3 py-1.5 text-xs font-semibold text-[var(--text)] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
              Built for the next step in your flying career
            </div>
            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-strong)] sm:text-6xl lg:text-[4.15rem]">
              Your experience deserves more than a PDF resume.
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-[var(--muted)]">
              Build a living pilot profile that puts qualifications, availability, and contact first—then backs it up with logbook-powered experience.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {alphaFull ? (
                <Link href="/alpha-full" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-text)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105">
                  Join the founding waitlist <Arrow />
                </Link>
              ) : (
                <Link href="/sign-up" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-text)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105">
                  Build your profile <Arrow />
                </Link>
              )}
              <Link href="/p/demo-cfi" className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_86%,transparent)] px-6 py-3.5 text-sm font-semibold text-[var(--text)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:bg-[var(--panel)]">
                Explore a live demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[var(--muted)]">
              {["Private by default", "No credit card", "You control every section"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><span className="text-[var(--accent)]"><Check /></span>{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[690px] lg:mx-0">
            <div className="absolute -left-10 top-24 hidden h-20 w-20 rounded-full border border-[var(--border)] bg-[var(--panel)]/70 shadow-xl backdrop-blur lg:block" aria-hidden="true">
              <div className="absolute left-1/2 top-1/2 h-px w-11 -translate-x-1/2 -rotate-45 bg-[var(--accent)]" />
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--panel)]" />
            </div>
            <div className="landing-product overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[var(--panel)] shadow-[0_32px_100px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--muted)_35%,transparent)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--muted)_22%,transparent)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]" />
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-1.5 font-mono text-[10px] text-[var(--muted)]">mypilotpage.com/maya-chen</div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]" title="Published" />
              </div>
              <div className="p-5 sm:p-7">
                <div className="rounded-3xl bg-[var(--secondary)] p-6 text-[var(--secondary-text)] sm:p-8">
                  <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">Pilot profile</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Maya Chen</p>
                      <p className="mt-1 text-sm font-semibold text-blue-300">CRJ-900 Captain · Denver, CO</p>
                      <p className="mt-4 max-w-sm text-xs leading-5 text-slate-300">Part 121 captain preparing for a major-airline transition.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-blue-500 px-3 py-2 text-[10px] font-semibold text-white">Contact pilot</span>
                      <span className="rounded-full border border-slate-600 px-3 py-2 text-[10px] font-semibold text-slate-200">Snapshot</span>
                    </div>
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["10,684", "Total time"],
                      ["6,820", "Turbine PIC"],
                      ["2,940", "Multi-engine"],
                      ["CL-65", "Type rating"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl border border-slate-700/70 bg-slate-800/80 p-3">
                        <p className="text-lg font-semibold text-white">{value}</p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_.8fr]">
                  <div className="rounded-2xl border border-[var(--border)] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--text)]">Professional experience</p>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--accent)]">Verified profile</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="border-l-2 border-[var(--accent)] pl-3"><p className="text-xs font-semibold text-[var(--text)]">Captain · SkyWest Airlines</p><p className="text-[10px] text-[var(--muted)]">CRJ-700/900 · 2023–Present</p></div>
                      <div className="border-l-2 border-[var(--border)] pl-3"><p className="text-xs font-semibold text-[var(--text)]">First Officer · SkyWest Airlines</p><p className="text-[10px] text-[var(--muted)]">CRJ-700/900 · 2020–2023</p></div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">Availability</p>
                    <p className="mt-2 text-xs font-semibold text-[var(--text)]">Actively interviewing</p>
                    <div className="mt-4 h-px bg-[var(--border)]" />
                    <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">Readiness</p>
                    <p className="mt-2 text-[10px] leading-5 text-[var(--muted)]">First Class Medical<br />US Passport · FCC</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-5 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 shadow-2xl sm:right-9">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Check /></span>
              <span><span className="block text-xs font-semibold text-[var(--text)]">Recruiter-ready</span><span className="block text-[10px] text-[var(--muted)]">One link. Always current.</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_72%,transparent)] backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 text-center sm:grid-cols-3 lg:px-8">
          {[
            ["Private by default", "Nothing is public until you say so"],
            ["Logbook-powered", "Import from LogTen or ForeFlight"],
            ["Built for hiring", "Profile, resume, contact, and PDF snapshot"],
          ].map(([title, detail]) => (
            <div key={title} className="sm:border-l sm:border-[var(--border)] sm:first:border-l-0">
              <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">More signal. Less scrolling.</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">Built around the questions hiring teams actually ask.</h2>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">A pilot profile should make the first review easier—not turn a logbook into a dashboard.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            { number: "01", title: "Who are you?", desc: "Lead with role, base, qualifications, work authorization, availability, and a direct way to make contact.", tag: "Identity first" },
            { number: "02", title: "Are you qualified?", desc: "Choose the flight-time totals, certificates, type ratings, and aircraft experience that matter for the role.", tag: "Relevant proof" },
            { number: "03", title: "What’s the story?", desc: "Connect career history and recent experience into one credible, recruiter-friendly application snapshot.", tag: "Career context" },
          ].map((item) => (
            <article key={item.number} className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] hover:shadow-xl">
              <div className="absolute -right-8 -top-10 text-[8rem] font-semibold leading-none text-[color-mix(in_srgb,var(--accent)_6%,transparent)]">{item.number}</div>
              <p className="text-xs font-semibold text-[var(--accent)]">{item.number}</p>
              <h3 className="mt-12 text-2xl font-semibold tracking-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.desc}</p>
              <p className="mt-8 inline-flex rounded-full bg-[var(--panel-muted)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">{item.tag}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-text)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Profiles for the whole climb</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">Different goals.<br />One professional standard.</h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">The story changes as experience grows. The profile adapts without making every pilot look like an airline captain.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { href: "/p/demo-commercial", stage: "518 TT", title: "Commercial pilot", detail: "First non-instruction flying role", width: "34%" },
                { href: "/p/demo-cfi", stage: "1,512 TT", title: "ATP-minimum CFI", detail: "First regional airline seat", width: "63%" },
                { href: "/p/demo", stage: "10,684 TT", title: "Airline captain", detail: "Major-airline transition", width: "100%" },
              ].map((demo) => (
                <Link key={demo.href} href={demo.href} className="group rounded-2xl border border-slate-700 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-blue-400 hover:bg-slate-800">
                  <p className="text-xs font-semibold text-blue-300">{demo.stage}</p>
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-blue-400 transition-all group-hover:bg-blue-300" style={{ width: demo.width }} /></div>
                  <h3 className="mt-6 text-base font-semibold text-white">{demo.title}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-slate-400">{demo.detail}</p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white">View profile <Arrow /></p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">From logbook to application</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">Ready to share in three focused steps.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">You stay in control from the first import through the final recruiter link.</p>
        </div>
        <div className="space-y-3">
          {[
            ["01", "Import your logbook", "Bring in supported flight data and review exactly what can be shown."],
            ["02", "Add your career context", "Choose the qualifications, history, goals, and application actions that lead."],
            ["03", "Preview, then publish", "See the exact recruiter view and reveal only the sections you intentionally select."],
          ].map(([number, title, detail]) => (
            <div key={number} className="grid grid-cols-[auto_1fr] gap-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">{number}</span>
              <div><h3 className="text-base font-semibold text-[var(--text)]">{title}</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{detail}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[var(--panel)] px-7 py-10 shadow-2xl sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
          <div className="landing-cta-glow pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Founding Career · $49/year</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-4xl">Make your next application easier to understand.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Build privately for free. Publish when it feels ready.</p>
          </div>
          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:pl-8">
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">See pricing</Link>
            <Link href={alphaFull ? "/alpha-full" : "/sign-up"} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-text)] transition hover:brightness-105">{alphaFull ? "Join the waitlist" : "Build your profile"} <Arrow /></Link>
          </div>
        </div>
      </section>

    </main>
  );
}
