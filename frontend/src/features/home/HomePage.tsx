import { Link, useSearchParams } from 'react-router-dom';
import { PrototypeIcon } from '../../components/PrototypeIcon';
import { interfaceText } from '../../components/interfaceLanguage';
import { introductionPages, withLanguage } from '../explore/topicConfig';
import { landingTopics } from './landingTopics';

export function HomePage() {
  const [params] = useSearchParams();
  const lang = params.get('lang') === 'ne' ? '&lang=ne' : '';
  return <div className="landing-page" lang="en">
    <section className="landing-hero" aria-labelledby="landing-heading">
      <div className="hero-copy"><h1 id="landing-heading">Your New Zealand <br/><span>journey companion</span></h1>
        <p className="hero-nepali" lang="ne">{interfaceText('ne','tagline').text}</p>
        <p>Practical guides, checklists and trusted resources — from planning your move to finding your feet.</p>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path fill="#e9f6f3" d="M0 60 Q240 -15 480 45 T960 65 T1440 25 V100 H0Z"/><path fill="white" d="M0 75 Q260 0 580 65 T1060 70 T1440 60 V100 H0Z"/></svg>
    </section>
    <section className="landing-section" aria-labelledby="landing-topics">
      <div className="landing-section-head"><div><h2 id="landing-topics">Explore key topics</h2><p>Find the information you need for your New Zealand journey.</p></div><Link to={'/explore'+(lang ? '?lang=ne' : '')}>View all topics <PrototypeIcon name="arrow"/></Link></div>
      <div className="landing-topics">{landingTopics.map(topic=><Link key={topic.id} className={'landing-topic topic-'+topic.id} to={withLanguage('/explore/'+topic.id,lang?'ne':'en')} aria-labelledby={'landing-'+topic.id}>
        <img className="topic-photo" src={topic.photo} alt="" width="600" height="400"/>
        <span className="topic-icon"><PrototypeIcon name={topic.icon}/></span><div><h3 id={'landing-'+topic.id}>{topic.title}</h3><p>{topic.description}</p><small>Explore topic</small></div><span className="topic-arrow"><PrototypeIcon name="arrow"/></span>
      </Link>)}</div>
    </section>
    <section className="landing-section aotearoa-section" aria-labelledby="landing-aotearoa"><h2 id="landing-aotearoa">Get to know Aotearoa</h2><p>Useful information about life in New Zealand. Read introductions as they become available.</p>
      <ul className="aotearoa-topics">{introductionPages.map(topic=><li key={topic.slug}><PrototypeIcon name={topic.icon}/><Link to={withLanguage('/explore/aotearoa/'+topic.slug,lang?'ne':'en')}>{topic.title}</Link></li>)}</ul>
    </section>
  </div>;
}
