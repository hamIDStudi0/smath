// app/routes/login.tsx
import { redirect } from "react-router";
import { useState, type FormEvent } from "react";
import { Form, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/login";
import { verifyLogin } from "../auth.server";
import { createUserSession, getAdminId, destroyUserSession } from "../session.server";
import "../css/Login.css";

// ── Icons ─────────────────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

// ── Loader: cek apakah sudah login ────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const adminId = await getAdminId(request);
  // Sudah login → langsung ke dashboard
  if (adminId) return redirect("/dashboard");
  return null;
}

// ── Action: proses form login di server ───────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Handle logout
  if (intent === "logout") {
    return destroyUserSession(request);
  }

  // Handle login
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const admin = await verifyLogin(email, password);
  if (!admin) {
    // Jangan kasih tahu field mana yang salah (security best practice)
    return { error: "Email atau password salah." };
  }

  // Buat HttpOnly session cookie dan redirect ke dashboard
  return createUserSession(admin.id, "/dashboard");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <div className="login__brand-icon">
            <ShieldIcon />
          </div>
          <h1>Admin Login</h1>
          <p>Masuk untuk mengelola konten</p>
        </div>

        {/* Form dikirim ke server — tidak ada JS yang menyentuh password */}
        <Form method="post" className="login__form">
          <div className="form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@smagamath.id"
              required
              autoComplete="email"
            />
          </div>

          <div className="form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {actionData?.error && (
            <div className="login__error">{actionData.error}</div>
          )}

          <button
            type="submit"
            className="login__submit login__submit--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </Form>

        <p className="login__note">
          Sesi aktif selama <strong>8 jam</strong>.
        </p>
      </div>
    </div>
  );
}
