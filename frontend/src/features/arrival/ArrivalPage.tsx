import { useState } from 'react';
import { JourneyChecklist } from '../checklist/JourneyChecklist';
import type { ProgressRepository } from '../checklist/repository';
import { resetChecklist, retrySave, updateChecklistTask } from '../checklist/useCases';
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
  function reset() {
    const result=resetChecklist(repo,progress,initial.blocked);
    setProgress(result.progress);setWarning(result.warning);return result.reset;
  }
  return <>
    {warning && <div role="alert" className="notice warning"><p>{warning}</p>{!initial.blocked && <button onClick={() => setWarning(retrySave(repo,progress))}>Try saving first-week progress again</button>}</div>}
    <JourneyChecklist stage="firstweek" tasks={arrivalTasks} groups={arrivalGroups} progress={progress} summary={summary} onChange={change} onReset={reset} blocked={initial.blocked}/>
  </>;
}
