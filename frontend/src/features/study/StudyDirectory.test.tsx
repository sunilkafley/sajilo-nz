import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { groupProviders, nzqaQualifications, type Provider } from './directory';
import { providers } from './providers';
import { StudyDirectory } from './StudyDirectory';

it('groups alphabetically and combines location, type and international filters',()=>{
  const sample:Provider[]=[
    {id:'1',name:'Zulu',registeredName:'Zulu',type:'University',city:'Wellington',locations:['Whangārei'],website:'',nzqa:'',codeSignatory:true},
    {id:'2',name:'Beta',registeredName:'Beta',type:'University',city:'Auckland',locations:[],website:'',nzqa:'',codeSignatory:true},
    {id:'3',name:'Alpha',registeredName:'Alpha',type:'College',city:'Auckland',locations:[],website:'',nzqa:'',codeSignatory:false},
  ];
  expect(groupProviders(sample).map(g=>[g.city,...g.providers.map(p=>p.name)])).toEqual([['Auckland','Alpha','Beta'],['Wellington','Zulu']]);
  expect(groupProviders(sample,'whangarei','','University',true)[0].providers[0].id).toBe('1');
  expect(groupProviders(sample,'','Auckland','',true)[0].providers.map(p=>p.id)).toEqual(['2']);
  expect(groupProviders(sample,'unknown')).toEqual([]);
});
it('keeps unique source records, all eight universities and safe source links',()=>{
  expect(new Set(providers.map(p=>p.id)).size).toBe(providers.length);
  expect(providers.filter(p=>p.type==='University')).toHaveLength(8);
  for(const p of providers) {
    expect(new URL(p.nzqa).hostname).toBe('www.nzqa.govt.nz');
    expect(new URL(p.nzqa).searchParams.get('providerId')).toBe(p.id);
    if(p.website) expect(['http:','https:']).toContain(new URL(p.website).protocol);
    expect(p.city).not.toMatch(/\d{4}|PO Box|Private Bag/);
  }
});
it('shows sourced counts, filters institutions, and preserves the exact NZQA link',async()=>{
  render(<StudyDirectory/>);
  expect(screen.getByRole('link',{name:'View NZQA'})).toHaveAttribute('href',nzqaQualifications);
  await userEvent.selectOptions(screen.getByLabelText('Head-office city'),'Christchurch');
  await userEvent.selectOptions(screen.getByLabelText('Institution type'),'University');
  expect(screen.getByRole('status')).toHaveTextContent('1 provider records in 1 city groups');
  expect(screen.getByRole('heading',{name:'University of Canterbury'})).toBeVisible();
  const institutions=screen.getByRole('heading',{name:'Institutions by city · A–Z'}).closest('section')!;
  expect(within(institutions).queryByRole('heading',{name:'University of Auckland'})).toBeNull();
  await userEvent.type(screen.getByLabelText('Search institution or location'),'no-such-institution');
  expect(screen.getByText(/No institutions match/)).toBeVisible();
  await userEvent.click(screen.getByRole('button',{name:'Clear filters'}));
  expect(screen.getByRole('status')).toHaveTextContent(`${providers.length} provider records`);
});
