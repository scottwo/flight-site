# Test data and integration harness

All files under `tests/fixtures` must be synthetic, small, deterministic, and safe to commit. Never copy a real pilot's logbook, resume, email address, Clerk identifier, or Blob URL into this directory.

## Suites

- `npm test` recursively discovers unit tests under `src` and fails if it finds none.
- `npm run test:integration` recursively discovers `*.integration.test.ts` under `tests/integration`. It requires `TEST_DATABASE_URL` and fails before running if that variable is absent.

Apply the Prisma migrations to the dedicated test database before running integration tests:

```bash
npm run test:db:prepare
npm run test:integration
```

The integration database must never point to development, staging, or production data. Tests own records whose Clerk IDs begin with `integration-` and clean those records up after each run. Future import, publication/visibility, and external-cleanup integration tests should reuse this suite and the synthetic provider fixtures.

## Fixture ownership

- `tests/fixtures/imports/logten-synthetic.tsv` is the canonical small LogTen example.
- `tests/fixtures/imports/foreflight-synthetic.csv` is the canonical small ForeFlight example.
- Update a fixture only when its provider mapping or a deliberate parser edge case changes.
- Add a regression fixture with the smallest possible synthetic row set when fixing an importer bug.
