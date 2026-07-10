import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const suite = process.argv[2] ?? "unit";
const suiteConfig = {
  unit: {
    roots: ["src"],
    matches: (name) => name.endsWith(".test.ts") && !name.endsWith(".integration.test.ts"),
  },
  integration: {
    roots: ["tests/integration"],
    matches: (name) => name.endsWith(".integration.test.ts"),
  },
};

const config = suiteConfig[suite];
if (!config) {
  console.error(`Unknown test suite "${suite}". Expected one of: ${Object.keys(suiteConfig).join(", ")}.`);
  process.exit(1);
}

if (suite === "integration" && !process.env.TEST_DATABASE_URL) {
  console.error("TEST_DATABASE_URL is required for integration tests. Use a dedicated, migrated test database.");
  process.exit(1);
}

async function collectTests(directory, matches) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTests(entryPath, matches)));
    } else if (entry.isFile() && matches(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

const files = (
  await Promise.all(config.roots.map((root) => collectTests(path.resolve(root), config.matches)))
)
  .flat()
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  console.error(`No ${suite} test files were discovered. Refusing to report a false success.`);
  process.exit(1);
}

console.log(`Discovered ${files.length} ${suite} test file${files.length === 1 ? "" : "s"}.`);

const child = spawnSync(
  process.execPath,
  [
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
    "--experimental-strip-types",
    "--test",
    ...files,
  ],
  {
    env:
      suite === "integration"
        ? { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
        : process.env,
    stdio: "inherit",
  },
);

if (child.error) {
  console.error(child.error);
  process.exit(1);
}

process.exit(child.status ?? 1);
