import { Link } from 'react-router-dom';
import { PrototypeIcon } from './PrototypeIcon';
import type { ComponentProps } from 'react';
import './topic-card.css';

type Topic = { id:string; title:string; description:string; icon:ComponentProps<typeof PrototypeIcon>['name']; photo:string };

export function TopicCard({ topic, to, home=false }: { topic:Topic; to:string; home?:boolean }) {
  return <Link className={'topic-card'+(home?' landing-topic':'')} to={to} aria-labelledby={(home?'landing-':'explore-')+topic.id}>
    <img className="topic-card-photo" src={topic.photo} alt="" width="600" height="350" loading="lazy"/>
    <span className="topic-card-icon"><PrototypeIcon name={topic.icon}/></span>
    <h3 id={(home?'landing-':'explore-')+topic.id}>{topic.title}</h3><p>{topic.description}</p>
    <span className="topic-card-arrow" aria-hidden="true"><PrototypeIcon name="arrow"/></span>
  </Link>;
}
