type Flight = {
  flightDate: Date;
  fromIcao: string;
  toIcao: string;
  totalTime: number | null;
  night: number | null;
  ifr: number | null;
};

type Props = {
  flights: Flight[];
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function RecentFlights({ flights }: Props) {
  if (!flights.length) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">Recent flights</h2>
        <p className="text-sm text-[var(--muted)]">No recent flights logged.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">Recent flights</h2>
        <span className="text-xs font-semibold text-[var(--muted)]">
          Last {flights.length.toLocaleString()} flights
        </span>
      </div>
      <div className="space-y-2">
        {flights.map((flight) => (
          <div
            key={`${flight.flightDate.toISOString()}-${flight.fromIcao}-${flight.toIcao}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--text-strong)]">
                {flight.fromIcao} → {flight.toIcao}
              </span>
              <span className="text-xs text-[var(--muted)]">{formatDate(flight.flightDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-[var(--muted-2)]">
              <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-[var(--text)]">
                {flight.totalTime ? `${flight.totalTime.toFixed(1)} hrs` : "—"}
              </span>
              {flight.night && flight.night > 0 ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-[var(--text)]">
                  Night
                </span>
              ) : null}
              {flight.ifr && flight.ifr > 0 ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-[var(--text)]">
                  IFR
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
