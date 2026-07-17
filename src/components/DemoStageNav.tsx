import Link from "next/link";

const DEMOS = [
  { id: "commercial", step: "01", label: "500 TT commercial", detail: "First non-CFI flying role", href: "/p/demo-commercial" },
  { id: "cfi", step: "02", label: "ATP-minimum CFI", detail: "First regional airline role", href: "/p/demo-cfi" },
  { id: "captain", step: "03", label: "Airline captain", detail: "Major-airline transition", href: "/p/demo" },
] as const;

export type DemoStage = (typeof DEMOS)[number]["id"];

export default function DemoStageNav({ active }: { active: DemoStage }) {
  return (
    <nav aria-label="Demo career stages" className="sticky top-[61px] z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_94%,transparent)] shadow-[0_10px_32px_rgba(0,0,0,.12)] backdrop-blur-xl sm:top-[69px]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-2 py-2 sm:px-6 lg:px-8">
        <div className="mr-5 hidden shrink-0 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-2)]">Explore career stages</p>
          <p className="text-xs font-semibold text-[var(--text)] lg:mt-1">Three pilots. Three goals.</p>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1.5 sm:gap-2">
          {DEMOS.map((demo) => {
            const selected = demo.id === active;
            return (
              <Link scroll={false} key={demo.id} href={demo.href} aria-current={selected ? "page" : undefined} className={`group grid min-h-12 grid-cols-1 items-center gap-2 rounded-xl border px-2 py-2 text-center transition sm:grid-cols-[auto_1fr] sm:px-3 sm:text-left ${selected ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--panel))] shadow-sm" : "border-transparent hover:border-[var(--border)] hover:bg-[var(--panel-muted)]"}`}>
                <span className={`hidden h-7 w-7 items-center justify-center rounded-lg font-mono text-[9px] font-semibold sm:flex ${selected ? "bg-[var(--accent)] text-[var(--accent-text)]" : "bg-[var(--panel-muted)] text-[var(--muted-2)]"}`}>{demo.step}</span>
                <span><span className="block text-[10px] font-semibold leading-4 text-[var(--text)] sm:text-xs">{demo.label}</span><span className="mt-0.5 hidden text-[10px] text-[var(--muted)] xl:block">{demo.detail}</span></span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
