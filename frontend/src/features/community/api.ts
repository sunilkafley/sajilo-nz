import type { Language } from '../guides/api';
export const kinds={organisation:'Organisation',business:'Business',event:'Event'} as const;
export type Listing={slug:string;language:Language;title:string;summary:string;body:string;city:string;category:string;kind:keyof typeof kinds;source_kind:'official'|'community'|'commercial';source_url:string;source_hostname:string;verified_on:string;next_review_on:string;review_overdue:boolean;starts_at:string|null;ends_at:string|null};
export type DirectoryPage={results:Listing[];count:number;hasNext:boolean;facets:Record<'city'|'kind'|'category',string[]>};
const invalid=()=>new Error('Directory information could not be loaded safely.');
const validDate=(v:unknown)=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
const validTime=(v:unknown)=>typeof v==='string' && /T.*(Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v));
export function parseListing(value:unknown,language:Language):Listing {
  if(!value || typeof value!=='object')throw invalid();
  const a=value as Record<string,unknown>;
  if(['slug','title','summary','body','city','category','source_url','source_hostname'].some(k=>typeof a[k]!=='string') ||
    !/^[\w-]+$/.test(a.slug as string) || !a.title || a.language!==language || !Object.hasOwn(kinds,String(a.kind)) ||
    !(a.kind==='business'?a.source_kind==='commercial':['official','community'].includes(String(a.source_kind))) ||
    !validDate(a.verified_on) || !validDate(a.next_review_on) || String(a.next_review_on)<=String(a.verified_on) || typeof a.review_overdue!=='boolean')throw invalid();
  const url=new URL(a.source_url as string);
  if(url.protocol!=='https:' || url.hostname!==a.source_hostname || url.username || url.password || url.port || /[\s\\]/.test(a.source_url as string))throw invalid();
  if(a.kind==='event') {
    if(!validTime(a.starts_at) || (a.ends_at!==null && (!validTime(a.ends_at) || Date.parse(String(a.ends_at))<=Date.parse(String(a.starts_at)))))throw invalid();
  } else if(a.starts_at!==null || a.ends_at!==null)throw invalid();
  return value as Listing;
}
export function eventStatus(entry:Listing,now=Date.now()):string {
  if(entry.kind!=='event')return '';
  if(entry.ends_at && Date.parse(entry.ends_at)<now)return 'Past event';
  return Date.parse(entry.starts_at!)<=now?'Started — check organiser for current status':'Scheduled event — confirm with organiser';
}
export async function fetchDirectory(params:URLSearchParams,signal:AbortSignal,slug?:string):Promise<DirectoryPage> {
  const language=params.get('lang')==='ne'?'ne':'en';
  const query=new URLSearchParams({lang:language});
  if(!slug)for(const key of ['q','page','city','kind','category'])if(params.get(key))query.set(key,params.get(key)!);
  const response=await fetch(`/api/explore/directory/${slug?encodeURIComponent(slug)+'/':''}?${query}`,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(8000)])});
  const facets={city:[],kind:[],category:[]};
  if(slug && response.status===404)return {results:[],count:0,hasNext:false,facets};
  if(!response.ok)throw invalid();
  const data=await response.json();
  if(slug){const item=parseListing(data,language);if(item.slug!==slug)throw invalid();return {results:[item],count:1,hasNext:false,facets};}
  if(!Array.isArray(data.results) || !Number.isSafeInteger(data.count) || data.count<0 || !(data.next===null || typeof data.next==='string'))throw invalid();
  for(const key of ['city','kind','category'])if(!Array.isArray(data.facets?.[key]) || data.facets[key].some((v:unknown)=>typeof v!=='string' || (key==='kind' && !Object.hasOwn(kinds,v))))throw invalid();
  const results=data.results.map((item:unknown)=>parseListing(item,language));
  if(new Set(results.map((item:Listing)=>item.slug)).size!==results.length)throw invalid();
  return {results,count:data.count,hasNext:data.next!==null,facets:data.facets};
}
