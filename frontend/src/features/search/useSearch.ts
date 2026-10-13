import { useEffect, useState } from 'react';
import { loadSearchEntries, searchEntries, normalize, type SearchResult } from './domain';

type State = {query:string; loading:boolean; partial:boolean; results:SearchResult[]};
export function useSearch(input: string, enabled = true) {
  const query = normalize(input);
  const [attempt,setAttempt] = useState(0);
  const [state,setState] = useState<State>({query:'',loading:false,partial:false,results:[]});
  useEffect(() => {
    if (!query || !enabled) return;
    let current = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const loaded = await loadSearchEntries(controller.signal);
      if (current) setState({query,loading:false,partial:loaded.partial,results:searchEntries(loaded.entries,query)});
    },250);
    setState({query,loading:true,partial:false,results:[]});
    return () => {current=false; clearTimeout(timer); controller.abort();};
  },[query,enabled,attempt]);
  const visible = query && enabled ? state.query === query ? state : {query,loading:true,partial:false,results:[]} : {query,loading:false,partial:false,results:[]};
  return {...visible, retry:()=>setAttempt(value=>value+1)};
}
