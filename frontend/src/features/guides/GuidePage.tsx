import { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { readSaved, writeSaved, snapshot, reconcile, searchGuides, reviewDue, savedKey, arrivalSavedKey, type SavedGuide } from './saved';
import { tasks } from '../checklist/tasks';
import { arrivalTasks } from '../arrival/tasks';
import { fetchGuides, GuideError, type Guide, type Language, type GuideStage } from './api';
import { topics, topicGuides, guideLocation } from './topics';
import { findCity, cityGuides } from '../cities/catalog';
import { CityIntro } from '../cities/CityIntro';
export function GuidePage({ savedOnly = false }: { savedOnly?: boolean }) {
  const [params] = useSearchParams();
  const stage = params.get('stage') ?? 'predeparture';
  if (stage !== 'predeparture' && stage !== 'firstweek') return <><h1>Guide stage unavailable</h1><p role="alert">Choose pre-departure or first-week guides.</p><Link to="/guides">Browse pre-departure guides</Link></>;
  return <StageGuidePage key={stage} savedOnly={savedOnly} stage={stage}/>;
}
function StageGuidePage({ savedOnly, stage }: { savedOnly: boolean; stage: GuideStage }) {
  const storageKey = stage === 'firstweek' ? arrivalSavedKey : savedKey;
  const catalogue = stage === 'firstweek' ? arrivalTasks : tasks;
  const checklistPath = stage === 'firstweek' ? '/firstweek' : '/predeparture';
  const [saved, setSaved] = useState<SavedGuide[]>([]);
  const [storageError, setStorageError] = useState('');
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  function reloadSaved() { try { setSaved(readSaved(undefined, storageKey)); setStorageError(''); } catch { setStorageError('Saved guides could not be read. Existing data has been preserved.'); } }
  function persist(change: (items: SavedGuide[]) => SavedGuide[]) {
    try { setSaved(writeSaved(change, undefined, storageKey)); setStorageError(''); return true; }
    catch { setStorageError('Could not save changes to this browser. Check available storage and try again. Existing saved data has been preserved.'); return false; }
  }
  useEffect(() => { reloadSaved(); const listener = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) reloadSaved(); }; window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener); }, []);
  const { slug, cityId } = useParams();
  const [params, setParams] = useSearchParams();
  const cityKey = cityId ?? params.get('city');
  const city = findCity(cityKey);
  const unknownCity = !!cityKey && !city;
  const language: Language = params.get('lang') === 'ne' ? 'ne' : 'en';
  const topic = params.get('topic');
  const unknownTopic = !!topic && (stage === 'firstweek' || !topics.some(item => item.id === topic));
  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  const [state, setState] = useState<{ language: Language; guides?: Guide[]; error?: string }>({ language });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { const online = () => setAttempt(n => n + 1); window.addEventListener('online', online); return () => window.removeEventListener('online', online); }, []);
  useEffect(() => {
    setQuery(''); setMessage('');
    const controller = new AbortController();
    setState({ language });
    fetchGuides(language, controller.signal, stage).then(guides => { if (controller.signal.aborted) return; setState({ language, guides }); try { const current = readSaved(undefined, storageKey); if (current.some(item => item.language === language)) persist(items => reconcile(items, language, guides)); } catch { reloadSaved(); } }).catch(error => {
      if (!controller.signal.aborted) setState({ language, error: error instanceof GuideError ? error.message : 'Could not connect to guides. Check your connection and try again.' });
    });
    return () => controller.abort();
  }, [language, attempt, savedOnly, slug, cityId]);
  const live = state.language === language ? state.guides : undefined;
  const error = state.language === language ? state.error : undefined;
  const copies = saved.filter(item => item.language === language);
  const fallback = !live && !!error;
  const available = live ?? (fallback ? copies.flatMap(item => item.guide ? [item.guide] : []) : undefined);
  // Reconcile the full language catalogue above before applying presentation filters.
  const guides = available && searchGuides(topicGuides(cityGuides(savedOnly ? available.filter(guide => copies.some(item => item.slug === guide.slug)) : available, cityKey), topic), query);
  const guide = available && cityGuides(available, cityKey).find(item => item.slug === slug);
  const savedCopy = copies.find(item => item.slug === slug);
  function toggle(guide: Guide) {
    setMessage('');
    const exists = copies.some(item => item.slug === guide.slug);
    if (persist(items => exists ? items.filter(item => !(item.slug === guide.slug && item.language === language)) : [...items.filter(item => !(item.slug === guide.slug && item.language === language)), snapshot(guide)])) setMessage(exists ? 'Saved guide removed.' : 'Guide saved to this browser.');
  }
  function saveButton(guide: Guide) { return <button onClick={() => toggle(guide)}>{copies.some(item => item.slug === guide.slug) ? 'Remove saved guide' : 'Save guide'}</button>; }
  return <>
    <p className="eyebrow">{stage === 'firstweek' ? 'FIRST WEEK / GUIDES' : cityKey ? 'EXPLORE / CITY GUIDES' : 'BEFORE YOU FLY / GUIDES'}</p>
    <h1>{unknownCity ? 'City unavailable' : slug ? (guide?.title ?? (stage === 'firstweek' ? 'First-week guide' : 'Pre-departure guide')) : savedOnly ? (city ? `Saved ${city.title} guides` : stage === 'firstweek' ? 'Saved first-week guides' : 'Saved guides') : city ? city.title : stage === 'firstweek' ? 'Settle in, one step at a time' : 'Prepare with confidence'}</h1>
    <p><Link to={guideLocation(savedOnly ? '/saved' : '/guides', language, null)}>Pre-departure guidance</Link> · <Link to={guideLocation(savedOnly ? '/saved' : '/guides', language, null, null, 'firstweek')}>First-week guidance</Link></p>
    {cityId && city && <><p className="intro">Your city, one step at a time. Start with preparation for your arrival.</p><CityIntro/></>}
    {unknownCity && <p role="alert" className="notice warning">This city is not available yet. <Link to="/explore">Return to Explore</Link></p>}
    <div className="guide-language"><label htmlFor="guide-language">Guide language / भाषा</label>{' '}
      <select id="guide-language" value={language} onChange={event => changeParam('lang', event.target.value)}>
        <option value="en">English</option><option value="ne">नेपाली</option>
      </select>
    </div>
    {!slug && stage === 'predeparture' && <div className="guide-language"><label htmlFor="guide-topic">Guide topic</label>{' '}
      <select id="guide-topic" value={topic ?? ''} onChange={event => changeParam('topic', event.target.value)}>
        <option value="">All topics</option>{unknownTopic && <option value={topic!}>Unavailable topic</option>}
        {topics.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
    </div>}
    {unknownTopic && !slug && <p role="alert" className="notice warning">Topic unavailable. <button onClick={() => changeParam('topic', '')}>Show all topics</button></p>}
    <p className="intro">Read reviewed guidance, check the official sources and take your next step.</p>
    {storageError && <p role="alert" className="notice warning">{storageError}</p>}
    {message && <p role="status">{message}</p>}
    <p><Link to={guideLocation(savedOnly && city ? `/cities/${city.id}` : savedOnly ? '/guides' : '/saved', language, topic, cityKey, stage)}>{savedOnly ? (city ? 'Browse Christchurch guides' : 'Browse all guides') : 'View saved guides'}</Link>{city && <> · <Link to={`/guides?lang=${language}`}>Browse all pre-departure guides</Link> · <Link to="/explore">Back to Explore</Link></>}</p>
    {!slug && <div className="guide-search"><label htmlFor="guide-search">Search guides</label><input id="guide-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search titles and guidance"/>{query && <button onClick={() => setQuery('')}>Clear search</button>}</div>}
    {fallback && <p className="notice warning">Showing saved copies only. Publication status and changes cannot be checked until you reconnect. Official source links require an internet connection.</p>}
    {fallback && guide && savedCopy && <p>Copy saved: <time dateTime={savedCopy.fetchedAt}>{savedCopy.fetchedAt.slice(0, 10)}</time>. This is not a new review date.</p>}
    {error && <div role="alert" className="notice warning"><p>{error}</p><button onClick={() => setAttempt(n => n + 1)}>Try again</button></div>}
    {!guides && !error && <p role="status">Loading guides…</p>}
    {guides && !slug && !unknownTopic && topic && !guides.length && <p className="notice">No guides match this topic in the selected language{fallback ? ' among your saved copies' : ''}. Choose All topics to browse other guidance.</p>}
    {guides && !slug && !unknownTopic && !unknownCity && (guides.length ? <div className="groups">{guides.map(item => <article className="card" key={item.slug} lang={language}>
      <h2><Link to={guideLocation(`/guides/${item.slug}`, language, topic, cityKey, stage)}>{item.title}</Link></h2><p>{item.summary}</p>
      {saveButton(item)}
      <p>Last verified: <time dateTime={item.verified_on}>{item.verified_on}</time></p>
      {reviewDue(item) && <p className="notice">Review due — check the official source for updates.</p>}
    </article>)}</div> : <div className="card"><h2>{query ? 'No matching guides' : savedOnly ? 'No saved guides in this language' : fallback ? 'No saved copies available' : 'No reviewed guides available yet'}</h2><p>{query ? 'Try different words or clear your search.' : 'Save a reviewed guide while connected. You can still use your planning checklist.'}</p></div>)}
    {guides && slug && !guide && <div className="card"><h2>Guide unavailable in this language</h2><p>It may not have been published or reviewed yet. Try another language or return to all guides.</p></div>}
    {city && guides && !slug && !guides.length && !query && <p className="notice">No {fallback ? 'saved copies' : 'published guides'} match Christchurch, this topic and this language. City drafts require human content and translation review before publication. You can still use the checklist or browse all pre-departure guides.</p>}
    {savedOnly && !query && !topic && !unknownCity && copies.filter(item => (!city || city.guideSlugs.some(slug => slug === item.slug)) && !item.guide && (!live || !live.some(guide => guide.slug === item.slug))).map(item => <article className="card" key={item.slug}><h2>{item.title}</h2><p>This guide is no longer available. Its saved content has been removed.</p><button onClick={() => persist(items => items.filter(saved => !(saved.slug === item.slug && saved.language === language)))}>Remove unavailable guide</button></article>)}
    {guide && <article className="card guide-body" lang={language}>
      {saveButton(guide)}
      <p>Last verified: <time dateTime={guide.verified_on}>{guide.verified_on}</time> · Next review: <time dateTime={guide.next_review_on}>{guide.next_review_on}</time></p>
      {reviewDue(guide) && <p role="status" className="notice warning">Review due — check the official sources for updates.</p>}
      {guide.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <h2>Official sources</h2><ul className="sources">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span>Opens in a new tab</span></a></li>)}</ul>
      {!!guide.checklist_ids.length && <><h2>Your next steps</h2><ul>{guide.checklist_ids.map(id => <li key={id}><Link to={`${checklistPath}?task=${encodeURIComponent(id)}`}>{catalogue.find(task => task.id === id)?.label}</Link></li>)}</ul></>}
      <p className="notice">General planning guidance. This does not determine your immigration eligibility. Check official information for your circumstances.</p>
    </article>}
    <div className="guide-actions">{slug && <Link to={guideLocation(city ? `/cities/${city.id}` : '/guides', language, topic, cityKey, stage)}>{city ? 'Back to Christchurch' : 'All guides'}</Link>}<Link className="button" to={checklistPath}>Open my checklist</Link></div>
  </>;
}
