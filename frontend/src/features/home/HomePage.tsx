import { Link } from 'react-router-dom';
import type { Progress } from '../checklist/domain';
import { iconPaths } from '../explore/catalog';
import { homeJourney, plannedTools } from './domain';
import { useSavedPreview } from './useSavedPreview';
import { discoveryCards, emergencyResource } from './discovery';
import './home.css';

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconPaths[name]}/></svg>;
}

export function HomePage({ progress }: { progress: Progress }) {
  const journey = homeJourney(progress);
  const { preview, error } = useSavedPreview();
  return <div className="home-page">
    <Link className="home-search" to="/guides"><Icon name="search"/>Search pre-departure guides<Icon name="arrow"/></Link>
    <header className="home-welcome"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>Namaste, welcome home <span aria-hidden="true">👋</span></h1><p>For Nepalese students, workers, partners, families and newcomers navigating life in New Zealand. Let’s take the next step.</p></div><Link className="home-city-pill" to="/cities/christchurch"><Icon name="pin"/>Christchurch<Icon name="arrow"/></Link></header>
    <div className="home-grid">
      <div className="home-stack">
        <section className="home-hero" aria-labelledby="home-journey">
          <div className="home-hero-top"><div><p className="eyebrow">YOUR JOURNEY</p><h2 id="home-journey">Your pre-departure adventure</h2><p>Big plans. Small, achievable steps.</p><span className="badge"><Icon name="plane"/>Preparing to travel</span></div>
            <div className="home-ring" role="progressbar" aria-label="Planning tasks completed" aria-valuemin={0} aria-valuemax={journey.total} aria-valuenow={journey.completed} style={{background:`conic-gradient(#a3bba7 ${journey.percent}%, #55796a 0)`}}><div><strong>{journey.completed}<small> / {journey.total}</small></strong><span>tasks complete</span></div></div>
          </div>
          <div className="home-hero-bottom"><span>A new beginning, at your own pace</span><Link to="/predeparture">{journey.completed ? 'Continue my checklist' : 'Start my checklist'}<Icon name="arrow"/></Link></div>
        </section>
        <section aria-labelledby="home-discovery"><h2 id="home-discovery">Start exploring</h2><div className="home-discovery">{discoveryCards.map(card => <article className="home-discovery-card" key={card.title}>
          <span className="home-icon-tile"><Icon name={card.icon}/></span><h3>{card.title}</h3><p>{card.description}</p><span className="home-planned">{card.availability}</span>
          <div className="home-discovery-links">{card.links.map(link => link.external ? <a key={link.to} href={link.to}>{link.label}</a> : <Link key={link.to} to={link.to}>{link.label}</Link>)}</div>
        </article>)}</div><p className="home-small">Planned hubs are not available yet. Official links open external websites and need a connection. No personalised immigration assessment is provided.</p></section>
        <section className="card" aria-labelledby="home-next"><div className="home-section-head"><h2 id="home-next">Your next steps</h2><span>Before you fly</span></div>
          {journey.nextSteps.length ? <ol className="home-next-steps">{journey.nextSteps.map(task => <li key={task.id}><Icon name="journey"/><div><Link to={`/predeparture?task=${task.id}`}>{task.label}</Link><p>{task.group} · Open checklist step</p></div><Icon name="arrow"/></li>)}</ol> : <p role="status">All 27 planning tasks completed. You can revisit your checklist; completion does not confirm travel eligibility.</p>}
          <p className="home-small">Planning checklist — not yet editorially reviewed.</p><Link className="home-text-link" to="/predeparture">See all steps<Icon name="arrow"/></Link>
        </section>
        <section className="home-priority" aria-label="Budget and emergency help">
          <article className="card home-budget"><span className="home-icon-tile"><Icon name="wallet"/></span><h2>Budget</h2><p>Keep your budget preparation on your checklist.</p><Link className="home-text-link" to="/predeparture?task=budget">Open first-month budget step<Icon name="arrow"/></Link><p className="home-small">Unreviewed planning prompt. Budget calculator: Planned.</p></article>
          <article className="card home-emergency"><span className="home-icon-tile"><Icon name="heart"/></span><h2>Emergency Help</h2><p>Open the official emergency information directly.</p><a className="home-text-link" href={emergencyResource.url}>{emergencyResource.label}<Icon name="arrow"/></a><p className="home-small">External website — internet required. Sajilo NZ is not an emergency service; reviewed in-app emergency guidance is not available.</p></article>
        </section>
        <section aria-labelledby="home-tools"><h2 id="home-tools">A few handy tools</h2><p className="home-small">These tools are planned, not available yet.</p><div className="home-tools">{plannedTools.map(tool => <article className="home-tool" key={tool.title}><span className="home-icon-tile"><Icon name={tool.icon}/></span><h3>{tool.title}</h3><span className="home-planned">Planned</span></article>)}</div></section>
        <section className="card" aria-labelledby="home-saved"><div className="home-section-head"><h2 id="home-saved">Keep your favourites close</h2><Link to="/saved">View saved</Link></div>
          <p className="home-small">Pre-departure bookmarks shown here. <Link to="/saved?stage=firstweek">View saved first-week guides</Link></p>
          {error ? <p role="alert" className="notice warning">{error}</p> : !preview ? <p role="status">Reading saved bookmarks…</p> : <>
            <p>{preview.count} saved bookmarks · {preview.copies} saved copies on this browser</p>
            {preview.recent.length ? <ul className="home-saved-list">{preview.recent.map(item => <li key={`${item.language}:${item.slug}`}><Link lang={item.language} to={item.guide ? `/guides/${item.slug}?lang=${item.language}` : `/saved?lang=${item.language}`}>{item.title}</Link><span>{item.language === 'ne' ? 'नेपाली' : 'English'} · {item.guide ? 'Saved copy' : 'Unavailable bookmark — manage in Saved guides'}</span></li>)}</ul> : <p>Found something useful? Save a reviewed guide to keep a copy on this browser.</p>}
          </>}
          <p className="home-small">Bookmarks do not confirm current publication. Open a guide to check availability, its review dates and any offline warning.</p>
        </section>
      </div>
      <aside className="home-stack" aria-label="More to explore">
        <section className="card"><h2>Planning your first week?</h2><p>Keep a separate first-week checklist without changing your travel preparation.</p><Link className="home-text-link" to="/firstweek">Open first-week planner<Icon name="arrow"/></Link><p className="home-small">Planning prompts are not yet reviewed. Arrival guidance is planned separately.</p></section>
        <section className="card home-good-to-know"><p className="eyebrow">GOOD TO KNOW</p><h2>Guidance you can check</h2><p>Browse published guides in English or Nepali and open their official sources. Missing translations do not fall back to English.</p><Link className="home-text-link" to="/guides">Browse guides<Icon name="arrow"/></Link><p className="home-small">Each published guide shows its recorded review dates. This card is not a news or immigration update.</p><Link to="/sources">View official sources</Link></section>
        <section className="card"><h2>Your future neighbourhood</h2><div className="home-city-graphic" aria-hidden="true"><strong>CHC</strong><span>Christchurch</span></div><h3>Start with Christchurch</h3><p>Explore the city preparation page and its published guides.</p><Link className="home-text-link" to="/cities/christchurch">Explore Christchurch<Icon name="arrow"/></Link><p className="home-small">Featured city, not your detected location. City content requires separate human review.</p></section>
        <section className="card"><h2>A little closer to home</h2><span className="home-planned">Planned</span><p>Community and event discovery is not available yet. No live events are listed.</p><Link className="home-text-link" to="/explore">Discover Explore<Icon name="arrow"/></Link></section>
      </aside>
    </div>
    <p className="home-storage-note">No account needed. Progress is stored locally when browser storage is available. Save guides before going offline, once the app is ready. Clearing browser data removes progress and saved guides; they do not sync between devices.</p>
  </div>;
}
