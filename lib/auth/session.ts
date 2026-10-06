import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const secretValue = process.env.AUTH_SECRET;
if (!secretValue && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET must be configured in production.");
}
const secret = new TextEncoder().encode(secretValue || "local-development-only-secret");

export type Session = { userId: string; role: Role; name: string; email: string };

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const jar = await cookies();
  jar.set("agrolt_hr_session", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 28800, path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = (await cookies()).get("agrolt_hr_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || typeof payload.role !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { userId: payload.userId, role: payload.role as Role, name: payload.name, email: payload.email };
  } catch { return null; }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("agrolt_hr_session");
}