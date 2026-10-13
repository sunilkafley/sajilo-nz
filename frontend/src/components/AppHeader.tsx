import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SajiloLogo } from './SajiloLogo';
import { PrototypeIcon } from './PrototypeIcon';
import { MainNavigation } from './MainNavigation';

export function AppHeader() {
  const location=useLocation(), navigate=useNavigate();
  const language=new URLSearchParams(location.search).get('lang')==='ne'?'ne':'en';
  return <header className="app-header"><div className="app-header-inner">
    <Link className="brand-link" to={language==='ne'?'/?lang=ne':'/'} aria-label="Sajilo NZ home"><SajiloLogo language={language}/></Link>
    <MainNavigation/>
    <div className="header-controls"><select aria-label="Language / भाषा" value={language} onChange={event=>{
      const params=new URLSearchParams(location.search);params.set('lang',event.target.value);
      navigate({pathname:location.pathname,search:'?'+params,hash:location.hash});
    }}><option value="en">EN / नेपाली</option><option value="ne">नेपाली / EN</option></select>
      <Link className="header-search" to={language==='ne'?'/search?lang=ne':'/search'} aria-label="Search Sajilo NZ"><PrototypeIcon name="search"/></Link>
    </div>
  </div></header>;
}
