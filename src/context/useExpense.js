import { useContext } from 'react';
import { ExpenseContext } from './ExpenseContextCore';

export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider');
  return ctx;
}
