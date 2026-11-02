import { Link, useSearchParams } from 'react-router-dom';
import { PrototypeIcon } from '../../components/PrototypeIcon';
import { interfaceText } from '../../components/interfaceLanguage';
import { introductionPages, withLanguage } from '../explore/topicConfig';
import { landingTopics } from './landingTopics';
import { TopicCard } from '../../components/TopicCard';
import { aotearoaPhotos } from './aotearoaPhotos';
import newcomerStudents from '../../assets/newcomer-students.png';

export function HomePage() {
  const [params] = useSearchParams();
  const lang = params.get('lang') === 'ne' ? '&lang=ne' : '';
  return <div className="landing-page" lang="en">
    <section className="landing-hero" aria-labelledby="landing-heading">
      <div className="hero-copy"><h1 id="landing-heading">Your New Zealand <br/><span>Journey Companion</span></h1>
        <p className="hero-nepali" lang="ne">{interfaceText('ne','tagline').text}</p>
        <p>Practical guides, checklists and trusted resources — from planning your move to finding your feet.</p>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path fill="#e9f6f3" d="M0 60 Q240 -15 480 45 T960 65 T1440 25 V100 H0Z"/><path fill="white" d="M0 75 Q260 0 580 65 T1060 70 T1440 60 V100 H0Z"/></svg>
    </section>
    <section className="landing-section" aria-labelledby="landing-topics">
      <div className="landing-section-head"><div><h2 id="landing-topics">Explore key topics</h2><p>Find the information you need for your New Zealand journey.</p></div><Link to={'/explore'+(lang ? '?lang=ne' : '')}>View all topics <PrototypeIcon name="arrow"/></Link></div>
      <div className="landing-topics">{landingTopics.map(topic=><TopicCard key={topic.id} topic={topic} to={withLanguage('/explore/'+topic.id,lang?'ne':'en')} home/>)}</div>
    </section>
    <section className="landing-section aotearoa-section" aria-labelledby="landing-aotearoa"><h2 id="landing-aotearoa" tabIndex={-1}>Get to know Aotearoa</h2><p>Useful information about life in New Zealand. Read introductions as they become available.</p>
      <ul className="aotearoa-topics">{introductionPages.map(topic=><li key={topic.slug}><TopicCard topic={{id:topic.slug,title:topic.title,description:'',icon:topic.icon,photo:aotearoaPhotos[topic.slug]}} to={withLanguage('/explore/aotearoa/'+topic.slug,lang?'ne':'en')}/></li>)}</ul>
    </section>
    <section className="landing-section landing-welcome" aria-labelledby="landing-welcome-heading">
      <div><p className="landing-eyebrow">YOUR JOURNEY, AT YOUR PACE</p><h2 id="landing-welcome-heading">You’re not alone.</h2><p>Sajilo NZ is here for students, families and newcomers navigating their journey to life in New Zealand.</p><Link className="landing-welcome-link" to={withLanguage('/about',lang?'ne':'en')}>Discover our story <PrototypeIcon name="arrow"/></Link></div>
      <img src={newcomerStudents} alt="" loading="lazy"/>
    </section>
  </div>;
}
