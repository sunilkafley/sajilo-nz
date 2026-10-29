import type { Language } from '../features/guides/api';

export function languageFromSearch(search: string): Language {
  return new URLSearchParams(search).get('lang') === 'ne' ? 'ne' : 'en';
}

/** Set the interface language without losing filters or a fragment. */
export function withLanguage(to: string, language: Language): string {
  const hashIndex = to.indexOf('#');
  const fragment = hashIndex < 0 ? '' : to.slice(hashIndex);
  const destination = hashIndex < 0 ? to : to.slice(0, hashIndex);
  const queryIndex = destination.indexOf('?');
  const path = queryIndex < 0 ? destination : destination.slice(0, queryIndex);
  const params = new URLSearchParams(queryIndex < 0 ? '' : destination.slice(queryIndex + 1));
  if (language === 'ne') params.set('lang', 'ne');
  else params.delete('lang');
  return path + (params.size ? `?${params.toString()}` : '') + fragment;
}
