import { expect, it } from 'vitest';
import { calculateBudget, displayAmount, emptyBudget, parseAmount } from './domain';

it('calculates recurring totals and income balance without inventing defaults',()=>{
  expect(calculateBudget(emptyBudget())).toEqual({weekly:0,monthly:0,annual:0,balance:0});
  const budget=emptyBudget();budget.Rent={amount:'520',period:'Monthly'};budget.Groceries={amount:'50',period:'Weekly'};
  budget['Take-home income']={amount:'100',period:'Weekly'};
  expect(calculateBudget(budget)).toEqual({weekly:170,monthly:170*52/12,annual:8840,balance:-70});
});
it('rejects negative, non-finite, malformed, excessive and over-precision values',()=>{
  for(const value of ['-1','Infinity','NaN','1e6','1,000','1000001','1.001','0x10'])expect(()=>parseAmount(value)).toThrow();
  expect(parseAmount('')).toBe(0);expect(parseAmount('1000000')).toBe(1000000);expect(parseAmount('0.01')).toBe(.01);
});
it('period displays never mutate the original precision',()=>{
  const entry={amount:'10.01',period:'Weekly' as const};
  for(let i=0;i<100;i++)expect(displayAmount(entry,'Monthly')).toBe('43.38');
  expect(displayAmount(entry,'Weekly')).toBe('10.01');
  expect(displayAmount({amount:'bad',period:'Monthly'},'Weekly')).toBe('bad');
});
