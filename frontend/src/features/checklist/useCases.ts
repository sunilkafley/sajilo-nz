import { setCompleted, type Progress } from './domain';
import type { ProgressRepository } from './repository';
export function updateTask(repository: ProgressRepository, current: Progress, id: string, checked: boolean, blocked = false) {
  return updateChecklistTask(repository, current, id, checked, setCompleted, blocked);
}
export function updateChecklistTask(repository: ProgressRepository, current: Progress, id: string, checked: boolean,
  setTask: typeof setCompleted, blocked = false) {
  const progress = setTask(current, id, checked);
  if (blocked) return { progress, warning: 'Saved progress could not be read. Your stored data has been kept. Changes will only last for this session. Reload to try reading it again.' };
  try { repository.save(progress); return { progress, warning: undefined }; }
  catch { return { progress, warning: 'Could not save your latest changes. Keep this page open and try saving again.' }; }
}
export function retrySave(repository: ProgressRepository, progress: Progress) {
  try { repository.save(progress); return undefined; }
  catch { return 'Could not save your latest changes. Keep this page open and try saving again.'; }
}
