import { Link } from 'react-router-dom';
import { categories, cities, iconPaths, introductionTopics } from './catalog';
import './explore.css';
import { topics } from '../guides/topics';

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="explore-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={iconPaths[name]}/></svg>;
}

export function ExplorePage() {
  return <div className="explore-page">
    <p className="eyebrow">EXPLORE</p>
    <h1>A new country.<br/>A world of possibilities.</h1>
    <p className="intro">Start with your travel preparation. Discover more of life in New Zealand as new guides become available.</p>

    <Link className="explore-search" to="/guides">
      <Icon name="search"/>
      <span><strong>Search pre-departure guides</strong><span>Find published guidance in English or Nepali.</span></span>
      <Icon name="arrow"/>
    </Link>
    <p className="explore-saved"><Link to="/saved">Open saved guides</Link> <span>Keep reading saved copies when you are offline.</span></p>

    <section className="explore-section" aria-labelledby="explore-travel-topics">
      <h2 id="explore-travel-topics">Browse travel guides</h2>
      <p>Browse reviewed guides linked to your checklist. Some topics may not have published guidance yet.</p>
      <div className="explore-grid">{topics.map(topic => <Link className="explore-card explore-card-link" key={topic.id} to={`/guides?topic=${topic.id}`}><h3>{topic.title}</h3><span className="explore-action">Browse guides<Icon name="arrow"/></span></Link>)}</div>
    </section>

    <section aria-labelledby="explore-categories">
      <h2 id="explore-categories">Explore by topic</h2>
      <p>Start with the linked resources below. Sections marked Planned are not available yet.</p>
      <div className="explore-grid">
        {categories.map(category => {
          const titleId = `explore-${category.id}`;
          const content = <>
            <div className="explore-card-top"><span className="explore-icon-tile"><Icon name={category.icon}/></span>{category.status === 'planned' && <span className="explore-planned">Planned</span>}</div>
            <h3 id={titleId}>{category.title}</h3>
            <p>{category.description}</p>
            {category.status === 'available' && <span className="explore-action">{category.action}<Icon name="arrow"/></span>}
          </>;
          return category.status === 'available'
            ? <Link key={category.id} to={category.to} className="explore-card explore-card-link" aria-labelledby={titleId}>{content}</Link>
            : <article key={category.id} className="explore-card" aria-labelledby={titleId}>{content}</article>;
        })}
      </div>
    </section>

    <section className="explore-section" aria-labelledby="explore-aotearoa">
      <h2 id="explore-aotearoa">Get to know Aotearoa</h2>
      <p>These introductions are planned. Reviewed guides will appear as they become available.</p>
      <ul className="explore-topics">{introductionTopics.map(topic => <li key={topic}><Icon name="book"/><span>{topic}</span><span className="explore-planned">Planned</span></li>)}</ul>
    </section>

    <section className="explore-section" aria-labelledby="explore-cities">
      <h2 id="explore-cities">Find your city</h2>
      <p>Start with Christchurch preparation. Other city pages are planned; guidance is available only after publication review.</p>
      <ul className="explore-cities">{cities.map(city => <li key={city}><Icon name="pin"/>{city === 'Christchurch' ? <Link to="/cities/christchurch">Christchurch</Link> : <>{city}<span className="explore-planned">Planned</span></>}</li>)}</ul>
    </section>
  </div>;
}
