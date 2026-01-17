export type FunFact = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  score?: number;
};

type Props = {
  facts: FunFact[];
};

export function FunFacts({ facts }: Props) {
  if (!facts.length) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">Fun facts</h2>
        <p className="text-sm text-[var(--muted)]">Import data to see quick highlights about this pilot.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Fun facts</h2>
        <p className="text-sm text-[var(--muted)]">A few quick highlights from this logbook.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)]">
              {fact.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">{fact.value}</p>
            {fact.detail && <p className="text-sm text-[var(--muted)]">{fact.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
