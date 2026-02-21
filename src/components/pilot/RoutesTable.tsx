type Route = {
  fromIcao: string;
  toIcao: string;
  flightsCount: number;
  totalTime: number;
  lastFlownAt: Date | null;
};

type Props = {
  routes: Route[];
};

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function RoutesTable({ routes }: Props) {
  if (!routes.length) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">Routes</h2>
        <p className="text-sm text-[var(--muted)]">No routes yet. Import a logbook to see your most-flown legs.</p>
      </section>
    );
  }

  const uniqueAirports = new Set<string>();
  routes.forEach((r) => {
    uniqueAirports.add(r.fromIcao);
    uniqueAirports.add(r.toIcao);
  });

  const mostCommon = routes[0];

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Top 5 Routes</h2>
          <p className="text-sm text-[var(--muted)]">
            {uniqueAirports.size} airports • Most common:{" "}
            {mostCommon.fromIcao} → {mostCommon.toIcao}
          </p>
        </div>
      </div>
      <div className="space-y-2 sm:hidden">
        {routes.map((route) => (
          <div key={`${route.fromIcao}-${route.toIcao}`} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-3">
            <p className="text-sm font-semibold text-[var(--text)]">
              {route.fromIcao} → {route.toIcao}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <p>
                Flights: <span className="font-semibold text-[var(--text-strong)]">{route.flightsCount}</span>
              </p>
              <p>
                Time: <span className="font-semibold text-[var(--text-strong)]">{route.totalTime.toFixed(1)} hrs</span>
              </p>
              <p className="col-span-2">
                Last flown: <span className="font-semibold text-[var(--text-strong)]">{formatDate(route.lastFlownAt)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-[640px] text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="px-2 py-2 font-semibold">Route</th>
              <th className="px-2 py-2 font-semibold">Flights</th>
              <th className="px-2 py-2 font-semibold">Time</th>
              <th className="px-2 py-2 font-semibold">Last flown</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={`${route.fromIcao}-${route.toIcao}`} className="border-t border-[var(--border)]">
                <td className="px-2 py-2 text-[var(--text)]">
                  {route.fromIcao} → {route.toIcao}
                </td>
                <td className="px-2 py-2 text-[var(--text-strong)]">{route.flightsCount}</td>
                <td className="px-2 py-2 text-[var(--text-strong)]">{route.totalTime.toFixed(1)} hrs</td>
                <td className="px-2 py-2 text-[var(--muted)]">{formatDate(route.lastFlownAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
