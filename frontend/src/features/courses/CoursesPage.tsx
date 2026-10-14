import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { filterFields, getCourse, getCourses, type Course, type CoursePage } from './api';
import { courseRepository, selectCourse, type Selection } from './shortlist';
import { withLanguage } from '../explore/topicConfig';
import './courses.css';

const base='/explore/study/courses';
const labels={city:'City',qualification_level:'Qualification level',subject:'Subject',provider:'Institution',duration:'Duration',intake:'Intake'};
const fields=['provider','city','subject','qualification_level','duration','intake','tuition','entry_requirements'] as const;
const detailLabels={...labels,provider:'Institution',tuition:'Tuition',entry_requirements:'Entry requirements'};
function Source({course}:{course:Course}) {
  return <div className="article-attribution"><a href={course.source_url} rel="noopener noreferrer">{course.source_kind==='provider'?'Provider':'Official'} source: {course.source_hostname} (online)</a>
    <p>Reviewed <time dateTime={course.verified_on}>{course.verified_on}</time> · Next review <time dateTime={course.next_review_on}>{course.next_review_on}</time></p>
    {course.review_overdue && <p className="notice warning">Review overdue. Check current details with the provider.</p>}</div>;
}
export function CoursesPage({mode='catalogue'}:{mode?:'catalogue'|'shortlist'|'compare'}) {
  const {courseSlug}=useParams();
  const [params,setParams]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const link=(path:string)=>withLanguage(path,language);
  const [repository]=useState(()=>courseRepository());
  const [initial]=useState(()=>repository.load());
  const [saved,setSaved]=useState(initial.data);
  const [warning,setWarning]=useState(initial.warning);
  const [dirty,setDirty]=useState(false);
  const [feedback,setFeedback]=useState('');
  const [attempt,setAttempt]=useState(0);
  const selection=JSON.stringify(saved.items.filter(s=>mode==='shortlist' || s.compare));
  const key=JSON.stringify([mode,courseSlug,params.toString(),attempt,mode==='catalogue'?'':selection]);
  type Result={key:string;page?:CoursePage;courses?:Array<{selection:Selection;course:Course|null}>;error?:string};
  const [state,setState]=useState<Result>();
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    const run=async():Promise<Result>=>{
      if(courseSlug) return {key,courses:[{selection:{slug:courseSlug,language,compare:false},course:await getCourse(courseSlug,language,controller.signal)}]};
      if(mode==='catalogue')return {key,page:await getCourses(new URLSearchParams(params),controller.signal)};
      const choices:Selection[]=JSON.parse(selection);
      // Re-resolve each slug in the selected language. No stored content fallback.
      const unique=[...new Map(choices.map(s=>[s.slug,s])).values()];
      const courses=[];
      for(const s of unique)courses.push({selection:s,course:await getCourse(s.slug,language,controller.signal)});
      return {key,courses};
    };
    run().then(result=>{if(active)setState(result);}).catch(()=>{if(active)setState({key,error:'Courses could not be loaded. Check your connection and try again. Course content is not saved offline.'});});
    return ()=>{active=false;controller.abort();};
  },[key]); // key includes all request inputs; older responses cannot replace current results.
  const current=state?.key===key?state:undefined;
  const rows=current?.courses || [];
  const [query,setQuery]=useState(params.get('q') || '');
  useEffect(()=>setQuery(params.get('q') || ''),[params.toString()]);
  function changeFilter(name:string,value:string){const next=new URLSearchParams(params);next.delete('page');if(value)next.set(name,value);else next.delete(name);setParams(next);}
  function update(slug:string,lang:Selection['language'],action:'save'|'compare'|'remove') {
    if(initial.blocked)return;
    try {
      const next=selectCourse(saved,slug,lang,action);setSaved(next);
      setFeedback(action==='remove'?'Course removed from shortlist.':action==='save'?'Course shortlisted.':'Comparison selection updated.');
      try {repository.save(next);setWarning('');setDirty(false);} catch {setWarning('Course selections could not be saved. Changes last only for this session until saved.');setDirty(true);}
    } catch(error){setFeedback((error as Error).message);}
  }
  function controls(course:Course) {
    const item=saved.items.find(s=>s.slug===course.slug);
    const storedLanguage=item?.language || course.language;
    return <div className="course-actions"><button disabled={initial.blocked} onClick={()=>update(course.slug,storedLanguage,item?'remove':'save')}>{item?'Remove from shortlist':'Shortlist'}</button>
      <button disabled={initial.blocked} aria-pressed={!!item?.compare} onClick={()=>update(course.slug,storedLanguage,'compare')}>{item?.compare?'Remove comparison':'Compare'}</button></div>;
  }
  function card(course:Course,detail=false) {return <article className="card" key={course.slug} lang={course.language}>
    <p className="eyebrow">{course.language==='ne'?'नेपाली':'English'} · Course</p><h2>{detail?course.title:<Link to={link(base+'/'+course.slug)}>{course.title}</Link>}</h2><p>{course.summary}</p>
    <dl className="course-facts">{(detail?fields:fields.slice(0,6)).map(field=><div key={field}><dt>{detailLabels[field]}</dt><dd>{course[field] || 'Not specified — check with provider'}</dd></div>)}</dl>
    {!detail && <p>Tuition: {course.tuition || 'Not specified — check with provider'}</p>}
    {detail && <p className="article-text">{course.body}</p>}{controls(course)}<Source course={course}/>
  </article>;}
  const title=courseSlug?'Course details':mode==='compare'?'Compare courses':mode==='shortlist'?'Your course shortlist':'Find a course that fits';
  useEffect(()=>{document.title=title+' · Sajilo NZ';},[title]);
  return <section className="courses-page"><p className="eyebrow">Study / Course finder</p><h1>{title}</h1>
    <nav className="course-actions" aria-label="Course navigation"><Link to={link(base)}>Browse courses</Link><Link to={link(base+'/shortlist')}>Shortlist ({saved.items.length})</Link><Link to={link(base+'/compare')}>Compare ({saved.items.filter(s=>s.compare).length})</Link><Link to={link('/explore/study')}>Study guidance</Link><Link to={link('/explore/education')}>Education system</Link><Link to={link('/explore/support')}>Student support</Link></nav>
    <p>Selections stay in this browser only. Course information is loaded online in {language==='ne'?'नेपाली':'English'}; translations may be unavailable. Confirm fees, intake and entry requirements with the provider.</p>
    {warning && <div role="alert" className="notice warning">{warning}{dirty && <button onClick={()=>{try{repository.save(saved);setDirty(false);setWarning('');}catch{setWarning('Course selections still could not be saved. Please try again.');}}}>Try saving again</button>}</div>}
    <p role="status">{feedback}</p>
    {mode==='catalogue' && !courseSlug && <form className="course-filters" onSubmit={event=>{event.preventDefault();changeFilter('q',query.trim());}}>
      <label className="course-search">Search courses, subjects or institutions<input type="search" maxLength={200} value={query} onChange={e=>setQuery(e.target.value)}/></label><button type="submit">Search courses</button>
      {filterFields.map(field=><label key={field}>{labels[field]}<select value={params.get(field)||''} onChange={e=>changeFilter(field,e.target.value)}><option value="">All {labels[field].toLowerCase()}</option>
        {params.get(field) && !current?.page?.facets[field].includes(params.get(field)!) && <option value={params.get(field)!}>{params.get(field)} (selected)</option>}
        {current?.page?.facets[field].map(value=><option key={value} value={value}>{value}</option>)}</select></label>)}
      <button type="button" onClick={()=>setParams(language==='ne'?{lang:'ne'}:{})}>Reset filters</button>
    </form>}
    {!current && <p role="status">Loading published courses…</p>}
    {current?.error && <div role="alert"><p>{current.error}</p><button onClick={()=>setAttempt(n=>n+1)}>Try again</button></div>}
    {current?.page && <><p>{current.page.count} published courses</p>{!current.page.count && <p>No published courses match this language and these filters yet.</p>}<div className="course-grid">{current.page.results.map(c=>card(c))}</div>
      <nav className="course-actions" aria-label="Course result pages"><button disabled={!(Number(params.get('page'))>1)} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(Number(params.get('page'))-1));setParams(next);}}>Previous page</button><span>Page {params.get('page')||1}</span><button disabled={!current.page.next} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(Number(params.get('page')||1)+1));setParams(next);}}>Next page</button></nav></>}
    {current?.courses && <>
      {!current.courses.length && <p>{mode==='compare'?'Choose up to three courses to compare.':'No shortlisted courses yet.'}</p>}
      {current.courses.filter(row=>!row.course).map(row=><div className="card" key={row.selection.slug}><h2>Course unavailable</h2><p>This selection ({row.selection.slug}) may be withdrawn or not published in this language.</p>{language==='ne' && <Link to={withLanguage(base+'/'+row.selection.slug,'en')}>Check English availability</Link>}{!courseSlug && <button disabled={initial.blocked} onClick={()=>update(row.selection.slug,row.selection.language,'remove')}>Remove unavailable selection</button>}</div>)}
      {mode==='compare' && rows.some(row=>row.course) ? <div className="course-table" tabIndex={0} role="region" aria-label="Course comparison">
        <table><caption>Published course information — confirm current details with each provider</caption>
          <thead><tr><th scope="col">Detail</th>{rows.map(row=>row.course && <th scope="col" key={row.course.slug}><Link to={link(base+'/'+row.course.slug)}>{row.course.title}</Link>{controls(row.course)}</th>)}</tr></thead>
          <tbody>{fields.map(field=><tr key={field}><th scope="row">{detailLabels[field]}</th>{rows.map(row=>row.course && <td key={row.course.slug}>{row.course[field] || 'Not specified — check with provider'}</td>)}</tr>)}
            <tr><th scope="row">Source and review</th>{rows.map(row=>row.course && <td key={row.course.slug}><Source course={row.course}/></td>)}</tr></tbody>
        </table></div>
      : <div className={courseSlug?'course-reading':'course-grid'}>{current.courses.map(row=>row.course && card(row.course,!!courseSlug))}</div>}
    </>}
  </section>;
}
