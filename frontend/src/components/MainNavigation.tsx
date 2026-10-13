import { Link, useLocation } from 'react-router-dom';
import { PrototypeIcon } from './PrototypeIcon';

export const navigationItems = [
  { to:'/', label:'Home', icon:'home' },
  { to:'/journey', label:'Journey', icon:'journey' },
  { to:'/explore', label:'Explore', icon:'compass' },
  { to:'/community', label:'Community', icon:'users' },
  { to:'/about', label:'About', icon:'book' },
] as const;

export function MainNavigation() {
  const {pathname,search}=useLocation();
  const language=new URLSearchParams(search).get('lang')==='ne'?'?lang=ne':'';
  return <nav className="public-navigation" aria-label="Main navigation" lang="en">{navigationItems.map(item=>{
    const active=pathname===item.to || (item.to==='/journey' && ['/predeparture','/firstweek'].includes(pathname))
      || (item.to==='/explore' && ['/explore','/guides','/cities','/saved','/sources','/search'].some(path=>pathname===path || pathname.startsWith(path+'/')));
    return <Link key={item.to} to={item.to+language} aria-current={active?'page':undefined} className={(active?'active ':'')+(item.to==='/about'?'desktop-about':'')}><PrototypeIcon name={item.icon}/><span>{item.label}</span></Link>;
  })}</nav>;
}
