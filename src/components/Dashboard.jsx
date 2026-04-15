import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiTarget, FiAlertTriangle, FiInfo, FiCheckCircle, FiZap } from 'react-icons/fi';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, getLast7DaysData, getMonthlyData } from '../utils/helpers';
import CATEGORIES from '../utils/categories';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const INSIGHT_ICONS = {
  warning: FiAlertTriangle,
  danger: FiAlertTriangle,
  tip: FiZap,
  info: FiInfo,
  success: FiCheckCircle,
};

function CustomTooltip({ active, payload, label, region }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(18, 18, 26, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '12px 16px',
      backdropFilter: 'blur(10px)',
    }}>
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: '0.85rem', color: entry.color, fontWeight: 600 }}>
          {entry.name}: {formatCurrency(entry.value, region)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { transactions, totalIncome, totalExpenses, balance, savedAmount, savingsProgress, analysis, region } = useExpense();
  const [chartMode, setChartMode] = useState('week');

  const chartData = useMemo(() =>
    chartMode === 'week' ? getLast7DaysData(transactions) : getMonthlyData(transactions),
    [transactions, chartMode]
  );

  const categoryData = useMemo(() => {
    const entries = Object.entries(analysis.categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.map(([key, value]) => ({
      name: CATEGORIES[key]?.label || key,
      value,
      color: CATEGORIES[key]?.color || '#94a3b8',
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }, [analysis.categoryTotals]);

  const stats = [
    {
      label: 'Balance',
      value: formatCurrency(balance, region),
      icon: FiDollarSign,
      bg: 'var(--accent-primary-glow)',
      color: 'var(--accent-primary)',
      change: null,
    },
    {
      label: 'Income',
      value: formatCurrency(totalIncome, region),
      icon: FiTrendingUp,
      bg: 'var(--accent-green-dim)',
      color: 'var(--accent-green)',
      change: null,
    },
    {
      label: 'Expenses',
      value: formatCurrency(totalExpenses, region),
      icon: FiTrendingDown,
      bg: 'var(--accent-red-dim)',
      color: 'var(--accent-red)',
      change: analysis.percentChange !== 0 ? `${analysis.percentChange > 0 ? '+' : ''}${Math.round(analysis.percentChange)}% vs last month` : null,
      changeColor: analysis.percentChange > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
    },
    {
      label: 'Total Saved',
      value: formatCurrency(savedAmount, region),
      icon: FiCheckCircle,
      bg: 'var(--accent-blue-dim)',
      color: 'var(--accent-blue)',
      change: savingsProgress > 0 ? `${Math.round(savingsProgress)}% of goal` : null,
      changeColor: savingsProgress >= 100 ? 'var(--accent-green)' : 'var(--accent-primary)',
    },
  ];

  const allInsights = [...analysis.alerts, ...analysis.tips];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="page-header">
        <h2>Dashboard</h2>
        <p>Track your finances, spend smarter</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value" style={{ color: stat.color }}>{stat.value}</div>
            {stat.change && (
              <div className="stat-card-change" style={{ color: stat.changeColor }}>
                {stat.change}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Smart Insights */}
      {allInsights.length > 0 && (
        <motion.div variants={itemVariants} className="insights-section">
          <h3>
            <FiZap style={{ color: 'var(--accent-orange)' }} />
            Smart Insights
          </h3>
          <div className="insights-grid">
            <AnimatePresence>
              {allInsights.map((insight, i) => {
                const Icon = INSIGHT_ICONS[insight.type] || FiInfo;
                return (
                  <motion.div
                    key={i}
                    className={`insight-card ${insight.type}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="insight-icon">
                      <Icon />
                    </div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={itemVariants} className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Spending Overview</h3>
            <div className="chart-toggle">
              <button className={chartMode === 'week' ? 'active' : ''} onClick={() => setChartMode('week')}>7 Days</button>
              <button className={chartMode === 'month' ? 'active' : ''} onClick={() => setChartMode('month')}>6 Months</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={50} />
              <Tooltip content={<CustomTooltip region={region} />} />
              <Area type="monotone" dataKey="income" stroke="#4ade80" fill="url(#gradIncome)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#f87171" fill="url(#gradExpense)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>By Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <PieChart width={140} height={140}>
                  <Pie
                    data={categoryData}
                    cx={65}
                    cy={65}
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="category-list">
                {categoryData.map((cat, i) => (
                  <div key={i} className="category-row">
                    <div className="category-icon-sm" style={{ background: `${cat.color}20`, color: cat.color }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                    </div>
                    <div className="category-row-info">
                      <div className="category-row-top">
                        <span>{cat.name}</span>
                        <span>{cat.percent}%</span>
                      </div>
                      <div className="category-bar">
                        <div className="category-bar-fill" style={{ width: `${cat.percent}%`, background: cat.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No expense data yet
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
