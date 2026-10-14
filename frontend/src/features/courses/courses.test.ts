import { expect, it } from 'vitest';
import { courseRepository, COURSE_STORAGE_KEY, decodeCourses, selectCourse } from './shortlist';
import { parseCourse } from './api';

it('shortlists and compares separately without exceeding limits or storing content',()=>{
  let data=decodeCourses('{"version":1,"items":[]}');
  for(const slug of ['one','two','three'])data=selectCourse(data,slug,'en','compare');
  expect(()=>selectCourse(data,'four','en','compare')).toThrow(/three/);
  data=selectCourse(data,'one','en','compare');
  expect(data.items).toHaveLength(3);expect(data.items[0].compare).toBe(false);
  data=selectCourse(data,'two','en','remove');expect(data.items).toHaveLength(2);
  expect(decodeCourses(JSON.stringify(data))).toEqual(data);
  let key='';let value='';courseRepository(()=>({getItem:()=>null,setItem:(k,v)=>{key=k;value=v;}})).save(data);
  expect(key).toBe(COURSE_STORAGE_KEY);expect(value).not.toContain('title');
});
it('preserves corrupt/future storage and exposes write errors',()=>{
  for(const raw of ['bad','{"version":2,"items":[]}','{"version":1,"items":[{}]}']) {
    let writes=0;const repository=courseRepository(()=>({getItem:()=>raw,setItem:()=>{writes++;}}));
    expect(repository.load().blocked).toBe(true);expect(writes).toBe(0);
  }
  expect(courseRepository(()=>{throw new Error();}).load().blocked).toBe(true);
  expect(()=>courseRepository(()=>({getItem:()=>null,setItem:()=>{throw new Error('quota');}})).save({version:1,items:[]})).toThrow('quota');
});
it('rejects malformed, unreviewed and unsafe course responses',()=>{
  const course={slug:'test',language:'en',topic:'study',title:'Synthetic course',summary:'Test',body:'Test',provider:'Provider',city:'City',subject:'Subject',qualification_level:7,duration:'',intake:'',tuition:'',entry_requirements:'',source_url:'https://provider.example.org/course',source_hostname:'provider.example.org',source_kind:'provider',verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
  expect(parseCourse(course,'en').title).toBe(course.title);
  for(const changes of [{language:'ne'},{topic:'community'},{source_url:'javascript:bad'},{source_kind:'commercial'},{verified_on:null},{qualification_level:11}])expect(()=>parseCourse({...course,...changes},'en')).toThrow();
});
