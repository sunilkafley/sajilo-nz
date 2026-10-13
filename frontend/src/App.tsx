import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { interfaceText } from './components/interfaceLanguage';
import { JourneyDashboard } from './features/home/JourneyDashboard';
import { AboutPage, CommunityPage } from './features/home/InformationPages';
import { emergencyResource } from './features/home/discovery';
import { OfflineStatus } from './OfflineStatus';
import { GuidePage } from './features/guides/GuidePage';
import { ExplorePage } from './features/explore/ExplorePage';
import { TopicPage } from './features/explore/TopicPage';
import { topicConfig } from './features/explore/topicConfig';
import { HomePage } from './features/home/HomePage';
import { SearchPage } from './features/search/SiteSearch';
import { ArrivalPage } from './features/arrival/ArrivalPage';
import { arrivalTasks } from './features/arrival/tasks';
import { summarise } from './features/checklist/domain';
import { JourneyChecklist } from './features/checklist/JourneyChecklist';
import { groupNames, sources, tasks } from './features/checklist/tasks';
import type { ProgressRepository } from './features/checklist/repository';
import { resetChecklist, retrySave, updateTask } from './features/checklist/useCases';
export function App({ repository }: { repository: ProgressRepository }) {
  const [initial] = useState(() => repository.load());
  const [progress, setProgress] = useState(initial.progress);
  const [warning, setWarning] = useState(initial.warning);
  const summary = summarise(progress);
  const location = useLocation();
  const language = new URLSearchParams(location.search).get('lang') === 'ne' ? 'ne' : 'en';
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const firstweekGuides = (location.pathname.startsWith('/guides') || location.pathname === '/saved') && new URLSearchParams(location.search).get('stage') === 'firstweek';
    document.title = `${location.pathname === '/firstweek' ? 'First-week checklist' : location.pathname === '/' ? 'Home' : location.pathname === '/cities/christchurch' ? 'Christchurch' : location.pathname.startsWith('/cities/') ? 'City unavailable' : location.pathname === '/explore' ? 'Explore' : location.pathname === '/predeparture' ? 'Pre-departure checklist' : (location.pathname.startsWith('/guides') || location.pathname === '/saved') ? 'Pre-departure guides' : location.pathname === '/sources' ? 'Official sources' : 'Your journey'} · Sajilo NZ`;
    if (firstweekGuides) document.title = 'First-week guides · Sajilo NZ';
    if (['/journey','/community','/about'].includes(location.pathname)) document.title = `${location.pathname.slice(1).replace(/^./, value=>value.toUpperCase())} · Sajilo NZ`;
    if (location.pathname === '/search') document.title = 'Search · Sajilo NZ';
    if (location.pathname.startsWith('/explore/')) document.title = `${topicConfig[location.pathname.split('/')[2]]?.title || 'Topic unavailable'} · Sajilo NZ`;
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
  function reset() {
    const result=resetChecklist(repository,progress,initial.blocked);
    setProgress(result.progress);setWarning(result.warning);return result.reset;
  }
  return <>
    <a className="skip" href="#main" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <AppHeader/>
    <div className="workspace">
      <main id="main" className={location.pathname === '/' ? 'landing-main' : location.pathname.startsWith('/guides/') ? 'reading-main' : undefined} tabIndex={-1} ref={main}>
        {warning && <div role="alert" className="notice warning"><p>{warning}</p>{!initial.blocked && <button onClick={() => setWarning(retrySave(repository, progress))}>Try saving again</button>}</div>}
        <OfflineStatus quiet={location.pathname === '/'}/>
        {language === 'ne' && <p className="language-fallback" lang="en">{interfaceText(language,'fallback').text}</p>}
        <Routes>
          <Route path="/search" element={<SearchPage/>}/>
          <Route path="/explore" element={<ExplorePage/>}/>
          <Route path="/explore/:topicId" element={<TopicPage/>}/>
          <Route path="/explore/:topicId/:slug" element={<TopicPage/>}/>
          <Route path="/cities/:cityId" element={<GuidePage/>}/>
          <Route path="/saved" element={<GuidePage savedOnly/>}/>
          <Route path="/guides" element={<GuidePage/>}/>
          <Route path="/guides/:slug" element={<GuidePage/>}/>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/journey" element={<JourneyDashboard progress={progress} onTaskChange={change}/>}/>
          <Route path="/community" element={<CommunityPage/>}/>
          <Route path="/about" element={<AboutPage/>}/>
          <Route path="/firstweek" element={<ArrivalPage/>}/>
          <Route path="/predeparture" element={<JourneyChecklist stage="predeparture" tasks={tasks} groups={groupNames} progress={progress} summary={summary} onChange={change} onReset={reset} blocked={initial.blocked}/>}/>
          <Route path="/sources" element={<>
            <p className="eyebrow">TRUSTED STARTING POINTS</p><h1>Check the official guidance</h1><p className="intro">Use these official websites to check travel and entry information. This checklist does not determine eligibility.</p>
            <div className="card"><h2>Before you travel</h2><ul className="sources">{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span>Opens in a new tab</span></a></li>)}</ul><p>Last verified: not yet reviewed.</p></div><Link className="button" to="/predeparture">Back to my checklist</Link>
          </>}/>
          <Route path="*" element={<><h1>This page isn’t here</h1><p>Your checklist progress is still available.</p><Link className="button" to="/journey">Return to your journey</Link></>}/>
        </Routes>
      </main>
      <footer className="app-footer"><span>Sajilo NZ · One journey at a time</span><Link to="/about">About Sajilo NZ</Link><Link to="/saved">Saved resources</Link><Link to="/guides">Guides</Link><Link to="/sources">Official sources</Link><a href={emergencyResource.url}>Emergency Help (NZ Police, online)</a></footer>
    </div>
  </>;
}
