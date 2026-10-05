// Availability describes implemented destinations, never editorial verification.
type IconName = 'cap' | 'shield' | 'plane' | 'journey' | 'home' | 'wallet' | 'briefcase' | 'users' | 'globe' | 'car' | 'heart';
type Category = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
} & ({ status: 'available'; to: '/predeparture' | '/sources' | '/firstweek'; action: string } | { status: 'planned' });

export const categories: Category[] = [
  { id: 'predeparture', title: 'Prepare to travel', description: 'Keep track of documents, packing, money and your next steps.', icon: 'plane', status: 'available', to: '/predeparture', action: 'Open checklist' },
  { id: 'immigration', title: 'Immigration', description: 'Find official source links to check current guidance for your circumstances.', icon: 'shield', status: 'available', to: '/sources', action: 'View official sources' },
  { id: 'study', title: 'Study & courses', description: 'Course and campus discovery.', icon: 'cap', status: 'planned' },
  { id: 'arrival', title: 'Arrive & settle', description: 'Keep first-week planning steps separate from your travel preparation.', icon: 'journey', status: 'available', to: '/firstweek', action: 'Open first-week checklist' },
  { id: 'housing', title: 'Housing & flatting', description: 'Finding a place and understanding your responsibilities.', icon: 'home', status: 'planned' },
  { id: 'money', title: 'Money & budgeting', description: 'Tools for planning everyday and unexpected costs.', icon: 'wallet', status: 'planned' },
  { id: 'work', title: 'Work & careers', description: 'Resources for your job search and career preparation.', icon: 'briefcase', status: 'planned' },
  { id: 'community', title: 'Community', description: 'Places to find familiar faces and new connections.', icon: 'users', status: 'planned' },
  { id: 'nepal', title: 'Nepal services', description: 'Passport, document and official-contact resources.', icon: 'globe', status: 'planned' },
  { id: 'transport', title: 'Travel & transport', description: 'Getting around your new home.', icon: 'car', status: 'planned' },
  { id: 'support', title: 'Student support', description: 'Study, wellbeing and everyday support resources.', icon: 'heart', status: 'planned' },
  { id: 'education', title: 'Education system', description: 'An introduction to qualifications and levels.', icon: 'cap', status: 'planned' },
];

export const introductionTopics = ['About New Zealand', 'Culture & Māori culture', 'Weather & climate', 'Healthcare', 'Laws & everyday rules', 'Student life'];
export const cities = ['Auckland', 'Christchurch', 'Wellington', 'Hamilton', 'Dunedin'];

// Reuse the prototype's line icons without changing the preserved prototype.
export const iconPaths: Record<IconName | 'search' | 'arrow' | 'book' | 'pin', string> = {
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
