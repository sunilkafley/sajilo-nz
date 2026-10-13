import { afterEach, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSearch } from './useSearch';
import { loadSearchEntries, localEntries } from './domain';
vi.mock('./domain',async original=>({...await original<typeof import('./domain')>(),loadSearchEntries:vi.fn()}));
afterEach(()=>{vi.useRealTimers();vi.clearAllMocks();});
it('debounces edits, aborts old work and ignores late completion even if transport ignores abort',async()=>{
  vi.useFakeTimers();
  type Loaded = Awaited<ReturnType<typeof loadSearchEntries>>;
  let older!:(value:Loaded)=>void, newer!:(value:Loaded)=>void;
  vi.mocked(loadSearchEntries).mockImplementationOnce(()=>new Promise(resolve=>{older=resolve;}))
    .mockImplementationOnce(()=>new Promise(resolve=>{newer=resolve;}));
  const hook=renderHook(({query})=>useSearch(query),{initialProps:{query:'Pass'}});
  hook.rerender({query:'Passport'});
  await act(()=>vi.advanceTimersByTimeAsync(249));expect(loadSearchEntries).not.toHaveBeenCalled();
  await act(()=>vi.advanceTimersByTimeAsync(1));expect(loadSearchEntries).toHaveBeenCalledTimes(1);
  const signal=vi.mocked(loadSearchEntries).mock.calls[0][0];
  hook.rerender({query:'Plan a local journey'});
  expect(signal.aborted).toBe(true);expect(hook.result.current.results).toEqual([]);
  await act(()=>vi.advanceTimersByTimeAsync(250));
  await act(async()=>newer({entries:localEntries,partial:false}));
  expect(hook.result.current.results[0].title).toBe('Plan a local journey');
  await act(async()=>older({entries:localEntries,partial:false}));
  expect(hook.result.current.results[0].title).toBe('Plan a local journey');
  hook.rerender({query:''});expect(hook.result.current.results).toEqual([]);
});
