import type { Language } from '../guides/api';

export const filterFields = ['city','qualification_level','subject','provider','duration','intake'] as const;
export type FilterField = typeof filterFields[number];
export interface Course {
  slug:string; language:Language; title:string; summary:string; body:string;
  provider:string; city:string; subject:string; qualification_level:number|null;
  duration:string; intake:string; tuition:string; entry_requirements:string;
  source_url:string; source_hostname:string; source_kind:'official'|'provider';
  verified_on:string; next_review_on:string; review_overdue:boolean;
}
export interface CoursePage {results:Course[]; count:number; next:boolean; facets:Record<FilterField,string[]>}
const invalid=()=>new Error('Course information could not be loaded safely.');
const validDate=(value:unknown)=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
export function parseCourse(value:unknown,language:Language):Course {
  if(!value || typeof value!=='object')throw invalid();
  const c=value as Record<string,unknown>;
  const fields=['slug','title','summary','body','provider','city','subject','duration','intake','tuition','entry_requirements','source_url','source_hostname'];
  if(fields.some(key=>typeof c[key]!=='string') || !/^[\w-]+$/.test(c.slug as string) || !c.title || c.topic!=='study' || c.language!==language ||
    !['official','provider'].includes(c.source_kind as string) || typeof c.review_overdue!=='boolean' ||
    !validDate(c.verified_on) || !validDate(c.next_review_on) || (c.next_review_on as string)<=(c.verified_on as string) ||
    !(c.qualification_level===null || Number.isInteger(c.qualification_level) && Number(c.qualification_level)>=1 && Number(c.qualification_level)<=10))throw invalid();
  const url=new URL(c.source_url as string);
  if(url.protocol!=='https:' || url.hostname!==c.source_hostname || url.username || url.password || url.port || /[\s\\]/.test(c.source_url as string))throw invalid();
  return value as Course;
}
async function read(url:string,signal:AbortSignal) {
  return fetch(url,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(8000)])});
}
export async function getCourse(slug:string,language:Language,signal:AbortSignal):Promise<Course|null> {
  const response=await read(`/api/explore/courses/${encodeURIComponent(slug)}/?lang=${language}`,signal);
  if(response.status===404)return null;
  if(!response.ok)throw invalid();
  const course=parseCourse(await response.json(),language);
  if(course.slug!==slug)throw invalid();
  return course;
}
export async function getCourses(params:URLSearchParams,signal:AbortSignal):Promise<CoursePage> {
  const language=params.get('lang')==='ne'?'ne':'en';
  const query=new URLSearchParams({lang:language});
  for(const key of ['q','page',...filterFields])if(params.get(key))query.set(key,params.get(key)!);
  const response=await read('/api/explore/courses/?'+query,signal);
  if(!response.ok)throw invalid();
  const data=await response.json();
  if(!Array.isArray(data.results) || !Number.isSafeInteger(data.count) || data.count<0 || !(data.next===null || typeof data.next==='string') || !data.facets)throw invalid();
  const results=data.results.map((c:unknown)=>parseCourse(c,language));
  if(new Set(results.map((c:Course)=>c.slug)).size!==results.length)throw invalid();
  const facets={} as Record<FilterField,string[]>;
  for(const key of filterFields) {
    if(!Array.isArray(data.facets[key]) || data.facets[key].some((v:unknown)=> key==='qualification_level' ? !Number.isInteger(v) || Number(v)<1 || Number(v)>10 : typeof v!=='string'))throw invalid();
    facets[key]=data.facets[key].map(String);
  }
  return {results,count:data.count,next:data.next!==null,facets};
}
