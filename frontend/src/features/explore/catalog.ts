// Availability describes implemented destinations, never editorial verification.
type IconName = 'cap' | 'shield' | 'plane' | 'journey' | 'home' | 'wallet' | 'briefcase' | 'users' | 'globe' | 'car' | 'heart';
type Category = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
};

const categoryDefinitions: Category[] = [
  { id: 'study', title: 'Study & courses', description: 'Study, course and campus information.', icon: 'cap' },
  { id: 'immigration', title: 'Immigration', description: 'Official information and sources for your next questions.', icon: 'shield' },
  { id: 'predeparture', title: 'Prepare to travel', description: 'Documents, packing, money and preparation information.', icon: 'plane' },
  { id: 'arrival', title: 'Arrive & settle', description: 'Information for your first weeks in New Zealand.', icon: 'journey' },
  { id: 'housing', title: 'Housing & flatting', description: 'Accommodation, renting and flatting information.', icon: 'home' },
  { id: 'money', title: 'Money & budgeting', description: 'Banking, budgeting and everyday living costs.', icon: 'wallet' },
  { id: 'work', title: 'Work & careers', description: 'Resources for your job search and career preparation.', icon: 'briefcase' },
  { id: 'community', title: 'Community', description: 'Familiar faces and new connections.', icon: 'users' },
  { id: 'nepal', title: 'Nepal services', description: 'Passport, document and official-contact information.', icon: 'globe' },
  { id: 'transport', title: 'Travel & transport', description: 'Getting around your new home.', icon: 'car' },
  { id: 'support', title: 'Student support', description: 'Study, wellbeing and everyday support resources.', icon: 'heart' },
  { id: 'education', title: 'Education system', description: 'An introduction to qualifications and learning.', icon: 'cap' },
];

// A working topic page is not a claim that editorial content has been published.
export const categories = categoryDefinitions.map(category => ({...category,
  status: 'available' as const, to: `/explore/${category.id}`, action: 'Explore topic'}));

export const cities = ['Auckland', 'Christchurch', 'Wellington', 'Hamilton', 'Dunedin'];

// Reuse the prototype's line icons without changing the preserved prototype.
export const iconPaths: Record<IconName | 'search' | 'arrow' | 'book' | 'pin' | 'weather', string> = {
  weather: 'M12 3v2 M5 6l1.5 1.5 M3 13h2 M19 6l-1.5 1.5 M10 17a5 5 0 1 1 7-7 M8 21h11a3 3 0 0 0 0-6 5 5 0 0 0-9-1 3.5 3.5 0 0 0-2 7z',
  cap: 'M2 8l10-5 10 5-10 5z M6 10v7q6 5 12 0v-7 M22 8v8',
  shield: 'M12 2l9 4v6c0 6-9 10-9 10S3 18 3 12V6z M8 12l3 3 5-6',
  plane: 'M22 2l-7 20-4-9-9-4z M11 13L22 2',
  journey: 'M5 5a2 2 0 1 0 0 .1 M19 19a2 2 0 1 0 0 .1 M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h8',
  home: 'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',
  wallet: 'M3 6h17v15H3z M3 6V3h14v3 M15 11h7v6h-7z M18 14h.1',
  briefcase: 'M3 7h18v14H3z M8 7V3h8v4 M3 12q9 5 18 0 M12 12v4',
  users: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 7 M22 21v-3a4 4 0 0 0-3-4',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M2 12h20 M12 2q-8 10 0 20 M12 2q8 10 0 20',
  car: 'M3 16V9l3-6h12l3 6v7z M3 9h18 M6 16v4 M18 16v4 M6 12h.1 M18 12h.1',
  heart: 'M20 4c-4-3-8 2-8 2S8 1 4 4c-7 6 8 17 8 17S27 10 20 4z',
  search: 'M21 21l-5-5 M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  book: 'M3 3h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v17h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3z M12 5v17',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0 M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
};
