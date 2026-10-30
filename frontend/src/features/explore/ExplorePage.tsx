import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { categories, cities, iconPaths } from './catalog';
import { introductionPages, topicConfig, withLanguage } from './topicConfig';
import { topics } from '../guides/topics';
import './explore.css';

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="explore-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconPaths[name]}/></svg>;
}
export function ExplorePage() {
  const [params]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const link=(to:string)=>withLanguage(to,language);
  const category=params.get('category');
  if(category && Object.hasOwn(topicConfig,category)) {
    const query=new URLSearchParams(params);query.delete('category');
    return <Navigate replace to={`/explore/${category}${query.size?'?'+query:''}`}/>;
  }
  return <div className="explore-page">
    <p className="eyebrow">EXPLORE</p><h1>A new country. A world of possibilities.</h1>
    <p className="intro">Find your topic, read published information and choose your next step.</p>
    <Link className="explore-search" to={link('/search')}><Icon name="search"/><span><strong>Search Sajilo NZ</strong><span>Find existing guides, checklists and topic pages.</span></span><Icon name="arrow"/></Link>
    <p className="explore-saved"><Link to={link('/saved')}>Open saved guides</Link><span>Keep reading previously saved guides offline.</span></p>
    <section aria-labelledby="explore-categories"><h2 id="explore-categories">Explore by topic</h2><p>Articles appear after review and publication. Some topics may not have content in your language yet.</p>
      <div className="explore-grid">{categories.map(category=><Link key={category.id} to={link(category.to)} className="explore-card explore-card-link" aria-labelledby={`explore-${category.id}`}>
        <div className="explore-card-top"><span className="explore-icon-tile"><Icon name={category.icon}/></span></div><h3 id={`explore-${category.id}`}>{category.title}</h3><p>{category.description}</p><span className="explore-action">Explore<Icon name="arrow"/></span>
      </Link>)}</div>
    </section>
    <section className="explore-section" aria-labelledby="explore-aotearoa"><h2 id="explore-aotearoa">Get to know Aotearoa</h2><p>Read introductions when published in your selected language.</p>
      <ul className="explore-topics">{introductionPages.map(topic=><li key={topic.slug}><Icon name={topic.icon}/><Link to={link('/explore/aotearoa/'+topic.slug)}>{topic.title}</Link></li>)}</ul>
    </section>
    <section className="explore-section" aria-labelledby="explore-cities"><h2 id="explore-cities">Find your city</h2><p>Christchurch preparation uses the existing city guide. Other city introductions appear when published.</p>
      <ul className="explore-cities">{cities.map(city=><li key={city}><Icon name="pin"/><Link to={link(city==='Christchurch'?'/cities/christchurch':'/explore/cities/'+city.toLowerCase())}>{city}</Link></li>)}</ul>
      <p><Link to={link('/explore/cities')}>All published city introductions</Link></p>
    </section>
    <section className="explore-section" aria-labelledby="explore-travel-topics"><h2 id="explore-travel-topics">Browse travel guides</h2><p>Your existing travel guides and offline copies remain available.</p>
      <div className="explore-grid">{topics.map(topic=><Link className="explore-card explore-card-link" key={topic.id} to={link(`/guides?topic=${topic.id}`)}><h3>{topic.title}</h3><span className="explore-action">Browse guides<Icon name="arrow"/></span></Link>)}</div>
    </section>
  </div>;
}
