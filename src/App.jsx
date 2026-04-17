import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiGrid, FiList, FiZap, FiPlus, FiMenu, FiX, FiDollarSign, FiSun, FiMoon
} from 'react-icons/fi';
import { ExpenseProvider } from './context/ExpenseContext';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Insights from './components/Insights';
import AddTransaction from './components/AddTransaction';
import Toast from './components/Toast';

import './App.css';

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const [showAddTx, setShowAddTx] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState('brutal');



  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            className="sidebar-link" 
            onClick={() => setTheme(theme === 'brutal' ? 'glass' : 'brutal')}
            style={{ justifyContent: 'center', padding: '12px', fontSize: '1.25rem', width: '48px', height: '48px', margin: '0 auto', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
            title={theme === 'brutal' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                {theme === 'brutal' ? <FiMoon /> : <FiSun />}
              </motion.div>
            </AnimatePresence>
          </button>
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
