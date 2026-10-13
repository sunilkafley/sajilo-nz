import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TopicPage } from './TopicPage';
import { parseArticle, fetchArticles, type Article } from './articles';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';

const article:Article={slug:'test-study',language:'en',topic:'study',title:'Synthetic study article',summary:'Test summary',body:'<script>not executable</script>',sections:[{heading:'Test section',body:'Plain section text'}],source_url:'https://official.example.org/page',source_hostname:'official.example.org',source_kind:'official',verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
const response=(results:Article[],next:string|null=null)=>({ok:true,json:async()=>({results,count:results.length,next})});
const mount=(route='/explore/study')=>render(<MemoryRouter initialEntries={[route]}><Routes><Route path="/explore/:topicId" element={<TopicPage/>}/><Route path="/explore/:topicId/:slug" element={<TopicPage/>}/></Routes></MemoryRouter>);
afterEach(()=>{vi.unstubAllGlobals();localStorage.clear();});

it('validates language, topic, source URL and review metadata before rendering',()=>{
  expect(parseArticle(article,'study','en')).toEqual(article);
  for(const changes of [{language:'ne'},{topic:'housing'},{source_url:'javascript:alert(1)'},{source_url:'https://official.example.org.evil.org/'},{source_kind:'commercial'},{verified_on:'bad'},{next_review_on:'2025-01-01'},{sections:[{heading:1,body:'test'}]}]) {
    expect(()=>parseArticle({...article,...changes},'study','en')).toThrow();
  }
});
it('renders plain text, structured headings and original source/review without saving content',async()=>{
  const save=vi.spyOn(Storage.prototype,'setItem');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>article}));
  mount('/explore/study/test-study');
  expect(await screen.findByRole('heading',{name:article.title})).toBeInTheDocument();
  expect(screen.getByText(article.body)).toBeInTheDocument();
  expect(document.querySelector('script')).toBeNull();
  expect(screen.getByRole('heading',{name:'Test section'})).toBeInTheDocument();
  expect(screen.getByText(/Review overdue/)).toBeInTheDocument();
  expect(screen.getByRole('link',{name:/Official source:/})).toHaveAttribute('href',article.source_url);
  expect(save).not.toHaveBeenCalled();save.mockRestore();
});
it('shows unavailable translation without substituting English and keeps related language context',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:404}));
  mount('/explore/study/test-study?lang=ne');
  expect(await screen.findByRole('heading',{name:'This article is not available'})).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Check English availability'})).toHaveAttribute('href','/explore/study/test-study');
  expect(screen.getByRole('link',{name:'Student support'})).toHaveAttribute('href','/explore/support?lang=ne');
  expect(screen.queryByText(article.body)).toBeNull();
});
it('recovers from request failures and distinguishes an empty publication list',async()=>{
  const fetch=vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(response([]));vi.stubGlobal('fetch',fetch);mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('not saved for offline reading');
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByRole('heading',{name:'No published articles yet'})).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
});
it('shows accordion guidance without interactive checklists',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response([{...article,topic:'housing'}])));mount('/explore/housing');
  await screen.findByText(article.title);
  const summary=document.querySelector('summary')!;
  await userEvent.click(summary);
  expect(document.querySelector('details')).toHaveAttribute('open');
  expect(screen.getByRole('link',{name:'Read full article: '+article.title})).toHaveAttribute('href','/explore/housing/test-study');
  expect(screen.queryByRole('checkbox')).toBeNull();
});
it('ignores late English responses after switching to Nepali',async()=>{
  let finish!:(value:unknown)=>void;
  const fetch=vi.fn().mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValue(response([]));vi.stubGlobal('fetch',fetch);
  render(<MemoryRouter initialEntries={['/explore/study']}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
  await userEvent.selectOptions(screen.getByLabelText('Language / भाषा'),'ne');
  await screen.findByRole('heading',{name:'No published articles yet'});
  await act(async()=>finish(response([article])));
  expect(screen.queryByText(article.title)).toBeNull();
  expect(screen.getByText('Content language: नेपाली')).toBeInTheDocument();
});
it('paginates on the fixed endpoint and never follows an API-supplied external URL',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(response([article],'https://untrusted.example/private')).mockResolvedValue(response([{...article,slug:'second',title:'Second test article'}]));
  vi.stubGlobal('fetch',fetch);mount();await screen.findByText(article.title);
  await userEvent.click(screen.getByRole('button',{name:'Next page'}));
  expect(await screen.findByText('Second test article')).toBeInTheDocument();
  expect(fetch.mock.calls[1][0]).toBe('/api/explore/articles/?topic=study&lang=en&page=2');
});
it('rejects duplicated and mismatched article responses',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response([article,article])));
  await expect(fetchArticles('study','en',1,new AbortController().signal)).rejects.toThrow();
});
it('unknown topics including inherited object keys do not fetch content',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);mount('/explore/constructor');
  expect(screen.getByRole('heading',{name:'Topic unavailable'})).toBeInTheDocument();expect(fetch).not.toHaveBeenCalled();
});
it('hides the old article immediately while a new language request is loading',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(response([article])).mockImplementation(()=>new Promise(()=>{}));vi.stubGlobal('fetch',fetch);
  render(<MemoryRouter initialEntries={['/explore/study']}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
  await screen.findByText(article.title);await userEvent.selectOptions(screen.getByLabelText('Language / भाषा'),'ne');
  await waitFor(()=>expect(screen.queryByText(article.title)).toBeNull());
  expect(screen.getByText('Loading published information…')).toBeInTheDocument();
});
