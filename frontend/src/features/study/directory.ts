export type Provider = {
  id:string; name:string; registeredName:string; type:string; city:string;
  locations:string[]; website:string; nzqa:string; codeSignatory:boolean;
};
export const nzqaQualifications='https://www.nzqa.govt.nz/nzqf/search/results.do?q=&area=All&searchSubject=All&type=&lvl=&credit=&status=Current';
const normalise=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export function groupProviders(providers:Provider[], query='', city='', type='', internationalOnly=false) {
  const matches=providers.filter(p=>(!city || p.city===city) && (!type || p.type===type)
    && (!internationalOnly || p.codeSignatory)
    && normalise([p.name,p.registeredName,p.city,...p.locations].join(' ')).includes(normalise(query.trim())));
  const groups=new Map<string,Provider[]>();
  for(const provider of matches) groups.set(provider.city,[...(groups.get(provider.city)||[]),provider]);
  return [...groups].sort(([a],[b])=>a.localeCompare(b,'en-NZ')).map(([city,items])=>({city,providers:items.sort((a,b)=>a.name.localeCompare(b.name,'en-NZ'))}));
}
