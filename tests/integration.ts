import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const base = "http://127.0.0.1:3135";
const databaseUrl = "file:" + path.join(process.cwd(), ".test-data", "integration.db");
const env = { ...process.env, DATABASE_URL: databaseUrl, TEST_DATABASE_URL: databaseUrl, AUTH_URL: base, AUTH_SECRET: "integration-only-synthetic-secret-2026-unique-value", AUTH_TRUST_HOST: "true", DEMO_MODE: "false", NEXT_TELEMETRY_DISABLED: "1" };
class Client {
  cookies = new Map<string, string>();
  async fetch(route: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Origin", headers.get("Origin") || base);
    headers.set("Cookie", [...this.cookies].map(([k, v]) => k + "=" + v).join("; "));
    const res = await fetch(base + route, { ...options, headers, redirect: "manual" });
    for (const cookie of res.headers.getSetCookie()) {
      const pair = cookie.split(";")[0], split = pair.indexOf("=");
      const key = pair.slice(0, split), value = pair.slice(split + 1);
      if (value) this.cookies.set(key, value); else this.cookies.delete(key);
    }
    return res;
  }
  async json<T = Record<string, unknown>>(route: string, method = "GET", data?: unknown) {
    const res = await this.fetch(route, { method, ...(data !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : {}) });
    return { status: res.status, data: await res.json() as T };
  }
  async login(role: "employee" | "admin", identifier: string, password: string) {
    const csrf = await this.json<{ csrfToken: string }>("/api/auth/csrf");
    const form = new URLSearchParams({ csrfToken: csrf.data.csrfToken, callbackUrl: base, ...(role === "admin" ? { username: identifier, password } : { employeeId: identifier, passcode: password }) });
    await this.fetch("/api/auth/callback/" + (role === "admin" ? "credentials" : "employee"), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" }, body: form.toString() });
    return (await this.json<{ user?: { role: string } }>("/api/auth/session")).data?.user?.role;
  }
}
let checks = 0;
function check(label: string, condition: unknown) { assert.ok(condition, label); checks++; console.log("PASS", label); }
async function main() {
  const prepared = spawnSync(process.execPath, ["--import", "tsx", "scripts/prepare-test.ts"], { env, stdio: "inherit" });
  assert.equal(prepared.status, 0);
  const db = new PrismaClient({ adapter: new PrismaLibSql({ url: databaseUrl }) });
  let logs = "";
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3135", "--hostname", "127.0.0.1"], { env, stdio: ["ignore", "pipe", "pipe"] });
  server.stderr.on("data", chunk => { logs = (logs + chunk.toString()).slice(-6000); });
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Server readiness timed out. " + logs)), 30000);
      server.stdout.on("data", chunk => { if (chunk.toString().includes("Ready")) { clearTimeout(timer); resolve(); } });
      server.on("error", reject);
      server.on("exit", code => { if (code) { clearTimeout(timer); reject(new Error("Server failed: " + logs)); } });
    });
    const guest = new Client(), owner = new Client(), other = new Client(), third = new Client(), admin = new Client();
    check("guest cannot enumerate employee records", (await guest.json("/api/employees/lookup?name=Ava")).status === 401);
    check("guest cannot create orders", (await guest.json("/api/orders", "POST", {})).status === 401);
    check("guest cannot use admin APIs", (await guest.json("/api/admin/employees", "POST", {})).status === 401);
    check("unknown employee cannot sign in", !await guest.login("employee", "UNKNOWN", "PantryDemo2026!"));
    check("employee can sign in", await owner.login("employee", "DEMO001", "PantryDemo2026!") === "employee");
    check("second employee can sign in", await other.login("employee", "DEMO002", "PantryDemo2026!") === "employee");
    check("third employee can sign in", await third.login("employee", "DEMO003", "PantryDemo2026!") === "employee");
    check("administrator can sign in", await admin.login("admin", "demo-admin", "AdminPantry2026!") === "admin");
    check("employee cannot use admin APIs", (await owner.json("/api/admin/cycles", "POST", { name: "Forged", deadline: null })).status === 401);
    check("employee cannot access admin pages", (await owner.fetch("/admin")).status === 307);
    const cycle = await db.orderCycle.findFirstOrThrow({ where: { status: "open" } });
    const product = await db.cycleProduct.findFirstOrThrow({ where: { cycleId: cycle.id, product: { sku: "DEMO-MILK" } } });
    const items = [{ cycleProductId: product.id, quantity: 2 }];
    for (const [label, body] of [
      ["forged owner identity", { cycleId: cycle.id, employeeId: "DEMO002", items }],
      ["duplicate product lines", { cycleId: cycle.id, items: [...items, ...items] }],
      ["fractional quantity", { cycleId: cycle.id, items: [{ cycleProductId: product.id, quantity: 1.5 }] }],
      ["negative quantity", { cycleId: cycle.id, items: [{ cycleProductId: product.id, quantity: -1 }] }],
      ["quantity above product limit", { cycleId: cycle.id, items: [{ cycleProductId: product.id, quantity: product.maxQtyPerPerson + 1 }] }],
      ["unavailable product", { cycleId: cycle.id, items: [{ cycleProductId: "missing-product", quantity: 1 }] }],
    ] as const) check("rejects " + label, (await owner.json("/api/orders", "POST", body)).status === 400);
    const created = await owner.json<{ id: string; orderNumber: string; totalAmount: string }>("/api/orders", "POST", { cycleId: cycle.id, items });
    check("verified employee creates order with exact total", created.status === 201 && created.data.totalAmount === "6.40");
    const stored = await db.order.findUniqueOrThrow({ where: { id: created.data.id } });
    check("name and employee identity come from the verified account", stored.employeeId === "DEMO001" && stored.employeeName === "Ava Thompson" && stored.isAuthenticated && !stored.requiresSignature);
    check("second order for same employee is prevented", (await owner.json("/api/orders", "POST", { cycleId: cycle.id, items })).status === 409);
    check("guest cannot update an order", (await guest.json("/api/orders/" + stored.id, "PUT", { items })).status === 401);
    check("another employee cannot update the owner order", (await other.json("/api/orders/" + stored.id, "PUT", { items })).status === 404);
    check("lookup cannot request a different employee identity", (await owner.json("/api/orders/lookup", "POST", { cycleId: cycle.id, employeeId: "DEMO002" })).status === 400);
    const edited = await owner.json<{ totalAmount: string }>("/api/orders/" + stored.id, "PUT", { items: [{ cycleProductId: product.id, quantity: 1 }] });
    check("owner can edit their order with exact server total", edited.status === 200 && edited.data.totalAmount === "3.20");
    const concurrent = await Promise.all([other.json<{ orderNumber: string }>("/api/orders", "POST", { cycleId: cycle.id, items }), third.json<{ orderNumber: string }>("/api/orders", "POST", { cycleId: cycle.id, items })]);
    check("concurrent orders receive distinct order numbers", concurrent.every(r => r.status === 201) && concurrent[0].data.orderNumber !== concurrent[1].data.orderNumber);
    const crossOrigin = await owner.fetch("/api/orders/" + stored.id, { method: "PUT", headers: { Origin: "https://foreign.example", "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    check("cross-site mutation is rejected", crossOrigin.status === 403);
    check("public catalogue shows the open selection", (await (await guest.fetch("/")).text()).includes("Fresh full-cream milk"));
    await db.orderCycle.update({ where: { id: cycle.id }, data: { deadline: new Date(Date.now() - 1000) } });
    check("expired deadline blocks owner edits", (await owner.json("/api/orders/" + stored.id, "PUT", { items })).status === 409);
    check("expired cycle disappears immediately from the catalogue", !(await (await guest.fetch("/")).text()).includes("Fresh full-cream milk"));
    await db.orderCycle.update({ where: { id: cycle.id }, data: { deadline: new Date(Date.now() + 86400000) } });
    check("admin closes the cycle", (await admin.json("/api/admin/cycles/" + cycle.id, "PUT", { status: "closed" })).status === 200);
    const closed = await guest.fetch("/");
    check("closed state is fresh and not publicly cached", (await closed.text()).includes("Orders are currently closed") && !closed.headers.get("cache-control")?.includes("s-maxage=31536000"));
    check("closed cycle blocks owner edits", (await owner.json("/api/orders/" + stored.id, "PUT", { items })).status === 409);
    check("admin reopens the valid cycle", (await admin.json("/api/admin/cycles/" + cycle.id, "PUT", { status: "open" })).status === 200);
    const item = await db.orderItem.findFirstOrThrow({ where: { orderId: stored.id } });
    check("employee cannot remove admin order items", (await owner.json("/api/admin/orders/" + stored.id + "/items/" + item.id, "DELETE")).status === 401);
    check("admin removes an order item", (await admin.json("/api/admin/orders/" + stored.id + "/items/" + item.id, "DELETE")).status === 200);
    const emptied = await db.order.findUniqueOrThrow({ where: { id: stored.id } });
    check("removal recalculates the total and marks an empty order cancelled", Number(emptied.totalAmount) === 0 && emptied.status === "cancelled");
    const ownerAccount = await db.employee.findUniqueOrThrow({ where: { employeeId: "DEMO001" } });
    check("admin can reset an employee passcode", (await admin.json("/api/admin/employees/" + ownerAccount.id, "PUT", { fullName: ownerAccount.fullName, isActive: true, pin: "NewPantryPasscode2026!" })).status === 200);
    check("passcode reset revokes the previous session", (await owner.json("/api/orders/lookup", "POST", { cycleId: cycle.id })).status === 401);
    check("old employee passcode no longer works", !await new Client().login("employee", "DEMO001", "PantryDemo2026!"));
    check("employee can sign in with the reset passcode", await new Client().login("employee", "DEMO001", "NewPantryPasscode2026!") === "employee");
    const thirdAccount = await db.employee.findUniqueOrThrow({ where: { employeeId: "DEMO003" } });
    check("admin can deactivate an employee", (await admin.json("/api/admin/employees/" + thirdAccount.id, "PUT", { fullName: thirdAccount.fullName, isActive: false })).status === 200);
    check("deactivation invalidates an existing employee session", (await third.json("/api/orders/lookup", "POST", { cycleId: cycle.id })).status === 401);
    const locked = new Client();
    for (let i = 0; i < 5; i++) await locked.login("employee", "DEMO002", "IncorrectPasscode!");
    check("persistent rate limit blocks a correct password after repeated failures", !await locked.login("employee", "DEMO002", "PantryDemo2026!"));
    check("strong sign-in has no default admin password", !await new Client().login("admin", "demo-admin", "admin123"));
    console.log(checks + " integration checks passed.");
  } catch (error) { console.error(logs); throw error; }
  finally { server.kill("SIGTERM"); await db.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
