# MyPilotPage Product Backlog

This document tracks the work needed to move MyPilotPage from a functional logbook dashboard to a memorable, recruiter-ready pilot profile.

## Product direction

**Working positioning:** A living, recruiter-ready pilot resume powered by your logbook.

Use this statement to prioritize work:

- Imports should make a pilot's experience easier to maintain and trust.
- Public pages should lead with the pilot's identity and qualifications.
- Analytics should support the pilot's story instead of overwhelming it.
- Sharing controls should reflect the sensitivity of logbook, travel, and resume data.

## Current implementation baseline

As of July 9, 2026, the application has:

- Clerk-authenticated accounts with a Prisma/Postgres user and profile record.
- Public profiles addressed by handle, with display name, headline, resume, theme settings, aggregate statistics, recent flights, recency cards, route map, heatmap, and fun facts.
- LogTen TSV and ForeFlight CSV importers with Vercel Blob uploads, import jobs, status polling, warning data, and aggregate rebuilds.
- Transactional flight replacement and aggregate rebuilding for LogTen imports.
- Successful-import artifact deletion attempts for both providers.
- Airport seeding, airport aliases, route reconstruction utilities, and imported flight distance support.
- Profile-specific canonical metadata and Open Graph images.
- A separate demo/static profile renderer and a legacy static-data `/pilot` page in addition to the database-backed profile.

This section records the starting implementation baseline. Backlog checkboxes below track implementation status; partially implemented areas are described narrowly so completed work is not repeated.

## Priority labels

- **P0 — Trust/correctness:** Address before promoting the product broadly.
- **P1 — Core experience:** High-impact work required for a compelling product.
- **P2 — Differentiation:** Features that make MyPilotPage unusually useful or memorable.
- **P3 — Polish:** Smaller consistency, quality, and maintainability improvements.

---

## Phase 1 — Trust, privacy, and launch safety

### P0: Protect imported logbook files

- [ ] Store LogTen and ForeFlight source artifacts privately or behind authenticated, short-lived access.
- [ ] Stop returning Blob URLs from import-status APIs and remove raw Blob links from both import cards.
- [ ] Delete uploaded artifacts after failed imports as well as successful imports.
- [ ] Add scheduled cleanup for abandoned uploads, stale import jobs, and previously orphaned blobs.
- [ ] Make artifact deletion retryable and record whether cleanup succeeded.
- [ ] Clear stored Blob access data after deletion when it is no longer needed for an audit or retry.
- [ ] Document source-file retention and cleanup behavior in the import UI and privacy policy.

**Done when:** A user cannot access another user's raw export through a public URL, successful and failed imports have deterministic retention behavior, and abandoned artifacts are cleaned up automatically.

### P0: Complete account and external-data deletion

- [ ] Inventory a user's resume and outstanding import artifacts before deleting database records.
- [ ] Delete the uploaded resume and all import artifacts during account deletion.
- [ ] Make Blob and Clerk deletion retryable rather than logging and forgetting partial failures.
- [ ] Record a deletion request and per-system cleanup state so partial deletion can be audited safely.
- [ ] Give the user an accurate outcome instead of reporting complete deletion while external cleanup remains.
- [ ] Add integration tests for complete deletion, missing artifacts, and each partial-failure path.

**Done when:** Account deletion removes database records and all externally stored user artifacts, or preserves enough retryable state to finish and accurately report the deletion.

### P0: Make profiles private by default

- [ ] Add a profile-level publication state; new profiles must start unpublished.
- [ ] Add section visibility controls for recent flights, routes, heatmap, recency, fun facts, resume, and future career data.
- [ ] Enforce publication and section visibility in page queries, metadata generation, Open Graph images, and download actions—not only in the UI.
- [ ] Add an owner-only preview that shows the exact public visitor experience before publishing.
- [ ] Prevent unpublished profiles from appearing in search engines, metadata previews, sitemaps, or other discovery surfaces.
- [ ] Explain that routes and recent flight dates may reveal sensitive travel patterns.
- [ ] Evaluate unlisted links with revocation and expiration after published/unpublished behavior is reliable.

**Done when:** Pilots explicitly choose whether a profile is public, choose which sensitive sections are visible, and can verify the visitor experience before sharing it.

### P0: Replace unsupported currency claims

- [ ] Rename database-backed profile “Currency” to “Recent experience” or “Recency indicators.”
- [ ] Remove `CURRENT`/`NOT CURRENT` determinations based only on landing counts or IFR hours.
- [ ] Remove the 200-flight query cap from recency calculations by using complete date-window aggregates or database queries.
- [ ] Clearly label which values come directly from the logbook and which regulatory conclusions cannot be verified.
- [ ] Add date-boundary, timezone, leap-year, empty-history, and high-frequency-history tests.
- [ ] Only reintroduce regulatory currency assessments after the canonical model includes the required takeoff, full-stop landing, approach, hold, and instrument fields and the rules are documented.

**Done when:** Every public status label is supported by imported data and documented calculation rules; incomplete evidence is presented as recent experience rather than legal currency.

### P0: Replace placeholder legal documents

- [ ] Write a real privacy policy covering Clerk, Postgres hosting, Vercel Blob, Resend, retention, deletion, public profiles, and user rights.
- [ ] Write terms that accurately describe the beta product, importer limitations, user responsibilities, and non-authoritative recency data.
- [ ] Add effective dates and a way to announce material policy changes.
- [ ] Review the documents with appropriate legal/privacy guidance before launch.

---

## Phase 2 — Predictable and trustworthy imports

### P1: Bring ForeFlight to LogTen reliability

- [ ] Exempt the ForeFlight Blob completion callback from session-cookie protection, matching the LogTen callback flow.
- [ ] Display the backend's real `importedCount` in the ForeFlight UI instead of “Imported 0 flights (stub).”
- [ ] Stop mining ForeFlight pilot remarks for route airports.
- [ ] Resolve ForeFlight airport codes through the same canonical airport/alias utilities used by LogTen.
- [ ] Tag every ForeFlight flight with provider and import job IDs.
- [ ] Make ForeFlight flight replacement, aggregate rebuilding, and job success atomic.
- [ ] Ensure failure after parsing cannot leave flights and aggregates from different imports.
- [ ] Add representative ForeFlight parsing, mapping, transaction, and rollback tests.

### P1: Give both importers one predictable workflow

- [ ] State clearly that an import currently replaces the active logbook, including what happens when switching providers.
- [ ] Add a pre-import preview with detected provider, row totals, date range, skipped rows, unresolved airports, and field coverage.
- [ ] Require explicit confirmation before replacing existing flights.
- [ ] Add import history with provider, date, row count, warnings, importer version, and status.
- [ ] Preserve or snapshot the previous successful import so a user can roll back.
- [ ] Make retries and duplicate requests idempotent for a given import job.
- [ ] Decide and document whether the long-term model replaces, merges, or deduplicates records from multiple providers.

**Done when:** Both supported importers use the same understandable, atomic, reversible workflow and report accurate results without exposing source files.

---

## Phase 3 — Build the pilot profile, not just the dashboard

### P1: Unify demo, legacy, and real profile rendering

- [ ] Establish one profile view model and one component hierarchy for database profiles, the demo, and any retained static profile.
- [ ] Seed a fictional demo user/profile instead of maintaining a parallel aggregation and rendering implementation.
- [ ] Retire the legacy `/pilot` path and tracked `public/data` pipeline, or explicitly document and test why it remains separate.
- [ ] Ensure every feature shown in the demo is available to real users.
- [ ] Make demo totals, chart baselines, dates, qualifications, and career history tell one coherent story.
- [ ] Add regression tests or visual checks for demo, owner preview, and published profiles.

**Done when:** Product changes flow automatically to demo and real profiles without maintaining parallel page implementations.

### P1: Expand the pilot identity model

- [ ] Add editing and validation for the existing display-name field.
- [ ] Add headshot/avatar and optional profile cover treatment.
- [ ] Add current role, employer, home base/location, and availability/seeking status.
- [ ] Add a longer professional biography alongside the short headline.
- [ ] Add ratings, certificates, medical class/expiration, passport status, FCC license, and work authorization where appropriate.
- [ ] Add aircraft qualifications/type ratings and training milestones.
- [ ] Add career history with employer, role, aircraft, dates, and narrative.
- [ ] Decide which fields can be suggested from a resume and which always require user confirmation.
- [ ] Apply field-level privacy defaults to sensitive identity and qualification data.

### P1: Redesign the public-profile hierarchy

- [ ] Lead with the pilot's name, image, role, base, headline, and primary call to action.
- [ ] Let the pilot choose 3–5 headline metrics relevant to their goals.
- [ ] Promote the route map or another signature visual above secondary analytics.
- [ ] Present career history, qualifications, and aircraft experience before dense recency widgets.
- [ ] Keep recent-flight details and recency data behind optional visibility controls.
- [ ] Reduce nested card borders and create clearly different visual section types.
- [ ] Replace the global marketing-heavy header on shared profiles with a profile-focused header and subtle “Made with MyPilotPage” attribution.
- [ ] Add recruiter-friendly resume, contact, print, share, and QR actions.

**Done when:** A visitor can understand who the pilot is, what they are qualified for, and how to contact them within the first screen.

### P1: Add meaningful layout customization

- [ ] Replace the existing layout placeholder with real section controls.
- [ ] Allow pilots to show/hide and reorder sections.
- [ ] Offer a small set of designed templates, such as Career, General Aviation, Instructor, and Minimal.
- [ ] Preserve accessibility and contrast guardrails across templates.
- [ ] Provide live desktop and mobile previews before saving.
- [ ] Treat arbitrary accent colors as a supplement to templates, not the primary customization feature.

### P1: Replace the checklist dashboard with guided onboarding

- [ ] Create a progress-based onboarding flow: identity, import, review, customize, publish.
- [ ] Show an immediate profile preview after import.
- [ ] Remove internal language such as `/api/private/me` bootstrap instructions and “stubbed” settings.
- [ ] Surface import health, unresolved airports, missing profile fields, and publication readiness.
- [ ] Provide a clear primary next action instead of several equal buttons.
- [ ] Let returning users resume at the first incomplete or unhealthy step.

---

## Phase 4 — Distinctive logbook-powered experiences

### P2: Build a “Pilot Passport”

- [ ] Extend airport seeding to store municipality, region, country, airport type, and elevation from OurAirports.
- [ ] Show airports, states/regions, and countries visited.
- [ ] Aggregate total distance flown where source data supports it, building on the existing per-flight distance field.
- [ ] Highlight northernmost, southernmost, highest-elevation, busiest, and most remote airports.
- [ ] Create shareable passport-style cards from these facts.

### P2: Add aircraft-experience intelligence

- [ ] Normalize aircraft make, model, ICAO type, category/class, engine type, and tail number.
- [ ] Show time and flight counts by aircraft type and category/class.
- [ ] Highlight most-flown aircraft, turbine/multi-engine experience, and recent type experience.
- [ ] Let pilots choose which aircraft experience is public.

### P2: Add a milestone timeline

- [ ] Support manual milestones such as first solo, certificates, checkrides, and type ratings.
- [ ] Derive hour milestones such as 100, 500, 1,000, and ATP minimums from the logbook.
- [ ] Combine derived and manual milestones into a visual career timeline.
- [ ] Allow pilots to feature selected milestones on their public page.

### P2: Make the route map exploratory

- [ ] Filter by date range, aircraft type, role, and route frequency.
- [ ] Add useful airport tooltips with name, location, flight count, and last visit.
- [ ] Make map initialization resilient when containers resize or begin hidden.
- [ ] Add an accessible tabular alternative to map-only information.
- [ ] Consider route animation sparingly and honor reduced-motion preferences.

### P2: Add recruiter and sharing tools

- [ ] Generate a recruiter-focused one-page snapshot.
- [ ] Add PDF export and print styling.
- [ ] Add profile QR codes.
- [ ] Track privacy-respecting profile views and resume downloads.
- [ ] Allow a pilot to create separate public views for airline, instructor, charter, or networking audiences.

---

## Phase 5 — Landing page, discovery, and polish

### P1: Rebuild the landing page around the product outcome

- [ ] Refine the message around a living pilot resume powered by logbook data.
- [ ] Show a large real product preview above the fold.
- [ ] Add a simple three-step flow: import, personalize, share.
- [ ] Show supported logbooks and explain what data is retained.
- [ ] Add use cases for airline applicants, instructors, professional pilots, and general aviation pilots.
- [ ] Add privacy/trust messaging near the upload promise.
- [ ] Add social proof or pilot examples when available.

### P2: Finish sharing and discovery

- [ ] Enhance the existing profile Open Graph image with an optional pilot image and user-selected public stats.
- [ ] Generate sitemap entries for published profiles only.
- [ ] Add structured data where appropriate.
- [ ] Add explicit `noindex` behavior for owner previews, unpublished profiles, and unlisted links.
- [ ] Verify canonical URLs after deciding whether `/p/:handle` or the clean `/:handle` rewrite is authoritative.

### P3: Resolve visible product rough edges

- [ ] Remove the duplicate footer rendered inside the home page.
- [ ] Make pricing navigation consistent between desktop and mobile.
- [ ] Remove “stubbed,” “coming soon,” and implementation-oriented language from active user flows.
- [ ] Correct spelling and terminology in import instructions.
- [ ] Improve chart tick selection so date labels do not overlap.
- [ ] Fix OpenLayers zero-size initialization warnings.
- [ ] Add polished empty, loading, success, and failure states.
- [ ] Audit mobile pages for excessive vertical card stacking.

---

## Engineering foundations

### P1: Establish a reliable development loop

- [x] Fix the cross-platform test command so `npm test` discovers tests on Windows, macOS, Linux, and CI and fails when zero tests are found unexpectedly.
- [x] Add explicit `typecheck`, Prisma validation, and production-build scripts.
- [x] Add CI gates for install, lint, typecheck, unit/integration tests, Prisma validation, production build, and critical production dependency advisories.
- [x] Resolve the existing lint backlog so the CI gate starts from a passing baseline.
- [x] Pin and document the supported Node/npm versions.
- [x] Add `.env.example` with every required variable and safe local defaults where possible.
- [x] Replace the create-next-app README with architecture, setup, migration, seed, importer, storage, testing, and deployment guidance.
- [x] Add deterministic synthetic LogTen and ForeFlight fixtures that do not depend on a developer's personal logbook.
- [x] Add a guarded, deterministic local database seed for profile/onboarding development.
- [x] Separate data generation from scripts that automatically commit and push Git changes.
- [x] Document which generated files are tracked, which are runtime data, and who owns refreshing them.

**Done when:** A new contributor can configure the app, run it locally, exercise representative imports, and obtain the same validation result as CI without private personal data or undocumented steps.

### P1: Simplify authentication and request-time bootstrapping

- [ ] Stop calling `currentUser()` and `ensureUserAndProfile()` from the root layout on every authenticated page request.
- [ ] Bootstrap and synchronize users through a Clerk webhook or explicit onboarding boundary.
- [ ] Make bootstrap retries idempotent and observable.
- [ ] Isolate authenticated navigation data so public pages can remain cacheable where appropriate.
- [ ] Define behavior for webhook delay, email/profile updates, deleted Clerk users, and alpha-cap enforcement.
- [ ] Measure public-profile query count and render time before and after changes.

### P1: Create a shared import architecture

- [ ] Separate provider parsing/mapping from canonical validation, persistence, aggregate rebuilding, and job-state transitions.
- [ ] Extract the duplicated LogTen/ForeFlight replacement and aggregation pipeline into shared services.
- [ ] Use one transaction boundary and one job-state machine for every provider.
- [ ] Define valid import-status transitions and guard them against concurrent requests.
- [ ] Version parsers and aggregate logic so results can be reproduced and rebuilt deterministically.
- [ ] Keep provider-specific source fields and warnings without leaking them into domain calculations.
- [ ] Stream or batch large files instead of retaining complete exports and complete flight histories in memory where practical.

### P1: Expand and constrain the canonical data model

- [ ] Add dual given/received, actual/simulated instrument, day/night takeoffs, full-stop landings, approaches, holds, and relevant aircraft metadata.
- [ ] Preserve provider source IDs and add appropriate uniqueness constraints for deduplication.
- [ ] Define units, nullability, timezone/date semantics, and validation rules for every canonical field.
- [ ] Keep provider mappings separate from regulatory or profile-facing calculations.
- [ ] Add schema support for publication, visibility, identity, qualifications, career history, and deletion state before building their UI.
- [ ] Review indexes and query plans for public-profile and import-history access patterns.

### P2: Move expensive calculations into aggregates

- [ ] Avoid loading every tail number to calculate the most-flown aircraft.
- [ ] Calculate recency from complete database windows rather than capped result sets.
- [ ] Add aggregates for aircraft experience, visited airports, distances, and profile highlights.
- [ ] Rebuild all provider aggregates transactionally through the shared import pipeline.
- [ ] Add a deterministic command/job to rebuild aggregates from canonical flights.

### P1: Add layered automated testing

- [x] Add a dedicated PostgreSQL integration-test harness, guarded test-database migration command, and representative cascade-cleanup test.
- [ ] Add unit tests for both provider parsers, canonical mappings, route utilities, recency rules, theme validation, and handle rules.
- [ ] Add database integration tests for atomic imports, retries, profile visibility, account cleanup, and aggregate rebuilds.
- [ ] Add end-to-end tests for sign-up/onboarding, import/preview/confirm, publish/unpublish, profile viewing, and deletion.
- [ ] Add responsive visual regression checks for the landing page, onboarding, demo, and public profile.
- [ ] Add accessibility checks for color contrast, keyboard navigation, dialogs, charts, maps, and reduced-motion behavior.
- [ ] Use synthetic fixtures only; never place a real user's source logbook in the test suite.

### P1: Improve security and operational resilience

- [ ] Validate uploaded file contents and size before import rather than trusting filename and MIME type alone.
- [ ] Rate-limit upload-token creation, import execution, handle checks, and contact submissions.
- [ ] Add security headers and review Content Security Policy requirements for Clerk, Blob, maps, and analytics.
- [ ] Add structured logs with request, user, and import-job correlation IDs without logging sensitive flight or resume content.
- [ ] Add error monitoring and alerts for failed imports, stale jobs, orphan cleanup, account-deletion failures, and public-page errors.
- [ ] Add a scheduled stale-job reconciler and document operational recovery procedures.
- [x] Fail CI on critical production dependency advisories and test-database migration failures.
- [ ] Upgrade or replace dependencies responsible for the remaining high-severity audit findings, then decide whether CI can enforce a high-severity threshold.

---

## Delivery milestones

Milestones group and sequence the authoritative backlog items above; completion status is tracked in those sections rather than duplicated here.

### Milestone 0 — Reliable development loop

- Reproducible local setup and environment documentation
- Cross-platform test discovery that cannot silently pass with zero tests
- Lint, typecheck, Prisma validation, test, and build CI gates
- Synthetic seed/import fixtures and documented generated-data ownership
- Baseline import, visibility, and cleanup integration-test harness

**Outcome:** Contributors can make changes confidently and receive fast, trustworthy feedback before product-risk work expands.

### Milestone 1 — Private by default

- Private/authenticated import storage and deterministic artifact cleanup
- Complete, retryable account and external-data deletion
- Unpublished-by-default profiles with enforced section visibility
- Owner-only privacy preview and publication controls
- Accurate recency language without unsupported currency claims
- Real privacy policy and terms
- Publication-aware metadata, Open Graph behavior, and indexing rules

**Outcome:** Pilots can import data and prepare a profile without accidentally exposing logbooks, travel patterns, or resumes.

### Milestone 2 — Import with confidence

- ForeFlight callback, attribution, route parsing, and transaction fixes
- Shared import job state machine and atomic aggregate pipeline
- Import preview, validation summary, and explicit replacement confirmation
- Consistent counts, warnings, and status reporting for both providers
- Import history, idempotent retries, and rollback to the previous successful import
- Documented replace/merge policy and provider field coverage

**Outcome:** A pilot can understand, trust, retry, and reverse an import without risking the previous working profile.

### Milestone 3 — Recruiter-ready profile

- Unified demo/real profile renderer and retirement decision for `/pilot`
- Editable identity hero with name, headshot, role, base, biography, and qualifications
- Career history and aircraft experience before secondary analytics
- User-selected headline metrics and route map as a signature visual
- Designed profile templates with section ordering and visibility
- Guided onboarding through import review, preview, and publish
- Recruiter-friendly resume, contact, print, and share actions

**Outcome:** A visitor can quickly understand the pilot's identity, qualifications, experience, and next desired role, while the pilot controls what is shared.

### Milestone 4 — Differentiation and growth

- Pilot Passport and aircraft-experience intelligence
- Career milestone timeline
- Exploratory and accessible route map
- Recruiter snapshots, PDF export, QR codes, and audience-specific views
- Landing page centered on the finished product outcome
- Privacy-respecting sharing analytics, discovery, and social proof

**Outcome:** MyPilotPage becomes meaningfully more useful and memorable than a static resume or generic logbook dashboard.
