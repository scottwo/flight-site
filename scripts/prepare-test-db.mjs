import path from "node:path";
import { spawnSync } from "node:child_process";

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) {
  console.error("TEST_DATABASE_URL is required. Refusing to migrate an unspecified database.");
  process.exit(1);
}

const prismaCli = path.resolve("node_modules", "prisma", "build", "index.js");
const child = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  env: { ...process.env, DATABASE_URL: connectionString },
  stdio: "inherit",
});

if (child.error) {
  console.error(child.error);
  process.exit(1);
}

process.exit(child.status ?? 1);
