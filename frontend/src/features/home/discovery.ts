import type { iconPaths } from '../explore/catalog';

// These are navigation/resource labels, not reviewed guidance or live catalogues.
type DiscoveryCard = {
  title: string; description: string; icon: keyof typeof iconPaths; availability: string;
  links: readonly { label: string; to: string; external?: boolean }[];
};
export const discoveryCards: readonly DiscoveryCard[] = [
  { title: 'Study & Courses', description: 'Courses, institutions, fees and qualifications.', icon: 'cap', availability: 'Planned', links: [] },
  { title: 'Work & Careers', description: 'Job search, CVs, interviews and employment rights.', icon: 'briefcase', availability: 'Planned', links: [] },
  { title: 'Residence Pathways', description: 'Official information and links to licensed advice.', icon: 'shield', availability: 'Official links only', links: [
    { label: 'Immigration New Zealand (online)', to: 'https://www.immigration.govt.nz/', external: true },
    { label: 'Immigration Advisers Authority (online)', to: 'https://www.iaa.govt.nz/for-migrants/', external: true },
  ] },
  { title: 'Skills Roadmap', description: 'Skills to learn and progress tracking.', icon: 'book', availability: 'Planned', links: [] },
  { title: 'Life in New Zealand', description: 'Housing, transport, healthcare and community.', icon: 'home', availability: 'City preparation only · wider hub planned', links: [{ label: 'Christchurch preparation', to: '/cities/christchurch' }] },
  { title: 'Preparing to Arrive', description: 'Documents, packing, airports and first-week essentials.', icon: 'plane', availability: 'Planning checklists · not yet reviewed', links: [
    { label: 'Pre-departure planning', to: '/predeparture' }, { label: 'First-week planning', to: '/firstweek' },
  ] },
];
export const emergencyResource = { label: 'NZ Police emergency information (online)', url: 'https://www.police.govt.nz/contact-us/111-police-emergency' };
