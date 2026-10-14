import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchArticles, type Article, type ArticlePage } from './articles';
import { introductionPages, topicConfig, withLanguage } from './topicConfig';
import './explore.css';

function Attribution({article}:{article:Article}) {
  return <div className="article-attribution" lang="en">
    {article.article_type==='general' && <p>General information · Sajilo NZ editorial content, not official guidance.</p>}
    {article.source_url && <a href={article.source_url} rel="noopener noreferrer">Official source: {article.source_hostname} (online)</a>}
    <p>Reviewed <time dateTime={article.verified_on}>{article.verified_on}</time> · Next review <time dateTime={article.next_review_on}>{article.next_review_on}</time></p>
    {article.review_overdue && <p className="notice warning">{article.source_url?'Review overdue. Check the current official source before acting.':'Editorial review overdue. This information may need updating.'}</p>}</div>;
}
function ArticleBody({article}:{article:Article}) {
  return <><p className="article-text">{article.body}</p>{article.sections.map((section,index)=><section key={index}><h3>{section.heading}</h3><p className="article-text">{section.body}</p></section>)}</>;
}
type State={key:string; data?:ArticlePage; error?:string};
export function TopicPage() {
  const {topicId='',slug}=useParams();
  const config=Object.hasOwn(topicConfig,topicId)?topicConfig[topicId]:undefined;
  const [params,setParams]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const parsed=Number(params.get('page') || 1);
  const page=Number.isSafeInteger(parsed)&&parsed>0?parsed:1;
  const [attempt,setAttempt]=useState(0);
  const key=JSON.stringify([topicId,slug,language,page,attempt]);
  const [state,setState]=useState<State>({key:''});
  useEffect(()=>{
    if(!config)return;
    const controller=new AbortController();let active=true;
    fetchArticles(topicId,language,page,controller.signal,slug).then(data=>{if(active)setState({key,data});})
      .catch(()=>{if(active)setState({key,error:'Information is unavailable right now. Check your connection and try again.'});});
    return ()=>{active=false;controller.abort();};
  },[topicId,slug,language,page,attempt,key,config]);
  const current=state.key===key?state:undefined;
  const data=current?.data;
  const article=slug?data?.results[0]:undefined;
  const link=(path:string)=>withLanguage(path,language);
  const reserved=introductionPages.find(p=>p.slug===slug);
  const title=article?.title || (slug && topicId==='aotearoa'?reserved?.title:undefined) || (slug && topicId==='cities'?slug.replace(/^./,s=>s.toUpperCase()):undefined) || (slug?(!current?'Loading article…':'Article unavailable'):config?.heading);
  useEffect(()=>{document.title=`${article?.title || config?.title || 'Topic unavailable'} · Sajilo NZ`;},[article?.title,config?.title,key]);
  if(!config)return <section><h1>Topic unavailable</h1><p>This topic is not available.</p><Link to={link('/explore')}>Browse all Explore topics</Link></section>;
  function changePage(next:number){const query=new URLSearchParams(params);query.set('page',String(next));setParams(query);}
  return <div className="topic-page">
    <nav className="topic-breadcrumb" aria-label="Breadcrumb"><Link to={link('/explore')}>Explore</Link><span aria-hidden="true"> / </span>{slug?<Link to={link('/explore/'+topicId)}>{config.title}</Link>:<span>{config.title}</span>}</nav>
    <p className="eyebrow">{config.title}</p><h1 lang={article?language:undefined}>{title}</h1>
    <p className="intro" lang={article?language:undefined}>{article?.summary || config.intro}</p>
    {!slug && (topicId==='study' || topicId==='education') && <p><Link className="button" to={link('/explore/study/courses')}>Find courses and compare options</Link></p>}
    <div className={'topic-layout'+(slug?' topic-reading':'')}>
      <section aria-label={slug?'Article':config.section} className="topic-content">
        {!slug && <h2>{config.section}</h2>}
        <p className="topic-language">Content language: {language==='ne'?'नेपाली':'English'}</p>
        {!current && <p role="status">Loading published information…</p>}
        {current?.error && <div role="alert" className="card"><p>{current.error} These articles are not saved for offline reading.</p><button onClick={()=>setAttempt(n=>n+1)}>Try again</button>{page>1 && <p><Link to={link('/explore/'+topicId)}>Return to the first page</Link></p>}<p><Link to={link('/saved')}>Open previously saved guides</Link></p></div>}
        {data && !data.results.length && <div className="card"><h2>{slug?'This article is not available':'No published articles yet'}</h2><p>{slug?'It may not be published in this language, or it may have been withdrawn.':'There are no published articles for this topic in the selected language yet.'}</p>{language==='ne' && <Link to={withLanguage('/explore/'+topicId+(slug?'/'+slug:''),'en')}>Check English availability</Link>}</div>}
        {article && <article className="card" lang={language}><ArticleBody article={article}/><Attribution article={article}/></article>}
        {!slug && data && <div className={config.layout==='accordion'?'topic-accordions':'topic-articles'}>{data.results.map(item=>config.layout==='accordion'
          ? <details className="card" key={item.slug} lang={language}><summary>{item.title}</summary><div><p>{item.summary}</p><ArticleBody article={item}/><Attribution article={item}/><Link to={link(`/explore/${topicId}/${item.slug}`)}>Read full article: {item.title}</Link></div></details>
          : <article className="card" key={item.slug} lang={language}><p className="eyebrow">{language==='ne'?'नेपाली':'English'} · Article</p><h3><Link to={link(`/explore/${topicId}/${item.slug}`)}>{item.title}</Link></h3><p>{item.summary}</p><Attribution article={item}/></article>)}</div>}
        {!slug && data && (page>1 || data.hasNext) && <nav className="topic-pagination" aria-label="Article pages"><button disabled={page<=1} onClick={()=>changePage(page-1)}>Previous page</button><span>Page {page} · {data.count} articles</span><button disabled={!data.hasNext} onClick={()=>changePage(page+1)}>Next page</button></nav>}
      </section>
      <aside className="topic-related card" aria-label="Related resources"><h2>Useful next places</h2><ul>{config.related.map(item=><li key={item.to}><Link to={link(item.to)}>{item.title}</Link></li>)}</ul><p>Planning tasks and saved progress stay in Journey.</p><Link to={link('/journey')}>Open Journey</Link></aside>
    </div>
  </div>;
}
