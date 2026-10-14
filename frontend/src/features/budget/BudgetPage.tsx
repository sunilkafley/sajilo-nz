import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { budgetFields, calculateBudget, displayAmount, emptyBudget, parseAmount, type Period } from './domain';
import { withLanguage } from '../explore/topicConfig';
import './budget.css';

const money=(value:number)=>new Intl.NumberFormat('en-NZ',{style:'currency',currency:'NZD'}).format(value);
export function BudgetPage() {
  const [budget,setBudget]=useState(emptyBudget);
  const [period,setPeriod]=useState<Period>('Weekly');
  const [resetting,setResetting]=useState(false);
  const [params]=useSearchParams();
  const language=params.get('lang')==='ne'?'ne':'en';
  const link=(path:string)=>withLanguage(path,language);
  const errors=new Map<string,string>();
  for(const field of budgetFields)try{parseAmount(budget[field].amount);}catch(error){errors.set(field,(error as Error).message);}
  const totals=errors.size?null:calculateBudget(budget);
  return <section className="budget-page"><p className="eyebrow">Money / Budget planner</p><h1>Make room for your new life.</h1>
    <p>A plan starts with your own numbers. All amounts are NZD. Blank fields count as zero, not estimated living costs.</p>
    <p className="notice">Figures are not saved or sent to our server. Leaving this page or refreshing clears them. This is an arithmetic planning tool, not financial advice.</p>
    <div className="budget-layout"><section className="card"><h2>Your recurring expenses</h2>
      <label>Input period <select value={period} onChange={event=>setPeriod(event.target.value as Period)}><option>Weekly</option><option>Monthly</option></select></label>
      <p>Changing period converts the display without changing your original figures. Rounded displays use two decimal places.</p>
      {budgetFields.map((field,index)=><div className="budget-field" key={field}><label htmlFor={'budget-'+index}>{field} ({period.toLowerCase()} NZD){field==='Take-home income'?' — optional':''}</label>
        <input id={'budget-'+index} type="text" inputMode="decimal" maxLength={20} value={displayAmount(budget[field],period)} aria-invalid={errors.has(field)} aria-describedby={errors.has(field)?'budget-error-'+index:undefined}
          onChange={event=>setBudget({...budget,[field]:{amount:event.target.value,period}})}/>
        {errors.has(field) && <p id={'budget-error-'+index} className="notice warning">{errors.get(field)}</p>}</div>)}
      <button onClick={()=>setResetting(true)}>Clear figures</button>
      {resetting && <div className="notice" role="group" aria-label="Confirm clear figures"><p>Clear all figures in this budget? Your checklist progress will not change.</p><button onClick={()=>{setBudget(emptyBudget());setResetting(false);}}>Confirm clear</button> <button onClick={()=>setResetting(false)}>Keep figures</button></div>}
    </section><aside className="card budget-summary" aria-label="Budget summary"><h2>Your plan at a glance</h2>
      <div aria-live="polite" aria-atomic="true">{totals?<dl>{[['Weekly expenses',totals.weekly],['Monthly expenses',totals.monthly],['Annual recurring expenses',totals.annual],['Weekly income minus expenses',totals.balance]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{money(Number(value))}</dd></div>)}</dl>:<p>Correct the highlighted amounts to calculate your budget.</p>}</div>
      <p>Monthly = weekly × 52 ÷ 12. Annual = weekly × 52. A negative balance means entered expenses exceed entered income.</p>
      <p>One-off costs such as flights, bond, tuition and visa fees are not included. No income, work rights or affordability is assumed.</p>
      <nav aria-label="Budget resources"><p><Link to={link('/explore/money')}>Money guidance</Link></p><p><Link to={link('/explore/housing')}>Housing information</Link></p><p><Link to={link('/predeparture?task=budget')}>Budget planning task in Journey</Link></p></nav>
    </aside></div></section>;
}
