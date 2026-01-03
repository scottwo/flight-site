import { formatCount, formatHours, getHeatmap, getStats } from "@/lib/stats";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function Pilot() {
  const [stats, heatmap] = await Promise.all([getStats(), getHeatmap()]);
  const { currency } = stats;
  const now = stats.generatedAt ? new Date(stats.generatedAt) : new Date();
  const start90 = new Date(now);
  start90.setDate(start90.getDate() - 89);
  const heatmap90 = heatmap.filter((entry) => {
    const d = new Date(entry.date);
    return d >= start90 && d <= now;
  });
  const heatmapMap = new Map(heatmap90.map((entry) => [entry.date, entry]));
  const summaryCards = [
    {
      label: "Total time",
      value: `${formatHours(stats.totals.total)} hrs`,
      helper: `${formatCount(stats.totals.landings)} landings`,
    },
    {
      label: "PIC",
      value: `${formatHours(stats.totals.pic)} hrs`,
      helper: `${formatCount(stats.totals.nightLandings)} night landings`,
    },
    {
      label: "Dual received",
      value: `${formatHours(stats.totals.dual)} hrs`,
      helper: `${formatHours(stats.totals.night)} night hrs`,
    },
    {
      label: "Last 90 days",
      value: `${formatHours(stats.last90.total)} hrs`,
      helper: `${formatCount(stats.last90.landings)} landings`,
    },
    {
      label: "Instrument",
      value: `${formatHours(stats.totals.instrument + stats.totals.instrumentSim)} hrs`,
      helper: `${formatHours(stats.totals.instrumentActual)} actual hrs`,
    },
    {
      label: "Cross-country",
      value: `${formatHours(stats.totals.xc)} hrs`,
      helper: "Day + night XC combined",
    },
  ];
  const currencyItems = [
    {
      title: "Day (last 90 days)",
      value: `${formatCount(currency.day.landings)} landings`,
      requirement: currency.day.requirement,
      window: `${formatDate(currency.windows.dayNight90dStart)}–${formatDate(currency.windows.dayNight90dEnd)}`,
      current: currency.day.meetsPassengerCarry,
    },
    {
      title: "Night (last 90 days)",
      value: `${formatCount(currency.night.landings)} landings`,
      requirement: currency.night.requirement,
      window: `${formatDate(currency.windows.dayNight90dStart)}–${formatDate(currency.windows.dayNight90dEnd)}`,
      current: currency.night.meetsPassengerCarry,
    },
    {
      title: "IFR (last 6 cal months)",
      value: `${formatCount(currency.ifr.approaches)} approaches / ${formatCount(currency.ifr.holds)} holds`,
      requirement: "Need ≥6 approaches plus holding within the last 6 calendar months (intercept/track not tracked here).",
      window: `${formatDate(currency.windows.ifr6CalMoStart)}–${formatDate(currency.windows.ifr6CalMoEndExclusive)}`,
      current: currency.ifr.meetsTrackedItems,
    },
  ];
  const monthlyTotals = [...stats.monthly]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((entry) => {
      const date = new Date(`${entry.month}-01T00:00:00`);
      const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      return { ...entry, label };
    });
  const maxMonthlyTotal = monthlyTotals.reduce((max, m) => Math.max(max, m.total), 0);
  const heatmapSorted = [...heatmap90].sort((a, b) => a.date.localeCompare(b.date));
  const maxHeatmapHours = heatmapSorted.reduce((max, entry) => Math.max(max, entry.hours), 0);
  const heatLevels = [
    { threshold: 0, className: "bg-[#eaf1f8] border border-[#d4e0ec]" },
    { threshold: 0.15, className: "bg-[#c8dbf1]" },
    { threshold: 0.35, className: "bg-[#9cb6cf]" },
    { threshold: 0.6, className: "bg-[#6a91b8]" },
    { threshold: 1, className: "bg-[#1f4b71]" },
  ];
  const getHeatClass = (hours: number) => {
    if (maxHeatmapHours === 0) return heatLevels[0].className;
    const ratio = hours / maxHeatmapHours;
    const level = heatLevels.find((l) => ratio <= l.threshold) ?? heatLevels[heatLevels.length - 1];
    return level.className;
  };
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const weeks = (() => {
    if (heatmapSorted.length === 0) return [];
    const first = startOfWeek(start90);
    const last = startOfWeek(now);
    const end = addDays(last, 6);
    const result: { date: Date; entry?: (typeof heatmap)[number] }[][] = [];
    for (let cursor = new Date(first); cursor <= end; cursor = addDays(cursor, 7)) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(cursor, i);
        const key = date.toISOString().slice(0, 10);
        const entry = heatmapMap.get(key);
        return { date, entry };
      });
      result.push(days);
    }
    return result;
  })();
  const monthLabels = weeks.map((week, idx) => {
    const month = week[0]?.date.toLocaleDateString("en-US", { month: "short" });
    const prevMonth = weeks[idx - 1]?.[0]?.date.toLocaleDateString("en-US", { month: "short" });
    return idx === 0 || month !== prevMonth ? month : "";
  });
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        </header>

        <section className="grid grid-cols-1">
          <main className="w-full rounded-3xl border border-[#d4e0ec] bg-white px-6 py-10 shadow-sm md:col-span-3">
            <h1 className="text-4xl font-semibold tracking-tight">Pilot</h1>

            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-[#d4e0ec] bg-white p-5 shadow-sm">
                  <div className="text-sm text-[#5d7995]">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-[#0b1f33]">{card.value}</div>
                  <div className="text-sm text-[#35506c]">{card.helper}</div>
                </div>
              ))}
            </section>

            {monthlyTotals.length > 0 && (
              <section className="mt-12 space-y-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[#0b1f33]">Recent monthly totals</h2>
                  <p className="text-sm text-[#4b647c]">Flight time from your LogTen export.</p>
                </div>
                <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-5 shadow-sm">
                  <div className="flex items-end gap-4">
                    {monthlyTotals.map((month) => {
                      const barHeight = maxMonthlyTotal > 0 ? (month.total / maxMonthlyTotal) * 100 : 0;
                      return (
                        <div key={month.month} className="flex-1 text-center">
                          <div className="flex h-40 items-end justify-center rounded-xl bg-white/70 p-2">
                            <div
                              className="w-8 rounded-lg bg-[#1f4b71] shadow-sm transition"
                              style={{ height: `${barHeight}%` }}
                            />
                          </div>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#5d7995]">
                            {month.label}
                          </p>
                          <p className="text-sm font-semibold text-[#0b1f33]">
                            {formatHours(month.total)} hrs
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            <section className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#0b1f33]">Currency</h2>
                  <p className="text-sm text-[#4b647c]">Pulled from your latest LogTen export.</p>
                </div>
                <div className="grid gap-4">
                  {currencyItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0b1f33]">{item.title}</p>
                          <p className="text-sm text-[#35506c]">{item.window}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.current
                              ? "bg-[#e1f5e6] text-[#1f7a3d] border border-[#b9e4c4]"
                              : "bg-[#fff0e6] text-[#b45309] border border-[#f4d3ad]"
                          }`}
                        >
                          {item.current ? "Current" : "Out of Currency"}
                        </span>
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[#0b1f33]">{item.value}</div>
                      <p className="text-sm text-[#4b647c]">{item.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#0b1f33]">Recency heatmap</h2>
                  <p className="text-sm text-[#4b647c]">
                    Last 90 days of flying. Each square is a flight day sized by hours; darker means more time that day.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4 shadow-inner">
                  <div className="mb-3 flex gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#5d7995]">
                    <span className="w-10" aria-hidden />
                    {weeks.map((_, idx) => (
                      <span key={idx} className="w-[18px] text-center">
                        {monthLabels[idx]}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex w-10 flex-col justify-between text-right text-[10px] uppercase text-[#5d7995]">
                      {dayLabels.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <div className="grid grid-flow-col auto-cols-[18px] grid-rows-7 gap-1">
                        {weeks.flatMap((week, weekIdx) =>
                          week.map((day, dayIdx) => {
                            const hours = day.entry?.hours ?? 0;
                            const flights = day.entry?.flights ?? 0;
                            const cls = getHeatClass(hours);
                            const label = day.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                            return (
                              <div
                                key={`${weekIdx}-${dayIdx}`}
                                className={`h-[18px] w-[18px] rounded-sm ${cls}`}
                                title={`${label} • ${formatHours(hours)} hrs • ${formatCount(flights)} flights`}
                                aria-label={`${label} • ${formatHours(hours)} hours • ${formatCount(flights)} flights`}
                              />
                            );
                          }),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-[#35506c]">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                      {heatLevels.map((level, idx) => (
                        <span
                          key={idx}
                          className={`h-[14px] w-[14px] rounded-sm ${level.className}`}
                          aria-label={`Heat level ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Current Training Status</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li>Main Aircraft: Diamond DA 40</li>
              <li>First Class Medical | Passport ready | FCC Radiotelephone License</li>
              <li>Future CFI / CFII / MEI</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#0b1f33]">Operational experience</h2>
              <p className="text-sm text-[#4b647c]">
                The environments and procedures you know best.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li></li>
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
                  title: "Technical Operations Manager",
                  org: "Viewport (defunct)",
                  detail: "Daily operational management of 90MM emails, junior data analyst mentorship, and SOP creation and refinement.",
                },
                {
                  title: "Ramp Agent",
                  org: "Somewhere",
                  detail: "hopefully soon",
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
            <h2 className="text-2xl font-semibold text-[#0b1f33]">Training Milestones</h2>
            <ul className="space-y-3 text-sm text-[#35506c]">
              <li>Intro Flight: May 2025</li>
              <li>Private Ground School: September 2025</li>
              <li>Private EOC: Jan 2026</li>
              <li>Instrument Ground School: Jan 2026</li>
              <li>Medical: First Class</li>
              <li>FCC Radiotelephone: Yes</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
