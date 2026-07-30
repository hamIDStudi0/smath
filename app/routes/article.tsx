import {Link, useLoaderData, useSearchParams, useFetcher, type LoaderFunctionArgs, type ActionFunctionArgs} from 'react-router';
import { prisma } from '../db.server';
import { getAdminId } from '../session.server';
import '../css/Articles.css';
const PAGE_SIZE = 6;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page   = Math.max(1, Number(url.searchParams.get('page')  ?? '1'));
  const search = (url.searchParams.get('q') ?? '').trim();

  const where = search
    ? {
        OR: [
          { title:  { contains: search } },
          { author: { contains: search } },
          { body:   { contains: search } },
        ],
      }
    : {};

  // adminId dicek paralel juga — request session ringan, tidak menunggu DB artikel
  const [total, dbArticles, adminId] = await Promise.all([
    prisma.article.count({ where }),
    (prisma.article as any).findMany({
      where,
      // Pengumuman (pinned) selalu tampil di atas, baru urutan terbaru
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
      select: {
        id:          true,
        title:       true,
        body:        true,
        author:      true,
        createdAt:   true,
        isPinned:    true,
        // Kolom boolean ringan — bukan seluruh htmlContent (hemat bandwidth & waktu query DB beneran)
        hasHtml:     true,
      },
    }),
    getAdminId(request),
  ]);

  return {
    articles: dbArticles.map((art: any) => ({
      id:      art.id,
      title:   art.title,
      description: art.body,
      hasHtml: !!art.hasHtml,
      isPinned: !!art.isPinned,
      author:  art.author,
      date:    art.createdAt.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    })),
    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
      pageSize:   PAGE_SIZE,
    },
    search,
    isAdmin: !!adminId,
  };
}

// Toggle pin/"pengumuman" langsung dari halaman artikel — hanya admin yang login
export async function action({ request }: ActionFunctionArgs) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return { error: 'Kamu harus login sebagai admin untuk melakukan ini.' };
  }
  const formData  = await request.formData();
  const articleId = Number(formData.get('articleId'));
  const pin       = formData.get('pin') === '1';
  if (!articleId) return { error: 'ID Artikel tidak valid.' };

  await (prisma.article as any).update({
    where: { id: articleId },
    data:  { isPinned: pin, pinnedAt: pin ? new Date() : null },
  });

  return { ok: true, id: articleId, isPinned: pin };
}

function initials(name:string){
    if(!name) return '?';
    return name.split(' ').filter(Boolean).map((n)=>n[0]).join('').slice(0, 2).toUpperCase();
}

interface ArticleListItem {
  id: number;
  title: string;
  description: string;
  hasHtml: boolean;
  isPinned: boolean;
  author: string;
  date: string;
}

function ArticleCard({ article, isAdmin }: { article: ArticleListItem; isAdmin: boolean }) {
  const fetcher = useFetcher<typeof action>();
  // Optimistic UI: begitu tombol ditekan, tampilan langsung berubah tanpa menunggu server
  const optimisticPinned = fetcher.formData
    ? fetcher.formData.get('pin') === '1'
    : article.isPinned;

  return (
    <div className={`article-card ${optimisticPinned ? 'article-card--pinned' : ''}`}>
      {isAdmin && (
        <fetcher.Form method="post" className="article-card__pin-form">
          <input type="hidden" name="articleId" value={article.id} />
          <input type="hidden" name="pin" value={optimisticPinned ? '0' : '1'} />
          <button
            type="submit"
            className={`article-card__pin-btn ${optimisticPinned ? 'article-card__pin-btn--active' : ''}`}
            title={optimisticPinned ? 'Batalkan status pengumuman' : 'Jadikan pengumuman (pin di atas)'}
            disabled={fetcher.state !== 'idle'}
          >
            📌 {optimisticPinned ? 'Batal Pengumuman' : 'Jadikan Pengumuman'}
          </button>
        </fetcher.Form>
      )}

      {optimisticPinned && <span className="article-card__pin-flag">📌 Pengumuman</span>}

      <Link to={`/article/${article.id}`} className="article-card__link">
        <div className="article-card__meta">
          <div className="article-card__avatar">{initials(article.author)}</div>
          <span className="article-card__author">{article.author}</span>
          <span className="article-card__date">{article.date}</span>
          {article.hasHtml && (
            <span className="article-card__badge">Baca →</span>
          )}
        </div>
        <h2 className="article-card__title">{article.title}</h2>
        <p className="article-card__body">{article.description}</p>
      </Link>
    </div>
  );
}

export default function Articles() {
    const {articles,pagination, search, isAdmin} = useLoaderData<typeof loader>();
    const [, setSearchParams] = useSearchParams();
    function handleSearch(e: React.ChangeEvent<HTMLInputElement>){
        const q = e.target.value;
        setSearchParams((prev)=>{
            if(q){prev.set('q',q);} else {prev.delete('q');}
            prev.delete('page');
            return prev;
        }, {replace:true});
    }
    function goToPage(p:number){
        setSearchParams((prev)=>{
            prev.set('page',String(p));
            return prev;
        });
        window.scrollTo({top:0, behavior:'smooth'});
    }
    const hasPrev = pagination.page > 1;
    const hasNext = pagination.page < pagination.totalPages;
  return (
    <div className="articles">

      {/* ── Header ── */}
      <div className="articles__header">
        <h1 className="articles__title">Articles</h1>
        <p className="articles__subtitle">Kumpulan artikel dari para author angkatan.</p>
      </div>

      {/* ── Search bar ── */}
      <div className="articles__search-wrap">
        <div className="articles__search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          className="articles__search"
          type="search"
          placeholder="Cari judul, atau deskripsi…"
          defaultValue={search}
          onChange={handleSearch}
          aria-label="Cari artikel"
        />
        {search && (
          <span className="articles__search-count">
            {pagination.total} hasil
          </span>
        )}
      </div>

      {/* ── Article list ── */}
      <div className="articles__list">
        {articles.length === 0 ? (
          <div className="articles__empty">
            <p>
              {search
                ? `Tidak ada artikel yang cocok dengan "${search}".`
                : 'Belum ada artikel yang dipublikasikan.'}
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} isAdmin={isAdmin} />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="articles__pagination">
          <button
            className="pagination__btn"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!hasPrev}
            aria-label="Halaman sebelumnya"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="pagination__pages">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
              // Tampilkan: halaman pertama, terakhir, halaman aktif & ±1, sisanya "…"
              const show =
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.page) <= 1;

              if (!show) {
                // Tampilkan ellipsis sekali per celah
                const prev = p - 1;
                const prevShow =
                  prev === 1 ||
                  prev === pagination.totalPages ||
                  Math.abs(prev - pagination.page) <= 1;
                if (prevShow) return <span key={`ellipsis-${p}`} className="pagination__ellipsis">…</span>;
                return null;
              }

              return (
                <button
                  key={p}
                  className={`pagination__page${p === pagination.page ? ' pagination__page--active' : ''}`}
                  onClick={() => goToPage(p)}
                  aria-current={p === pagination.page ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            className="pagination__btn"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!hasNext}
            aria-label="Halaman berikutnya"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <span className="pagination__info">
            {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total}
          </span>
        </div>
      )}

    </div>
  );
}
