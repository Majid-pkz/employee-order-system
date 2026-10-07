import type { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface User { role: "admin" | "employee"; employeeId?: string; sessionVersion: number; }
  interface Session {
    user: { id: string; role: "admin" | "employee"; employeeId?: string; sessionVersion: number } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; role: "admin" | "employee"; employeeId?: string; sessionVersion: number; }
}
