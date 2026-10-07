type Environment = Record<string, string | undefined>;

export function databaseConfig(
  env: Environment = process.env,
  allowDevelopmentFallback = true,
) {
  const url = env.DATABASE_URL || env.TURSO_DATABASE_URL ||
    (allowDevelopmentFallback && env.NODE_ENV !== "production" ? "file:./dev.db" : "");
  if (!url) throw new Error("Set DATABASE_URL or TURSO_DATABASE_URL to a persistent database.");
  const authToken = env.DATABASE_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;
  if (url.startsWith("libsql:") && !authToken) {
    throw new Error("Set DATABASE_AUTH_TOKEN or TURSO_AUTH_TOKEN for the hosted database.");
  }
  return { url, authToken };
}
