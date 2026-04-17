import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowDown, FiArrowUp, FiTerminal, FiAlertOctagon, FiShield, FiTarget } from 'react-icons/fi';
import { useExpense } from '../context/useExpense';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVINGS_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/helpers';

export default function AddTransaction({ onClose, onToast }) {
  const { dispatch, limits, periods, savingsGoal, balance, region } = useExpense();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [limitWarning, setLimitWarning] = useState(null);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : type === 'savings' ? SAVINGS_CATEGORIES : INCOME_CATEGORIES;

  const selectedCat = categories.find(c => c.key === category);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'goals') return; // Goals are saved onChange

    if (!amount || !category) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (type === 'expense') {
      let limitMsg = null;
      if (balance < numAmount) {
        limitMsg = `Insufficient funds! This expense is greater than your total balance of ${formatCurrency(balance, region)}.`;
      } else if (limits.daily > 0 && periods.daily + numAmount > limits.daily) {
        limitMsg = `This expense exceeds your daily limit of ${formatCurrency(limits.daily, region)}.`;
      } else if (limits.weekly > 0 && periods.weekly + numAmount > limits.weekly) {
        limitMsg = `This expense exceeds your weekly limit of ${formatCurrency(limits.weekly, region)}.`;
      } else if (limits.monthly > 0 && periods.monthly + numAmount > limits.monthly) {
        limitMsg = `This expense exceeds your monthly limit of ${formatCurrency(limits.monthly, region)}.`;
      } else if (savingsGoal > 0 && balance - numAmount < savingsGoal) {
        limitMsg = `This expense drops your balance below your savings goal of ${formatCurrency(savingsGoal, region)}.`;
      }

      if (limitMsg) {
        setLimitWarning(limitMsg);
        return;
      }
    }

    finalizeSubmit(numAmount);
  };

  const finalizeSubmit = (numAmount) => {
    let label = selectedCat?.label ?? category;
    if ((category === 'other_expense' || category === 'other_income') && description.trim()) {
      label = description.trim();
    }

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        type,
        amount: numAmount,
        description: label,
        category,
        date,
      },
    });

    onToast?.({
      type: type === 'savings' ? 'info' : type === 'expense' ? 'warning' : 'success',
      title: type === 'savings' ? 'Savings Logged' : type === 'expense' ? 'Expense Added' : 'Income Added',
      message: `${label} — ${type === 'expense' ? '−' : '+'}₹${numAmount.toFixed(2)}`,
    });

    onClose();
  };

  const isOther = category === 'other_expense' || category === 'other_income';
  const isDescriptionValid = !isOther || (isOther && description.trim() !== '');
  const isValid = amount && category && parseFloat(amount) > 0 && isDescriptionValid;


  return (
    <AnimatePresence>
      <motion.div
        className="add-tx-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="add-tx-modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="add-tx-header">
            <h3>Add Transaction</h3>
            <button className="add-tx-close" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {limitWarning ? (
              <motion.div
                key="warning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                <div style={{ fontSize: '3rem', color: 'var(--accent-red)', marginBottom: '16px' }}>
                  <FiAlertOctagon />
                </div>
                <h3 style={{ marginBottom: '12px', color: 'var(--accent-red)' }}>Limit Exceeded</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  {limitWarning}<br/><br/>
                  <strong>Please make other arrangements or adjust your goals to proceed.</strong>
                </p>
                <button
                  type="button"
                  className="form-submit"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', boxShadow: 'none' }}
                  onClick={() => setLimitWarning(null)}
                >
                  Got It
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
              >
                {/* Type Toggle */}
            <div className="form-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
                  onClick={() => { setType('expense'); setCategory(''); setDescription(''); }}
                >
                  <FiArrowDown /> Expense
                </button>
                <button
                  type="button"
                  className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
                  onClick={() => { setType('income'); setCategory(''); setDescription(''); }}
                >
                  <FiArrowUp /> Income
                </button>
                <button
                  type="button"
                  className={`type-btn ${type === 'savings' ? 'active-savings' : ''}`}
                  onClick={() => { setType('savings'); setCategory(''); setDescription(''); }}
                >
                  <FiShield /> Savings
                </button>
                <button
                  type="button"
                  className={`type-btn ${type === 'goals' ? 'active-goals' : ''}`}
                  onClick={() => { setType('goals'); setCategory(''); setDescription(''); }}
                >
                  <FiTarget /> Goals
                </button>
            </div>

            {type === 'goals' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="goals-form-section"
              >
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Savings Goal ({region.code})</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={savingsGoal || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (val >= 0 || e.target.value === '') {
                        dispatch({ type: 'SET_SAVINGS_GOAL', payload: val || 0 });
                      }
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Daily Limit ({region.code})</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 50"
                    value={limits.daily || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (val >= 0 || e.target.value === '') {
                        dispatch({ type: 'SET_LIMITS', payload: { daily: val || 0 } });
                      }
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Weekly Limit ({region.code})</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 350"
                    value={limits.weekly || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (val >= 0 || e.target.value === '') {
                        dispatch({ type: 'SET_LIMITS', payload: { weekly: val || 0 } });
                      }
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>Monthly Limit ({region.code})</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1500"
                    value={limits.monthly || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (val >= 0 || e.target.value === '') {
                        dispatch({ type: 'SET_LIMITS', payload: { monthly: val || 0 } });
                      }
                    }}
                    min="0"
                  />
                </div>
                <motion.button
                  type="button"
                  className="form-submit"
                  onClick={() => {
                    onToast?.({ type: 'success', title: 'Goals Saved', message: 'Your financial goals and limits have been updated.' });
                    onClose();
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Goals & Limits
                </motion.button>
              </motion.div>
            ) : (
              <>

            {/* Amount */}
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) {
                    setAmount(val);
                  }
                }}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>



            {/* Date */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            {/* Category Grid */}
            <div className="form-group">
              <label>Category</label>
              <div className="category-grid">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.key}
                      type="button"
                      className={`category-chip ${category === cat.key ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.key)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon style={{ color: cat.color }} />
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Description (Only for Other) */}
            <AnimatePresence>
              {(category === 'other_expense' || category === 'other_income') && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }}
                  className="form-group"
                >
                  <label>Description (Required)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="What was this for?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              className="form-submit"
              disabled={!isValid}
              whileTap={{ scale: 0.98 }}
            >
              {type === 'expense' ? 'Add Expense' : type === 'income' ? 'Add Income' : 'Deposit Savings'}
            </motion.button>
              </>
            )}
            </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
