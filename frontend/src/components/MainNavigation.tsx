import { Link, useLocation } from 'react-router-dom';
import { PrototypeIcon } from './PrototypeIcon';
import { languageFromSearch, withLanguage } from '../routing/language';

export const navigationItems = [
  { to:'/', label:'Home', icon:'home' },
  { to:'/journey', label:'Journey', icon:'journey' },
  { to:'/explore', label:'Explore', icon:'compass' },
  { to:'/faqs', label:'FAQs', icon:'help' },
  { to:'/about', label:'About', icon:'book' },
] as const;

export function MainNavigation() {
  const {pathname,search}=useLocation();
  const language=languageFromSearch(search);
  return <nav className="public-navigation" aria-label="Main navigation" lang="en">{navigationItems.map(item=>{
    const active=pathname===item.to || (item.to==='/journey' && ['/predeparture','/firstweek'].includes(pathname))
      || (item.to==='/explore' && ['/explore','/guides','/cities','/saved','/sources','/search'].some(path=>pathname===path || pathname.startsWith(path+'/')));
    return <Link key={item.to} to={withLanguage(item.to,language)} aria-current={active?'page':undefined} className={(active?'active ':'')+(item.to==='/about'?'desktop-about':'')}><PrototypeIcon name={item.icon}/><span>{item.label}</span></Link>;
  })}</nav>;
}
