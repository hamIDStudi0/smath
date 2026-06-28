// app/routes/register.tsx
import { Form, useActionData, useNavigation, useLoaderData, Link } from 'react-router';
import { redirect } from 'react-router';
import type { Route } from './+types/register';
import { requireAdminId } from '../session.server';
import { createAdmin } from '../auth.server';
import { prisma } from '../db.server';
import '../css/Register.css';

// ── Icons ────────────────────────────────────────────────────────────────────

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── Loader: hanya admin yang bisa akses ──────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const currentAdminId = await requireAdminId(request); // redirect ke /login jika belum auth

  // Ambil semua admin untuk ditampilkan di list
  const admins = await prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return { admins, currentAdminId };
}

// ── Action: buat atau hapus akun admin ───────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const currentAdminId = await requireAdminId(request);

  const formData = await request.formData();
  const intent   = formData.get('intent') as string;

  // ── Hapus admin lain ──────────────────────────────────────────────────────
  if (intent === 'delete_admin') {
    const targetId = Number(formData.get('targetId'));
    if (targetId === currentAdminId) {
      return { error: 'Anda tidak bisa menghapus akun Anda sendiri.', intent };
    }
    await prisma.adminUser.delete({ where: { id: targetId } });
    return { success: 'Akun admin berhasil dihapus.', intent };
  }

  // ── Buat admin baru ───────────────────────────────────────────────────────
  const name            = (formData.get('name')            as string)?.trim();
  const email           = (formData.get('email')           as string)?.trim().toLowerCase();
  const password        = formData.get('password')        as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validasi
  if (!name || !email || !password || !confirmPassword) {
    return { error: 'Semua field wajib diisi.', intent: 'create' };
  }
  if (password.length < 8) {
    return { error: 'Password minimal 8 karakter.', intent: 'create' };
  }
  if (password !== confirmPassword) {
    return { error: 'Password dan konfirmasi password tidak cocok.', intent: 'create' };
  }

  // Cek duplikat email
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Email sudah digunakan oleh akun lain.', intent: 'create' };
  }

  await createAdmin(email, password, name);
  return { success: `Akun admin untuk ${name} berhasil dibuat.`, intent: 'create' };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Register() {
  const { admins, currentAdminId } = useLoaderData<typeof loader>();
  const actionData  = useActionData<typeof action>();
  const navigation  = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="reg">
      <div className="reg__container">

        {/* Header */}
        <div className="reg__header">
          <Link to="/dashboard" className="reg__back-btn">
            <ArrowLeftIcon /> Kembali ke Dashboard
          </Link>
          <div className="reg__brand">
            <div className="reg__brand-icon">
              <UserPlusIcon />
            </div>
            <h1>Kelola Admin</h1>
            <p>Tambah atau hapus akun admin lainnya</p>
          </div>
        </div>

        {/* Form Buat Admin Baru */}
        <div className="reg__card">
          <h2 className="reg__card-title">Buat Akun Admin Baru</h2>

          {actionData?.intent === 'create' && actionData.error && (
            <div className="reg__alert reg__alert--error">{actionData.error}</div>
          )}
          {actionData?.intent === 'create' && actionData.success && (
            <div className="reg__alert reg__alert--success">{actionData.success}</div>
          )}

          <Form method="post" className="reg__form">
            <input type="hidden" name="intent" value="create" />

            <div className="reg__field">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Contoh: Budi Santoso"
                required
                autoComplete="off"
              />
            </div>

            <div className="reg__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@smagamath.id"
                required
                autoComplete="off"
              />
            </div>

            <div className="reg__field-row">
              <div className="reg__field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="reg__field">
                <label htmlFor="confirmPassword">Konfirmasi Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="reg__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Membuat akun...' : 'Buat Akun Admin →'}
            </button>
          </Form>
        </div>

        {/* Daftar Admin */}
        <div className="reg__card">
          <h2 className="reg__card-title">Daftar Admin Aktif</h2>

          {actionData?.intent === 'delete_admin' && actionData.error && (
            <div className="reg__alert reg__alert--error">{actionData.error}</div>
          )}
          {actionData?.intent === 'delete_admin' && actionData.success && (
            <div className="reg__alert reg__alert--success">{actionData.success}</div>
          )}

          <div className="reg__admin-list">
            {admins.map((admin: any) => (
              <div key={admin.id} className="reg__admin-row">
                <div className="reg__admin-left">
                  <div className="reg__avatar">{initials(admin.name)}</div>
                  <div className="reg__admin-info">
                    <p className="reg__admin-name">
                      {admin.name}
                      {admin.id === currentAdminId && (
                        <span className="reg__self-badge">Anda</span>
                      )}
                    </p>
                    <p className="reg__admin-email">{admin.email}</p>
                  </div>
                </div>
                {admin.id !== currentAdminId && (
                  <Form
                    method="post"
                    style={{ display: 'inline' }}
                    onSubmit={(e) => {
                      if (!confirm(`Hapus akun admin "${admin.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="intent"   value="delete_admin" />
                    <input type="hidden" name="targetId" value={admin.id} />
                    <button type="submit" className="reg__delete-btn">
                      <TrashIcon /> Hapus
                    </button>
                  </Form>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="reg__note">
          Hanya admin yang sedang login yang dapat mengakses halaman ini.
        </p>
      </div>
    </div>
  );
}
