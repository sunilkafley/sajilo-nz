import { expect, it } from 'vitest';
import { languageFromSearch, withLanguage } from './language';
import { pageTitle } from './pageTitle';

it.each([
  ['/', '', 'Home'],
  ['/faqs', '?lang=ne', 'FAQs'],
  ['/guides/passport', '?stage=firstweek&lang=ne', 'First-week guides'],
  ['/saved', '?stage=firstweek', 'First-week guides'],
  ['/guides/passport', '', 'Pre-departure guides'],
  ['/cities/christchurch', '', 'Christchurch'],
  ['/cities/unknown', '', 'City unavailable'],
  ['/explore/study/courses/compare', '', 'Study & courses'],
  ['/explore/unknown', '', 'Topic unavailable'],
  ['/missing', '', 'Your journey'],
])('preserves the title for %s %s', (path, search, title) => {
  expect(pageTitle(path, search)).toBe(`${title} · Sajilo NZ`);
});

it('changes language without losing checklist focus, filters or fragments', () => {
  const destination = '/predeparture?task=budget&lang=en#requirements';
  expect(withLanguage(destination, 'ne')).toBe('/predeparture?task=budget&lang=ne#requirements');
  expect(withLanguage(withLanguage(destination, 'ne'), 'en')).toBe('/predeparture?task=budget#requirements');
  expect(withLanguage('/faqs#finding-work', 'ne')).toBe('/faqs?lang=ne#finding-work');
});

it('defaults unsupported or absent language values to English', () => {
  expect(languageFromSearch('?lang=ne&stage=firstweek')).toBe('ne');
  expect(languageFromSearch('?lang=unknown')).toBe('en');
  expect(languageFromSearch('')).toBe('en');
});
