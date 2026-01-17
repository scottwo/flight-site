import type { ProfileStats } from "@prisma/client";

type Props = {
  stats: ProfileStats | null;
};

const fields: { key: keyof ProfileStats; label: string; helper?: string }[] = [
  { key: "totalTime", label: "Total time" },
  { key: "pic", label: "PIC" },
  { key: "sic", label: "SIC" },
  { key: "ifr", label: "IFR" },
  { key: "night", label: "Night" },
  { key: "crossCountry", label: "Cross-country" },
];

const last90Fields: { key: keyof ProfileStats; label: string; suffix?: string }[] = [
  { key: "last90_total", label: "Total", suffix: "hrs" },
  { key: "last90_landings", label: "Landings" },
  { key: "last90_ifr", label: "IFR", suffix: "hrs" },
];

function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined) return "0.0 hrs";
  return `${value.toFixed(1)} hrs`;
}

function formatInt(value: number | null | undefined) {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString();
}

export function StatsCards({ stats }: Props) {
  if (!stats) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <p className="text-sm text-[var(--muted)]">Pilot stats will render here once an import has been completed.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Totals</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-2)]">
            {stats.flightsCount.toLocaleString()} flights
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                {field.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
                {formatHours(stats[field.key] as number)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">Last 90 days</h3>
        <div className="mt-3 space-y-2">
          {last90Fields.map((field) => (
            <div key={field.key} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">
                {field.label}
              </span>
              <span className="text-sm font-semibold text-[var(--text-strong)]">
                {field.suffix === "hrs"
                  ? formatHours(stats[field.key] as number)
                  : formatInt(stats[field.key] as number)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Landings total: {formatInt(stats.landingsTotal)} • Flights: {formatInt(stats.flightsCount)}
        </p>
      </div>
    </section>
  );
}
