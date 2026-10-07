import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || (process.env.NODE_ENV === "production" ? "" : "file:./dev.db");
if (!url) throw new Error("DATABASE_URL is required in production. Use a persistent SQLite volume or a hosted libSQL database.");
if (url.startsWith("libsql:") && !process.env.DATABASE_AUTH_TOKEN) throw new Error("DATABASE_AUTH_TOKEN is required for a hosted libSQL database.");
const adapter = new PrismaLibSql({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
