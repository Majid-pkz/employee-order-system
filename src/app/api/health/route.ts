import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseDiagnostics } from "@/lib/database-diagnostics";
import { runtimeDatabaseEnvironment } from "@/lib/database-config";

export const dynamic = "force-dynamic";
const requiredTables = ["Admin", "Employee", "Product", "OrderCycle", "CycleProduct", "Order", "OrderItem", "LoginAttempt", "_prisma_migrations"];
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const diagnostics = process.env.DEMO_MODE === "true"
    ? { database: databaseDiagnostics(runtimeDatabaseEnvironment()) }
    : {};
  try {
    const rows = await prisma.$queryRaw<Array<{ name: string }>>`SELECT name FROM sqlite_master WHERE type = 'table'`;
    const tables = new Set(rows.map(row => row.name));
    const ready = requiredTables.every(name => tables.has(name));
    return NextResponse.json({ status: ready ? "ok" : "unavailable", ...diagnostics }, { status: ready ? 200 : 503, headers });
  } catch {
    return NextResponse.json({ status: "unavailable", ...diagnostics }, { status: 503, headers });
  }
}
