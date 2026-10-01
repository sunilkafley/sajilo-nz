import { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { tasks } from '../checklist/tasks';
import { fetchGuides, GuideError, type Guide, type Language } from './api';
export function GuidePage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const language: Language = params.get('lang') === 'ne' ? 'ne' : 'en';
  const [state, setState] = useState<{ language: Language; guides?: Guide[]; error?: string }>({ language });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ language });
    fetchGuides(language, controller.signal).then(guides => setState({ language, guides })).catch(error => {
      if (!controller.signal.aborted) setState({ language, error: error instanceof GuideError ? error.message : 'Could not connect to guides. Check your connection and try again.' });
    });
    return () => controller.abort();
  }, [language, attempt]);
  const guides = state.language === language ? state.guides : undefined;
  const guide = guides?.find(item => item.slug === slug);
  return <>
    <p className="eyebrow">BEFORE YOU FLY / GUIDES</p>
    <h1>{slug ? (guide?.title ?? 'Pre-departure guide') : 'Prepare with confidence'}</h1>
    <div className="guide-language"><label htmlFor="guide-language">Guide language / भाषा</label>{' '}
      <select id="guide-language" value={language} onChange={event => setParams({ lang: event.target.value })}>
        <option value="en">English</option><option value="ne">नेपाली</option>
      </select>
    </div>
    <p className="intro">Read reviewed guidance, check the official sources and take your next step.</p>
    {state.error && <div role="alert" className="notice warning"><p>{state.error}</p><button onClick={() => setAttempt(n => n + 1)}>Try again</button></div>}
    {!guides && !state.error && <p role="status">Loading guides…</p>}
    {guides && !slug && (guides.length ? <div className="groups">{guides.map(item => <article className="card" key={item.slug} lang={language}>
      <h2><Link to={`/guides/${item.slug}?lang=${language}`}>{item.title}</Link></h2><p>{item.summary}</p>
      <p>Last verified: <time dateTime={item.verified_on}>{item.verified_on}</time></p>
      {item.review_overdue && <p className="notice">Review due — check the official source for updates.</p>}
    </article>)}</div> : <div className="card"><h2>No reviewed guides available yet</h2><p>Guides in this language will appear after review. You can still use your planning checklist.</p></div>)}
    {guides && slug && !guide && <div className="card"><h2>Guide unavailable in this language</h2><p>It may not have been published or reviewed yet. Try another language or return to all guides.</p></div>}
    {guide && <article className="card guide-body" lang={language}>
      <p>Last verified: <time dateTime={guide.verified_on}>{guide.verified_on}</time> · Next review: <time dateTime={guide.next_review_on}>{guide.next_review_on}</time></p>
      {guide.review_overdue && <p role="status" className="notice warning">Review due — check the official sources for updates.</p>}
      {guide.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <h2>Official sources</h2><ul className="sources">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span>Opens in a new tab</span></a></li>)}</ul>
      {!!guide.checklist_ids.length && <><h2>Your next steps</h2><ul>{guide.checklist_ids.map(id => <li key={id}><Link to={`/predeparture?task=${encodeURIComponent(id)}`}>{tasks.find(task => task.id === id)?.label}</Link></li>)}</ul></>}
      <p className="notice">General planning guidance. This does not determine your immigration eligibility. Check official information for your circumstances.</p>
    </article>}
    <div className="guide-actions">{slug && <Link to={`/guides?lang=${language}`}>All guides</Link>}<Link className="button" to="/predeparture">Open my checklist</Link></div>
  </>;
}
