import { parseArticle } from '../explore/articles';
import { parseCourse } from '../courses/api';
import { parseListing } from '../community/api';
import { topicConfig } from '../explore/topicConfig';
import type { SearchEntry } from './domain';
import type { Language } from '../guides/api';
export type Resource = 'articles'|'courses'|'directory';
export function editorialEntry(raw:unknown,resource:Resource,language:Language):SearchEntry {
  if(!raw || typeof raw!=='object')throw new Error('Invalid resource');
  const metadata=raw as {topic:string;stage:string;tags:string[]};
  if(!Object.hasOwn(topicConfig,metadata.topic) || !['','predeparture','firstweek','settling','daily'].includes(metadata.stage) ||
    !Array.isArray(metadata.tags) || metadata.tags.some(tag=>typeof tag!=='string'))throw new Error('Invalid resource metadata');
  const record=resource==='articles'?parseArticle(raw,metadata.topic,language):resource==='courses'?parseCourse(raw,language):parseListing(raw,language);
  const route=resource==='articles'?`/explore/${metadata.topic}/${record.slug}`:resource==='courses'?`/explore/study/courses/${record.slug}`:`/community/${record.slug}`;
  const extra=resource==='articles'?parseArticle(raw,metadata.topic,language).sections.flatMap(s=>[s.heading,s.body]):resource==='courses'?[parseCourse(raw,language).provider,parseCourse(raw,language).subject]:[parseListing(raw,language).city,parseListing(raw,language).category];
  const classification=resource==='directory'?parseListing(raw,language).source_kind==='commercial'?'Commercial listing · not an endorsement':'Community/official source listing':resource==='articles' && parseArticle(raw,metadata.topic,language).article_type==='general'?'General editorial information':'Sourced content';
  return {title:record.title,language,type:resource==='articles'?'Article':resource==='courses'?'Course':'Directory listing',topic:metadata.topic,stage:metadata.stage,
    to:route+'?lang='+language,text:[record.summary,record.body,...extra,...metadata.tags].join(' '),
    status:`${classification} · Reviewed ${record.verified_on}${record.review_overdue?' · review overdue':''}`};
}
// Bounded sequential pages per catalogue, concurrent catalogues. Never follow server-supplied URLs.
export async function loadEditorial(resource:Resource,language:Language,signal:AbortSignal) {
  const entries:SearchEntry[]=[];
  try {
    for(let page=1;page<=20;page++) {
      const response=await fetch(`/api/explore/${resource}/?lang=${language}&page=${page}`,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(8000)])});
      if(!response.ok)throw new Error('Unavailable catalogue');
      const data=await response.json();
      if(!Array.isArray(data.results) || data.results.length>24 || !(data.next===null || typeof data.next==='string'))throw new Error('Invalid page');
      entries.push(...data.results.map((record:unknown)=>editorialEntry(record,resource,language)));
      if(data.next===null)return {entries,partial:false};
    }
  } catch { /* Keep only already validated public pages and disclose incompleteness. */ }
  return {entries,partial:true};
}
