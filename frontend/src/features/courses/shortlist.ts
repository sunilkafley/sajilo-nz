import type { Language } from '../guides/api';

export const COURSE_STORAGE_KEY='sajilo-nz:courses:v1';
export type Selection={slug:string;language:Language;compare:boolean};
export type SavedCourses={version:1;items:Selection[]};
type StorageAccess=()=>Pick<Storage,'getItem'|'setItem'>;
const empty=():SavedCourses=>({version:1,items:[]});
export function decodeCourses(raw:string):SavedCourses {
  const data=JSON.parse(raw);
  if(data.version!==1 || !Array.isArray(data.items) || data.items.length>50 || data.items.some((s:Selection)=>
    !s || typeof s.slug!=='string' || !/^[\w-]{1,50}$/.test(s.slug) || !['en','ne'].includes(s.language) || typeof s.compare!=='boolean') ||
    data.items.filter((s:Selection)=>s.compare).length>3 || new Set(data.items.map((s:Selection)=>s.language+':'+s.slug)).size!==data.items.length)throw new Error('Unreadable course selections');
  // Keep only identifiers and selection flags, never course content.
  return {version:1,items:data.items.map((s:Selection)=>({slug:s.slug,language:s.language,compare:s.compare}))};
}
export function courseRepository(storage:StorageAccess=()=>localStorage) {
  return {
    load():{data:SavedCourses;blocked:boolean;warning:string} {
      try {const raw=storage().getItem(COURSE_STORAGE_KEY);return {data:raw===null?empty():decodeCourses(raw),blocked:false,warning:''};}
      catch {return {data:empty(),blocked:true,warning:'Saved course selections cannot be read. Stored data is preserved; changes are disabled until storage is available or repaired.'};}
    },
    save(data:SavedCourses){storage().setItem(COURSE_STORAGE_KEY,JSON.stringify(data));},
  };
}
export function selectCourse(data:SavedCourses,slug:string,language:Language,action:'save'|'compare'|'remove'):SavedCourses {
  let items=data.items.map(s=>({...s}));
  const current=items.find(s=>s.slug===slug && s.language===language);
  if(action==='remove')return {version:1,items:items.filter(s=>s!==current)};
  if(action==='compare' && !current?.compare && items.filter(s=>s.compare).length>=3)throw new Error('Compare up to three courses. Remove one comparison first.');
  if(!current) {
    if(items.length>=50)throw new Error('Shortlist limit reached (50 courses). Remove a course first.');
    items=[...items,{slug,language,compare:action==='compare'}];
  } else if(action==='compare')current.compare=!current.compare;
  return {version:1,items};
}
