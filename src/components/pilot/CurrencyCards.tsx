type FlightForCurrency = {
  flightDate: Date | string;
  dayLandings: number | null;
  nightLandings: number | null;
  ifr: number | null;
};

type Props = {
  flights: FlightForCurrency[];
  window90Start: Date;
  window180Start: Date;
};

function formatDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function normalizeDate(value: Date | string) {
  return typeof value === "string" ? new Date(value) : value;
}

export function CurrencyCards({ flights, window90Start, window180Start }: Props) {
  const now = new Date();
  const dayLandingCount = flights
    .filter((f) => normalizeDate(f.flightDate) >= window90Start)
    .reduce((sum, f) => sum + (f.dayLandings ?? 0), 0);
  const nightLandingCount = flights
    .filter((f) => normalizeDate(f.flightDate) >= window90Start)
    .reduce((sum, f) => sum + (f.nightLandings ?? 0), 0);
  const ifr6Month = flights
    .filter((f) => normalizeDate(f.flightDate) >= window180Start)
    .reduce((sum, f) => sum + (f.ifr ?? 0), 0);

  const cards = [
    {
      label: "Day landings",
      detail: `${dayLandingCount} in last 90 days`,
    },
    {
      label: "Night landings",
      detail: `${nightLandingCount} in last 90 days`,
    },
    {
      label: "Instrument time",
      detail: `${ifr6Month.toFixed(1)} hrs in last 6 months`,
    },
  ];

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Recent experience</h2>
          <p className="text-sm text-[var(--muted)]">
            Day/Night window: {formatDateRange(window90Start, now)} • IFR window:{" "}
            {formatDateRange(window180Start, now)}
          </p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-2)]">
          Logbook totals only
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                {card.label}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{card.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
        These are imported activity totals, not a determination of FAA or employer currency. The logbook may not include every event or condition needed to make that assessment.
      </p>
    </section>
  );
}
