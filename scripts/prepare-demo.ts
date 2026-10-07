import "dotenv/config";
import { createClient } from "@libsql/client";
import { spawnSync } from "node:child_process";
import { databaseConfig } from "../src/lib/database-config";
import { assertDemoDatabase } from "../src/lib/demo-deployment";
import { passcodeSchema } from "../src/lib/validation";

async function main() {
  if (process.env.DEMO_MODE !== "true") {
    throw new Error("Demo preparation requires DEMO_MODE=true and a separate demonstration database.");
  }
  const seed = process.env.ALLOW_DEMO_SEED === "true";
  if (seed) {
    passcodeSchema.parse(process.env.DEMO_EMPLOYEE_PASSWORD);
    passcodeSchema.parse(process.env.DEMO_ADMIN_PASSWORD);
  }
  const config = databaseConfig(process.env, false);
  const client = createClient(config);
  let seeded: boolean;
  try {
    seeded = await assertDemoDatabase(
      client,
      process.env.DEMO_EMPLOYEE_ID || "DEMO001",
      process.env.DEMO_ADMIN_USERNAME || "demo-admin",
    );
  } finally { client.close(); }
  if (!seeded && !seed) {
    throw new Error("The selected database has no primary demo account. Check the database configuration; set ALLOW_DEMO_SEED=true only to initialize the dedicated demo database.");
  }
  const env = { ...process.env, DATABASE_URL: config.url, DATABASE_AUTH_TOKEN: config.authToken };
  const run = (script: string) => {
    const result = spawnSync(process.execPath, ["--import", "tsx", script], { env, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Demo preparation failed. Check the preceding log.");
  };
  // Inspect before migrations or seed writes, including explicit schema upgrades.
  run("scripts/migrate.ts");
  if (seed) run("scripts/seed-demo.ts");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Demo preparation failed.");
  process.exitCode = 1;
});
