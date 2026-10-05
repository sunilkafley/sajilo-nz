import { summarise, type Progress } from '../checklist/domain';
import { tasks } from '../checklist/tasks';
import type { SavedGuide } from '../guides/saved';

export function homeJourney(progress: Progress) {
  const completed = new Set(progress.completed);
  return { ...summarise(progress), nextSteps: tasks.filter(task => !completed.has(task.id)).slice(0, 3) };
}
// Bookmarks are not proof of current publication. Home never displays their bodies.
export function savedPreview(items: SavedGuide[]) {
  return { count: items.length, copies: items.filter(item => item.guide !== null).length,
    recent: [...items].sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt)).slice(0, 2) };
}
export const plannedTools = [
  { title: 'Course finder', icon: 'cap' }, { title: 'Budget planner', icon: 'wallet' },
  { title: 'Can I bring it?', icon: 'plane' }, { title: 'Skills roadmap', icon: 'book' },
] as const;
