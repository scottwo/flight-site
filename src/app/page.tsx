export default function Home() {
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
              <p className="max-w-3xl text-base text-[#4b647c] sm:text-lg">
                A clear, interview-ready snapshot of your flight experience, certifications, and availability.
                Swap in your headshot and details whenever you are ready.
              </p>
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
                Airline Transport Pilot
              </p>
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Reliable cockpit leadership</h2>
              <p className="max-w-3xl text-[#4b647c]">
                Summarize your flying style, safety mindset, and what kind of operation you are targeting.
                Mention the aircraft you know best, and the kind of crew environment where you thrive.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">Total time</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">4,200+</p>
                <p className="text-sm text-[#5d7995]">Hours logged</p>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">PIC</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">1,800</p>
                <p className="text-sm text-[#5d7995]">Multi-engine</p>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4">
                <p className="text-sm text-[#5d7995]">Last 12 months</p>
                <p className="text-3xl font-semibold text-[#0f2f4b]">520</p>
                <p className="text-sm text-[#5d7995]">Recent flight hours</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Type ratings</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#4b647c]">
                  <li>Embraer 170/190 | Boeing 737 | Airbus A320</li>
                  <li>Instrument, multi-engine, and instructor current</li>
                  <li>First Class Medical | Passport ready</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#4b647c]">
                  <li>Line check airman with an eye for calm, precise SOPs</li>
                  <li>Comfortable in glass cockpits and mixed fleet ops</li>
                  <li>Based near a major hub; open to relocation</li>
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
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Headshot placeholder</p>
                  <p className="text-xs text-[#5b7693]">
                    Drop a professional portrait here when you have it.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#0b1f33]">Flight credentials</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#4b647c]">
                <li>ATP | CFI / CFII / MEI</li>
                <li>Part 91, 121, and 135 experience</li>
                <li>CRM-focused with a strong safety record</li>
              </ul>
              <div className="mt-5 rounded-2xl bg-[#f3f7fc] p-4 text-left text-sm text-[#35506c]">
                <p className="font-semibold text-[#0b1f33]">Contact</p>
                <p className="mt-1">you@example.com</p>
                <p>(555) 123-4567</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
