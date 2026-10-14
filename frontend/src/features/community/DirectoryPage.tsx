import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { eventStatus, fetchDirectory, kinds, type DirectoryPage as Page, type Listing } from './api';
import { withLanguage } from '../explore/topicConfig';
import './directory.css';
const sourceLabels={official:'Official authority',community:'Third-party community organisation',commercial:'Commercial business — not an endorsement'};
const time=(value:string)=>new Intl.DateTimeFormat('en-NZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Pacific/Auckland'}).format(new Date(value));
export function DirectoryPage() {
  const {listingSlug}=useParams();const [params,setParams]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const [query,setQuery]=useState(params.get('q') || '');
  useEffect(()=>setQuery(params.get('q') || ''),[params.toString()]);
  const [attempt,setAttempt]=useState(0);
  const key=JSON.stringify([listingSlug,params.toString(),attempt]);
  const [state,setState]=useState<{key:string;data?:Page;error?:boolean}>();
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    fetchDirectory(params,controller.signal,listingSlug).then(data=>{if(active)setState({key,data});}).catch(()=>{if(active)setState({key,error:true});});
    return ()=>{active=false;controller.abort();};
  },[key]);
  const current=state?.key===key?state:undefined;
  const link=(path:string)=>withLanguage(path,language);
  const context=params.size?'?'+params.toString():'';
  function filter(name:string,value:string){const next=new URLSearchParams(params);next.delete('page');if(value)next.set(name,value);else next.delete(name);setParams(next);}
  function card(item:Listing){return <article className="card" key={item.slug} lang={item.language}>
    <p className="eyebrow">{kinds[item.kind]} · {item.language==='ne'?'नेपाली':'English'}</p>
    <h2>{listingSlug?item.title:<Link to={'/community/'+item.slug+context}>{item.title}</Link>}</h2><p>{item.city} · {item.category}</p><p>{item.summary}</p>
    {item.kind==='event' && <div className="notice"><strong>{eventStatus(item)}</strong><p><time dateTime={item.starts_at!}>{time(item.starts_at!)}</time>{item.ends_at && <> – <time dateTime={item.ends_at}>{time(item.ends_at)}</time></>} (Pacific/Auckland)</p></div>}
    {listingSlug && <p className="article-text">{item.body}</p>}
    <div className="article-attribution" lang="en"><p>{sourceLabels[item.source_kind]}</p><a href={item.source_url} rel="noopener noreferrer">Visit source: {item.source_hostname} (external website)</a>
      <p>Content reviewed <time dateTime={item.verified_on}>{item.verified_on}</time> · Next review <time dateTime={item.next_review_on}>{item.next_review_on}</time></p>
      {item.review_overdue && <p className="notice warning">Review overdue. Confirm current details directly.</p>}</div></article>;}
  return <section className="directory-page"><p className="eyebrow">Community / Local services</p><h1>{listingSlug?'Community listing':'A little closer to home'}</h1>
    <p>Discover published organisations, events and local businesses. Listings are information, not endorsements; confirm current services and event details with the source.</p>
    <nav className="directory-actions" aria-label="Community resources"><Link to={link('/explore/community')}>Community articles</Link><Link to={link('/cities/christchurch')}>Christchurch preparation</Link>{listingSlug?<Link to={'/community'+context}>Back to directory</Link>:<button onClick={()=>filter('city','Christchurch')}>Browse Christchurch pilot</button>}</nav>
    {!listingSlug && <form className="directory-filters" onSubmit={event=>{event.preventDefault();filter('q',query.trim());}}><label>Search directory<input type="search" maxLength={200} value={query} onChange={event=>setQuery(event.target.value)}/></label><button>Search listings</button>
      {(['city','kind','category'] as const).map(field=><label key={field}>{field==='kind'?'Type':field==='city'?'Location':'Category'}<select value={params.get(field)||''} onChange={event=>filter(field,event.target.value)}><option value="">All</option>
        {params.get(field) && !current?.data?.facets[field].includes(params.get(field)!) && <option value={params.get(field)!}>{params.get(field)} (selected)</option>}
        {current?.data?.facets[field].map(value=><option key={value} value={value}>{field==='kind'?kinds[value as keyof typeof kinds]:value}</option>)}</select></label>)}
      <button type="button" onClick={()=>setParams(language==='ne'?{lang:'ne'}:{})}>Reset filters</button></form>}
    {!current && <p role="status">Loading published listings…</p>}
    {current?.error && <div role="alert"><p>Directory unavailable. Check your connection and try again. Listings are not saved offline.</p><button onClick={()=>setAttempt(n=>n+1)}>Try again</button></div>}
    {current?.data && <>{!current.data.results.length?<div className="card"><h2>{listingSlug?'Listing unavailable':'No published listings match'}</h2><p>There may be no reviewed content in this language, or the record may have been withdrawn.</p>{language==='ne' && <Link to={(listingSlug?'/community/'+listingSlug:'/community')+'?'+new URLSearchParams({...Object.fromEntries(params),lang:'en'})}>Check English availability</Link>}</div>:<><p>{current.data.count} published {listingSlug?'listing':'listings'}</p><div className={listingSlug?'directory-reading':'directory-grid'}>{current.data.results.map(card)}</div></>}
    {!listingSlug && <nav className="directory-actions" aria-label="Directory pages"><button disabled={!(Number(params.get('page'))>1)} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(Number(params.get('page'))-1));setParams(next);}}>Previous page</button><span>Page {params.get('page')||1}</span><button disabled={!current.data.hasNext} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(Number(params.get('page')||1)+1));setParams(next);}}>Next page</button></nav>}</>}
  </section>;
}
