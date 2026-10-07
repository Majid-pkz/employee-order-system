import { createHash } from "node:crypto";
import { databaseConfig } from "./database-config";

export function databaseDiagnostics(env: Record<string, string | undefined>) {
  const config = databaseConfig(env);
  const destination = new URL(config.url);
  destination.username = "";
  destination.password = "";
  destination.search = "";
  destination.hash = "";
  return {
    source: env.DATABASE_URL ? "DATABASE_URL" : env.TURSO_DATABASE_URL ? "TURSO_DATABASE_URL" : "development default",
    mode: destination.protocol === "file:" ? "local" : "hosted",
    fingerprint: createHash("sha256").update(destination.toString()).digest("hex").slice(0, 16),
  };
}
