import { useEffect, useState } from 'react';
import { fetchGuides, type Guide, type GuideStage, type Language } from '../guides/api';

export function useRelatedGuides(stage:GuideStage, language:Language) {
  const key=stage+':'+language;
  const [attempt,setAttempt]=useState(0);
  const [state,setState]=useState<{key:string;guides:Guide[];loading:boolean;error:boolean}>({key:'',guides:[],loading:true,error:false});
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    setState({key,guides:[],loading:true,error:false});
    fetchGuides(language,controller.signal,stage).then(guides=>{
      if(active)setState({key,guides,loading:false,error:false});
    }).catch(()=>{if(active)setState({key,guides:[],loading:false,error:true});});
    return ()=>{active=false;controller.abort();};
  },[key,stage,language,attempt]);
  // Never display previous-language/stage results during a route transition.
  return {...(state.key===key?state:{guides:[],loading:true,error:false}),retry:()=>setAttempt(value=>value+1)};
}
