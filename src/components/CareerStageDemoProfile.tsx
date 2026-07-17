import DemoStageNav, { type DemoStage } from "@/components/DemoStageNav";

type Metric = { label: string; value: string; helper: string };
type Role = { title: string; organization: string; dates: string; detail: string };
type RecentItem = { label: string; value: string; window: string };

export type CareerStageDemo = {
  stage: DemoStage;
  banner: string;
  displayName: string;
  currentRole: string;
  homeBase: string;
  headline: string;
  availability: string;
  contactEmail: string;
  snapshotUrl?: string;
  qualifications: { label: string; values: string[] }[];
  metrics: Metric[];
  targetRoles: string[];
  strengths: string[];
  roles: Role[];
  recentExperience: RecentItem[];
  note: string;
};

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

export default function CareerStageDemoProfile({ profile }: { profile: CareerStageDemo }) {
  return (
    <div className="landing-shell min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--text)]">
      <DemoStageNav active={profile.stage} />

      <main>
        <section className="relative isolate overflow-hidden border-b border-[var(--border)]">
          <div className="landing-grid pointer-events-none absolute inset-0 -z-20" />
          <div className="landing-glow pointer-events-none absolute -right-48 -top-40 -z-10 h-[680px] w-[680px] rounded-full" />
          <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_78%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]" />
              {profile.banner}
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Recruiter-ready pilot profile</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-strong)] sm:text-6xl lg:text-[4.6rem]">{profile.displayName}</h1>
                <p className="mt-5 text-xl font-semibold text-[var(--accent)] sm:text-2xl">{profile.currentRole} <span className="text-[var(--muted-2)]">· {profile.homeBase}</span></p>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">{profile.headline}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={`mailto:${profile.contactEmail}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-text)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105">Contact pilot <Arrow /></a>
                  {profile.snapshotUrl ? <a href={profile.snapshotUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-6 py-3.5 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:border-[var(--accent)]">Download recruiter snapshot</a> : null}
                </div>
              </div>

              <aside className="relative overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--accent)_20%,var(--border))] bg-[var(--panel)] p-6 shadow-[0_24px_80px_rgba(0,0,0,.22)] sm:p-7">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-2)]">Application status</p>
                    <p className="mt-2 text-base font-semibold leading-6 text-[var(--text)]">{profile.availability}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Check /></span>
                </div>
                <div className="relative mt-6 space-y-5 border-t border-[var(--border)] pt-6">
                  {profile.qualifications.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">{group.label}</p>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--text)]">{group.values.join(" · ")}</p>
                    </div>
                  ))}
                </div>
                <div className="relative mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Profile updated for this application
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="relative -mt-px bg-[var(--secondary)] text-[var(--secondary-text)]">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Application snapshot</p><h2 className="mt-2 text-2xl font-semibold text-white">Flight experience at a glance</h2></div>
              <p className="text-xs text-slate-400">Pilot-provided logbook totals</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {profile.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 transition hover:border-blue-400/70 hover:bg-slate-800/80">
                  <p className="text-2xl font-semibold tracking-tight text-white">{metric.value}</p>
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-blue-300">{metric.label}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
            <article className="relative overflow-hidden rounded-[2rem] bg-[var(--secondary)] p-7 text-[var(--secondary-text)] shadow-xl sm:p-9">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-blue-400/20" />
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border border-blue-400/15" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Career direction</p>
              <h2 className="relative mt-3 text-3xl font-semibold tracking-tight text-white">Where this pilot is headed</h2>
              <div className="relative mt-8 space-y-4">
                {profile.targetRoles.map((role, index) => (
                  <div key={role} className="grid grid-cols-[auto_1fr] gap-3 border-t border-slate-700 pt-4 first:border-0 first:pt-0">
                    <span className="font-mono text-[10px] font-semibold text-blue-300">0{index + 1}</span>
                    <p className="text-sm leading-6 text-slate-300">{role}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-sm sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Experience strengths</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">What this pilot brings</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {profile.strengths.map((strength) => (
                  <div key={strength} className="flex gap-3 rounded-2xl bg-[var(--panel-muted)] p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><Check /></span>
                    <p className="text-sm leading-6 text-[var(--muted)]">{strength}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_64%,transparent)]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.18fr_.82fr] lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Professional experience</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-4xl">The experience behind the hours</h2>
              <div className="relative mt-10 space-y-8 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-[var(--border)]">
                {profile.roles.map((role, index) => (
                  <article key={`${role.title}-${role.organization}`} className="relative grid grid-cols-[auto_1fr] gap-5">
                    <span className={`relative z-10 mt-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-[var(--panel)] ${index === 0 ? "bg-[var(--accent)] shadow-[0_0_16px_color-mix(in_srgb,var(--accent)_45%,transparent)]" : "bg-[var(--muted-2)]"}`} />
                    <div className="pb-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-base font-semibold text-[var(--text)]">{role.title}</h3><p className="font-mono text-[10px] font-semibold text-[var(--muted-2)]">{role.dates}</p></div>
                      <p className="mt-1 text-sm font-semibold text-[var(--accent)]">{role.organization}</p>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{role.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside>
              <div className="sticky top-28 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] shadow-lg">
                <div className="border-b border-[var(--border)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Logbook-supported</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Recent experience</h2>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Activity totals—not regulatory currency determinations.</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {profile.recentExperience.map((item, index) => (
                    <div key={item.label} className="p-6">
                      <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">{item.label}</p><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{item.value}</p></div><p className="text-[10px] text-[var(--muted)]">{item.window}</p></div>
                      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--panel-muted)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${72 + index * 9}%` }} /></div>
                    </div>
                  ))}
                </div>
                <p className="border-t border-[var(--border)] bg-[var(--panel-muted)] p-5 text-[10px] leading-5 text-[var(--muted)]">{profile.note}</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[var(--panel)] px-7 py-8 text-center shadow-xl sm:flex-row sm:text-left lg:px-10">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Application ready</p><h2 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Interested in {profile.displayName}?</h2><p className="mt-1 text-sm text-[var(--muted)]">Start the conversation directly from this profile.</p></div>
            <a href={`mailto:${profile.contactEmail}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-text)] transition hover:brightness-105">Contact pilot <Arrow /></a>
          </div>
          <p className="mt-8 text-center text-xs text-[var(--muted)]">Fictional demonstration profile · Made with MyPilotPage</p>
        </section>
      </main>
    </div>
  );
}
