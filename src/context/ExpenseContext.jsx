import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { detectUserRegion, generateId, analyzeSpending, getExpensePeriods } from '../utils/helpers';

const ExpenseContext = createContext();
const STORAGE_KEY = 'spendwise_data';

// ── Load from localStorage ────────────────────────────────────────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        transactions: data.transactions || [],
        limits: data.limits || { daily: 0, weekly: 0, monthly: 0 },
        savingsGoal: data.savingsGoal || 0,
      };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return { transactions: [], limits: { daily: 0, weekly: 0, monthly: 0 }, savingsGoal: 0 };
}

function saveData(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions: state.transactions,
      limits: state.limits,
      savingsGoal: state.savingsGoal,
    }));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// ── Reducer ───────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const newTx = {
        id: generateId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      return { ...state, transactions: [newTx, ...state.transactions] };
    }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_LIMITS':
      return { ...state, limits: { ...state.limits, ...action.payload } };
    case 'RESET_LIMITS':
      return { ...state, limits: { daily: 0, weekly: 0, monthly: 0 } };
    case 'SET_SAVINGS_GOAL':
      return { ...state, savingsGoal: action.payload };
    case 'CLEAR_ALL':
      return { ...state, transactions: [] };
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────
export function ExpenseProvider({ children }) {
  const region = useMemo(() => detectUserRegion(), []);
  const initial = useMemo(() => loadData(), []);

  const [state, dispatch] = useReducer(reducer, initial);

  // Persist on every state change
  useEffect(() => {
    saveData(state);
  }, [state]);

  // Computed values
  const analysis = useMemo(() => analyzeSpending(state.transactions), [state.transactions]);
  const periods = useMemo(() => getExpensePeriods(state.transactions), [state.transactions]);

  const totalIncome = useMemo(() =>
    state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [state.transactions]
  );

  const totalExpenses = useMemo(() =>
    state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [state.transactions]
  );

  const savedAmount = useMemo(() =>
    state.transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0),
    [state.transactions]
  );

  const balance = totalIncome - totalExpenses - savedAmount;
  const savingsGoal = state.savingsGoal;
  const savingsProgress = savingsGoal > 0 ? Math.min(100, (savedAmount / savingsGoal) * 100) : 0;

  const value = {
    transactions: state.transactions,
    limits: state.limits,
    periods,
    savingsGoal,
    savedAmount,
    savingsProgress,
    region,
    analysis,
    totalIncome,
    totalExpenses,
    balance,
    dispatch,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider');
  return ctx;
}
