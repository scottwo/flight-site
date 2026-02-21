"use client";

type Point = {
  date: string; // YYYY-MM-DD
  total: number;
  cumulative: number;
};

type Props = {
  data: Point[];
  totalHours: number;
  yAxisMin?: number;
};

function formatDateLabel(date: string) {
  const [year, month] = date.split("-");
  return `${month}/${year.slice(-2)}`;
}

export function CumulativeHoursChart({ data, totalHours, yAxisMin }: Props) {
  if (!data || data.length < 2) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Cumulative flight time</h2>
            <p className="text-sm text-[var(--muted)]">Total hours over time</p>
          </div>
          <span className="text-sm font-semibold text-[var(--muted)]">Not enough flights yet</span>
        </div>
      </section>
    );
  }

  const width = 900;
  const height = 260;
  const padding = 40;

  const minDataY = Math.min(...data.map((d) => d.cumulative));
  const minY = yAxisMin !== undefined ? Math.min(yAxisMin, minDataY) : 0;
  const maxY = Math.max(...data.map((d) => d.cumulative), minY + 1);
  const rangeY = Math.max(1, maxY - minY);
  const minDate = new Date(`${data[0].date}T00:00:00Z`).getTime();
  const maxDate = new Date(`${data[data.length - 1].date}T00:00:00Z`).getTime();
  const rangeX = Math.max(1, maxDate - minDate);

  const points = data.map((d) => {
    const x = padding + ((new Date(`${d.date}T00:00:00Z`).getTime() - minDate) / rangeX) * (width - padding * 2);
    const y = height - padding - ((d.cumulative - minY) / rangeY) * (height - padding * 2);
    return { x, y };
  });

  const path = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  // pick a handful of ticks: first, last, and roughly monthly
  const tickIndices = new Set<number>([0, points.length - 1]);
  const approxMonthly = Math.max(1, Math.floor(points.length / 6));
  for (let i = approxMonthly; i < points.length - 1; i += approxMonthly) tickIndices.add(i);

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = minY + (rangeY / yTicks) * i;
    const y =
      height -
      padding -
      ((value - minY) / rangeY) * (height - padding * 2);
    return { value, y };
  });

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Cumulative flight time</h2>
          <p className="text-sm text-[var(--muted)]">Total hours over time</p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-1 text-sm font-semibold text-[var(--text-strong)]">
          {totalHours.toFixed(1)} hrs
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Cumulative flight time line chart"
          className="w-full min-w-[640px] text-[var(--accent)]"
        >
          <rect
            x={padding}
            y={padding}
            width={width - padding * 2}
            height={height - padding * 2}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
          {yLabels.map((tick, idx) => (
            <g key={`y-${idx}`} transform={`translate(0, ${tick.y})`}>
              <line
                x1={padding - 6}
                x2={padding}
                y1={0}
                y2={0}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={3}
                textAnchor="end"
                className="fill-[var(--muted)] text-[10px]"
                fontFamily="inherit"
              >
                {tick.value.toFixed(0)}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r={3} fill="currentColor" opacity={0.85} />
          ))}
          {Array.from(tickIndices)
            .sort((a, b) => a - b)
            .map((i) => {
              const p = points[i];
              const label = formatDateLabel(data[i].date);
              return (
                <g key={`tick-${i}`} transform={`translate(${p.x}, ${height - padding + 16})`}>
                  <line x1="0" y1={-16} x2="0" y2="-8" stroke="var(--border)" strokeWidth="1" />
                  <text
                    x={0}
                    y={8}
                    textAnchor="middle"
                    className="fill-[var(--muted)] text-[10px]"
                    fontFamily="inherit"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          <text
            x={padding - 10}
            y={padding - 10}
            textAnchor="end"
            className="fill-[var(--muted)] text-[11px]"
            fontFamily="inherit"
          >
            Hours
          </text>
        </svg>
      </div>
    </section>
  );
}
