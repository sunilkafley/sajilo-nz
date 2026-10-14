export const expenseFields = ['Rent','Groceries','Transport','Utilities','Phone and internet','Other recurring costs'] as const;
export const budgetFields = [...expenseFields, 'Take-home income'] as const;
export type Field = typeof budgetFields[number];
export type Period = 'Weekly' | 'Monthly';
export type Entry = { amount: string; period: Period };
export type Budget = Record<Field, Entry>;
export const emptyBudget = ():Budget => Object.fromEntries(budgetFields.map(field=>[field,{amount:'',period:'Weekly'}])) as Budget;
export function parseAmount(value:string):number {
  if(!value.trim())return 0;
  if(!/^\d+(\.\d{1,2})?$/.test(value) || Number(value)>1000000)throw new Error('Enter an amount from 0 to 1,000,000 with up to two decimal places.');
  return Number(value);
}
export const weekly = (entry:Entry) => parseAmount(entry.amount) * (entry.period==='Monthly'?12/52:1);
export function displayAmount(entry:Entry, period:Period):string {
  if(entry.amount==='' || entry.period===period)return entry.amount;
  try{return (weekly(entry)*(period==='Monthly'?52/12:1)).toFixed(2);}catch{return entry.amount;}
}
export function calculateBudget(budget:Budget) {
  const expenses=expenseFields.reduce((total,field)=>total+weekly(budget[field]),0);
  const income=weekly(budget['Take-home income']);
  return {weekly:expenses,monthly:expenses*52/12,annual:expenses*52,balance:income-expenses};
}
