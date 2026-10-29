import { Link, useLocation } from 'react-router-dom';
import { faqGroups } from './content';
import { languageFromSearch, withLanguage } from '../../routing/language';
import './faqs.css';

export function FaqPage() {
  const { search } = useLocation();
  const language = languageFromSearch(search);
  const nepali = language === 'ne';
  return <section className="faq-page" lang="en">
    <p className="eyebrow">FAQs</p>
    <h1>Frequently asked questions</h1>
    <p className="intro">Thinking about life in New Zealand? Start with common questions about work, cities, living costs, housing and study.</p>
    {nepali && <p className="notice">These FAQs are available in English. A reviewed Nepali version is not available yet.</p>}
    <div className="faq-groups">{faqGroups.map(group => <section key={group.title} aria-label={group.title}>
      <h2>{group.title}</h2>
      {group.questions.map(item => <details className="card faq-item" key={item.id}>
        <summary>{item.question}</summary>
        <div className="faq-answer"><p>{item.answer}</p>
          {item.points && <ul>{item.points.map(point=><li key={point}>{point}</li>)}</ul>}
          <p className="faq-source"><a href={item.source.url}>{item.source.label}</a></p>
          <Link to={withLanguage(item.link.to, language)}>{item.link.label}</Link>
        </div>
      </details>)}
    </section>)}</div>
  </section>;
}
