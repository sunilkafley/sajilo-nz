import { tasks } from './tasks';
export type Progress = { version: 1; completed: string[] };
export const emptyProgress = (): Progress => ({ version: 1, completed: [] });
export function createChecklistRules(taskIds: readonly string[]) {
  const ids = new Set<string>(taskIds);
  function decodeProgress(raw: string): Progress {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
        !('completed' in value) || !Array.isArray(value.completed) || value.completed.some(id => typeof id !== 'string')) {
      throw new Error('Unsupported progress format');
    }
    return { version: 1, completed: [...new Set(value.completed.filter(id => ids.has(id)))] };
  }
  function setCompleted(progress: Progress, id: string, completed: boolean): Progress {
    if (!ids.has(id)) throw new Error('Unknown checklist task');
    return { version: 1, completed: completed ? [...new Set([...progress.completed, id])] : progress.completed.filter(item => item !== id) };
  }
  function summarise(progress: Progress) {
    const completed = new Set(progress.completed.filter(id => ids.has(id))).size;
    return { completed, total: ids.size, percent: ids.size ? Math.round(completed / ids.size * 100) : 0 };
  }
  return { decodeProgress, setCompleted, summarise };
}
export const { decodeProgress, setCompleted, summarise } = createChecklistRules(tasks.map(task => task.id));
export function migrateLegacy(raw: string): Progress {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('checks' in value) || !value.checks || typeof value.checks !== 'object' || Array.isArray(value.checks)) throw new Error('Invalid legacy progress');
  const checks = value.checks as Record<string, unknown>;
  return { version: 1, completed: tasks.filter(task => checks[task.legacyKey] === true).map(task => task.id) };
}
