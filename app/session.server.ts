// app/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET tidak ditemukan di .env!");
}

// Cookie HttpOnly — tidak bisa diakses JavaScript di browser sama sekali
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,       // ← JS browser tidak bisa baca/tulis
    secure: process.env.NODE_ENV === "production", // ← HTTPS only di production
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
    secrets: [process.env.SESSION_SECRET],
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function createUserSession(adminId: number, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("adminId", adminId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// Ambil adminId dari session — null jika tidak login
export async function getAdminId(request: Request): Promise<number | null> {
  const session = await getSession(request);
  const adminId = session.get("adminId");
  return typeof adminId === "number" ? adminId : null;
}

// Paksa redirect ke login jika belum auth
export async function requireAdminId(request: Request): Promise<number> {
  const adminId = await getAdminId(request);
  if (!adminId) {
    throw redirect("/login");
  }
  return adminId;
}
