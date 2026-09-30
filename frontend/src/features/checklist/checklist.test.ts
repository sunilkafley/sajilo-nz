import { describe, expect, it } from 'vitest';
import { decodeProgress, emptyProgress, migrateLegacy, setCompleted, summarise } from './domain';
import { createLocalRepository, STORAGE_KEY } from './repository';
import { updateTask } from './useCases';
function storage(seed: Record<string,string> = {}) { const data = new Map(Object.entries(seed)); return { getItem: (k: string) => data.get(k) ?? null, setItem: (k:string,v:string) => { data.set(k,v); } }; }
describe('checklist rules', () => {
  it('deduplicates completion, reverses it, and rejects unknown tasks', () => {
    const once = setCompleted(emptyProgress(), 'passport', true);
    expect(setCompleted(once, 'passport', true)).toEqual(once);
    expect(summarise(once)).toMatchObject({ completed: 1, total: 27 });
    expect(setCompleted(once, 'passport', false)).toEqual(emptyProgress());
    expect(() => setCompleted(once, 'unknown', true)).toThrow();
  });
  it('filters obsolete saved IDs without inflating progress', () => {
    expect(decodeProgress('{"version":1,"completed":["passport","passport","obsolete"]}').completed).toEqual(['passport']);
  });
  it.each(['null', '[]', '{"version":2,"completed":[]}', '{"version":1,"completed":[1]}'])('rejects incompatible data: %s', raw => expect(() => decodeProgress(raw)).toThrow());
  it('imports only true, known legacy checklist values', () => {
    expect(migrateLegacy('{"checks":{"Documents:Passport":true,"Documents:Visa/eVisa":"true","other":true}}').completed).toEqual(['passport']);
  });
});
describe('storage integration', () => {
  it('saves through the use case and loads in a new repository', () => {
    const s = storage(); const repo = createLocalRepository(() => s);
    updateTask(repo, emptyProgress(), 'passport', true);
    expect(createLocalRepository(() => s).load().progress.completed).toEqual(['passport']);
  });
  it('preserves future-version data and blocks writes through the use case', () => {
    const raw = '{"version":2,"completed":["passport"]}'; const s = storage({[STORAGE_KEY]:raw});
    const repo = createLocalRepository(() => s); const loaded = repo.load();
    const result = updateTask(repo, loaded.progress, 'visa', true, loaded.blocked);
    expect(result.warning).toBeTruthy(); expect(s.getItem(STORAGE_KEY)).toBe(raw);
  });
  it('handles access denial on read and write without losing in-memory changes', () => {
    const repo = createLocalRepository(() => { throw new Error('denied'); });
    expect(repo.load().warning).toBeTruthy();
    const result = updateTask(repo, emptyProgress(), 'passport', true);
    expect(result.progress.completed).toEqual(['passport']); expect(result.warning).toContain('Could not save');
  });
  it('imports legacy progress on the same origin without deleting the original', () => {
    const raw = '{"checks":{"Documents:Passport":true}}'; const s = storage({'sajilo-prototype':raw});
    const repo = createLocalRepository(() => s); const loaded = repo.load();
    expect(loaded.progress.completed).toEqual(['passport']);
    updateTask(repo, loaded.progress, 'visa', true);
    expect(s.getItem('sajilo-prototype')).toBe(raw);
    expect(repo.load().progress.completed).toEqual(['passport','visa']);
  });
});
