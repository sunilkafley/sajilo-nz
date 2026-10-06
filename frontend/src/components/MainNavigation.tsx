import { NavLink } from 'react-router-dom';
import { iconPaths } from '../features/explore/catalog';

// Existing destinations and labels: presentation only, no new routes.
export const navigationItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'globe' },
  { to: '/predeparture', label: 'Pre-departure checklist', icon: 'plane' },
  { to: '/firstweek', label: 'First-week checklist', icon: 'journey' },
  { to: '/guides', label: 'Pre-departure guides', icon: 'book' },
  { to: '/saved', label: 'Saved guides', icon: 'book' },
  { to: '/sources', label: 'Official sources', icon: 'shield' },
] as const;

export function MainNavigation() {
  return <nav aria-label="Main navigation" lang="en">{navigationItems.map(item =>
    <NavLink key={item.to} to={item.to} end={item.to === '/'}>
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconPaths[item.icon]}/></svg>
      <span>{item.label}</span>
    </NavLink>)}</nav>;
}
