import { createChecklistRules } from '../checklist/domain';
import { arrivalTasks } from './tasks';
export const arrivalRules = createChecklistRules(arrivalTasks.map(task => task.id));
