# MyPilotPage

MyPilotPage turns an imported pilot logbook into a customizable public profile with flight statistics, recent experience, routes, maps, and resume sharing. The product is currently an alpha; see [`docs/PRODUCT_BACKLOG.md`](docs/PRODUCT_BACKLOG.md) for launch-safety and product milestones.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS
- Clerk authentication
- PostgreSQL through Prisma and the `pg` adapter
- Vercel Blob for logbook and resume uploads
- OpenLayers for route maps
- Resend for contact-form delivery

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- npm 11.3.0 (see `packageManager` in `package.json`)
- PostgreSQL
- A Clerk application for authenticated flows
- A Vercel Blob store for upload flows

## Local setup

1. Select the supported Node version and install dependencies:

   ```bash
   nvm use
   npm install --global npm@11.3.0
   npm ci
   ```

2. Copy `.env.example` to the ignored `.env` file and fill in at least `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

3. Create the PostgreSQL database and apply migrations:

   ```bash
   npm run migrate:deploy
   ```

4. Optionally seed airport metadata, then start the app:

   ```bash
   npm run seed:airports
   npm run dev
   ```

Open `http://localhost:3000`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection used by the application and Prisma CLI |
| `DIRECT_URL` | No | Direct PostgreSQL connection preferred by the airport seed script |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser/client configuration |
| `CLERK_SECRET_KEY` | Yes | Clerk server authentication |
| `BLOB_READ_WRITE_TOKEN` | For uploads | Vercel Blob access for imports and resumes |
| `VERCEL_BLOB_CALLBACK_URL` | Sometimes | Explicit callback origin for client-upload completion; useful locally or behind a proxy |
| `RESEND_API_KEY` | For contact delivery | Resend API authentication |
| `CONTACT_TO_EMAIL` | For contact delivery | Contact-form destination |
| `CONTACT_FROM_EMAIL` | For contact delivery | Verified Resend sender |
| `ALPHA_LIMIT_ENABLED` | No | Enables the account cap when set to `true` |
| `ALPHA_MAX_USERS` | No | Maximum users while the alpha cap is enabled; defaults to `40` |
| `ALLOW_DEV_SEED` | Local seed only | Must be `true` to confirm intentional mutation of a disposable local database |
| `LOGTEN_DB_PATH` | Legacy export only | Local LogTen database read by `npm run export:logten` |
| `TEST_DATABASE_URL` | Integration tests | Dedicated migrated PostgreSQL database; never use shared or production data |

Vercel supplies its own `VERCEL_*` deployment variables. Do not copy secrets into committed files.

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/app` | App Router pages, metadata, and API route handlers |
| `src/components` | Client and server UI components |
| `src/lib` | Prisma access, profile bootstrap, theme rules, route parsing, and map queries |
| `prisma/schema.prisma` | Canonical user, profile, flight, airport, import-job, and aggregate models |
| `prisma/migrations` | Ordered production schema migrations |
| `scripts` | Test runner, database preparation, data generation, and airport seeding |
| `tests/fixtures` | Small synthetic provider exports safe for automated tests |
| `tests/integration` | PostgreSQL integration tests |

Authenticated pages live under `/dashboard`. Public database-backed profiles render at `/p/[handle]`; `next.config.ts` also rewrites clean top-level handles to that route. `/p/demo` and `/pilot` currently use separate static-data implementations and are scheduled for consolidation.

### Import flow

1. The authenticated upload endpoint creates an `ImportJob` and mints a Vercel Blob client-upload token.
2. Vercel's signed completion callback records the uploaded artifact.
3. The user explicitly starts parsing and import.
4. The importer currently replaces that user's active flights and rebuilds profile, day, and route aggregates.
5. Successful imports attempt to delete the source artifact.

LogTen replacement is transactional. ForeFlight still has known transaction, attribution, callback, and route-inference gaps tracked in the backlog. Source artifacts and public-profile publication controls must be treated as alpha limitations until Milestone 1 is complete.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run the Next.js ESLint configuration |
| `npm run typecheck` | Run strict TypeScript checking without emitting files |
| `npm run prisma:validate` | Validate the Prisma schema and configuration |
| `npm test` | Discover and run unit tests; fails if no tests are found |
| `npm run test:db:prepare` | Apply migrations to `TEST_DATABASE_URL` |
| `npm run test:integration` | Run PostgreSQL integration tests; requires `TEST_DATABASE_URL` |
| `npm run check` | Run lint, typecheck, Prisma validation, and unit tests |
| `npm run build` | Build the production application |
| `npm run audit:critical` | Fail on critical production dependency advisories |
| `npm run seed:airports` | Upsert OurAirports data and rebuild unambiguous aliases |
| `npm run seed:dev` | Idempotently seed a synthetic local profile at `/p/dev-pilot`; requires `ALLOW_DEV_SEED=true` |
| `npm run gen:demo` | Regenerate tracked synthetic demo aggregates |
| `npm run data:refresh` | Refresh legacy static profile data without changing Git state |

The repository-owned test runner recursively discovers explicit test suffixes and passes file paths directly to Node, avoiding shell-specific glob behavior. See [`tests/README.md`](tests/README.md) for fixture rules and integration-test safety.

## Validation and CI

The GitHub Actions workflow uses Node 22, npm 11.3.0, and a disposable PostgreSQL service. Every push and pull request runs:

1. Dependency installation
2. ESLint
3. TypeScript checking
4. Prisma validation and migrations
5. Unit and integration tests
6. Production build
7. Critical production-dependency audit

Run `npm run check` before pushing. For the full local sequence, prepare a dedicated test database, run `npm run test:db:prepare`, `npm run test:integration`, and then `npm run build`.

## Data and generated-file ownership

- `data/ourairports/airports.csv` is the airport seed source. Refresh it deliberately from [OurAirports](https://ourairports.com/data/), review the source change, and rerun `npm run seed:airports`.
- `public/demo-data` is tracked synthetic product-demo data generated by `npm run gen:demo`.
- `tests/fixtures` is tracked synthetic test data maintained alongside importer mappings.
- `scripts/seed-dev.mjs` owns the idempotent synthetic local profile; it refuses production/Vercel execution and requires an explicit safety switch.
- `public/data` is tracked legacy `/pilot` output produced from a local LogTen database by `npm run data:refresh`. It is web-public after deployment and must not contain information that is not intentionally public.
- Runtime user flights, profiles, import jobs, and aggregates belong in PostgreSQL—not tracked JSON.
- Uploaded source logbooks and resumes belong in Blob storage—not the repository.

Generation commands never stage, commit, or push changes. Review generated diffs and perform Git operations separately.

## Deployment

The production target is Vercel. Configure the production environment variables in Vercel, apply Prisma migrations with `npm run migrate:deploy`, and use `npm run vercel-build` for the application build. Do not run the legacy LogTen export as an implicit deployment step; refresh and review tracked static data separately when it is intentionally retained.

Before broader promotion, complete the privacy, retention, publication, and legal work in Milestone 1 of the product backlog.
