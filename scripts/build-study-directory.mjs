import fs from 'node:fs';

// Input is collected from NZQA; only public organisation facts reach the client.
const source = JSON.parse(fs.readFileSync('docs/study-register-data.json', 'utf8').replace(/^\uFEFF/, ''));
const aliases = {
  '601290001': 'NorthTec (NZIST)', '601702001': 'Western Institute of Technology at Taranaki — WITT (NZIST)',
  '601420001': 'Whitireia & WelTec (NZIST)', '602432001': 'Tai Poutini Polytechnic (NZIST)',
  '604421001': 'NZIST work-based learning record', '668369001': 'New Zealand Institute of Skills and Technology (NZIST)',
};
const cityOverrides = {
  '700642001':'Lincoln', '668369001':'Hamilton', '742892001':'Rangiora', '441626001':'Ōpunake',
  '876922001':'Awanui', '2060409001':'Kaitaia', '809101001':'New Plymouth',
  '801866001':'Overseas — Rarotonga', '2059976001':'Overseas — Victoria',
};
const cityAliases = {
  'auckland cbd':'Auckland', 'auckland city':'Auckland', 'manukau':'Auckland', 'manukau city':'Auckland',
  'north harbour':'Auckland', 'north harbour auckland':'Auckland', 'north shore city':'Auckland',
  'waitakere':'Auckland', 'whangaparaoa':'Auckland', 'pukekohe':'Auckland',
  'hamilton east':'Hamilton', 'wellington south':'Wellington',
  'mount maunganui':'Tauranga', 'mount maunganui south':'Tauranga', 'mt maunganui':'Tauranga',
  'whangarei':'Whangārei', 'whakatane':'Whakatāne', 'otaki':'Ōtaki', 'opotiki':'Ōpōtiki',
  'taupo':'Taupō', 'wanaka':'Wānaka', 'turangi':'Tūrangi',
};
function cityOf(p) {
  if (cityOverrides[p.id]) return cityOverrides[p.id];
  const last = p.address.filter(line=>!/^\d+$/.test(line)).at(-1)?.replace(/\s+\d{4}$/, '').trim();
  if (!last || last==='(Refer notes)') return 'Head-office city not listed';
  return cityAliases[last.toLowerCase()] || last.toLowerCase().replace(/(^|\s)\S/g, c=>c.toUpperCase());
}
const providers = source.providers.map(p=>({
  id:p.id, name:aliases[p.id] || p.name, registeredName:p.name, type:p.type,
  city:cityOf(p), locations:p.locations.sort((a,b)=>a.localeCompare(b,'en-NZ')),
  website:p.website, nzqa:p.nzqa, codeSignatory:p.codeSignatory,
})).sort((a,b)=>a.city.localeCompare(b.city,'en-NZ') || a.name.localeCompare(b.name,'en-NZ'));
if(new Set(providers.map(p=>p.id)).size!==providers.length) throw new Error('Duplicate provider IDs');
fs.mkdirSync('frontend/src/features/study',{recursive:true});
fs.writeFileSync('frontend/src/features/study/providers.ts', '// Generated from NZQA public provider records. See docs/study-directory-sources.md.\nimport type { Provider } from "./directory";\nexport const snapshotDate = '+JSON.stringify(source.retrievedOn)+';\nexport const providers: Provider[] = '+JSON.stringify(providers,null,2)+';\n');
console.log(JSON.stringify({records:providers.length,codeSignatory:providers.filter(p=>p.codeSignatory).length,websites:providers.filter(p=>p.website).length,cities:new Set(providers.map(p=>p.city)).size}));
