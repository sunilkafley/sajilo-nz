// IDs are explicit and stable; labels may change without losing saved progress.
const groups = [
  ['Documents', [
    ['passport', 'Passport'], ['visa', 'Visa/eVisa'], ['offer', 'Offer of place'],
    ['academic', 'Academic documents'], ['insurance', 'Insurance'], ['accommodation', 'Accommodation confirmation'],
    ['flight', 'Flight itinerary'], ['emergency-contacts', 'Emergency contacts'],
  ]],
  ['Packing', [
    ['clothing', 'Clothing'], ['laptop', 'Laptop'], ['chargers', 'Chargers'],
    ['medication', 'Medication'], ['document-copies', 'Important document copies'], ['personal', 'Personal items'],
  ]],
  ['Money', [
    ['cash', 'NZD'], ['cards', 'Bank cards'], ['emergency-money', 'Emergency money'], ['budget', 'First-month budget'],
  ]],
  ['Before leaving Nepal', [
    ['passport-validity', 'Passport validity'], ['visa-conditions', 'Check visa conditions'],
    ['confirm-accommodation', 'Confirm accommodation'], ['airport-transport', 'Airport transport'],
    ['baggage', 'Baggage allowance'], ['transit', 'Transit requirements'], ['contacts', 'Important contacts'],
    ['biosecurity', 'Review biosecurity rules'], ['declaration', 'Traveller declaration'],
  ]],
] as const;
export const tasks = groups.flatMap(([group, entries]) => entries.map(([id, label]) => ({ id, label, group, legacyKey: `${group}:${label}` })));
export const groupNames = groups.map(([name]) => name);
export const sources = [
  { title: 'Immigration New Zealand', url: 'https://www.immigration.govt.nz/' },
  { title: 'Ministry for Primary Industries', url: 'https://www.mpi.govt.nz/' },
  { title: 'New Zealand Traveller Declaration', url: 'https://www.travellerdeclaration.govt.nz/' },
];
