import { decodeProgress, emptyProgress, migrateLegacy, type Progress } from './domain';
export const STORAGE_KEY = 'sajilo-nz:predeparture:v1';
export type LoadResult = { progress: Progress; warning?: string; blocked?: boolean };
export interface ProgressRepository { load(): LoadResult; save(progress: Progress): void }
export function createLocalRepository(getStorage: () => Pick<Storage, 'getItem' | 'setItem'>): ProgressRepository {
  return createChecklistRepository(getStorage, STORAGE_KEY, decodeProgress, migrateLegacy);
}
export function createChecklistRepository(getStorage: () => Pick<Storage, 'getItem' | 'setItem'>, key: string,
  decode: (raw: string) => Progress, legacyDecoder?: (raw: string) => Progress): ProgressRepository {
  return {
    load() {
      try {
        const storage = getStorage();
        const raw = storage.getItem(key);
        if (raw !== null) {
          try { return { progress: decode(raw) }; }
          catch { return { progress: emptyProgress(), blocked: true, warning: 'Saved progress could not be read. Your stored data has been kept. Changes will only last for this session.' }; }
        }
        const legacy = legacyDecoder ? storage.getItem('sajilo-prototype') : null;
        if (legacy !== null) {
          try { return { progress: legacyDecoder!(legacy) }; }
          catch { return { progress: emptyProgress(), warning: 'Prototype progress could not be imported. The original data has been kept.' }; }
        }
        return { progress: emptyProgress() };
      } catch { return { progress: emptyProgress(), blocked: true, warning: 'Device storage is unavailable. Changes will only last for this session. Reload when storage is available.' }; }
    },
    save(progress) { getStorage().setItem(key, JSON.stringify(progress)); },
  };
}
