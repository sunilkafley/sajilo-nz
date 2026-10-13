import type { Language } from '../guides/api';
export interface Article {
  slug:string; language:Language; topic:string; title:string; summary:string; body:string;
  sections:{heading:string;body:string}[]; source_url:string; source_hostname:string; source_kind:'official';
  verified_on:string; next_review_on:string; review_overdue:boolean;
}
export interface ArticlePage { results:Article[]; count:number; hasNext:boolean }
export class ArticleError extends Error {}
const invalid=()=>new ArticleError('The information could not be loaded safely. Please try again later.');
const date=(v:unknown)=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
export function parseArticle(value:unknown, topic:string, language:Language):Article {
  if(!value || typeof value!=='object')throw invalid();
  const a=value as Record<string,unknown>;
  if(!['slug','title','summary','source_url','source_hostname'].every(k=>typeof a[k]==='string' && !!a[k]) ||
    !/^[\w-]+$/.test(a.slug as string) || a.topic!==topic || a.language!==language || typeof a.body!=='string' ||
    a.source_kind!=='official' || !date(a.verified_on) || !date(a.next_review_on) || (a.next_review_on as string)<=(a.verified_on as string) || typeof a.review_overdue!=='boolean' ||
    !Array.isArray(a.sections) || a.sections.some(s=>!s || typeof s.heading!=='string' || typeof s.body!=='string'))throw invalid();
  try {
    const url=new URL(a.source_url as string);
    if(url.protocol!=='https:' || url.hostname!==a.source_hostname || url.username || url.password || url.port || /[\s\\]/.test(a.source_url as string))throw invalid();
  } catch {throw invalid();}
  return value as Article;
}
export async function fetchArticles(topic:string, language:Language, page:number, signal:AbortSignal, slug?:string):Promise<ArticlePage> {
  const query=new URLSearchParams({topic,lang:language});
  if(!slug)query.set('page',String(page));
  const response=await fetch(`/api/explore/articles/${slug?encodeURIComponent(slug)+'/':''}?${query}`,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(8000)])});
  if(response.status===404 && slug)return {results:[],count:0,hasNext:false};
  if(!response.ok)throw new ArticleError('Information is unavailable right now. Check your connection and try again.');
  const data:unknown=await response.json();
  if(slug){const article=parseArticle(data,topic,language);if(article.slug!==slug)throw invalid();return {results:[article],count:1,hasNext:false};}
  if(!data || typeof data!=='object')throw invalid();
  const p=data as Record<string,unknown>;
  if(!Array.isArray(p.results) || !Number.isSafeInteger(p.count) || (p.count as number)<0 || !(p.next===null || typeof p.next==='string'))throw invalid();
  const results=p.results.map(a=>parseArticle(a,topic,language));
  if(new Set(results.map(a=>a.slug)).size!==results.length)throw invalid();
  // Never follow a response-supplied URL: subsequent requests use this same endpoint.
  return {results,count:p.count as number,hasNext:p.next!==null};
}
