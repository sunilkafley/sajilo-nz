import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { CoursesPage } from './CoursesPage';
import { COURSE_STORAGE_KEY } from './shortlist';
const course={slug:'test',language:'en',topic:'study',title:'Test course',summary:'Synthetic',body:'Body',provider:'Provider',city:'City',subject:'Subject',qualification_level:7,duration:'',intake:'',tuition:'',entry_requirements:'',source_url:'https://provider.example.org/course',source_hostname:'provider.example.org',source_kind:'provider',verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
const facets={city:['City'],subject:['Subject'],provider:['Provider'],qualification_level:[7],duration:[],intake:[]};
const response=(data:unknown)=>({ok:true,json:async()=>data});
const mount=(path='/explore/study/courses/test')=>render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/explore/study/courses" element={<CoursesPage/>}/><Route path="/explore/study/courses/:courseSlug" element={<CoursesPage/>}/></Routes></MemoryRouter>);
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();localStorage.clear();});

it('shows failed storage saves and retries only the course key',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(course)));
  const original=Storage.prototype.setItem;
  const save=vi.spyOn(Storage.prototype,'setItem').mockImplementationOnce(()=>{throw new Error('quota');});
  mount();await screen.findByRole('heading',{name:'Test course'});
  await userEvent.click(screen.getByRole('button',{name:'Shortlist'}));
  expect(screen.getByRole('alert')).toHaveTextContent('could not be saved');
  expect(screen.getByRole('link',{name:'Shortlist (1)'})).toBeInTheDocument();
  save.mockImplementation(original);
  await userEvent.click(screen.getByRole('button',{name:'Try saving again'}));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(save.mock.calls.every(([key])=>key===COURSE_STORAGE_KEY)).toBe(true);
  expect(localStorage.getItem(COURSE_STORAGE_KEY)).not.toContain('Test course');
});
it('ignores late filter responses and recovers from unavailable requests',async()=>{
  let finish!:(r:unknown)=>void;
  const fetch=vi.fn().mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}))
    .mockResolvedValueOnce(response({results:[],count:0,next:null,facets}));
  vi.stubGlobal('fetch',fetch);mount('/explore/study/courses');
  await userEvent.type(screen.getByLabelText('Search courses, subjects or institutions'),'missing');
  await userEvent.click(screen.getByRole('button',{name:'Search courses'}));
  await screen.findByText(/No published courses match/);
  await act(async()=>finish(response({results:[course],count:1,next:null,facets})));
  expect(screen.queryByText('Test course')).toBeNull();
});
it('course errors have retry and never use stored course content',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(response(course)));
  mount();await screen.findByRole('alert');
  expect(screen.getByRole('alert')).toHaveTextContent('not saved offline');
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByRole('heading',{name:'Test course'})).toBeInTheDocument();
});
