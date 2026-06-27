// app/routes/key.tsx
import { redirect } from "react-router";
import { requireAdminId } from "../session.server";
import type { Route } from "./+types/key";
import "../css/key.css";

// ── Loader — runs only on the server ─────────────────────────────────────────
// requireAdminId throws a redirect to /login if the request has no valid
// admin session cookie, so unauthenticated users never reach this loader.
// The secret string is resolved here on the server and sent to the client
// only after authentication is confirmed.

const SECRET_KEY = "eW91V2lsbE5ldmVyRmluZFdoYXRZb3VBcmVMb29raW5nRm9y";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdminId(request); // throws redirect → /login if not admin
  return { key: SECRET_KEY };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

import { useLoaderData } from "react-router";
import { useState } from "react";

export default function KeyPage() {
  const { key } = useLoaderData<typeof loader>();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="key-page">
      <div className="key-card">

        {/* Header */}
        <div className="key-card__header">
          <div className="key-card__icon">
            <ShieldIcon />
          </div>
          <h1 className="key-card__title">Secret Key</h1>
          <p className="key-card__subtitle">
            Halaman ini hanya dapat diakses oleh administrator.
          </p>
        </div>

        {/* Badge */}
        <div className="key-badge">
          <LockIcon />
          <span>MFA GAME NO.<code>0007</code></span>
        </div>

        {/* Secret display */}
        <div className="key-secret">
          <div className="key-secret__label">SECRET KEY</div>
          <div className="key-secret__box">
            <code className="key-secret__value">{key}</code>
            <button
              className={`key-secret__copy ${copied ? "key-secret__copy--done" : ""}`}
              onClick={handleCopy}
              title="Salin ke clipboard"
            >
              {copied ? (
                <span className="key-secret__copy-text">✓ Tersalin</span>
              ) : (
                <>
                  <CopyIcon />
                  <span className="key-secret__copy-text">Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info footer */}
        <div className="key-info">
          <div className="key-info__item">
            <span className="key-info__dot key-info__dot--green" />
            <span>Kunci untuk peserta no.<code>0121</code></span>
          </div>
          <div className="key-info__item">
            <span className="key-info__dot key-info__dot--green"></span>
            <span>Akses hanya untuk Admin</span>
          </div>
          <div className="key-info__item">
            <span className="key-info__dot key-info__dot--green" />
            <span>Wadah kosong no.<code>0023</code></span>
          </div>
        </div>

      </div>
    </div>
  );
}