import { useState } from 'react';
import { groupProviders, nzqaQualifications } from './directory';
import { providers, snapshotDate } from './providers';
import './study.css';

const cities=[...new Set(providers.map(p=>p.city))].sort((a,b)=>a.localeCompare(b,'en-NZ'));
const types=[...new Set(providers.map(p=>p.type))].sort();
const examples=[
  {name:'Bachelor of Business',level:7,provider:'AUT',area:'Business',url:'https://www.aut.ac.nz/study/study-options/business/courses/bachelor-of-business'},
  {name:'Bachelor of Nursing (Puahou Tapuhi o Aotearoa)',level:7,provider:'Ara',area:'Health',url:'https://www.ara.ac.nz/products/programme/ch4088-stru-bachelor-of-nursing-puahou-tapuhi-o-aotearoa/'},
  {name:'Bachelor of Engineering with Honours',level:8,provider:'University of Canterbury',area:'Engineering',url:'https://www.canterbury.ac.nz/study/academic-study/qualifications/bachelor-of-engineering-with-honours/'},
  {name:'Master of Information Technology',level:9,provider:'University of Auckland',area:'Computing',url:'https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/master-of-information-technology-minfotech.html'},
];
export function StudyDirectory() {
  const [query,setQuery]=useState('');
  const [city,setCity]=useState('');
  const [type,setType]=useState('');
  const [internationalOnly,setInternationalOnly]=useState(false);
  const groups=groupProviders(providers,query,city,type,internationalOnly);
  const count=groups.reduce((sum,group)=>sum+group.providers.length,0);
  return <div className="study-directory" lang="en">
    <section className="card" aria-labelledby="study-start">
      <h2 id="study-start">Find a place to study</h2>
      <p>Explore universities, polytechnics, private colleges and training establishments, and wānanga. Start with a city, then visit the provider’s website for courses, entry requirements and fees.</p>
      <p><a className="button" href={nzqaQualifications} rel="noopener noreferrer">View NZQA</a></p>
      <p>This link searches current qualifications. Enter a subject or qualification name on NZQA to see results. To check a provider, use its NZQA record below.</p>
    </section>
    <section className="card" aria-labelledby="study-international">
      <h2 id="study-international">What can international students study?</h2>
      <p>Options include English-language and foundation study, vocational certificates and diplomas, bachelor’s degrees, postgraduate qualifications and research degrees. Availability depends on the provider, programme and campus.</p>
      <p>Check that the provider is an approved international Code signatory, then confirm the specific programme accepts international applications. Ask about academic and English-language entry requirements, intake dates, fees, delivery location and any placement requirements.</p>
      <p>A Code signatory listing does not confirm that every course is open to international students, or that an application will be accepted.</p>
      <p><a href="https://www2.nzqa.govt.nz/tertiary/tertiary-education-in-new-zealand/choosing-a-tertiary-provider/">NZQA: choosing a provider</a> · <a href="https://www.studywithnewzealand.govt.nz/en/study-options/courses-and-programmes">Explore international study options</a></p>
    </section>
    <section aria-labelledby="study-providers">
      <h2 id="study-providers">Institutions by city · A–Z</h2>
      <p><strong>{providers.length} provider records</strong> across four tertiary provider types in the NZQA search snapshot; <strong>{providers.filter(p=>p.codeSignatory).length} appear in its international Code signatory filter</strong>.</p>
      <p className="study-note">Source snapshot: <time dateTime={snapshotDate}>{snapshotDate}</time>. Counts use NZQA provider IDs; some institutions have multiple records, including NZIST divisions and MIT/Unitec. Schools and other provider types are outside this directory.</p>
      <p>Grouped by the head-office town or city in NZQA’s contact address, with Auckland suburbs combined. Providers may teach in other cities. Open a provider’s delivery locations to check the register’s location names; confirm your campus directly before applying.</p>
      <div className="study-filters">
        <label htmlFor="study-query">Search institution or location<input id="study-query" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Massey or Auckland"/></label>
        <label htmlFor="study-city">Head-office city<select id="study-city" value={city} onChange={e=>setCity(e.target.value)}><option value="">All cities</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label>
        <label htmlFor="study-type">Institution type<select id="study-type" value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{types.map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="study-toggle"><input type="checkbox" checked={internationalOnly} onChange={e=>setInternationalOnly(e.target.checked)}/> Show international Code signatory records only</label>
      </div>
      <p role="status">{count} provider records in {groups.length} city groups</p>
      {(query || city || type || internationalOnly) && <button type="button" onClick={()=>{setQuery('');setCity('');setType('');setInternationalOnly(false);}}>Clear filters</button>}
      {!count && <p>No institutions match these filters. Try another name or clear the filters.</p>}
      <div className="topic-accordions">{groups.map(group=><details className="card study-city" key={group.city} open={Boolean(query || city)}>
        <summary>{group.city} <span>({group.providers.length})</span></summary>
        <ul className="study-providers">{group.providers.map(p=><li key={p.id}>
          <h3>{p.name}</h3><p>{p.type} · {p.codeSignatory?'Listed in international Code signatory search':'Not listed in international Code signatory search'}</p>
          <p>{p.website?<a href={p.website} rel="noopener noreferrer">Official website<span className="sr-only">: {p.name}</span></a>:<span>Website not supplied in the NZQA record</span>} · <a href={p.nzqa} rel="noopener noreferrer">NZQA provider record<span className="sr-only">: {p.name}</span></a></p>
          <details className="study-locations"><summary>NZQA delivery locations</summary><p>{p.locations.join(' · ')}</p><p className="study-note">Names as listed by NZQA, including suburbs and any overseas sites. A location listing does not establish current course availability.</p></details>
        </li>)}</ul>
      </details>)}</div>
      <p><a href="https://www.nzqa.govt.nz/providers/index.do">Search the live NZQA provider register</a></p>
    </section>
    <section className="card" aria-labelledby="study-popular">
      <h2 id="study-popular">Popular study areas and qualifications</h2>
      <p>Education New Zealand highlights business, health, engineering, computing, creative arts and science as popular study areas. Here are four real qualification examples in those areas; this is not a ranking of individual programmes.</p>
      <ul className="study-providers">{examples.map(example=><li key={example.name}><h3><a href={example.url}>{example.name}</a></h3><p>{example.area} · Level {example.level} · {example.provider}</p></li>)}</ul>
      <p>Use each programme’s official page to check international availability and current intakes.</p>
      <p><a href="https://www.studywithnewzealand.govt.nz/en/study-options/courses-and-programmes/areas-of-study">Education New Zealand: popular study areas</a></p>
    </section>
    <section className="card" aria-labelledby="study-levels">
      <h2 id="study-levels">Understand the level of study</h2>
      <dl className="study-levels">
        <dt>Levels 1–6</dt><dd>Certificates</dd>
        <dt>Levels 5–7</dt><dd>Diplomas</dd>
        <dt>Level 7</dt><dd>Bachelor’s degrees, graduate certificates and graduate diplomas</dd>
        <dt>Level 8</dt><dd>Bachelor honours degrees, postgraduate certificates and postgraduate diplomas</dd>
        <dt>Level 9</dt><dd>Master’s degrees</dd>
        <dt>Level 10</dt><dd>Doctoral degrees</dd>
      </dl>
      <p>The qualification level describes learning complexity; it is different from a university’s internal course numbering. English-language or foundation programmes do not all lead to the same qualification or level.</p>
      <p><a href="https://www2.nzqa.govt.nz/qualifications-and-standards/about-new-zealand-qualifications-credentials-framework/">NZQA: qualification levels</a></p>
    </section>
  </div>;
}
