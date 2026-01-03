import { formatCount, formatHours, getStats } from "@/lib/stats";
import Image from "next/image";

export default async function Home() {
  const stats = await getStats();
  return (
    <div className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1f4b71] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
              Pilot Resume
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold leading-tight text-[#0b1f33] sm:text-5xl">
                Professional Pilot Landing Page
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/resume"
              className="inline-flex items-center justify-center rounded-full bg-[#1f4b71] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#163552] hover:shadow"
            >
              Download resume
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[#9cb6cf] bg-white px-5 py-3 text-sm font-semibold text-[#0f2f4b] transition hover:border-[#7fa0c1] hover:bg-[#f3f7fc]"
            >
              Contact
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-8 rounded-3xl border border-[#d4e0ec] bg-white p-8 shadow-sm lg:col-span-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">
                Student Pilot
              </p>
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Proven Flight Deck Leadership</h2>
              <p className="max-w-3xl text-[#4b647c]">
                I’m training with an airline-style mindset: brief early, fly stabilized, debrief honestly, and never negotiate with weather or fatigue.
                Most of my experience is in light single-engine piston aircraft, and I thrive in standardized, team-oriented crews where CRM and continuous improvement are the norm.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">Total time</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">
                  {formatHours(stats.totals.total)} hrs
                </p>
                <p className="text-sm text-[#5d7995]">
                  {formatCount(stats.totals.landings)} landings
                </p>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">PIC</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">
                  {formatHours(stats.totals.pic)} hrs
                </p>
                <p className="text-sm text-[#5d7995]">
                  {formatCount(stats.totals.nightLandings)} night landings
                </p>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">Last 90 days</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">
                  {formatHours(stats.last90.total)} hrs
                </p>
                <p className="text-sm text-[#5d7995]">
                  {formatCount(stats.last90.landings)} recent landings
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Type ratings</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#4b647c]">
                  <li>I wish</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#4b647c]">
                  <li>Career transition with an eye for calm, precise SOPs</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
              <h3 className="text-base font-semibold text-[#0b1f33]">Availability</h3>
              <p className="mt-2 text-sm text-[#4b647c]">
                Ready for interviews and sim evals this month. Outline your notice period, travel flexibility,
                and the kinds of schedules or aircraft you are most interested in.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-dashed border-[#b6c8dc] bg-white p-6 text-center shadow-sm">
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-[#b6c8dc] bg-[#f3f7fc] text-[#5b7693]">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#0b1f33]">First Day of Flight School</p>
                  <div className="relative mx-auto h-72 w-52 overflow-hidden rounded-xl border border-[#d4e0ec] shadow-sm">
                    <Image
                      src="/img/headshot2.jpeg"
                      alt="Scott in front of a Diamond DA 40"
                      fill
                      sizes="208px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#0b1f33]">Flight credentials</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#4b647c]">
                <li>Student Pilot</li>
                <li>CRM-focused with a strong safety record</li>
              </ul>
              <div className="mt-5 rounded-2xl bg-[#f3f7fc] p-4 text-left text-sm text-[#35506c]">
                <p className="font-semibold text-[#0b1f33]">Contact</p>
                <p className="mt-1">scott.w.ogden@gmail.com</p>
                <p>(503) 703-4208</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
