import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SajiloLogo } from './SajiloLogo';
import { PrototypeIcon } from './PrototypeIcon';
import { MainNavigation } from './MainNavigation';
import { languageFromSearch, withLanguage } from '../routing/language';

export function AppHeader() {
  const location=useLocation(), navigate=useNavigate();
  const language=languageFromSearch(location.search);
  const nextLanguage=language==='en'?'ne':'en';
  return <header className="app-header"><div className="app-header-inner">
    <Link className="brand-link" to={language==='ne'?'/?lang=ne':'/'} aria-label="Sajilo NZ home"><SajiloLogo language={language}/></Link>
    <MainNavigation/>
    <div className="header-controls"><button className="language-toggle" type="button"
      lang={nextLanguage} aria-label={nextLanguage==='ne'?'Switch to Nepali':'Switch to English'}
      onClick={()=>navigate(withLanguage(location.pathname+location.search+location.hash,nextLanguage))}>
      {nextLanguage==='ne'?'नेपाली':'English'}
    </button>
      <Link className="header-search" to={language==='ne'?'/search?lang=ne':'/search'} aria-label="Search Sajilo NZ"><PrototypeIcon name="search"/></Link>
    </div>
  </div></header>;
}
