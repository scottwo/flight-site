# MyPilotPage Product Backlog

This document tracks the work needed to move MyPilotPage from a functional logbook dashboard to a memorable, recruiter-ready pilot profile.

## Product direction

**Working positioning:** A living, recruiter-ready pilot resume powered by your logbook.

Use this statement to prioritize work:

- Imports should make a pilot's experience easier to maintain and trust.
- Public pages should lead with the pilot's identity and qualifications.
- Analytics should support the pilot's story instead of overwhelming it.
- Sharing controls should reflect the sensitivity of logbook, travel, and resume data.

## Priority labels

- **P0 — Trust/correctness:** Address before promoting the product broadly.
- **P1 — Core experience:** High-impact work required for a compelling product.
- **P2 — Differentiation:** Features that make MyPilotPage unusually useful or memorable.
- **P3 — Polish:** Smaller consistency, quality, and maintainability improvements.

---

## Phase 1 — Trust, privacy, and correctness

### P0: Protect imported logbook files

- [ ] Move LogTen and ForeFlight artifacts away from public Blob access.
- [ ] Delete uploaded artifacts after both successful and failed imports.
- [ ] Add cleanup for abandoned uploads and stale import jobs.
- [ ] Avoid displaying raw Blob URLs in the import UI.
- [ ] Document retention behavior for uploaded source files.

**Done when:** A user cannot access another user's raw export through a public URL, and abandoned artifacts are cleaned up automatically.

### P0: Complete account and blob deletion

- [ ] Delete uploaded resumes when an account is deleted.
- [ ] Delete outstanding import artifacts when an account is deleted.
- [ ] Make external cleanup retryable if Blob or Clerk deletion fails.
- [ ] Record enough state to audit a partial deletion safely.

**Done when:** Account deletion removes database records and all externally stored user artifacts, or clearly reports a retryable failure.

### P0: Add profile publishing and privacy controls

- [ ] Add a profile-level `published` state; new profiles should not be public by accident.
- [ ] Add section visibility controls for recent flights, routes, heatmap, recency, fun facts, resume, and career history.
- [ ] Add a privacy-focused public preview before publishing.
- [ ] Consider private/unlisted share links with revocation and expiration.
- [ ] Explain that routes and recent flight dates may reveal sensitive travel patterns.

**Done when:** Pilots explicitly choose what is public and can preview the exact visitor experience.

### P0: Replace unsupported currency claims

- [ ] Rename dynamic-profile "Currency" to "Recent experience" or "Recency indicators" until the required source data is available.
- [ ] Remove `CURRENT`/`NOT CURRENT` determinations based only on landing counts or IFR hours.
- [ ] Remove the 200-flight cap from recency calculations, or calculate recency in database aggregates.
- [ ] Import and model day/night takeoffs, full-stop landings, approaches, holds, and actual/simulated instrument experience.
- [ ] Clearly identify any requirement that cannot be verified from imported fields.
- [ ] Add tests around date windows and high-frequency flight histories.

**Done when:** Every status label is supported by the imported data and documented calculation rules.

### P0: Replace placeholder legal documents

- [ ] Write a real privacy policy covering Clerk, Neon/Postgres, Vercel Blob, Resend, retention, deletion, public profiles, and user rights.
- [ ] Write terms that accurately describe the beta product and its limitations.
- [ ] Add effective dates and a way to announce material policy changes.
- [ ] Review the documents with appropriate legal/privacy guidance before launch.

### P1: Finish and harden every importer

- [ ] Exempt the ForeFlight Blob completion callback from session-cookie protection, matching the LogTen callback flow.
- [ ] Replace the ForeFlight "Imported 0 flights (stub)" result with the real imported count.
- [ ] Remove arbitrary remarks-to-route inference from ForeFlight.
- [ ] Tag ForeFlight flights with provider and import job IDs.
- [ ] Make ForeFlight replacement and aggregate rebuilds atomic.
- [ ] Add importer preview, validation summary, skipped-row list, and confirmation before replacement.
- [ ] Add import history with provider, date, row count, warnings, and status.
- [ ] Add rollback or restore of the previous successful import.
- [ ] Explain whether importing a different provider replaces or combines with existing flights.

**Done when:** Both supported importers provide the same predictable, reversible workflow and accurate status reporting.

---

## Phase 2 — Build the pilot profile, not just the dashboard

### P1: Unify demo and real profile rendering

- [ ] Replace the separate hard-coded demo profile with the same components and schema used by real profiles.
- [ ] Seed a fictional demo user/profile instead of maintaining a parallel product implementation.
- [ ] Ensure every feature shown in the demo is available to real users.
- [ ] Make demo totals, chart baselines, dates, qualifications, and career history tell one coherent story.
- [ ] Add regression tests or visual checks for both demo and real profiles.

**Done when:** Product changes automatically affect the demo and real profiles together.

### P1: Expand the pilot identity model

- [ ] Add an editable display name.
- [ ] Add headshot/avatar and optional profile cover treatment.
- [ ] Add current role, employer, home base/location, and availability/seeking status.
- [ ] Add a longer professional biography alongside the short headline.
- [ ] Add ratings, certificates, medical class/expiration, passport status, FCC license, and work authorization where appropriate.
- [ ] Add aircraft qualifications/type ratings and training milestones.
- [ ] Add career history with employer, role, aircraft, dates, and narrative.
- [ ] Decide which fields can be derived from a resume and which require user confirmation.

### P1: Redesign the public-profile hierarchy

- [ ] Lead with the pilot's name, image, role, base, headline, and primary call to action.
- [ ] Let the pilot choose 3–5 headline metrics relevant to their goals.
- [ ] Promote the route map or another signature visual above secondary analytics.
- [ ] Present career history, qualifications, and aircraft experience before dense recency widgets.
- [ ] Move recent-flight details and recency data behind optional visibility controls.
- [ ] Reduce nested card borders and create clearly different visual section types.
- [ ] Replace the global marketing-heavy header on shared profiles with a profile-focused header and subtle "Made with MyPilotPage" attribution.
- [ ] Add recruiter-friendly resume, contact, print, share, and QR actions.

**Done when:** A visitor can understand who the pilot is, what they are qualified for, and how to contact them within the first screen.

### P1: Add meaningful layout customization

- [ ] Implement the existing layout-toggle placeholder.
- [ ] Allow pilots to show/hide and reorder sections.
- [ ] Offer a small set of designed templates, such as Career, General Aviation, Instructor, and Minimal.
- [ ] Preserve accessibility and contrast guardrails across templates.
- [ ] Provide live desktop and mobile previews before saving.
- [ ] Treat arbitrary accent colors as a supplement to templates, not the primary customization feature.

### P1: Replace the checklist dashboard with guided onboarding

- [ ] Create a progress-based onboarding flow: identity, import, review, customize, publish.
- [ ] Show an immediate profile preview after import.
- [ ] Replace internal language such as `/api/private/me` bootstrap instructions.
- [ ] Surface import health, unresolved airports, missing profile fields, and publication readiness.
- [ ] Provide a clear primary next action instead of several equal buttons.

---

## Phase 3 — Distinctive logbook-powered experiences

### P2: Build a "Pilot Passport"

- [ ] Store airport municipality, region, country, and airport type from OurAirports.
- [ ] Show airports, states/regions, and countries visited.
- [ ] Calculate total distance flown where source data supports it.
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

## Phase 4 — Landing page, growth, and polish

### P1: Rebuild the landing page around the product outcome

- [ ] Refine the message around a living pilot resume powered by logbook data.
- [ ] Show a large real product preview above the fold.
- [ ] Add a simple three-step flow: import, personalize, share.
- [ ] Show supported logbooks and explain what data is retained.
- [ ] Add use cases for airline applicants, instructors, professional pilots, and general aviation pilots.
- [ ] Add privacy/trust messaging near the upload promise.
- [ ] Add social proof or pilot examples when available.

### P3: Resolve visible product rough edges

- [ ] Remove the duplicate footer rendered inside the home page.
- [ ] Make pricing navigation consistent between desktop and mobile.
- [ ] Remove "stubbed," "coming soon," and implementation-oriented language from active user flows.
- [ ] Correct spelling and terminology in import instructions.
- [ ] Improve chart tick selection so date labels do not overlap.
- [ ] Fix OpenLayers zero-size initialization warnings.
- [ ] Add polished empty, loading, success, and failure states.
- [ ] Audit mobile pages for excessive vertical card stacking.

### P2: Improve sharing and discovery

- [ ] Add branded, profile-specific Open Graph previews with a pilot image and selected stats.
- [ ] Add canonical profile URLs and sitemap support for published profiles only.
- [ ] Add structured data where appropriate.
- [ ] Ensure unpublished or private profiles cannot be indexed.

---

## Engineering foundations

### P1: Simplify request-time profile bootstrapping

- [ ] Stop calling `currentUser()` and `ensureUserAndProfile()` from the root layout on every authenticated page request.
- [ ] Bootstrap users during sign-up/webhook/onboarding instead of during general rendering.
- [ ] Isolate authenticated navigation data so public pages can remain cacheable where appropriate.
- [ ] Measure public-profile query count and render time before and after changes.

### P1: Expand the canonical flight model

- [ ] Add dual given/received, actual/simulated instrument, takeoffs, approaches, holds, distance, and relevant aircraft metadata.
- [ ] Define provider mappings separately from canonical domain calculations.
- [ ] Preserve provider source IDs where available for deduplication.
- [ ] Version importer behavior so aggregates can be rebuilt deterministically.
- [ ] Add shared parsing and route utilities instead of duplicating logic across providers.

### P2: Move expensive calculations into aggregates

- [ ] Avoid loading every tail number to calculate the most-flown aircraft.
- [ ] Calculate recency from complete database windows rather than capped result sets.
- [ ] Add aggregates for aircraft experience, visited airports, and profile highlights.
- [ ] Rebuild aggregates transactionally during import.

### P2: Add quality gates

- [ ] Resolve the existing full-project lint backlog.
- [ ] Add tests for importer parsing, recency calculations, profile visibility, and account cleanup.
- [ ] Add responsive visual regression checks for the landing page, onboarding, and public profile.
- [ ] Add accessibility checks for color contrast, keyboard navigation, charts, and maps.
- [ ] Add monitoring for failed imports, orphaned uploads, and public-page errors.

---

## Suggested next milestone

The next cohesive milestone should combine trust and visible product value:

- [ ] Private import storage and cleanup
- [ ] Accurate recency language/calculations
- [ ] Publish and section visibility controls
- [ ] Unified demo/real profile renderer
- [ ] New identity hero with editable name, headshot, role, base, and qualifications
- [ ] User-selectable headline metrics
- [ ] Route map promoted as the signature visual
- [ ] Guided onboarding through preview and publish

Completing this milestone should produce a profile pilots are comfortable publishing and proud to share.

