// Only explicitly approved Nepali interface copy belongs here.
// Missing translations retain English; guide publication remains independent.
export const interfaceCopy = {
  en: {
    tagline: 'Your New Zealand journey companion',
    fallback: 'Interface shown in English where reviewed Nepali translations are unavailable. Guides use your selected language; unavailable translations are not substituted.',
  },
  ne: { tagline: 'तपाईंको न्युजिल्यान्ड सहयात्री' },
} as const;
export function interfaceText(language:'en'|'ne',key:keyof typeof interfaceCopy.en) {
  const translated: Partial<Record<keyof typeof interfaceCopy.en,string>> = interfaceCopy[language];
  return {text:translated[key] ?? interfaceCopy.en[key], language:translated[key] ? language : 'en'};
}
