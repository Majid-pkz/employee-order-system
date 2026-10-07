import { databaseConfig } from "@/lib/database-config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql(databaseConfig());
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
