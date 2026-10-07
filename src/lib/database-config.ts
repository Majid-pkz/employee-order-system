type Environment = Record<string, string | undefined>;

export function databaseConfig(
  env: Environment = process.env,
  allowDevelopmentFallback = true,
) {
  const url = env.DATABASE_URL || env.TURSO_DATABASE_URL ||
    (allowDevelopmentFallback && env.NODE_ENV !== "production" && env.VERCEL !== "1" ? "file:./dev.db" : "");
  if (!url) throw new Error("Set DATABASE_URL or TURSO_DATABASE_URL to a persistent database.");
  if (env.VERCEL === "1" && !/^(libsql|https):\/\//.test(url)) {
    throw new Error("Vercel must use the hosted database, not a local SQLite file.");
  }
  const authToken = env.DATABASE_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;
  if (url.startsWith("libsql:") && !authToken) {
    throw new Error("Set DATABASE_AUTH_TOKEN or TURSO_AUTH_TOKEN for the hosted database.");
  }
  return { url, authToken };
}

// Keep framework environment reads explicit at the server boundary.
export function runtimeDatabaseEnvironment(): Environment {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  };
}
