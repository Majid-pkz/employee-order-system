import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hashSync } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { passcodeSchema } from "@/lib/validation";
import { consumeLoginAttempt, clearLoginAttempts } from "@/lib/login-limit";

const dummyHash = hashSync("unused-account-timing-value", 12);
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Administrator",
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        const parsed = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(72) }).safeParse(credentials);
        if (!parsed.success) return null;
        const { username, password } = parsed.data;
        if (password === "admin123") return null;
        if (!await consumeLoginAttempt("admin", username)) return null;
        const admin = await prisma.admin.findUnique({ where: { username } });
        const valid = await compare(password, admin?.passwordHash || dummyHash);
        if (!admin?.isActive || !valid) return null;
        await clearLoginAttempts("admin", username);
        return { id: admin.id, name: admin.name || admin.username, role: "admin", sessionVersion: admin.sessionVersion };
      },
    }),
    Credentials({
      id: "employee",
      name: "Employee",
      credentials: { employeeId: {}, passcode: {} },
      async authorize(credentials) {
        const parsed = z.object({ employeeId: z.string().trim().min(1).max(40), passcode: passcodeSchema }).safeParse(credentials);
        if (!parsed.success) return null;
        const { employeeId, passcode } = parsed.data;
        if (!await consumeLoginAttempt("employee", employeeId)) return null;
        const employee = await prisma.employee.findUnique({ where: { employeeId } });
        const valid = await compare(passcode, employee?.pinHash || dummyHash);
        if (!employee?.isActive || !employee.pinHash || !valid) return null;
        await clearLoginAttempts("employee", employeeId);
        return { id: employee.id, name: employee.fullName, employeeId: employee.employeeId, role: "employee", sessionVersion: employee.sessionVersion };
      },
    }),
  ],
  pages: { signIn: "/account/sign-in" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; token.employeeId = user.employeeId; token.sessionVersion = user.sessionVersion; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.role === "admin" || token.role === "employee") && typeof token.id === "string" ? token.id : "";
        session.user.role = token.role === "admin" ? "admin" : "employee";
        session.user.employeeId = typeof token.employeeId === "string" ? token.employeeId : undefined;
        session.user.sessionVersion = typeof token.sessionVersion === "number" ? token.sessionVersion : -1;
      }
      return session;
    },
  },
});
