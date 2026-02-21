"use client";

import { useMemo } from "react";

type HeatmapPoint = {
  day: string; // YYYY-MM-DD
  totalTime: number;
  flightsCount: number;
};

type Props = {
  data: HeatmapPoint[];
  title?: string;
};

type DayCell = {
  date: Date;
  iso: string;
  value: number;
};

const DAY_MS = 86_400_000;
const WEEKS = 26;

function buildRange(start: Date, end: Date) {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

export function Heatmap({ data, title = "Recent flying" }: Props) {
  const { weeks, maxValue } = useMemo(() => {
    const parsed = data.map((d) => {
      const date = new Date(`${d.day}T00:00:00Z`);
      return {
        date,
        iso: d.day,
        value: d.totalTime ?? 0,
      };
    });

    const today = new Date();
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const start = new Date(end.getTime() - (WEEKS * 7 - 1) * DAY_MS);
    const range = buildRange(start, end);
    const valueByIso = new Map(parsed.map((p) => [p.iso, p.value]));

    const cells: DayCell[] = range.map((date) => {
      const iso = date.toISOString().slice(0, 10);
      return {
        date,
        iso,
        value: valueByIso.get(iso) ?? 0,
      };
    });

    const weeksBuilt: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeksBuilt.push(cells.slice(i, i + 7));
    }

    const maxValue = cells.reduce((m, p) => (p.value > m ? p.value : m), 0);
    return { weeks: weeksBuilt, maxValue };
  }, [data]);

  const levels = (value: number) => {
    if (maxValue === 0 || value === 0) return 0;
    const ratio = value / maxValue;
    if (ratio > 0.66) return 3;
    if (ratio > 0.33) return 2;
    return 1;
  };

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
          <p className="text-sm text-[var(--muted)]">Hours flown per day</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-2 py-1">Less</span>
          {[1, 2, 3].map((l) => (
            <span
              key={l}
              className="h-3.5 w-3.5 rounded-sm bg-[var(--accent)] sm:h-4 sm:w-4"
              style={{ opacity: 0.2 + l * 0.2 }}
            />
          ))}
          <span className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-2 py-1">More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[420px] gap-1 pb-1 sm:min-w-0">
          {weeks.map((week, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {week.map((day) => {
                const level = levels(day.value);
                const opacity = level === 0 ? 0.1 : 0.2 + level * 0.2;
                return (
                  <div
                    key={day.iso}
                    className="h-3 w-3 rounded-sm border border-[var(--border)] bg-[var(--accent)] sm:h-4 sm:w-4"
                    style={{ opacity }}
                    title={`${day.iso} – ${day.value.toFixed(1)} hrs`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
