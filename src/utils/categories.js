import {
  FiHome, FiShoppingCart, FiZap, FiFilm, FiHeart,
  FiBook, FiTruck, FiCoffee, FiGift, FiDollarSign,
  FiTrendingUp, FiCreditCard, FiWifi, FiPhone, FiMoreHorizontal, FiShield
} from 'react-icons/fi';

const CATEGORIES = {
  // Expenses
  groceries:      { label: 'Groceries',      icon: FiShoppingCart, color: '#4ade80', type: 'expense' },
  food:           { label: 'Food & Dining',  icon: FiCoffee,      color: '#fb923c', type: 'expense' },
  transport:      { label: 'Transport',      icon: FiTruck,       color: '#60a5fa', type: 'expense' },
  entertainment:  { label: 'Entertainment',  icon: FiFilm,        color: '#c084fc', type: 'expense' },
  shopping:       { label: 'Shopping',       icon: FiGift,        color: '#f472b6', type: 'expense' },
  health:         { label: 'Health',         icon: FiHeart,       color: '#f87171', type: 'expense' },
  education:      { label: 'Education',      icon: FiBook,        color: '#38bdf8', type: 'expense' },
  utilities:      { label: 'Utilities',      icon: FiZap,         color: '#fbbf24', type: 'expense' },
  rent:           { label: 'Rent',           icon: FiHome,        color: '#a78bfa', type: 'expense' },
  subscriptions:  { label: 'Subscriptions',  icon: FiWifi,        color: '#2dd4bf', type: 'expense' },
  phone:          { label: 'Phone & Internet', icon: FiPhone,     color: '#818cf8', type: 'expense' },
  other_expense:  { label: 'Other',          icon: FiMoreHorizontal, color: '#94a3b8', type: 'expense' },

  // Income
  salary:         { label: 'Salary',         icon: FiDollarSign,  color: '#4ade80', type: 'income' },
  freelance:      { label: 'Freelance',      icon: FiCreditCard,  color: '#38bdf8', type: 'income' },
  other_income:   { label: 'Other Income',   icon: FiMoreHorizontal, color: '#94a3b8', type: 'income' },

  // Savings
  savings_deposit: { label: 'Savings Deposit', icon: FiShield, color: '#10b981', type: 'savings' },
  investment_deposit: { label: 'Investment', icon: FiTrendingUp, color: '#fbbf24', type: 'savings' },
};

export default CATEGORIES;

export const EXPENSE_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'expense')
  .map(([key, v]) => ({ key, ...v }));

export const INCOME_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'income')
  .map(([key, v]) => ({ key, ...v }));

export const SAVINGS_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'savings')
  .map(([key, v]) => ({ key, ...v }));
