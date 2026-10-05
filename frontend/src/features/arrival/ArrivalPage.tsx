import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProgressRepository } from '../checklist/repository';
import { retrySave, updateChecklistTask } from '../checklist/useCases';
import { arrivalRules } from './domain';
import { createArrivalRepository } from './repository';
import { arrivalGroups, arrivalTasks } from './tasks';

export function ArrivalPage({ repository }: { repository?: ProgressRepository }) {
  const [repo] = useState(() => repository ?? createArrivalRepository());
  const [initial] = useState(() => repo.load());
  const [progress,setProgress] = useState(initial.progress);
  const [warning,setWarning] = useState(initial.warning);
  const summary = arrivalRules.summarise(progress);
  function change(id: string, checked: boolean) {
    const result = updateChecklistTask(repo,progress,id,checked,arrivalRules.setCompleted,initial.blocked);
    setProgress(result.progress); setWarning(result.warning);
  }
  return <>
    <p className="eyebrow">JOURNEY / SETTLE IN</p><h1>Your first week, one step at a time.</h1>
    <p className="intro">There’s a lot that’s new. Keep your planning steps together without changing your pre-departure checklist.</p>
    <p className="notice">Unreviewed planning prompts — not a list of legal, immigration or provider requirements. Last verified: not yet reviewed. Reviewed arrival guidance is planned separately; these ticks do not establish eligibility or readiness.</p>
    {warning && <div role="alert" className="notice warning"><p>{warning}</p>{!initial.blocked && <button onClick={() => setWarning(retrySave(repo,progress))}>Try saving first-week progress again</button>}</div>}
    <section className="progress-card" aria-label="First-week progress"><div><h2 aria-live="polite">{summary.completed} of {summary.total} first-week steps completed</h2><span>{summary.percent}%</span></div><progress aria-label="First-week steps completed" value={summary.completed} max={summary.total}/></section>
    {!arrivalTasks.some(task => !progress.completed.includes(task.id)) && <p role="status">All first-week planning steps completed. Revisit them whenever needed; no next stage is selected automatically.</p>}
    <div className="groups">{arrivalGroups.map(group => <section className="card" key={group}><h2>{group}</h2>{arrivalTasks.filter(task => task.group === group).map(task => <div className={`task ${progress.completed.includes(task.id) ? 'done' : ''}`} key={task.id}><input id={task.id} type="checkbox" checked={progress.completed.includes(task.id)} onChange={event => change(task.id,event.target.checked)}/><label htmlFor={task.id}>{task.label}</label></div>)}</section>)}</div>
    <div className="guide-actions"><Link to="/cities/christchurch">Christchurch preparation</Link><Link to="/guides">Browse pre-departure guides</Link><Link to="/saved">Open saved guides</Link><Link to="/predeparture">Return to pre-departure checklist</Link></div>
    <p className="notice">No account is needed. First-week progress is separate and stays on this browser when storage is available. Clearing browser data removes it; it does not sync between devices. The checklist works offline after the app is ready. No addresses, phone numbers, account details or budgets are collected here.</p>
  </>;
}
