import type { Language } from '../guides/api';

type Related = { title: string; to: string };
// Navigation only; guidance stays in separately reviewed Article records.
export const practicalResources: Record<string,Related[]> = {
  housing:[{title:'Calculate your own budget',to:'/explore/money/budget'}],
  nepal:[{title:'Travel document guides',to:'/guides?topic=documents'}],
  transport:[{title:'Local travel planning in Journey',to:'/firstweek?task=arrival-transport'}],
  support:[{title:'Housing support information',to:'/explore/housing'},{title:'Work and employment information',to:'/explore/work'}],
  work:[{title:'Money and budgeting',to:'/explore/money'},{title:'Study and qualifications',to:'/explore/education'}],
  immigration:[{title:'Work and careers',to:'/explore/work'},{title:'Study and courses',to:'/explore/study'},{title:'Nepal document services',to:'/explore/nepal'}],
};
export type TopicConfig = { title: string; heading: string; intro: string; section: string; layout?: 'accordion'; related: Related[] };
export const topicConfig: Record<string, TopicConfig> = {
  study: {title:'Study & courses', heading:'Your future starts with a good fit.', intro:'Find institutions by city, explore qualifications and understand your study options in New Zealand.', section:'Study guidance', related:[{title:'Understand the education system',to:'/explore/education'},{title:'Student support',to:'/explore/support'},{title:'Prepare for your journey',to:'/predeparture'}]},
  immigration: {title:'Immigration', heading:'Clear information. Trusted sources.', intro:'Find published guidance and check its official sources. This is not a personal eligibility assessment.', section:'Immigration information', related:[{title:'Official travel and immigration sources',to:'/sources'},{title:'Prepare to travel',to:'/explore/predeparture'}]},
  predeparture: {title:'Prepare to travel', heading:'Make room for your next chapter.', intro:'Read travel preparation guidance, then keep your next steps in Journey.', section:'Travel preparation information', related:[{title:'Open pre-departure checklist',to:'/predeparture'},{title:'Browse pre-departure guides',to:'/guides'},{title:'Open saved guides',to:'/saved'}]},
  arrival: {title:'Arrive & settle', heading:'Find your feet, one step at a time.', intro:'Read arrival information and keep your first-week planning in Journey.', section:'Arrival information', related:[{title:'Open first-week checklist',to:'/firstweek'},{title:'Browse first-week guides',to:'/guides?stage=firstweek'},{title:'Christchurch preparation',to:'/cities/christchurch'}]},
  housing: {title:'Housing & flatting', heading:'A place to feel settled.', intro:'Explore published information about accommodation, renting and flatting.', section:'Housing guidance', layout:'accordion', related:[{title:'Money & budgeting',to:'/explore/money'},{title:'First-week planning',to:'/firstweek'}]},
  money: {title:'Money & budgeting', heading:'Plan for everyday life.', intro:'Find published information about banking, budgeting and living costs.', section:'Money information', related:[{title:'Plan your first-month budget in Journey',to:'/predeparture?task=budget'},{title:'Browse travel money guides',to:'/guides?topic=money'},{title:'Work & careers',to:'/explore/work'}]},
  work: {title:'Work & careers', heading:'Your next opportunity starts here.', intro:'Explore published career preparation and employment information.', section:'Your career resources', related:[{title:'Education system',to:'/explore/education'},{title:'Immigration information',to:'/explore/immigration'},{title:'Choose your journey stage',to:'/journey'}]},
  community: {title:'Community', heading:'New place. Familiar faces.', intro:'Read published community information and discover existing local starting points.', section:'Community information', related:[{title:'Community directory status',to:'/community'},{title:'Christchurch preparation',to:'/cities/christchurch'},{title:'Student support',to:'/explore/support'}]},
  nepal: {title:'Nepal services', heading:'A connection to home.', intro:'Find published information about Nepalese document and consular services.', section:'Nepal services guidance', layout:'accordion', related:[{title:'Prepare to travel',to:'/explore/predeparture'},{title:'Community information',to:'/explore/community'}]},
  transport: {title:'Travel & transport', heading:'Find your way.', intro:'Explore published transport, driving and everyday travel information.', section:'Getting around', related:[{title:'Christchurch preparation',to:'/cities/christchurch'},{title:'Healthcare information',to:'/explore/aotearoa/healthcare'},{title:'Arrival information',to:'/explore/arrival'}]},
  support: {title:'Student support', heading:'A little help, a long way.', intro:'Explore published resources for study, wellbeing and everyday support.', section:'Support information', related:[{title:'Study & courses',to:'/explore/study'},{title:'Community information',to:'/explore/community'},{title:'Healthcare information',to:'/explore/aotearoa/healthcare'}]},
  education: {title:'Education system', heading:'Find your place in education.', intro:'Read published introductions to qualifications, learning and education in New Zealand.', section:'Understanding education', related:[{title:'Study & courses',to:'/explore/study'},{title:'Student support',to:'/explore/support'}]},
  aotearoa: {title:'Get to know Aotearoa', heading:'Get to know Aotearoa', intro:'Explore published introductions to life in New Zealand.', section:'About life in New Zealand', related:[{title:'Explore all topics',to:'/explore'}]},
  cities: {title:'City information', heading:'Find your city.', intro:'Explore published city introductions, starting with Christchurch preparation.', section:'City introductions', related:[{title:'Christchurch preparation',to:'/cities/christchurch'},{title:'Arrival information',to:'/explore/arrival'}]},
};
export const introductionPages = [
  {slug:'about-new-zealand',title:'About New Zealand'}, {slug:'culture-maori-culture',title:'Culture & Māori culture'},
  {slug:'weather-climate',title:'Weather & climate'}, {slug:'healthcare',title:'Healthcare'},
  {slug:'laws-everyday-rules',title:'Laws & everyday rules'}, {slug:'student-life',title:'Student life'},
];
export const withLanguage = (to: string, language: Language) => {
  const [path, search=''] = to.split('?');
  const params=new URLSearchParams(search);
  if(language==='ne')params.set('lang','ne');else params.delete('lang');
  return path+(params.size?'?'+params.toString():'');
};
