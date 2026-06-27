import { prisma } from "~/db.server";
import type { Route } from "./+types/article.$id";
import { Link, useLoaderData } from "react-router";
import '../css/Articles.css';

export async function loader({params}:Route.LoaderArgs) {
    const id = Number(params.id);
    if(isNaN(id)) throw new Response('Not Found', {status:404});
    const art = await (prisma.article as any).findUnique({where:{id}});
    if(!art) throw new Response('Not Found', {status : 404});
    return {
        article:{
            id:art.id,
            title:art.title,
            description:art.body,
            htmlContent:art.htmlContent ?? null,
            author:art.author,
            date: new Date(art.createdAt).toLocaleDateString('id-ID',{
                day:'numeric',month:'long',year:'numeric'
            })
        }
    }
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
    const {article} = useLoaderData<typeof loader>();
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