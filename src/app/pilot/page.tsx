export default function Pilot() {
  return (
    <div className="min-h-screen bg-[#eaf1f8] text-[#0b1f33]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7995]">
            Pilot Profile
          </p>
          <h1 className="text-4xl font-semibold text-[#0b1f33] sm:text-5xl">
            Flight hours and ratings snapshot
          </h1>
          <p className="max-w-3xl text-base text-[#4b647c] sm:text-lg">
            Replace these placeholders with your actual totals, aircraft types, and operational highlights.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total time", value: "4,200+", note: "Hours logged" },
            { label: "Pilot in Command", value: "1,800", note: "Multi-engine" },
            { label: "Last 12 months", value: "520", note: "Recent hours" },
            { label: "Night", value: "800", note: "Hours" },
            { label: "IFR", value: "1,200", note: "Instrument" },
            { label: "Cross-country", value: "2,300", note: "Hours" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#d4e0ec] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-[#5d7995]">{item.label}</p>
              <p className="text-3xl font-semibold text-[#0f2f4b]">{item.value}</p>
              <p className="text-sm text-[#5d7995]">{item.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Type ratings</h2>
              <p className="text-sm text-[#4b647c]">
                Swap in the aircraft you are current on and the ones you want to feature.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li>Airbus A320 | Boeing 737 | Embraer 170/190</li>
              <li>First Class Medical | Passport ready</li>
              <li>CFI / CFII / MEI | Check airman experience</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Operational experience</h2>
              <p className="text-sm text-[#4b647c]">
                Highlight the environments and procedures you know best.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li>Part 121 line operations with mixed fleet exposure</li>
              <li>ETOPS and RNAV/RNP approaches across varied terrain</li>
              <li>CRM-focused cockpit leadership; calm under irregular ops</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Recent roles</h2>
              <p className="text-sm text-[#4b647c]">
                A quick timeline you can refine with employers, dates, and fleets.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Captain — Narrow-body fleet",
                  org: "Placeholder Air",
                  detail: "Line operations, mentoring FOs, and SOP refinement.",
                },
                {
                  title: "First Officer — Regional jet",
                  org: "Metro Regional",
                  detail: "High-frequency routes, de-icing ops, and winter ops focus.",
                },
                {
                  title: "Instructor — Simulator",
                  org: "Flight Training Center",
                  detail: "Type rating prep, LOFT scenarios, and CRM workshops.",
                },
              ].map((role) => (
                <div
                  key={role.title}
                  className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4"
                >
                  <p className="text-sm font-semibold text-[#0b1f33]">
                    {role.title}
                  </p>
                  <p className="text-sm text-[#4b647c]">{role.org}</p>
                  <p className="mt-1 text-sm text-[#35506c]">{role.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0b1f33]">Training & currency</h2>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li>Recurrent check: Jan 2024 (simulate your date)</li>
              <li>Proficiency check: Current</li>
              <li>IFR currency: Current</li>
              <li>Medical: First Class</li>
              <li>FCC Radiotelephone: Yes</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
