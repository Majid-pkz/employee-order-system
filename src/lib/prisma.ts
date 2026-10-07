import { databaseConfig, runtimeDatabaseEnvironment } from "@/lib/database-config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaLibSql as PrismaLibSqlHttp } from "@prisma/adapter-libsql/web";

const config = databaseConfig(runtimeDatabaseEnvironment());
const adapter = /^(libsql|https):\/\//.test(config.url)
  ? new PrismaLibSqlHttp(config)
  : new PrismaLibSql(config);
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
