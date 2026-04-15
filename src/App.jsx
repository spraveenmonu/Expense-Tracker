import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiGrid, FiList, FiZap, FiPlus, FiMenu, FiX, FiDollarSign, FiTarget
} from 'react-icons/fi';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Insights from './components/Insights';
import AddTransaction from './components/AddTransaction';
import Toast from './components/Toast';
import { formatCurrency } from './utils/helpers';
import './App.css';

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const [showAddTx, setShowAddTx] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { dispatch, region } = useExpense();

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);


  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'transactions', label: 'Transactions', icon: FiList },
    { id: 'insights', label: 'Insights', icon: FiZap },
  ];

  return (
    <div className="app">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
          SpendWise
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setShowAddTx(true)}
        >
          <FiPlus />
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <FiDollarSign />
          </div>
          <div>
            <h1>SpendWise</h1>
            <span>Smart Finance Tracker</span>
          </div>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {page === 'dashboard' && <Dashboard key="dashboard" />}
          {page === 'transactions' && <TransactionList key="transactions" />}
          {page === 'insights' && <Insights key="insights" />}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <motion.button
        className="fab"
        onClick={() => setShowAddTx(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
      >
        <FiPlus />
      </motion.button>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTx && (
          <AddTransaction
            onClose={() => setShowAddTx(false)}
            onToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
