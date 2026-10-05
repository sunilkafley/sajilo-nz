import { useEffect, useState } from 'react';
import { readSaved, savedKey } from '../guides/saved';
import { savedPreview } from './domain';

export function useSavedPreview() {
  const [state, setState] = useState<{ preview?: ReturnType<typeof savedPreview>; error?: string }>({});
  useEffect(() => {
    const refresh = () => {
      try { setState({ preview: savedPreview(readSaved()) }); }
      catch { setState({ error: 'Saved guides could not be read. Your stored data has been kept.' }); }
    };
    const storage = (event: StorageEvent) => { if (event.key === savedKey || event.key === null) refresh(); };
    refresh();
    window.addEventListener('storage', storage);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('storage', storage); window.removeEventListener('focus', refresh); };
  }, []);
  return state;
}
