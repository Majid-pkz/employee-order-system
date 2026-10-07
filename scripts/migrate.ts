import "dotenv/config";
import { databaseConfig } from "../src/lib/database-config";
import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Split Prisma's SQL migrations without cutting quoted strings or comments.
function statements(sql: string) {
  const result: string[] = [];
  let current = "", quote = "", lineComment = false, blockComment = false;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i], next = sql[i + 1];
    if (lineComment) { if (char === "\n") { lineComment = false; current += "\n"; } continue; }
    if (blockComment) { if (char === "*" && next === "/") { blockComment = false; i++; } continue; }
    if (!quote && char === "-" && next === "-") { lineComment = true; i++; continue; }
    if (!quote && char === "/" && next === "*") { blockComment = true; i++; continue; }
    if (quote) {
      current += char;
      if (char === quote) { if (next === quote) { current += next; i++; } else quote = ""; }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") { quote = char; current += char; continue; }
    if (char === ";") { if (current.trim()) result.push(current.trim()); current = ""; } else current += char;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}
async function main() {
  const client = createClient(databaseConfig(process.env, false));
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY, "checksum" TEXT NOT NULL, "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`);
    const root = path.join(process.cwd(), "prisma", "migrations");
    const dirs = (await readdir(root, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort();
    for (const name of dirs) {
      const sql = await readFile(path.join(root, name, "migration.sql"), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const applied = await client.execute({ sql: 'SELECT "checksum", "finished_at", "rolled_back_at" FROM "_prisma_migrations" WHERE "migration_name" = ? ORDER BY "started_at" DESC LIMIT 1', args: [name] });
      const previous = applied.rows[0];
      if (previous?.finished_at && !previous.rolled_back_at) {
        if (previous.checksum !== checksum) throw new Error("Applied migration has changed: " + name);
        continue;
      }
      if (previous && !previous.rolled_back_at) throw new Error("Resolve the previous failed migration before continuing: " + name);
      const tx = await client.transaction("write");
      try {
        // Defer checks through SQLite table rebuilds; committed data must satisfy all foreign keys.
        await tx.execute("PRAGMA defer_foreign_keys = ON");
        for (const statement of statements(sql)) {
          if (/^PRAGMA (foreign_keys|defer_foreign_keys)\s*=/i.test(statement)) continue;
          await tx.execute(statement);
        }
        const violations = await tx.execute("PRAGMA foreign_key_check");
        if (violations.rows.length) throw new Error("Migration would leave invalid foreign keys: " + name);
        await tx.execute({ sql: 'INSERT INTO "_prisma_migrations" ("id","checksum","migration_name","finished_at","applied_steps_count") VALUES (?,?,?,?,1)', args: [randomUUID(), checksum, name, new Date().toISOString()] });
        await tx.commit();
        console.log("Applied migration:", name);
      } catch (error) { await tx.rollback(); throw error; }
      finally { tx.close(); }
    }
    console.log("Database migrations are up to date.");
  } finally { client.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Migration failed."); process.exitCode = 1; });
