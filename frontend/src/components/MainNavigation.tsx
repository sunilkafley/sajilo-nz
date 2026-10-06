import { NavLink, useLocation } from 'react-router-dom';
import { PrototypeIcon } from './PrototypeIcon';
import { emergencyResource } from '../features/home/discovery';

// Existing destinations grouped using the prototype's navigation labels.
export const navigationItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'compass' },
  { to: '/predeparture', label: 'Pre-departure checklist', icon: 'plane' },
  { to: '/firstweek', label: 'First-week checklist', icon: 'journey' },
  { to: '/guides', label: 'Pre-departure guides', icon: 'book' },
  { to: '/saved', label: 'Saved resources', icon: 'save' },
  { to: '/sources', label: 'Official sources', icon: 'shield' },
] as const;

export function MainNavigation({ completed }: { completed: number }) {
  const { pathname } = useLocation();
  const journeyActive = pathname === '/predeparture' || pathname === '/firstweek';
  const item = (index: number) => {
    const entry = navigationItems[index];
    return <NavLink to={entry.to} end={entry.to === '/'}><PrototypeIcon name={entry.icon}/><span>{entry.label}</span></NavLink>;
  };
  return <nav aria-label="Main navigation" lang="en">
    {item(0)}{item(1)}
    <details className={`journey-menu ${journeyActive ? 'active' : ''}`} open={journeyActive || undefined}>
      <summary><PrototypeIcon name="journey"/><span>Journey</span><span className="nav-count" aria-label={`${completed} pre-departure tasks completed`}>{completed}</span></summary>
      <div className="journey-links">{item(2)}{item(3)}</div>
    </details>
    <div className="nav-unavailable"><PrototypeIcon name="users"/><span>Community<small>Coming soon</small></span></div>
    <div className="nav-unavailable"><PrototypeIcon name="user"/><span>Profile<small>Coming soon</small></span></div>
    <div className="nav-label">YOUR POCKET GUIDE</div>
    {item(5)}
    <details open={pathname.startsWith('/guides') || pathname === '/sources' || undefined}>
      <summary><PrototypeIcon name="heart"/><span>Help & wellbeing</span></summary>
      <div className="journey-links">{item(4)}{item(6)}<a href={emergencyResource.url}>Emergency Help (NZ Police, online)</a></div>
    </details>
  </nav>;
}
