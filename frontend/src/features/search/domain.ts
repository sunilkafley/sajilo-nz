import { tasks, sources } from '../checklist/tasks';
import { arrivalTasks } from '../arrival/tasks';
import { topics } from '../guides/topics';
import { categories } from '../explore/catalog';
import { christchurch } from '../cities/catalog';
import { emergencyResource } from '../home/discovery';
import { fetchGuides, type Guide, type Language, type GuideStage } from '../guides/api';
import { loadEditorial, type Resource } from './editorial';

export interface SearchEntry {
  title: string; type: string; language: Language; to: string; text: string; status: string;
  topic?:string; stage?:string;
}
export interface SearchResult extends SearchEntry { excerpt: string }
const entry = (title: string, type: string, to: string, text: string, status = ''): SearchEntry =>
  ({title, type, to, text, status, language:'en',topic:to.startsWith('/explore/')?to.split('/')[2].split('?')[0]:undefined,
    stage:to.startsWith('/firstweek')?'firstweek':to.startsWith('/predeparture')?'predeparture':undefined});
export const localEntries: SearchEntry[] = [
  entry('Home', 'Page', '/', 'Your New Zealand journey companion. Explore key topics. Get to know Aotearoa.'),
  entry('Journey', 'Page', '/journey', 'Choose your stage. Before you leave. Arrival. Your next steps and browser-saved progress.'),
  entry('About Sajilo NZ', 'Page', '/about', 'For Nepalese students, workers, partners, families and newcomers. Privacy and browser storage.'),
  entry('Explore', 'Page', '/explore', 'A new country. A world of possibilities. Explore available topics, categories and city preparation.'),
  entry('Pre-departure guides', 'Page', '/guides', 'Prepare with confidence. Read reviewed guidance, check the official sources and take your next step.'),
  entry('First-week guides', 'Page', '/guides?stage=firstweek', 'Settle in, one step at a time. Published first-week guidance.'),
  entry('Pre-departure checklist', 'Checklist', '/predeparture', 'Pack your essentials, prepare your documents and feel ready.', 'Planning · unreviewed'),
  entry('First-week checklist', 'Checklist', '/firstweek', 'Your first week, one step at a time. Settle in. Get ready for study.', 'Planning · unreviewed'),
  ...tasks.map(task => entry(task.label, 'Checklist task', `/predeparture?task=${task.id}`, `Pre-departure checklist. ${task.group}`, 'Planning · unreviewed')),
  ...arrivalTasks.map(task => entry(task.label, 'Checklist task', `/firstweek?task=${task.id}`, `First-week checklist. ${task.group}`, 'Planning · unreviewed')),
  ...topics.map(topic => entry(topic.title, 'Topic', `/guides?topic=${topic.id}`, topic.group)),
  ...categories.flatMap(category => category.status === 'available' ? [entry(category.title, 'Category', category.to, category.description)] : []),
  entry(christchurch.title, 'City', '/cities/christchurch', 'Your Christchurch preparation. Use your existing checklist alongside published city guides. Airport transport. Accommodation checklist.'),
  entry('Official sources', 'Page', '/sources', 'Check official travel and entry information.'),
  ...sources.map(source => entry(source.title, 'Official source', source.url, 'Official information (online).', 'External website')),
  entry('Emergency Help', 'Help', emergencyResource.url, emergencyResource.label, 'External website · internet required'),
  entry('Saved resources', 'Page', '/saved', 'Saved pre-departure guides and offline copies on this browser.'),
  entry('Saved first-week guides', 'Page', '/saved?stage=firstweek', 'Saved first-week guidance on this browser.'),
  entry('Budget checklist', 'Tool', '/predeparture?task=budget', 'First-month budget planning task.', 'Planning · unreviewed'),
  entry('Budget calculator', 'Tool', '/explore/money/budget', 'Calculate your own weekly and monthly NZD expenses. Figures are not saved.'),
  entry('Course finder', 'Tool', '/explore/study/courses', 'Browse published courses, shortlist and compare options.'),
  entry('Community directory', 'Page', '/community', 'Published organisations, local businesses and events. Filter by location and category.'),
];
export function guideEntry(guide: Guide): SearchEntry {
  return {title:guide.title, type:'Guide', language:guide.language,stage:guide.stage,
    to:`/guides/${guide.slug}?lang=${guide.language}&stage=${guide.stage}`,
    text:[guide.summary, guide.body, ...guide.sources.map(source=>source.title)].join(' '),
    status:`Reviewed ${guide.verified_on}${guide.review_overdue ? ' · review overdue' : ''}`};
}
export const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
function excerpt(text: string, query: string): string {
  const plain = text.replace(/\s+/g, ' ').trim();
  const found = normalize(plain).indexOf(query);
  const start = Math.max(0, found - 45);
  return `${start ? '…' : ''}${plain.slice(start, start+170)}${plain.length > start+170 ? '…' : ''}`;
}
export function searchEntries(entries: SearchEntry[], input: string): SearchResult[] {
  const query = normalize(input);
  if (!query) return [];
  const terms = query.split(' ');
  const ranked = entries.flatMap(item => {
    const title = normalize(item.title), content = normalize(item.text);
    const score = title === query ? 0 : title.includes(query) ? 1 : terms.every(term => `${title} ${content}`.includes(term)) ? 2 : -1;
    return score < 0 ? [] : [{item, score}];
  }).sort((a,b) => a.score-b.score || a.item.title.localeCompare(b.item.title) || a.item.to.localeCompare(b.item.to));
  const seen = new Set<string>();
  return ranked.flatMap(({item}) => {
    const key = `${item.language}:${item.to}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{...item, excerpt:excerpt(item.text, query)}];
  });
}
// Only the existing public API is indexed. Never read admin, draft or saved-body storage.
export async function loadSearchEntries(signal: AbortSignal) {
  const languages: Language[] = ['en','ne'];
  const stages: GuideStage[] = ['predeparture','firstweek'];
  const [responses,editorial] = await Promise.all([
    Promise.allSettled(stages.flatMap(stage => languages.map(language => fetchGuides(language, signal, stage)))),
    Promise.all((['articles','courses','directory'] as Resource[]).flatMap(resource=>languages.map(language=>loadEditorial(resource,language,signal)))),
  ]);
  return {
    entries:[...localEntries, ...responses.flatMap(result => result.status === 'fulfilled' ? result.value.map(guideEntry) : []),...editorial.flatMap(result=>result.entries)],
    partial:responses.some(result=>result.status === 'rejected') || editorial.some(result=>result.partial),
  };
}
