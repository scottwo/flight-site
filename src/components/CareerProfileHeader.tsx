type QualificationGroup = {
  label: string;
  values: string[];
};

type Props = {
  displayName: string;
  handle?: string;
  currentRole?: string | null;
  homeBase?: string | null;
  headline?: string | null;
  availability?: string | null;
  contactEmail?: string | null;
  resumeUrl?: string | null;
  snapshotUrl?: string | null;
  qualificationGroups?: QualificationGroup[];
};

export default function CareerProfileHeader({
  displayName,
  handle,
  currentRole,
  homeBase,
  headline,
  availability,
  contactEmail,
  resumeUrl,
  snapshotUrl,
  qualificationGroups = [],
}: Props) {
  const visibleGroups = qualificationGroups.filter((group) => group.values.length > 0);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] shadow-sm">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-2)]">
              Recruiter-ready pilot profile
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
              {displayName}
            </h1>
            <p className="text-lg font-semibold text-[var(--accent)]">
              {[currentRole, homeBase].filter(Boolean).join(" · ") || (handle ? `@${handle}` : "Professional pilot")}
            </p>
            {headline ? <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">{headline}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition hover:opacity-90"
              >
                Contact pilot
              </a>
            ) : null}
            {snapshotUrl ? (
              <a
                href={snapshotUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel)]"
              >
                Recruiter snapshot
              </a>
            ) : null}
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-muted)]"
              >
                Download resume
              </a>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 rounded-3xl bg-[var(--panel-muted)] p-5 sm:p-6">
          {availability ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">Availability</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{availability}</p>
            </div>
          ) : null}
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-2)]">{group.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text)]">{group.values.join(" · ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
