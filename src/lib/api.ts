import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = new URL(process.env.AUTH_URL || req.url).origin;
  if (!origin || origin !== expected) throw new ApiError(403, "Please submit this request from the application.");
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid request." }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "This record already exists. Refresh and try again." }, { status: 409 });
    if (error.code === "P2003") return NextResponse.json({ error: "This record is still in use." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  console.error("Request failed:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
