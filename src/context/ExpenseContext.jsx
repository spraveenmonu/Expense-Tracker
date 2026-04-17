import { useReducer, useEffect, useMemo, useState } from 'react';
import { detectUserRegion, generateId, analyzeSpending, getExpensePeriods } from '../utils/helpers';
import { openDB } from 'idb';

import { ExpenseContext } from './ExpenseContextCore';
const DB_NAME = 'SpendWiseDB';
const STORE_NAME = 'appData';

async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return db;
}

// ── Load from IndexedDB (with LocalStorage fallback for migration) ──
async function loadData() {
  try {
    const db = await initDB();
    const data = await db.get(STORE_NAME, 'state');
    
    if (data) {
      return {
        transactions: data.transactions || [],
        limits: data.limits || { daily: 0, weekly: 0, monthly: 0 },
        savingsGoal: data.savingsGoal || 0,
      };
    } else {
      // MIGRATION: Check localStorage and migrate directly
      const raw = localStorage.getItem('spendwise_data');
      if (raw) {
        const legacyData = JSON.parse(raw);
        const migratedState = {
          transactions: legacyData.transactions || [],
          limits: legacyData.limits || { daily: 0, weekly: 0, monthly: 0 },
          savingsGoal: legacyData.savingsGoal || 0,
        };
        await db.put(STORE_NAME, migratedState, 'state');
        localStorage.removeItem('spendwise_data');
        return migratedState;
      }
    }
  } catch (e) {
    console.error('Failed to load from IndexedDB:', e);
  }
  return { transactions: [], limits: { daily: 0, weekly: 0, monthly: 0 }, savingsGoal: 0 };
}

async function saveData(state) {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, {
      transactions: state.transactions,
      limits: state.limits,
      savingsGoal: state.savingsGoal,
    }, 'state');
  } catch (e) {
    console.error('Failed to save to IndexedDB:', e);
  }
}

// ── Reducer ───────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
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
  const [isLoaded, setIsLoaded] = useState(false);

  const [state, dispatch] = useReducer(reducer, { transactions: [], limits: { daily: 0, weekly: 0, monthly: 0 }, savingsGoal: 0 });

  // Initial Data Fetch
  useEffect(() => {
    loadData().then(initialState => {
      dispatch({ type: 'HYDRATE', payload: initialState });
      setIsLoaded(true);
    });
  }, []);

  // Persist on every state change, but ONLY after hydration
  useEffect(() => {
    if (isLoaded) {
      saveData(state);
    }
  }, [state, isLoaded]);



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

  if (!isLoaded) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Database...</div>;
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}


