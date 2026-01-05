type FunFact = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  score?: number;
};

const PRIORITY = [
  "furthest_leg",
  "most_frequent_route",
  "biggest_day_hours",
  "unique_airports",
  "longest_flight_time",
  "avg_flight_duration",
  "longest_streak",
  "busiest_day_flights",
  "most_northern",
  "most_southern",
];

function selectFunFacts(facts: FunFact[] = [], max = 4) {
  if (!facts.length) return [];
  const byId = new Map(facts.map((f) => [f.id, f]));
  const chosen: FunFact[] = [];
  for (const id of PRIORITY) {
    const fact = byId.get(id);
    if (fact) chosen.push(fact);
    if (chosen.length >= max) break;
  }
  if (chosen.length < max) {
    const remaining = facts
      .filter((f) => !chosen.find((c) => c.id === f.id))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    for (const f of remaining) {
      if (chosen.length >= max) break;
      chosen.push(f);
    }
  }
  return chosen.slice(0, max);
}

export default function FunFacts({ facts }: { facts?: FunFact[] }) {
  const selected = selectFunFacts(facts, 4);
  if (!selected.length) return null;

  return (
    <section className="mt-10 rounded-3xl border border-[#d4e0ec] bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#0b1f33]">Fun facts</h2>
        <p className="text-sm text-[#4b647c]">A few quick highlights from your logbook.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {selected.map((fact) => (
          <div
            key={fact.id}
            className="rounded-2xl border border-[#d4e0ec] bg-[#f3f7fc] p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5d7995]">
              {fact.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#0b1f33]">{fact.value}</p>
            {fact.detail && <p className="text-sm text-[#35506c]">{fact.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
