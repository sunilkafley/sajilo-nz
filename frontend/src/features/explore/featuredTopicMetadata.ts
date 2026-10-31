// Select existing directory sections, never unpublished guide pages.
export const featuredTopicMetadata = [
  { id:'immigration', title:'Immigration & Visas', description:'Official immigration information, visa conditions and authoritative links.', icon:'shield' },
  { id:'study', title:'Study & Education', description:'Courses, providers, qualifications and student support.', icon:'cap' },
  { id:'money', title:'Earnings & Living Expenses', description:'Earnings, banking, budgeting, taxes and everyday living costs.', icon:'wallet' },
  { id:'work', title:'Work & Careers', description:'Employment rights, job-search resources and career preparation.', icon:'briefcase' },
] as const;
