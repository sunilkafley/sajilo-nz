import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { PrototypeIcon } from './components/PrototypeIcon';
import { emergencyResource } from './features/home/discovery';
import { SajiloLogo } from './components/SajiloLogo';
import { MainNavigation } from './components/MainNavigation';
import { OfflineStatus } from './OfflineStatus';
import { GuidePage } from './features/guides/GuidePage';
import { ExplorePage } from './features/explore/ExplorePage';
import { HomePage } from './features/home/HomePage';
import { ArrivalPage } from './features/arrival/ArrivalPage';
import { arrivalTasks } from './features/arrival/tasks';
import { summarise } from './features/checklist/domain';
import { groupNames, sources, tasks } from './features/checklist/tasks';
import type { ProgressRepository } from './features/checklist/repository';
import { retrySave, updateTask } from './features/checklist/useCases';
export function App({ repository }: { repository: ProgressRepository }) {
  const [initial] = useState(() => repository.load());
  const [progress, setProgress] = useState(initial.progress);
  const [warning, setWarning] = useState(initial.warning);
  const summary = summarise(progress);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const language = new URLSearchParams(location.search).get('lang') === 'ne' ? 'ne' : 'en';
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    setMenuOpen(false);
    const firstweekGuides = (location.pathname.startsWith('/guides') || location.pathname === '/saved') && new URLSearchParams(location.search).get('stage') === 'firstweek';
    document.title = `${location.pathname === '/firstweek' ? 'First-week checklist' : location.pathname === '/' ? 'Home' : location.pathname === '/cities/christchurch' ? 'Christchurch' : location.pathname.startsWith('/cities/') ? 'City unavailable' : location.pathname === '/explore' ? 'Explore' : location.pathname === '/predeparture' ? 'Pre-departure checklist' : (location.pathname.startsWith('/guides') || location.pathname === '/saved') ? 'Pre-departure guides' : location.pathname === '/sources' ? 'Official sources' : 'Your journey'} · Sajilo NZ`;
    if (firstweekGuides) document.title = 'First-week guides · Sajilo NZ';
    const task = new URLSearchParams(location.search).get('task');
    if (task && ((location.pathname === '/predeparture' && tasks.some(item => item.id === task)) || (location.pathname === '/firstweek' && arrivalTasks.some(item => item.id === task)))) {
      document.getElementById(task)?.focus();
    } else {
      main.current?.focus({ preventScroll: true });
      if (document.documentElement.scrollTop) window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);
  function change(id: string, checked: boolean) {
    const result = updateTask(repository, progress, id, checked, initial.blocked);
    setProgress(result.progress); setWarning(result.warning);
  }
  return <>
    <a className="skip" href="#main" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <aside className="sidebar" data-menu-open={menuOpen}>
      <div className="sidebar-brand"><Link className="brand-link" to="/" aria-label="Sajilo NZ home"><SajiloLogo language={language}/></Link><button className="mobile-menu" aria-expanded={menuOpen} aria-controls="sidebar-navigation" onClick={() => setMenuOpen(!menuOpen)}>Menu</button></div>
      <div id="sidebar-navigation"><MainNavigation completed={summary.completed}/></div>
      <div className="sidebar-note"><PrototypeIcon name="shield"/><strong> A little help, a long way.</strong><p>Trusted sources. Clear next steps.<br/>One journey at a time.</p><a href={emergencyResource.url}>Emergency Help (NZ Police) →</a></div>
    </aside>
    <header className="topbar">
      <Link className="top-search" to={`/guides?lang=${language}`}><PrototypeIcon name="search"/><span>Search pre-departure guides</span></Link>
      <div className="top-actions"><label className="toolbar-language">Guides<select aria-label="Toolbar guide language" value={language} onChange={event => {
        const params = new URLSearchParams(location.search); params.set('lang', event.target.value);
        const guidePage = location.pathname.startsWith('/guides') || location.pathname.startsWith('/cities/') || location.pathname === '/saved';
        navigate(`${guidePage ? location.pathname : '/guides'}?${guidePage ? params : new URLSearchParams({lang:event.target.value})}`);
      }}><option value="en">EN</option><option value="ne">नेपाली</option></select></label><a className="help-shortcut" href={emergencyResource.url} aria-label="Emergency help and support (NZ Police, online)"><PrototypeIcon name="heart"/><span>Help</span></a></div>
    </header>
    <div className="workspace">
      <main id="main" tabIndex={-1} ref={main}>
        {warning && <div role="alert" className="notice warning"><p>{warning}</p>{!initial.blocked && <button onClick={() => setWarning(retrySave(repository, progress))}>Try saving again</button>}</div>}
        <OfflineStatus quiet={location.pathname === '/'}/>
        <Routes>
          <Route path="/explore" element={<ExplorePage/>}/>
          <Route path="/cities/:cityId" element={<GuidePage/>}/>
          <Route path="/saved" element={<GuidePage savedOnly/>}/>
          <Route path="/guides" element={<GuidePage/>}/>
          <Route path="/guides/:slug" element={<GuidePage/>}/>
          <Route path="/" element={<HomePage progress={progress} onTaskChange={change}/>}/>
          <Route path="/firstweek" element={<ArrivalPage/>}/>
          <Route path="/predeparture" element={<>
            <p className="eyebrow">JOURNEY / BEFORE YOU FLY</p><h1>Your pre-departure checklist</h1><p className="intro">Pack your essentials, prepare your documents and feel ready.</p>
            <section className="progress-card" aria-label="Checklist progress"><div><h2 aria-live="polite">{summary.completed} of {summary.total} completed</h2><span>{summary.percent}%</span></div><progress aria-label="Tasks completed" value={summary.completed} max={summary.total}/></section>
            <p><Link to="/guides">Read pre-departure guides</Link></p>
            <div className="groups">{groupNames.map(group => <section className="card" key={group}><h2>{group}</h2>{tasks.filter(task => task.group === group).map(task => <div className={`task ${progress.completed.includes(task.id) ? 'done' : ''}`} key={task.id}><input id={task.id} type="checkbox" checked={progress.completed.includes(task.id)} onChange={event => change(task.id, event.target.checked)}/><label htmlFor={task.id}>{task.label}</label></div>)}</section>)}</div>
            <div className="notice"><strong>Use this as a planning checklist.</strong><p>Last verified: not yet reviewed. Check the current official guidance for your circumstances.</p><Link to="/sources">View official sources</Link></div>
          </>}/>
          <Route path="/sources" element={<>
            <p className="eyebrow">TRUSTED STARTING POINTS</p><h1>Check the official guidance</h1><p className="intro">Use these official websites to check travel and entry information. This checklist does not determine eligibility.</p>
            <div className="card"><h2>Before you travel</h2><ul className="sources">{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span>Opens in a new tab</span></a></li>)}</ul><p>Last verified: not yet reviewed.</p></div><Link className="button" to="/predeparture">Back to my checklist</Link>
          </>}/>
          <Route path="*" element={<><h1>This page isn’t here</h1><p>Your checklist progress is still available.</p><Link className="button" to="/">Return to your journey</Link></>}/>
        </Routes>
      </main>
      <footer>Sajilo NZ · One journey at a time</footer>
    </div>
  </>;
}
