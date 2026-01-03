export default function Resume() {
  return (
    <div className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">
            Resume
          </p>
          <h1 className="text-4xl font-semibold text-[#0b1f33] sm:text-5xl">
            Pilot resume overview
          </h1>
          <p className="max-w-3xl text-base text-[#4b647c] sm:text-lg">
            Swap in your real credentials, dates, and achievements. Keep it concise and ready to export.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-8 rounded-3xl border border-[#d4e0ec] bg-white p-8 shadow-sm lg:col-span-2">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Summary</h2>
              <p className="text-[#4b647c]">
                Experienced airline transport pilot with thousands of hours across regional and mainline fleets.
                Calm in the cockpit, disciplined with SOPs, and focused on smooth crew coordination and safety.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Core skills</h3>
                <ul className="space-y-2 text-sm text-[#35506c]">
                  <li>IFR, ETOPS, RNAV/RNP operations</li>
                  <li>CRM leadership and mentoring</li>
                  <li>De-icing, mountain ops, and winter procedures</li>
                  <li>Flight planning and dispatch collaboration</li>
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5">
                <h3 className="text-base font-semibold text-[#0b1f33]">Certifications</h3>
                <ul className="space-y-2 text-sm text-[#35506c]">
                  <li>ATP | First Class Medical</li>
                  <li>CFI / CFII / MEI</li>
                  <li>FCC Radiotelephone</li>
                  <li>Passport ready | Global Entry</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Experience</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Captain — Narrow-body fleet",
                    company: "Placeholder Air",
                    dates: "2021 — Present",
                    bullets: [
                      "Lead mixed-experience crews on domestic and short-haul international routes.",
                      "Mentor first officers; support line checks and SOP refreshers.",
                      "Maintain on-time performance while prioritizing safety and passenger experience.",
                    ],
                  },
                  {
                    title: "First Officer — Regional Jet",
                    company: "Metro Regional",
                    dates: "2017 — 2021",
                    bullets: [
                      "Executed high-frequency schedules in varied weather with strong dispatch coordination.",
                      "Supported new-hire training and cockpit standardization efforts.",
                      "Focused on fuel efficiency and stable approach discipline.",
                    ],
                  },
                  {
                    title: "Instructor — Simulator & Ground",
                    company: "Flight Training Center",
                    dates: "2014 — 2017",
                    bullets: [
                      "Delivered type rating prep, LOFT scenarios, and CRM workshops.",
                      "Developed training checklists and scenario-based assessments.",
                    ],
                  },
                ].map((role) => (
                  <div
                    key={role.title}
                    className="rounded-2xl border border-[#d4e0ec] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-[#0b1f33]">
                          {role.title}
                        </p>
                        <p className="text-sm text-[#4b647c]">{role.company}</p>
                      </div>
                      <p className="text-sm text-[#5d7995]">{role.dates}</p>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-[#35506c]">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>• {bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Education & training</h2>
              <ul className="space-y-2 text-sm text-[#35506c]">
                <li>B.S. Aviation Science — Aviation University (placeholder)</li>
                <li>Airline Transport Pilot Certification — FAA</li>
                <li>Annual recurrent training — Current</li>
              </ul>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#0b1f33]">Contact</h3>
              <p className="mt-2 text-sm text-[#35506c]">you@example.com</p>
              <p className="text-sm text-[#35506c]">(555) 123-4567</p>
              <p className="text-sm text-[#4b647c]">Home base: Your city</p>
              <a
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#1f4b71] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#163552] hover:shadow"
                href="/contact"
              >
                Schedule a call
              </a>
            </div>

            <div className="rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#0b1f33]">Download</h3>
              <p className="mt-2 text-sm text-[#35506c]">
                Add a PDF link when ready. Keep a short link here for recruiters.
              </p>
              <a
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#9cb6cf] bg-white px-4 py-2 text-sm font-semibold text-[#0f2f4b] transition hover:border-[#7fa0c1] hover:bg-[#f3f7fc]"
                href="#"
              >
                Placeholder PDF
              </a>
            </div>

            <div className="rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#0b1f33]">Fast facts</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#35506c]">
                <li>Based near major hub</li>
                <li>Open to relocation</li>
                <li>Eligible to work in US</li>
                <li>Available for interviews this month</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
