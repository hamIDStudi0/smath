import { prisma } from "~/db.server";
import { getAdminId } from "~/session.server";
import type { Route } from "./+types/article.$id";
import { Link, useLoaderData, useFetcher } from "react-router";
import '../css/Articles.css';

export async function loader({params, request}:Route.LoaderArgs) {
    const id = Number(params.id);
    if(isNaN(id)) throw new Response('Not Found', {status:404});

    const [art, adminId] = await Promise.all([
        (prisma.article as any).findUnique({where:{id}}),
        getAdminId(request),
    ]);
    if(!art) throw new Response('Not Found', {status : 404});
    return {
        article:{
            id:art.id,
            title:art.title,
            description:art.body,
            htmlContent:art.htmlContent ?? null,
            author:art.author,
            isPinned: !!art.isPinned,
            date: new Date(art.createdAt).toLocaleDateString('id-ID',{
                day:'numeric',month:'long',year:'numeric'
            })
        },
        isAdmin: !!adminId,
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const adminId = await getAdminId(request);
    if (!adminId) return { error: 'Kamu harus login sebagai admin untuk melakukan ini.' };

    const id = Number(params.id);
    if (isNaN(id)) return { error: 'ID Artikel tidak valid.' };

    const formData = await request.formData();
    const pin = formData.get('pin') === '1';

    await (prisma.article as any).update({
        where: { id },
        data:  { isPinned: pin, pinnedAt: pin ? new Date() : null },
    });

    return { ok: true, isPinned: pin };
}

export function meta({matches}: Route.MetaArgs){
    const match = matches.find((m) => m.id === 'routes/article.$id');
    const data = match && 'loaderData' in match && match.id === 'routes/article.$id'?(match.loaderData as {article:{title:string; description:string}}):undefined;
    return [
        {title:data?.article?.title??'Artikel'},
        {name:'description', content:data?.article?.description??''}
    ];
}

function initials(name: string){
    if(!name) return '?';
    return name.split(' ').filter(Boolean).map((n)=>n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ArticleDetail() {
    const {article, isAdmin} = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    const optimisticPinned = fetcher.formData
      ? fetcher.formData.get('pin') === '1'
      : article.isPinned;

  return (
    <div className="article-page">
        <div className="article-page__topbar">
            <Link to="/article" className="article-page__back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
            Semua Artikel</Link>

            <div className="article-page__meta">
                <div className="article-card__avatar">{initials(article.author)}</div>
                <span className="article-card__author">{article.author}</span>
                <span className="article-card__date">{article.date}</span>
            </div>
        </div>

        <div className="article-page__body">
            {optimisticPinned && (
                <span className="article-page__pin-flag">📌 Pengumuman</span>
            )}

            {isAdmin && (
                <fetcher.Form method="post" className="article-page__pin-form">
                    <input type="hidden" name="pin" value={optimisticPinned ? '0' : '1'} />
                    <button
                        type="submit"
                        className={`article-page__pin-btn ${optimisticPinned ? 'article-page__pin-btn--active' : ''}`}
                        disabled={fetcher.state !== 'idle'}
                    >
                        📌 {optimisticPinned ? 'Batal Pengumuman' : 'Jadikan Pengumuman'}
                    </button>
                </fetcher.Form>
            )}

            <div className="article-page__title">{article.title}</div>
            <div className="article-page__divider"></div>
            {article.htmlContent ? (
                <div className="article-page__content" dangerouslySetInnerHTML={{__html:article.htmlContent}}></div>
            ):(
                <div className="article-page__empty">
                    <p>Konten Belum tersedia</p>
                </div>
            )}
        </div>
    </div>
  )
}
