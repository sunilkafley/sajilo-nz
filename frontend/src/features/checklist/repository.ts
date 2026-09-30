import { decodeProgress, emptyProgress, migrateLegacy, type Progress } from './domain';
export const STORAGE_KEY = 'sajilo-nz:predeparture:v1';
export type LoadResult = { progress: Progress; warning?: string; blocked?: boolean };
export interface ProgressRepository { load(): LoadResult; save(progress: Progress): void }
export function createLocalRepository(getStorage: () => Pick<Storage, 'getItem' | 'setItem'>): ProgressRepository {
  return {
    load() {
      try {
        const storage = getStorage();
        const raw = storage.getItem(STORAGE_KEY);
        if (raw !== null) {
          try { return { progress: decodeProgress(raw) }; }
          catch { return { progress: emptyProgress(), blocked: true, warning: 'Saved progress could not be read. Your stored data has been kept. Changes will only last for this session.' }; }
        }
        const legacy = storage.getItem('sajilo-prototype');
        if (legacy !== null) {
          try { return { progress: migrateLegacy(legacy) }; }
          catch { return { progress: emptyProgress(), warning: 'Prototype progress could not be imported. The original data has been kept.' }; }
        }
        return { progress: emptyProgress() };
      } catch { return { progress: emptyProgress(), blocked: true, warning: 'Device storage is unavailable. Changes will only last for this session. Reload when storage is available.' }; }
    },
    save(progress) { getStorage().setItem(STORAGE_KEY, JSON.stringify(progress)); },
  };
}
