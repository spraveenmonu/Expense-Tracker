import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiTrash2, FiInbox } from 'react-icons/fi';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate, formatFullDate } from '../utils/helpers';
import CATEGORIES from '../utils/categories';

const txVariants = {
  initial: { opacity: 0, x: -20, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.25 } },
};

export default function TransactionList() {
  const { transactions, region, dispatch } = useExpense();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filter !== 'all') list = list.filter(t => t.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (CATEGORIES[t.category]?.label || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filter, search]);

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2>Transactions</h2>
        <p>All your income and expenses in one place</p>
      </div>

      <div className="transactions-header">
        <div className="tx-filters">
          {['all', 'expense', 'income'].map(f => (
            <button
              key={f}
              className={`tx-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'expense' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      <div className="tx-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="tx-list">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((tx) => {
              const cat = CATEGORIES[tx.category];
              const Icon = cat?.icon;
              return (
                <motion.div
                  key={tx.id}
                  className="tx-item"
                  variants={txVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {Icon && (
                    <div className="tx-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                      <Icon />
                    </div>
                  )}
                  <div className="tx-info">
                    <div className="tx-title">{tx.description}</div>
                    <div className="tx-meta">
                      <span>{cat?.label || tx.category}</span>
                      <span>•</span>
                      <span title={formatFullDate(tx.date)}>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <div className={`tx-amount ${tx.type}`}>
                    {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount, region)}
                  </div>
                  <button
                    className="tx-delete"
                    onClick={() => handleDelete(tx.id)}
                    title="Delete transaction"
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              className="tx-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="tx-empty-icon"><FiInbox /></div>
              <h4>{search ? 'No matches found' : 'No transactions yet'}</h4>
              <p>{search ? 'Try a different search term' : 'Click the + button to add your first transaction'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
