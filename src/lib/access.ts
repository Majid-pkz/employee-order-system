import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";

export async function getAdmin() {
  const session = await auth();
  if (session?.user.role !== "admin" || !Number.isInteger(session.user.sessionVersion)) return null;
  return prisma.admin.findFirst({ where: { id: session.user.id, isActive: true, sessionVersion: session.user.sessionVersion } });
}
export async function getEmployee() {
  const session = await auth();
  if (session?.user.role !== "employee" || !Number.isInteger(session.user.sessionVersion)) return null;
  return prisma.employee.findFirst({ where: { id: session.user.id, isActive: true, sessionVersion: session.user.sessionVersion, pinHash: { not: null } } });
}
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
export async function requireEmployeePage() {
  const employee = await getEmployee();
  if (!employee) redirect("/account/sign-in");
  return employee;
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new ApiError(401, "Sign in as an administrator to continue.");
  return admin;
}
export async function requireEmployee() {
  const employee = await getEmployee();
  if (!employee) throw new ApiError(401, "Sign in with your employee account to continue.");
  return employee;
}
