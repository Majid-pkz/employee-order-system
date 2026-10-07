import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
async function main() {
  const root = path.join(process.cwd(), ".test-data");
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !url.startsWith("file:" + root + "/")) throw new Error("Tests may reset databases only inside .test-data.");
  await mkdir(root, { recursive: true });
  const filename = url.slice(5);
  for (const suffix of ["", "-journal", "-wal", "-shm"]) await rm(filename + suffix, { force: true });
  const env = { ...process.env, DATABASE_URL: url, DEMO_MODE: "true", ALLOW_DEMO_SEED: "true", DEMO_EMPLOYEE_ID: "DEMO001", DEMO_EMPLOYEE_PASSWORD: "PantryDemo2026!", DEMO_ADMIN_USERNAME: "demo-admin", DEMO_ADMIN_PASSWORD: "AdminPantry2026!" };
  for (const script of ["scripts/migrate.ts", "scripts/seed-demo.ts"]) {
    const result = spawnSync(process.execPath, ["--import", "tsx", script], { env, stdio: "inherit" });
    if (result.status !== 0) throw new Error("Test fixture preparation failed.");
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Fixture preparation failed."); process.exitCode = 1; });
