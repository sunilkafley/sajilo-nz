import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Progress } from './domain';
import type { Guide, GuideStage } from '../guides/api';
import { useRelatedGuides } from './useRelatedGuides';
import { sources } from './tasks';
import './journey.css';

type Task = {id:string;label:string;group:string};
type Props = {
  stage:GuideStage; tasks:readonly Task[]; groups:readonly string[]; progress:Progress;
  summary:{completed:number;total:number;percent:number};
  onChange:(id:string,checked:boolean)=>void; onReset:()=>boolean; blocked?:boolean;
};
export function JourneyChecklist({stage,tasks,groups,progress,summary,onChange,onReset,blocked}:Props) {
  const firstweek=stage==='firstweek';
  const [params]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const related=useRelatedGuides(stage,language);
  const [message,setMessage]=useState('');
  const progressHeading=useRef<HTMLHeadingElement>(null);
  const {completed,total,percent}=summary;
  const name=firstweek?'first-week':'pre-departure';
  const context='?lang='+language+(firstweek?'&stage=firstweek':'');
  const guideUrl=(guide:Guide)=>'/guides/'+guide.slug+context;
  return <section className="journey-detail">
    <p className="eyebrow">JOURNEY / {firstweek?'ARRIVAL':'BEFORE YOU LEAVE'}</p>
    <h1>{firstweek?'Your first week, one step at a time.':'Your pre-departure checklist'}</h1>
    <p className="intro">{firstweek?'Keep your first-week planning separate from your travel preparation.':'Pack your essentials, prepare your documents and feel ready.'}</p>
    <div className="journey-detail-grid"><div className="journey-checklist-main">
      <section className="progress-card" aria-label={firstweek?'First-week progress':'Checklist progress'}>
        <div><h2 ref={progressHeading} tabIndex={-1} aria-live="polite">{completed} of {total}{firstweek?' first-week steps':''} completed</h2><span>{percent}%</span></div>
        <progress aria-label={firstweek?'First-week steps completed':'Tasks completed'} value={completed} max={total}/>
        <p className="journey-storage">Progress is stored on this browser only, when storage is available.</p>
      </section>
      {completed===total && <p role="status" className="journey-complete">{firstweek?'All first-week planning steps completed. Revisit them whenever needed; no next stage is selected automatically.':'All pre-departure planning tasks completed. Revisit them whenever needed; completion does not confirm travel eligibility.'}</p>}
      <div className="groups">{groups.map(group=><section className="card" key={group}><h2>{group}</h2>{tasks.filter(task=>task.group===group).map(task=><div className={'task '+(progress.completed.includes(task.id)?'done':'')} key={task.id}>
        <input id={task.id} type="checkbox" checked={progress.completed.includes(task.id)} onChange={event=>{setMessage('');onChange(task.id,event.target.checked);}}/>
        <div className="journey-task-copy"><label htmlFor={task.id}>{task.label}</label>
          {related.guides.filter(guide=>guide.checklist_ids.includes(task.id)).map(guide=><Link className="task-guide" lang={guide.language} key={guide.slug} to={guideUrl(guide)}>Read: {guide.title}</Link>)}
        </div>
      </div>)}</section>)}</div>
      <p className="notice journey-disclaimer">Unreviewed planning prompts — not a list of legal, immigration or provider requirements. Last verified: not yet reviewed. Guides require separate human review; these ticks do not establish eligibility or readiness.</p>
      <div className="journey-actions"><button type="button" onClick={()=>{setMessage('');try{window.print();}catch{setMessage('Printing is unavailable in this browser. Use your browser menu to print.');}}}>Print / Save as PDF</button>
        <button type="button" className="reset-checklist" disabled={blocked || !completed} onClick={()=>{
          if(window.confirm('Reset your '+name+' checklist? This clears only its completed tasks on this browser. Your other checklist and saved guides will not change.')){
            const reset=onReset();setMessage(reset?'Your '+name+' checklist has been reset.':'');
            if(reset)progressHeading.current?.focus();
          }
        }}>Reset checklist</button>
      </div>
      <p role="status" className="journey-action-status">{message}</p>
      <p className="journey-print-help">Choose “Save as PDF” in your browser’s print options, if supported. No file is uploaded.</p>
      {blocked && <p>Reset is disabled while saved progress cannot be read. Stored data is kept unchanged.</p>}
    </div><aside className="journey-support" aria-label="Related information">
      <section className="card"><h2>Guides for this stage</h2><p>Showing {language==='ne'?'Nepali':'English'} guidance. Each guide has its own review record.</p>
        {related.loading?<p role="status">Loading related guides…</p>:related.error?<p role="status">Related guides are unavailable right now. Your checklist still works. <button type="button" onClick={related.retry}>Retry related guides</button></p>:!related.guides.length?<p>No published guides are available for this stage in {language==='ne'?'Nepali':'English'} yet.</p>:<ul className="related-guides">{related.guides.map(guide=><li key={guide.slug}><Link lang={guide.language} to={guideUrl(guide)}>{guide.title}</Link><small>Reviewed {guide.verified_on} · Next review {guide.next_review_on}{guide.review_overdue?' · Review overdue':''}</small></li>)}</ul>}
        <p><Link to={'/guides'+context}>{firstweek?'Browse first-week guides':'Read pre-departure guides'}</Link></p>
        <Link to={'/saved'+context}>{firstweek?'Saved first-week guides':'Open saved guides'}</Link>
      </section>
      <section className="card"><h2>{firstweek?'City preparation':'Official starting points'}</h2>{firstweek?<><p><Link to={'/cities/christchurch?lang='+language}>Christchurch preparation</Link></p><p>For local transport guidance, check the published guides above and their official sources.</p></>:<ul className="related-guides">{sources.map(source=><li key={source.url}><a href={source.url}>{source.title} (online)</a></li>)}</ul>}<Link to="/sources">View official sources</Link></section>
      <section className="card"><h2>Your progress stays with you</h2><p>No account is needed. Each checklist is independent. Clearing browser data removes progress; it does not sync between devices.</p><p>Previously saved guides and checklist progress work offline after the app is ready. External websites need internet access.</p><Link to={'/journey?lang='+language}>Choose another stage</Link></section>
    </aside></div>
  </section>;
}
