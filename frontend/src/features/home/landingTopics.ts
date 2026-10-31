import immigrationPhoto from '../../assets/topics/immigration.jpg';
import studyPhoto from '../../assets/topics/study.jpg';
import moneyPhoto from '../../assets/topics/money.jpg';
import workPhoto from '../../assets/topics/work.jpg';

// Select existing directory sections, never unpublished guide pages.
export const landingTopics = [
  { id:'immigration', title:'Immigration & Visas', description:'Official immigration information, visa conditions and authoritative links.', icon:'shield', photo:immigrationPhoto },
  { id:'study', title:'Study & Education', description:'Courses, providers, qualifications and student support.', icon:'cap', photo:studyPhoto },
  { id:'money', title:'Earnings & Living Expenses', description:'Earnings, banking, budgeting, taxes and everyday living costs.', icon:'wallet', photo:moneyPhoto },
  { id:'work', title:'Work & Careers', description:'Employment rights, job-search resources and career preparation.', icon:'briefcase', photo:workPhoto },
] as const;
