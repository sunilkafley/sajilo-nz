import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { BudgetPage } from './BudgetPage';

it('validates inputs, confirms reset and never writes browser storage',async()=>{
  const spy=vi.spyOn(Storage.prototype,'setItem');
  render(<MemoryRouter><BudgetPage/></MemoryRouter>);
  const input=screen.getByLabelText('Rent (weekly NZD)');
  await userEvent.type(input,'-1');expect(input).toHaveAttribute('aria-invalid','true');
  expect(screen.getByText('Correct the highlighted amounts to calculate your budget.')).toBeInTheDocument();
  await userEvent.clear(input);await userEvent.type(input,'120');
  await userEvent.selectOptions(screen.getByLabelText('Input period'),'Monthly');
  expect(screen.getByLabelText('Rent (monthly NZD)')).toHaveValue('520.00');
  await userEvent.click(screen.getByRole('button',{name:'Clear figures'}));
  await userEvent.click(screen.getByRole('button',{name:'Keep figures'}));
  expect(screen.getByLabelText('Rent (monthly NZD)')).toHaveValue('520.00');
  await userEvent.click(screen.getByRole('button',{name:'Clear figures'}));
  await userEvent.click(screen.getByRole('button',{name:'Confirm clear'}));
  expect(screen.getByLabelText('Rent (monthly NZD)')).toHaveValue('');
  expect(spy).not.toHaveBeenCalled();spy.mockRestore();
});
