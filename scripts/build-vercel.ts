import "dotenv/config";
import { spawnSync } from "node:child_process";
import { databaseConfig } from "../src/lib/database-config";
import { passcodeSchema } from "../src/lib/validation";

async function main() {
  if (process.env.DEMO_MODE !== "true") {
    throw new Error("This Vercel build is for the portfolio demo. Set DEMO_MODE=true and use a separate Turso database.");
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    throw new Error("Set a unique AUTH_SECRET containing at least 32 characters.");
  }
  passcodeSchema.parse(process.env.DEMO_EMPLOYEE_PASSWORD);
  passcodeSchema.parse(process.env.DEMO_ADMIN_PASSWORD);
  const config = databaseConfig(process.env, false);
  if (!config.url.startsWith("libsql://")) {
    throw new Error("Vercel requires a hosted Turso database; local SQLite files are not persistent.");
  }
  const env = { ...process.env, DATABASE_URL: config.url, DATABASE_AUTH_TOKEN: config.authToken };
  const run = (args: string[]) => {
    const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Deployment preparation failed. Check the preceding log.");
  };
  // Provisioning is explicit. Ordinary builds never inspect or change database data.
  if (process.env.ALLOW_DEMO_SEED === "true") {
    run(["--import", "tsx", "scripts/prepare-demo.ts"]);
  } else {
    console.log("Building the existing demo without database setup. Apply schema changes with npm run db:prepare-demo before deploying.");
  }
  run(["node_modules/prisma/build/index.js", "generate"]);
  run(["node_modules/next/dist/bin/next", "build"]);
}
main().catch(error => {
  console.error(error instanceof Error ? error.message : "Vercel build failed.");
  process.exitCode = 1;
});
