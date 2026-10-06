import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PrototypeIcon } from '../../components/PrototypeIcon';
import { useSearch } from './useSearch';
import type { SearchResult } from './domain';
import './search.css';

const resultsUrl = (query:string) => `/search?q=${encodeURIComponent(query.trim())}`;
function ResultText({result}:{result:SearchResult}) {
  return <><strong lang={result.language}>{result.title}</strong><span className="search-meta">{result.type} · {result.language==='ne'?'नेपाली':'English'}{result.status && ` · ${result.status}`}</span><span className="search-excerpt" lang={result.language}>{result.excerpt}</span></>;
}
function SearchStatus({state}:{state:ReturnType<typeof useSearch>}) {
  return <div role="status" className="search-status">
    {!state.query ? 'Enter a search term to find guides, checklists and topics.' : state.loading ? 'Searching Sajilo NZ…' : <>
      {state.partial && <p>Some guides could not be searched. Results may be incomplete. <button type="button" onClick={state.retry}>Try again</button></p>}
      {!state.results.length && (state.partial ? 'No matches in the available results.' : 'No results found. Try another word.')}
    </>}
  </div>;
}
export function SiteSearch() {
  const location = useLocation(), navigate = useNavigate();
  const [query,setQuery] = useState('');
  const [open,setOpen] = useState(false);
  const [active,setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const state = useSearch(query,open);
  const suggestions = state.results.slice(0,5);
  useEffect(()=>{
    setOpen(false);setActive(-1);
    setQuery(location.pathname === '/search' ? new URLSearchParams(location.search).get('q') ?? '' : '');
  },[location.pathname,location.search]);
  useEffect(()=>setActive(-1),[query,state.loading]);
  useEffect(()=>{
    if(open && active>=0) document.getElementById(`search-option-${active}`)?.scrollIntoView?.({block:'nearest'});
  },[open,active]);
  return <form className="site-search" role="search" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}
    onSubmit={event=>{event.preventDefault();setOpen(false);navigate(resultsUrl(query));}}>
    <div className="search-input-row"><PrototypeIcon name="search"/>
      <input ref={input} role="combobox" aria-label="Search Sajilo NZ guides, checklists and topics" placeholder="Search Sajilo NZ" autoComplete="off"
        aria-autocomplete="list" aria-expanded={open} aria-controls={open?'site-search-options':undefined}
        aria-activedescendant={open && active>=0 ? `search-option-${active}` : undefined}
        value={query} onFocus={()=>setOpen(true)} onChange={event=>{setQuery(event.target.value);setActive(-1);setOpen(true);}}
        onKeyDown={event=>{
          if (event.nativeEvent.isComposing) return;
          if(event.key==='Escape'){event.preventDefault();setOpen(false);setActive(-1);}
          if(event.key==='ArrowDown' || event.key==='ArrowUp'){
            event.preventDefault();setOpen(true);
            setActive(value=>event.key==='ArrowDown'?Math.min(value+1,suggestions.length):Math.max(value-1,0));
          }
          if(event.key==='Enter' && open && active>=0){
            event.preventDefault();const target=suggestions[active]?.to ?? resultsUrl(query);setOpen(false);
            if(target.startsWith('https://')) window.location.assign(target); else navigate(target);
          }
        }}/>
      <button type="submit" className="search-submit" aria-label="View all search results"><PrototypeIcon name="arrow"/></button>
    </div>
    {open && <div className="search-dropdown">
      <SearchStatus state={state}/>
      <ul id="site-search-options" role="listbox" aria-label="Search suggestions">
        {suggestions.map((result,index)=><li role="presentation" key={result.to}><a role="option" aria-selected={active===index} id={`search-option-${index}`} tabIndex={-1} href={result.to.startsWith('https://')?result.to:`#${result.to}`} onMouseDown={event=>event.preventDefault()} onClick={()=>setOpen(false)}><ResultText result={result}/></a></li>)}
        <li role="presentation"><Link role="option" aria-selected={active===suggestions.length} id={`search-option-${suggestions.length}`} to={resultsUrl(query)} onClick={()=>setOpen(false)}>View all results</Link></li>
      </ul>
    </div>}
  </form>;
}
export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const state = useSearch(query);
  return <section className="search-page"><p className="eyebrow">EXPLORE / SEARCH</p><h1>Search results</h1>
    {query.trim() && <p>Results for “{query}”</p>}
    <SearchStatus state={state}/>
    {!state.loading && !!state.results.length && <><p>{state.results.length} results</p><ul className="search-results">{state.results.map(result=><li key={result.to}>
      {result.to.startsWith('https://') ? <a href={result.to}><ResultText result={result}/></a> : <Link to={result.to}><ResultText result={result}/></Link>}
    </li>)}</ul></>}
  </section>;
}
