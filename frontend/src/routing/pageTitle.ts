import { topicConfig } from '../features/explore/topicConfig';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/journey': 'Journey',
  '/community': 'Community',
  '/about': 'About',
  '/faqs': 'FAQs',
  '/search': 'Search',
  '/explore': 'Explore',
  '/sources': 'Official sources',
  '/predeparture': 'Pre-departure checklist',
  '/firstweek': 'First-week checklist',
};

export function pageTitle(pathname: string, search: string): string {
  let title = pageTitles[pathname] ?? 'Your journey';
  if (pathname.startsWith('/guides') || pathname === '/saved') {
    title = new URLSearchParams(search).get('stage') === 'firstweek'
      ? 'First-week guides' : 'Pre-departure guides';
  } else if (pathname.startsWith('/cities/')) {
    title = pathname === '/cities/christchurch' ? 'Christchurch' : 'City unavailable';
  } else if (pathname.startsWith('/explore/')) {
    title = topicConfig[pathname.split('/')[2]]?.title ?? 'Topic unavailable';
  }
  return `${title} · Sajilo NZ`;
}
