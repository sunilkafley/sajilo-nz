// Select existing directory sections, never unpublished guide pages.
export const landingTopics = [
  { id:'immigration', title:'Immigration & Visas', description:'Official immigration information, visa conditions and authoritative links.', icon:'shield', status:'Official source links' },
  { id:'study', title:'Study & Education', description:'Courses, providers, qualifications and student support.', icon:'cap', status:'Resources planned' },
  { id:'work', title:'Work & Careers', description:'Employment rights, job-search resources and career preparation.', icon:'briefcase', status:'Resources planned' },
  { id:'housing', title:'Housing & Flatting', description:'Accommodation, renting, tenancy and flatting resources.', icon:'home', status:'Resources planned' },
  { id:'money', title:'Money & Banking', description:'Banking, budgeting, taxes and everyday living costs.', icon:'wallet', status:'Travel money guides' },
  { id:'transport', title:'Everyday Life & Services', description:'Healthcare, transport, driving and essential public services.', icon:'heart', status:'Resources planned' },
] as const;
