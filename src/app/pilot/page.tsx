import FlightsMap from "@/components/FlightsMap";
import FunFacts from "@/components/FunFacts";
import { CumulativeHoursChart } from "@/components/CumulativeHoursChart";
import ThemeScope from "@/components/ThemeScope";
import CareerProfileHeader from "@/components/CareerProfileHeader";
import { formatCount, formatHours, getHeatmap, getStats } from "@/lib/stats";
import { getRoutes } from "@/lib/routes";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type StatsType = Awaited<ReturnType<typeof getStats>>;
type HeatmapType = Awaited<ReturnType<typeof getHeatmap>>;
type RoutesType = Awaited<ReturnType<typeof getRoutes>>;

export async function PilotProfilePage({
  dataDir = "data",
  statsOverride,
  heatmapOverride,
  routesOverride,
  cumulativeOverride,
}: {
  dataDir?: string;
  statsOverride?: StatsType;
  heatmapOverride?: HeatmapType;
  routesOverride?: RoutesType;
  cumulativeOverride?: {
    data: { date: string; total: number; cumulative: number }[];
    totalHours: number;
    yAxisMin?: number;
  };
} = {}) {
  const [stats, heatmap, routes] = await Promise.all([
    statsOverride ?? getStats(dataDir),
    heatmapOverride ?? getHeatmap(dataDir),
    routesOverride ?? getRoutes("routes.json", dataDir),
  ]);

  const sicHours = (stats.totals as { sic?: number }).sic ?? 0;
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
      helper: `${formatHours(sicHours)} SIC`,
    },
    {
      label: "Night",
      value: `${formatHours(stats.totals.night)} hrs`,
      helper: `${formatCount(stats.totals.nightLandings)} night landings`,
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
      window: `${formatDate(currency.windows.dayNight90dStart)}–${formatDate(currency.windows.dayNight90dEnd)}`,
    },
    {
      title: "Night (last 90 days)",
      value: `${formatCount(currency.night.landings)} landings`,
      window: `${formatDate(currency.windows.dayNight90dStart)}–${formatDate(currency.windows.dayNight90dEnd)}`,
    },
    {
      title: "IFR (last 6 cal months)",
      value: `${formatCount(currency.ifr.approaches)} approaches / ${formatCount(currency.ifr.holds)} holds`,
      requirement: "Imported approaches and holds only; intercept/track and other required conditions are not verified.",
      window: `${formatDate(currency.windows.ifr6CalMoStart)}–${formatDate(currency.windows.ifr6CalMoEndExclusive)}`,
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
    { threshold: 0, className: "bg-[var(--bg)] border border-[var(--border)]" },
    { threshold: 0.15, className: "bg-[color-mix(in_srgb,var(--accent)_20%,var(--panel-muted))]" },
    { threshold: 0.35, className: "bg-[color-mix(in_srgb,var(--accent)_40%,var(--panel-muted))]" },
    { threshold: 0.6, className: "bg-[color-mix(in_srgb,var(--accent)_65%,var(--panel-muted))]" },
    { threshold: 1, className: "bg-[var(--accent)]" },
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
  const airportEntries: [string, { code: string; lat: number; lon: number }][] = routes
    .flatMap((r) => [
      [r.from.icao, { code: r.from.icao, lat: r.from.lat, lon: r.from.lon }] as [
        string,
        { code: string; lat: number; lon: number },
      ],
      [r.to.icao, { code: r.to.icao, lat: r.to.lat, lon: r.to.lon }] as [
        string,
        { code: string; lat: number; lon: number },
      ],
    ])
    .filter(
      ([, v]) =>
        typeof v.lat === "number" &&
        Number.isFinite(v.lat) &&
        typeof v.lon === "number" &&
        Number.isFinite(v.lon),
    );
  const airportsForMap = Array.from(new Map(airportEntries).values());
  const routesForMap = routes
    .filter(
      (r) =>
        r.from.icao &&
        r.to.icao &&
        Number.isFinite(r.from.lat) &&
        Number.isFinite(r.from.lon) &&
        Number.isFinite(r.to.lat) &&
        Number.isFinite(r.to.lon),
    )
    .map((r) => ({ from: r.from.icao, to: r.to.icao, count: r.count }));

  return (
    <ThemeScope className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16">
        <CareerProfileHeader
          displayName="Maya Chen"
          currentRole="CRJ-900 Captain"
          homeBase="Denver, CO"
          headline="Part 121 captain with mountain, winter, and high-density airport experience, preparing for a major-airline transition."
          availability="Actively interviewing · Available with 30 days notice"
          contactEmail="maya.chen@example.com"
          snapshotUrl="/demo/maya-chen-recruiter-snapshot.pdf"
          qualificationGroups={[
            { label: "Certificates", values: ["ATP", "CFI", "CFII", "MEI"] },
            { label: "Type ratings", values: ["CL-65"] },
            { label: "Readiness", values: ["First Class Medical", "US Passport", "FCC Restricted Radiotelephone"] },
          ]}
        />

        <section className="grid grid-cols-1">
          <main className="w-full rounded-3xl border border-[var(--border)] bg-[var(--panel)] px-4 py-6 shadow-sm sm:px-6 sm:py-10 md:col-span-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Application snapshot</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Flight experience</h2>
            </div>

            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
                  <div className="text-sm text-[var(--muted-2)]">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--text)]">{card.value}</div>
                  <div className="text-sm text-[var(--muted)]">{card.helper}</div>
                </div>
              ))}
            </section>

            <FunFacts facts={stats.funFacts} />

            {monthlyTotals.length > 0 && (
              <section className="mt-12 space-y-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Recent monthly totals</h2>
                  <p className="text-sm text-[var(--muted-2)]">Flight time from your LogTen export.</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-3 shadow-sm sm:p-5">
                  <div className="overflow-x-auto">
                    <div className="flex min-w-[680px] items-end gap-4">
                    {monthlyTotals.map((month) => {
                      const barHeight = maxMonthlyTotal > 0 ? (month.total / maxMonthlyTotal) * 100 : 0;
                      return (
                        <div key={month.month} className="flex-1 text-center">
                          <div className="flex h-40 items-end justify-center rounded-xl bg-[var(--panel)]/70 p-2">
                            <div
                              className="w-8 rounded-lg bg-[var(--accent)] shadow-sm transition"
                              style={{ height: `${barHeight}%` }}
                            />
                          </div>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                            {month.label}
                          </p>
                          <p className="text-sm font-semibold text-[var(--text)]">
                            {formatHours(month.total)} hrs
                          </p>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>
                {cumulativeOverride ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
                    <CumulativeHoursChart
                      data={cumulativeOverride.data}
                      totalHours={cumulativeOverride.totalHours}
                      yAxisMin={cumulativeOverride.yAxisMin}
                    />
                  </div>
                ) : null}
              </section>
            )}

            <section className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="min-w-0 space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Recent experience</h2>
                  <p className="text-sm text-[var(--muted-2)]">Imported activity only; no regulatory currency conclusion is made.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {currencyItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 shadow-sm"
                    >
                      <div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                          <p className="text-xs text-[var(--muted)] sm:text-sm">{item.window}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--text)]">{item.value}</div>
                      {item.requirement ? <p className="text-sm text-[var(--muted-2)]">{item.requirement}</p> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[var(--text)]">Recency heatmap</h2>
                  <p className="text-sm text-[var(--muted-2)]">
                    Last 90 days of flying.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 shadow-inner">
                  <div className="mb-3 flex gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                    <span className="hidden w-10 sm:block" aria-hidden />
                    {weeks.map((_, idx) => (
                      <span key={idx} className="w-[14px] text-center sm:w-[18px]">
                        {monthLabels[idx]}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="hidden w-10 flex-col justify-between text-right text-[10px] uppercase text-[var(--muted-2)] sm:flex">
                      {dayLabels.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <div className="grid min-w-[350px] grid-flow-col auto-cols-[12px] grid-rows-7 gap-1 sm:min-w-[280px] sm:auto-cols-[18px]">
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
                                className={`h-[12px] w-[12px] rounded-sm sm:h-[18px] sm:w-[18px] ${cls}`}
                                title={`${label} • ${formatHours(hours)} hrs • ${formatCount(flights)} flights`}
                                aria-label={`${label} • ${formatHours(hours)} hours • ${formatCount(flights)} flights`}
                              />
                            );
                          }),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--muted)]">
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

            <section className="mt-12 space-y-3">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)]">Route map</h2>
                <p className="text-sm text-[var(--muted-2)]">
                  Segments from your sample routes export, sized by trip count.
                </p>
              </div>
              <FlightsMap airports={airportsForMap} routes={routesForMap} />
            </section>
          </main>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[var(--text)]">Qualifications</h2>
            </div>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>ATP | CFI | CFII | MEI | CL-65 type rating</li>
              <li>CRJ-700/900 line captain; check airman mentorship program participant</li>
              <li>First Class Medical | Passport ready | FCC Radiotelephone License</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[var(--text)]">Operational experience</h2>
            </div>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>Part 121 hub-and-spoke operations across DEN, DFW, PHX, ORD, and LAX</li>
              <li>Mountain ops into SLC/BOI/COS; winter operations and de-ice coordination</li>
              <li>Busy airspace: JFK/LGA/EWR/BOS/DC metros; RNAV/RNP and ILS proficiency</li>
              <li>High-altitude departures/arrivals; standard push/turn times at busy hubs</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6 lg:col-span-2">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[var(--text)]">Recent roles</h2>
            </div>
            <div className="space-y-4">
              {[
              {
                title: "Captain",
                org: "SkyWest Airlines (CRJ-700/900)",
                detail:
                  "PIC responsibility in Part 121 operations, with an emphasis on stable decision-making, crew development, and reliable winter operations.",
              },
              {
                title: "First Officer",
                org: "SkyWest Airlines (CRJ-700/900)",
                detail:
                  "High-frequency mountain and coastal flying; upgraded after building consistent line, CRM, and irregular-operations experience.",
              },
              {
                  title: "Flight Instructor",
                  org: "Front Range Flight Academy",
                  detail:
                    "Delivered private through commercial and instrument instruction while building a strong foundation in risk management and clear cockpit communication.",
                },
              ].map((role) => (
                <div
                  key={`${role.title}-${role.org}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {role.title}
                  </p>
                  <p className="text-sm text-[var(--muted-2)]">{role.org}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{role.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
            <h2 className="text-2xl font-semibold text-[var(--text)]">Career milestones</h2>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>ATP/CTP complete; First Class Medical</li>
              <li>CL-65 type rating and Part 121 captain upgrade complete</li>
              <li>Recurrent sims: stalls/UAS, upset recovery, RTO, and engine-out procedures</li>
              <li>Emergency equipment/CRM refreshers each cycle</li>
              <li>FCC Radiotelephone: Yes</li>
            </ul>
          </div>
        </section>
      </div>
    </ThemeScope>
  );
}

export default async function Pilot() {
  return <PilotProfilePage />;
}
