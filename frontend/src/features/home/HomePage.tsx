import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Progress } from '../checklist/domain';
import { iconPaths } from '../explore/catalog';
import { homeJourney, plannedTools } from './domain';
import { useSavedPreview } from './useSavedPreview';
import { emergencyResource } from './discovery';
import './home.css';

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconPaths[name]}/></svg>;
}

export function HomePage({ progress, onTaskChange }: { progress: Progress; onTaskChange: (id: string, checked: boolean) => void }) {
  const nextPanel = useRef<HTMLElement>(null);
  const [restoreFocus, setRestoreFocus] = useState(false);
  useEffect(() => {
    if (restoreFocus) {
      (nextPanel.current?.querySelector<HTMLInputElement>('input') ?? nextPanel.current?.querySelector<HTMLElement>('h2'))?.focus();
      setRestoreFocus(false);
    }
  }, [restoreFocus, progress]);
  const journey = homeJourney(progress);
  const { preview, error } = useSavedPreview();
  return <div className="home-page">
    <header className="home-welcome"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>Namaste, welcome home <span aria-hidden="true">👋</span></h1><p>A little closer to your New Zealand dream. Let’s take the next step.</p></div><Link className="home-city-pill" to="/cities/christchurch"><Icon name="pin"/>Christchurch<Icon name="arrow"/></Link></header>
    <div className="home-grid">
      <div className="home-stack">
        <section className="home-hero" aria-labelledby="home-journey">
          <div className="home-hero-top"><div><p className="eyebrow">YOUR JOURNEY</p><h2 id="home-journey">Your pre-departure adventure</h2><p>Big plans. Small, achievable steps.</p><span className="badge"><Icon name="plane"/>Preparing to travel</span></div>
            <div className="home-ring" role="progressbar" aria-label="Planning tasks completed" aria-valuemin={0} aria-valuemax={journey.total} aria-valuenow={journey.completed} style={{background:`conic-gradient(#a3bba7 ${journey.percent}%, #55796a 0)`}}><div><strong>{journey.completed}<small> / {journey.total}</small></strong><span>tasks complete</span></div></div>
          </div>
          <div className="home-hero-bottom"><span>A new beginning, at your own pace</span><Link to="/predeparture">{journey.completed ? 'Continue my checklist' : 'Start my checklist'}<Icon name="arrow"/></Link></div>
        </section>
        <section className="card" aria-labelledby="home-next" ref={nextPanel}><div className="home-section-head"><h2 id="home-next" tabIndex={-1}>Your next steps</h2><span>Planning · unreviewed</span></div>
          {journey.nextSteps.length ? <ol className="home-next-steps">{journey.nextSteps.map(task => <li key={task.id}><input type="checkbox" aria-label={task.label} checked={false} onChange={() => { onTaskChange(task.id, true); setRestoreFocus(true); }}/><div><Link to={`/predeparture?task=${task.id}`}>{task.label}</Link><p>{task.group}</p><Link className="home-step-link" to={`/predeparture?task=${task.id}`}>Open checklist step →</Link></div></li>)}</ol> : <p role="status">All 27 planning tasks completed. You can revisit your checklist; completion does not confirm travel eligibility.</p>}
          <Link className="home-text-link" to="/predeparture">See all steps<Icon name="arrow"/></Link>
        </section>
        <section aria-labelledby="home-tools"><h2 id="home-tools">A few handy tools</h2><div className="home-tools">{plannedTools.map(tool => <article className="home-tool" key={tool.title}><span className="home-icon-tile"><Icon name={tool.icon}/></span>{tool.icon === 'wallet' ? <Link to="/predeparture?task=budget" aria-label="Open first-month budget step"><h3>Budget checklist</h3></Link> : <><h3>{tool.title}</h3><span className="home-planned">Coming soon</span></>}</article>)}</div></section>
        <section className="card" aria-labelledby="home-saved"><div className="home-section-head"><h2 id="home-saved">Keep your favourites close</h2><Link to="/saved">View saved</Link></div>
          <p className="home-small">Pre-departure bookmarks shown here. <Link to="/saved?stage=firstweek">View saved first-week guides</Link></p>
          {error ? <p role="alert" className="notice warning">{error}</p> : !preview ? <p role="status">Reading saved bookmarks…</p> : <>
            <p>{preview.count} saved bookmarks · {preview.copies} saved copies on this browser</p>
            {preview.recent.length ? <ul className="home-saved-list">{preview.recent.map(item => <li key={`${item.language}:${item.slug}`}><Link lang={item.language} to={item.guide ? `/guides/${item.slug}?lang=${item.language}` : `/saved?lang=${item.language}`}>{item.title}</Link><span>{item.language === 'ne' ? 'नेपाली' : 'English'} · {item.guide ? 'Saved copy' : 'Unavailable bookmark — manage in Saved guides'}</span></li>)}</ul> : <p>Found something useful? Save a reviewed guide to keep a copy on this browser.</p>}
          </>}
        </section>
      </div>
      <aside className="home-stack" aria-label="More to explore">
        <section className="card home-good-to-know"><p className="eyebrow">GOOD TO KNOW</p><h2>Guidance you can check</h2><p>Find published guidance in English or Nepali, with official sources and recorded review dates.</p><Link className="home-text-link" to="/guides">Browse guides<Icon name="arrow"/></Link><p className="home-small">Check the guide’s review information before taking your next step.</p><Link className="home-source-link" to="/sources"><Icon name="shield"/>View official sources</Link></section>
        <section className="card"><h2>Your future neighbourhood</h2><div className="home-city-graphic" aria-hidden="true"><strong>CHC</strong><span>Christchurch</span></div><h3>Start with Christchurch</h3><p>Explore the city preparation page and its published guides.</p><Link className="home-text-link" to="/cities/christchurch">Explore Christchurch<Icon name="arrow"/></Link></section>
        <section className="card"><h2>A little closer to home</h2><span className="home-planned">Coming soon</span><p>Community and event discovery is on its way.</p></section>
        <section className="card home-emergency"><h2>Emergency Help</h2><p>Official emergency information from NZ Police.</p><a className="home-text-link" href={emergencyResource.url}>{emergencyResource.label}<Icon name="arrow"/></a><p className="home-small">External website — internet required.</p></section>
      </aside>
    </div>
    <p className="home-storage-note">For Nepalese students, workers, partners, families and newcomers. No account needed.</p>
  </div>;
}
