import { createChecklistRepository } from '../checklist/repository';
import { arrivalRules } from './domain';
export const ARRIVAL_STORAGE_KEY = 'sajilo-nz:firstweek:v1';
export function createArrivalRepository(getStorage: () => Pick<Storage,'getItem'|'setItem'> = () => window.localStorage) {
  // Never import prototype or pre-departure progress into first-week records.
  return createChecklistRepository(getStorage, ARRIVAL_STORAGE_KEY, arrivalRules.decodeProgress);
}
