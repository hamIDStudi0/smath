// app/routes/feedback.tsx
import { Form, useActionData, Link } from 'react-router';
import type { Route } from './+types/feedback';
import { prisma } from '../db.server';
import '../css/feedback.css';

// ─── Anti-spam ────────────────────────────────────────────────────────────────
const SPAM_WINDOW_MS = 10 * 60 * 1000;
const SPAM_MAX = 3;

// ─── ACTION ──────────────────────────────────────────────────────────────────
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name     = (formData.get('name')    as string)?.trim();
  const message  = (formData.get('message') as string)?.trim();
  const honeypot = (formData.get('website') as string);

  if (honeypot) return { success: false, error: 'Terdeteksi sebagai bot.' };

  if (!name || !message)
    return { success: false, error: 'Nama dan keluhan wajib diisi.' };
  if (name.length > 100)
    return { success: false, error: 'Nama terlalu panjang (maks 100 karakter).' };
  if (message.length < 10)
    return { success: false, error: 'Keluhan terlalu singkat (min 10 karakter).' };
  if (message.length > 1000)
    return { success: false, error: 'Keluhan terlalu panjang (maks 1000 karakter).' };

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';

  const windowStart = new Date(Date.now() - SPAM_WINDOW_MS);
  const recentCount = await (prisma.feedback as any).count({
    where: { ipAddress: ip, createdAt: { gte: windowStart } },
  });

  if (recentCount >= SPAM_MAX)
    return { success: false, error: 'Terlalu banyak feedback. Coba lagi dalam beberapa menit.' };

  await (prisma.feedback as any).create({
    data: { name, message, ipAddress: ip },
  });

  return { success: true, error: null };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="fb-page">

      {/* ── Breadcrumb ── */}
      <div className="fb-breadcrumb">
        <Link to="/about" className="fb-breadcrumb__link">
          <ArrowLeftIcon /> About
        </Link>
        <span className="fb-breadcrumb__sep">/</span>
        <span className="fb-breadcrumb__current">Feedback</span>
      </div>

      <div className="fb-layout">

        {/* ── Left: Info panel ── */}
        <aside className="fb-info">
          <div className="fb-info__icon">
            <MessageIcon />
          </div>
          <h1 className="fb-info__title">Kirim Feedback</h1>
          <p className="fb-info__desc">
            Ceritakan pengalamanmu, laporkan bug, atau berikan saran. Setiap
            masukan membantu kami tumbuh dan berkembang.
          </p>

          <ul className="fb-info__list">
            <li className="fb-info__item">
              <span className="fb-info__dot" />
              Feedback dikirim secara anonim
            </li>
            <li className="fb-info__item">
              <span className="fb-info__dot" />
              Dibaca langsung oleh tim admin
            </li>
            <li className="fb-info__item">
              <span className="fb-info__dot" />
              Dibatasi 3 kiriman per 10 menit
            </li>
          </ul>
        </aside>

        {/* ── Right: Form / Success ── */}
        <div className="fb-form-wrap">
          {actionData?.success ? (
            <SuccessState />
          ) : (
            <FeedbackForm error={actionData?.error} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeedbackForm({ error }: { error?: string | null }) {
  return (
    <div className="fb-card">
      <div className="fb-card__header">
        <h2 className="fb-card__title">Formulir Feedback</h2>
        <p className="fb-card__subtitle">Semua field wajib diisi</p>
      </div>

      <Form method="post" className="fb-form">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="fb-form__honeypot"
        />

        {error && (
          <div className="fb-alert fb-alert--error">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}

        <div className="fb-field">
          <label className="fb-label" htmlFor="fb-name">
            Nama
          </label>
          <input
            id="fb-name"
            type="text"
            name="name"
            placeholder="Nama kamu..."
            maxLength={100}
            required
            className="fb-input"
            autoComplete="name"
          />
        </div>

        <div className="fb-field">
          <label className="fb-label" htmlFor="fb-message">
            Keluhan / Saran
          </label>
          <textarea
            id="fb-message"
            name="message"
            rows={5}
            placeholder="Ceritakan pengalamanmu, laporkan masalah, atau berikan saran untuk kami..."
            minLength={10}
            maxLength={1000}
            required
            className="fb-input fb-input--textarea"
          />
          <p className="fb-field__hint">Min 10 · Maks 1000 karakter</p>
        </div>

        <button type="submit" className="fb-submit">
          Kirim Feedback
          <SendIcon />
        </button>
      </Form>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="fb-card fb-card--success">
      <div className="fb-success__icon">
        <CheckIcon />
      </div>
      <h2 className="fb-success__title">Terima kasih!</h2>
      <p className="fb-success__desc">
        Feedback kamu sudah kami terima. Tim kami akan segera meninjaunya.
      </p>
      <div className="fb-success__actions">
        <Link to="/feedback" className="fb-btn fb-btn--primary">
          Kirim Lagi
        </Link>
        <Link to="/" className="fb-btn fb-btn--ghost">
          Kembali ke Home
        </Link>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);