// app/routes/dashboard.tsx
import { useState } from 'react';
import { Form, redirect, useLoaderData, useActionData } from 'react-router';
import { prisma } from '../db.server';
import { requireAdminId } from '../session.server';
import { destroyUserSession } from '../session.server';
import type { Route } from './+types/dashboard';
import fs from 'node:fs/promises';
import path from 'node:path';
import '../css/Dashboard.css';

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const WriteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ─── LOADER ──────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const adminId = await requireAdminId(request);

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { name: true, email: true },
  });

  const [dbArticles, generations, feedbacks] = await Promise.all([
    prisma.article.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.generation.findMany({
      include: { members: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    }),
    (prisma.feedback as any).findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const articles = dbArticles.map((art: any) => ({
    id: art.id,
    title: art.title,
    description: art.body,
    htmlContent: art.htmlContent ?? null,
    hasHtml: !!art.htmlContent,
    author: art.author,
    date: art.createdAt.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    }),
  }));

  const feedbackList = feedbacks.map((fb: any) => ({
    id: fb.id,
    name: fb.name,
    message: fb.message,
    ipAddress: fb.ipAddress,
    isRead: fb.isRead,
    date: fb.createdAt.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  }));

  return { articles, generations, admin, feedbacks: feedbackList };
}

// ─── ACTION ──────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const adminId = await requireAdminId(request);

  const formData  = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'logout') {
    return destroyUserSession(request);
  }

  if (actionType === 'create_article') {
    const title       = formData.get('title')       as string;
    const description = formData.get('description') as string;
    const author      = formData.get('author')      as string;
    const htmlContent = formData.get('htmlContent') as string | null;
    if (!title?.trim() || !description?.trim() || !author?.trim()) {
      return { error: 'Judul, deskripsi, dan author wajib diisi!', section: 'article' };
    }
    await (prisma.article as any).create({
      data: { title: title.trim(), body: description.trim(), author: author.trim(), htmlContent: htmlContent?.trim() || null },
    });
    return redirect('/dashboard');
  }

  if (actionType === 'edit_article') {
    const articleId   = formData.get('articleId')   as string;
    const title       = formData.get('title')       as string;
    const description = formData.get('description') as string;
    const htmlContent = formData.get('htmlContent') as string | null;
    if (!articleId || !title?.trim() || !description?.trim()) {
      return { error: 'Data tidak lengkap untuk update artikel.', section: 'article' };
    }
    await (prisma.article as any).update({
      where: { id: Number(articleId) },
      data: { title: title.trim(), body: description.trim(), htmlContent: htmlContent?.trim() || null },
    });
    return redirect('/dashboard');
  }

  if (actionType === 'delete_article') {
    const articleId = formData.get('articleId') as string;
    if (!articleId) return { error: 'ID Artikel tidak valid.', section: 'article' };
    await prisma.article.delete({ where: { id: Number(articleId) } });
    return redirect('/dashboard');
  }

  if (actionType === 'create_generation') {
    const name = formData.get('name') as string;
    if (name?.trim()) await prisma.generation.create({ data: { name } });
    return redirect('/dashboard');
  }

  if (actionType === 'delete_generation') {
    const id = formData.get('id') as string;
    if (id) await prisma.generation.delete({ where: { id: Number(id) } });
    return redirect('/dashboard');
  }

  if (actionType === 'create_member') {
    const generationId = formData.get('generationId') as string;
    const name         = formData.get('name')         as string;
    const bio          = formData.get('bio')          as string;
    const imageFile    = formData.get('image')        as File | null;
    let imageUrl: string | null = null;
    if (imageFile && imageFile.name && imageFile.size > 0) {
      const fileName  = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath  = path.join(uploadDir, fileName);
      const buffer    = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }
    if (name?.trim() && bio?.trim() && generationId) {
      await prisma.member.create({ data: { name, bio, imageUrl, generationId: Number(generationId) } });
    }
    return redirect('/dashboard');
  }

  if (actionType === 'delete_member') {
    const id     = formData.get('id') as string;
    const member = await prisma.member.findUnique({ where: { id: Number(id) } });
    if (member) {
      if (member.imageUrl) {
        const filePath = path.join(process.cwd(), 'public', member.imageUrl);
        try { await fs.unlink(filePath); } catch {}
      }
      await prisma.member.delete({ where: { id: Number(id) } });
    }
    return redirect('/dashboard');
  }

  // ── Feedback actions ──────────────────────────────────────────────────────

  if (actionType === 'mark_feedback_read') {
    const id = formData.get('id') as string;
    await (prisma.feedback as any).update({
      where: { id: Number(id) },
      data: { isRead: true },
    });
    return redirect('/dashboard?tab=feedback');
  }

  if (actionType === 'delete_feedback') {
    const id = formData.get('id') as string;
    await (prisma.feedback as any).delete({ where: { id: Number(id) } });
    return redirect('/dashboard?tab=feedback');
  }

  return null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── HTML EDITOR TOOLBAR ─────────────────────────────────────────────────────

function HtmlEditorToolbar({ targetId }: { targetId: string }) {
  const wrap = (open: string, close: string) => {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.substring(start, end);
    const replacement = open + (sel || 'teks') + close;
    el.value = el.value.substring(0, start) + replacement + el.value.substring(end);
    el.focus();
    el.selectionStart = start + open.length;
    el.selectionEnd   = start + open.length + (sel || 'teks').length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const insertBlock = (snippet: string) => {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!el) return;
    const pos = el.selectionEnd;
    el.value = el.value.substring(0, pos) + '\n' + snippet + '\n' + el.value.substring(pos);
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const tools = [
    { label: 'B',    title: 'Bold',         action: () => wrap('<strong>', '</strong>') },
    { label: 'I',    title: 'Italic',        action: () => wrap('<em>', '</em>') },
    { label: 'H2',   title: 'Heading 2',     action: () => wrap('<h2>', '</h2>') },
    { label: 'H3',   title: 'Heading 3',     action: () => wrap('<h3>', '</h3>') },
    { label: 'P',    title: 'Paragraf',      action: () => wrap('<p>', '</p>') },
    { label: 'UL',   title: 'Bullet List',   action: () => insertBlock('<ul>\n  <li>Item</li>\n</ul>') },
    { label: 'OL',   title: 'Numbered List', action: () => insertBlock('<ol>\n  <li>Item</li>\n</ol>') },
    { label: '""',   title: 'Blockquote',    action: () => wrap('<blockquote>', '</blockquote>') },
    { label: '</>',  title: 'Inline Code',   action: () => wrap('<code>', '</code>') },
    { label: 'HR',   title: 'Divider',       action: () => insertBlock('<hr />') },
    { label: 'IMG',  title: 'Gambar',        action: () => insertBlock('<img src="" alt="" />') },
    { label: 'A',    title: 'Link',          action: () => wrap('<a href="">', '</a>') },
  ];

  return (
    <div className="html-toolbar">
      {tools.map((t) => (
        <button key={t.label} type="button" title={t.title} className="html-toolbar__btn" onClick={t.action}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────

interface ArticleItem {
  id: number;
  title: string;
  description: string;
  htmlContent: string | null;
  hasHtml: boolean;
  author: string;
  date: string;
}

function EditArticleModal({ article, onClose }: { article: ArticleItem; onClose: () => void }) {
  const [title, setTitle]   = useState(article.title);
  const [desc, setDesc]     = useState(article.description);
  const [html, setHtml]     = useState(article.htmlContent ?? '');
  const [activeTab, setTab] = useState<'visual' | 'html'>('visual');

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal__header">
          <h3 className="edit-modal__title">Edit Artikel</h3>
          <button className="dash-btn-icon" onClick={onClose} aria-label="Tutup">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <Form method="post" className="dash-form edit-modal__form">
          <input type="hidden" name="_action"   value="edit_article" />
          <input type="hidden" name="articleId" value={article.id} />

          <div className="dash-form__row">
            <label className="dash-label">Judul Artikel</label>
            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="dash-input" required />
          </div>

          <div className="dash-form__row">
            <label className="dash-label">Deskripsi Singkat</label>
            <textarea name="description" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="dash-input dash-input--textarea" required />
          </div>

          <div className="dash-form__row">
            <div className="html-editor-tabs">
              <button type="button" className={`html-tab ${activeTab === 'visual' ? 'html-tab--active' : ''}`} onClick={() => setTab('visual')}>Preview</button>
              <button type="button" className={`html-tab ${activeTab === 'html' ? 'html-tab--active' : ''}`} onClick={() => setTab('html')}>HTML</button>
            </div>
            {activeTab === 'html' ? (
              <>
                <HtmlEditorToolbar targetId="edit-html-editor" />
                <textarea id="edit-html-editor" name="htmlContent" rows={14} value={html} onChange={(e) => setHtml(e.target.value)} className="dash-input dash-input--code" placeholder="<p>Tulis konten artikel di sini...</p>" spellCheck={false} />
              </>
            ) : (
              <>
                <input type="hidden" name="htmlContent" value={html} />
                <div className="html-preview" dangerouslySetInnerHTML={{ __html: html || '<p class="html-preview__empty">Belum ada konten HTML.</p>' }} />
              </>
            )}
          </div>

          <div className="dash-form__actions">
            <button type="button" onClick={onClose} className="dash-btn dash-btn--ghost">Batal</button>
            <button type="submit" className="dash-btn dash-btn--primary">Simpan Perubahan →</button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { articles, generations, admin, feedbacks } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab]     = useState<'articles' | 'generations' | 'feedback'>('articles');
  const [editArticle, setEditArticle] = useState<ArticleItem | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [editorTab, setEditorTab]     = useState<'html' | 'preview'>('html');

  const unreadCount = feedbacks.filter((f: any) => !f.isRead).length;

  return (
    <div className="dash">

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__profile">
          <div className="dash-sidebar__avatar">{initials(admin?.name ?? '')}</div>
          <p className="dash-sidebar__name">{admin?.name}</p>
        </div>
          <nav className="dash-sidebar__nav">
            <button
              className={`dash-nav-item ${activeTab === 'articles' ? 'dash-nav-item--active' : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              <span className="dash-nav-item__icon"><PenIcon /></span>
              <span>Artikel</span>
              <span className="dash-nav-item__count">{articles.length}</span>
            </button>
            <button
              className={`dash-nav-item ${activeTab === 'generations' ? 'dash-nav-item--active' : ''}`}
              onClick={() => setActiveTab('generations')}
            >
              <span className="dash-nav-item__icon"><UsersIcon /></span>
              <span>Angkatan</span>
              <span className="dash-nav-item__count">{generations.length}</span>
            </button>
            <button
              className={`dash-nav-item ${activeTab === 'feedback' ? 'dash-nav-item--active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              <span className="dash-nav-item__icon"><MessageSquareIcon /></span>
              <span>Feedback</span>
              {unreadCount > 0 ? (
                <span className="dash-nav-item__count dash-nav-item__count--alert">{unreadCount}</span>
              ) : (
                <span className="dash-nav-item__count">{feedbacks.length}</span>
              )}
            </button>
          </nav>

          <div className="dash-sidebar__spacer" />

          <div className="dash-sidebar__footer">
            <Form method="post">
              <button type="submit" name="_action" value="logout" className="dash-back-btn">
                <LogOutIcon /> Logout
              </button>
            </Form>
          </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dash-main">

        {/* ══ TAB: ARTIKEL ══ */}
        {activeTab === 'articles' && (
          <section className="dash-section">
            <div className="dash-section__header">
              <div>
                <p className="dash-section__eyebrow">Manajemen Konten</p>
                <h2 className="dash-section__title">Artikel</h2>
              </div>
              <span className="dash-badge">{articles.length} artikel</span>
            </div>

            <div className="dash-card dash-card--form">
              <h3 className="dash-card__label"><WriteIcon /> Tambah Artikel Baru</h3>

              {actionData?.section === 'article' && actionData.error && (
                <p className="dash-error">{actionData.error}</p>
              )}

              <Form method="post" className="dash-form">
                <input type="hidden" name="_action" value="create_article" />
                <input type="hidden" name="author"  value={admin?.name ?? 'Admin'} />

                <div className="dash-form__row">
                  <label className="dash-label">Judul Artikel</label>
                  <input type="text" name="title" placeholder="Masukkan judul artikel..." className="dash-input" required />
                </div>

                <div className="dash-form__row">
                  <label className="dash-label">Deskripsi Singkat</label>
                  <textarea name="description" rows={2} placeholder="Tuliskan ringkasan singkat artikel ini..." className="dash-input dash-input--textarea" required />
                </div>

                <div className="dash-form__row">
                  <label className="dash-label">Isi Artikel (HTML)</label>
                  <div className="html-editor-tabs">
                    <button type="button" className={`html-tab ${editorTab === 'html' ? 'html-tab--active' : ''}`} onClick={() => setEditorTab('html')}>HTML</button>
                    <button type="button" className={`html-tab ${editorTab === 'preview' ? 'html-tab--active' : ''}`} onClick={() => setEditorTab('preview')}>Preview</button>
                  </div>
                  {editorTab === 'html' ? (
                    <>
                      <HtmlEditorToolbar targetId="new-html-editor" />
                      <textarea id="new-html-editor" name="htmlContent" rows={16} value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} className="dash-input dash-input--code" placeholder="<p>Tulis konten artikel di sini menggunakan HTML...</p>" spellCheck={false} />
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="htmlContent" value={htmlContent} />
                      <div className="html-preview" dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="html-preview__empty">Belum ada konten. Tulis HTML di tab sebelumnya.</p>' }} />
                    </>
                  )}
                </div>

                <div className="dash-form__actions">
                  <button type="submit" className="dash-btn dash-btn--primary">Publikasikan Artikel →</button>
                </div>
              </Form>
            </div>

            <div className="dash-card">
              <h3 className="dash-card__label"><ClipboardIcon /> Daftar Artikel</h3>
              {articles.length === 0 ? (
                <p className="dash-empty">Belum ada artikel. Tambahkan di atas.</p>
              ) : (
                <div className="dash-article-list">
                  {articles.map((art: any) => (
                    <div key={art.id} className="dash-article-row">
                      <div className="dash-article-row__left">
                        <div className="dash-mini-avatar">{initials(art.author)}</div>
                        <div className="dash-article-row__info">
                          <p className="dash-article-row__title">{art.title}</p>
                          <p className="dash-article-row__meta">
                            <span>{art.author}</span>
                            <span className="dash-dot">·</span>
                            <span>{art.date}</span>
                            {art.hasHtml && (
                              <>
                                <span className="dash-dot">·</span>
                                <span className="dash-html-badge">HTML ✓</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="dash-article-row__actions">
                        <button type="button" className="dash-btn dash-btn--edit-sm" onClick={() => setEditArticle(art)}>Edit</button>
                        <Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="articleId" value={art.id} />
                          <button type="submit" name="_action" value="delete_article" className="dash-btn dash-btn--danger-sm"
                            onClick={(e) => { if (!confirm('Hapus artikel ini secara permanen?')) e.preventDefault(); }}>
                            Hapus
                          </button>
                        </Form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ TAB: ANGKATAN ══ */}
        {activeTab === 'generations' && (
          <section className="dash-section">
            <div className="dash-section__header">
              <div>
                <p className="dash-section__eyebrow">Manajemen Tim</p>
                <h2 className="dash-section__title">Angkatan & Anggota</h2>
              </div>
              <span className="dash-badge">{generations.length} angkatan</span>
            </div>

            <div className="dash-card dash-card--form">
              <h3 className="dash-card__label"><TagIcon /> Tambah Angkatan Baru</h3>
              <Form method="post" className="dash-form dash-form--inline">
                <input type="text" name="name" placeholder="Nama angkatan, mis. Angkatan 2024" className="dash-input" required />
                <button type="submit" name="_action" value="create_generation" className="dash-btn dash-btn--primary">
                  <PlusIcon /> Tambah
                </button>
              </Form>
            </div>

            {generations.length === 0 ? (
              <div className="dash-card">
                <p className="dash-empty">Belum ada angkatan.</p>
              </div>
            ) : (
              generations.map((gen: any) => (
                <div key={gen.id} className="dash-card dash-gen-card">
                  <div className="dash-gen-card__header">
                    <div className="dash-gen-card__title-row">
                      <h3 className="dash-gen-card__title">{gen.name}</h3>
                      <span className="dash-badge dash-badge--sm">{gen.members.length} anggota</span>
                    </div>
                    {gen.members.length === 0 && (
                      <Form method="post">
                        <input type="hidden" name="id" value={gen.id} />
                        <button type="submit" name="_action" value="delete_generation" className="dash-btn dash-btn--danger-sm"
                          onClick={(e) => { if (!confirm(`Hapus angkatan "${gen.name}" secara permanen?`)) e.preventDefault(); }}>
                          Hapus Angkatan
                        </button>
                      </Form>
                    )}
                  </div>

                  <details className="dash-gen-card__add-member">
                    <summary className="dash-gen-card__add-toggle">
                      <PlusIcon /> Tambah Anggota Baru
                    </summary>
                    <Form method="post" encType="multipart/form-data" className="dash-form dash-form--member">
                      <input type="hidden" name="generationId" value={gen.id} />
                      <div className="dash-form__member-grid">
                        <div className="dash-form__col">
                          <label className="dash-label">Nama Anggota</label>
                          <input type="text" name="name" placeholder="Nama lengkap" className="dash-input" required />
                        </div>
                        <div className="dash-form__col">
                          <label className="dash-label">Foto</label>
                          <input type="file" name="image" accept="image/*" className="dash-input dash-input--file" />
                        </div>
                      </div>
                      <div className="dash-form__row">
                        <label className="dash-label">Bio / Spesialisasi</label>
                        <textarea name="bio" rows={3} placeholder="Deskripsikan anggota ini..." className="dash-input dash-input--textarea" required />
                      </div>
                      <button type="submit" name="_action" value="create_member" className="dash-btn dash-btn--primary">Simpan Anggota</button>
                    </Form>
                  </details>

                  {gen.members.length > 0 ? (
                    <div className="dash-members">
                      {gen.members.map((member: any) => (
                        <div key={member.id} className="dash-member-row">
                          <div className="dash-member-row__photo">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="dash-member-row__img" />
                            ) : (
                              <div className="dash-member-row__placeholder">{initials(member.name)}</div>
                            )}
                          </div>
                          <div className="dash-member-row__info">
                            <p className="dash-member-row__name">{member.name}</p>
                            <p className="dash-member-row__bio">{member.bio}</p>
                          </div>
                          <Form method="post" className="dash-member-row__action">
                            <input type="hidden" name="id" value={member.id} />
                            <button type="submit" name="_action" value="delete_member" className="dash-btn dash-btn--danger-sm"
                              onClick={(e) => { if (!confirm(`Hapus ${member.name} dari angkatan ini?`)) e.preventDefault(); }}>
                              Hapus
                            </button>
                          </Form>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dash-empty dash-empty--sm">Belum ada anggota di angkatan ini.</p>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {/* ══ TAB: FEEDBACK ══ */}
        {activeTab === 'feedback' && (
          <section className="dash-section">
            <div className="dash-section__header">
              <div>
                <p className="dash-section__eyebrow">Masukan Pengguna</p>
                <h2 className="dash-section__title">Feedback</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <span className="dash-badge dash-badge--alert">{unreadCount} belum dibaca</span>
                )}
                <span className="dash-badge">{feedbacks.length} total</span>
              </div>
            </div>

            {feedbacks.length === 0 ? (
              <div className="dash-card">
                <p className="dash-empty">Belum ada feedback yang masuk.</p>
              </div>
            ) : (
              <div className="dash-feedback-list">
                {feedbacks.map((fb: any) => (
                  <div key={fb.id} className={`dash-feedback-item ${!fb.isRead ? 'dash-feedback-item--unread' : ''}`}>
                    <div className="dash-feedback-item__header">
                      <div className="dash-feedback-item__meta">
                        <div className="dash-mini-avatar dash-mini-avatar--feedback">
                          {initials(fb.name)}
                        </div>
                        <div>
                          <p className="dash-feedback-item__name">{fb.name}</p>
                          <p className="dash-feedback-item__date">{fb.date} · {fb.ipAddress}</p>
                        </div>
                        {!fb.isRead && (
                          <span className="dash-feedback-badge-new">Baru</span>
                        )}
                      </div>
                      <div className="dash-feedback-item__actions">
                        {!fb.isRead && (
                          <Form method="post" style={{ display: 'inline' }}>
                            <input type="hidden" name="id" value={fb.id} />
                            <button type="submit" name="_action" value="mark_feedback_read"
                              className="dash-btn dash-btn--edit-sm" title="Tandai sudah dibaca">
                              ✓ Dibaca
                            </button>
                          </Form>
                        )}
                        <Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={fb.id} />
                          <button type="submit" name="_action" value="delete_feedback"
                            className="dash-btn dash-btn--danger-sm"
                            onClick={(e) => { if (!confirm('Hapus feedback ini?')) e.preventDefault(); }}
                            title="Hapus feedback">
                            <TrashIcon />
                          </button>
                        </Form>
                      </div>
                    </div>
                    <div 
                    className="dash-feedback-item__message"
                    dangerouslySetInnerHTML={{ __html: fb.message }} 
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {editArticle && (
        <EditArticleModal article={editArticle} onClose={() => setEditArticle(null)} />
      )}
    </div>
  );
}