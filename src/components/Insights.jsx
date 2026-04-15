import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiZap, FiShield, FiTrendingUp, FiTarget, FiHeart } from 'react-icons/fi';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';

const SMART_TIPS = [
  {
    icon: FiShield,
    title: 'Emergency Fund First',
    message: 'Before investing, build an emergency fund covering 3-6 months of expenses. Keep it in a easily accessible savings account.',
    color: '#60a5fa',
  },
  {
    icon: FiTrendingUp,
    title: 'Invest in Index Funds',
    message: 'If you have surplus cash, consider low-cost index funds or SIPs for long-term wealth building. Start small, stay consistent.',
    color: '#4ade80',
  },
  {
    icon: FiTarget,
    title: '50/30/20 Rule',
    message: 'Allocate 50% of income to needs (rent, groceries), 30% to wants (entertainment), and 20% to savings & investments.',
    color: '#8b5cf6',
  },
  {
    icon: FiHeart,
    title: 'Health Insurance',
    message: 'Prioritize health insurance to protect against unexpected medical costs. It\'s one of the smartest financial decisions.',
    color: '#f87171',
  },
  {
    icon: FiZap,
    title: 'Cancel Unused Subscriptions',
    message: 'Review your monthly subscriptions. Cancel what you haven\'t used in the last 30 days — small leaks sink big ships.',
    color: '#fb923c',
  },
  {
    icon: FiTarget,
    title: 'Set Specific Goals',
    message: 'Having clear financial goals (vacation, gadget, house) makes saving easier. Set a budget above and track your progress!',
    color: '#2dd4bf',
  },
];

const INSIGHT_ICONS = {
  warning: FiAlertTriangle,
  danger: FiAlertTriangle,
  tip: FiZap,
  info: FiInfo,
  success: FiCheckCircle,
};

export default function Insights() {
  const { analysis, region, totalExpenses, totalIncome, budget } = useExpense();
  const allInsights = [...analysis.alerts, ...analysis.tips];

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  const budgetUsed = budget > 0 ? Math.min(100, (totalExpenses / budget) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2>Smart Insights</h2>
        <p>AI-powered recommendations to optimize your spending</p>
      </div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--gradient-hero)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Financial Health Score
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          fontWeight: 800,
          background: savingsRate >= 20
            ? 'linear-gradient(135deg, #4ade80, #22c55e)'
            : savingsRate >= 10
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : 'linear-gradient(135deg, #f87171, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 4,
        }}>
          {totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(savingsRate + 50))) : '—'}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {totalIncome > 0 ? (
            savingsRate >= 20 ? '🎉 Excellent! You\'re saving well!'
              : savingsRate >= 10 ? '👍 Good, but there\'s room to improve'
                : savingsRate >= 0 ? '⚠️ Try to save at least 20% of income'
                  : '🚨 You\'re spending more than you earn!'
          ) : 'Add income to see your score'}
        </div>

        {totalIncome > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 20 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Savings Rate</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: savingsRate >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {Math.round(savingsRate)}%
              </div>
            </div>
            {budget > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Used</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: budgetUsed > 90 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {Math.round(budgetUsed)}%
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net This Month</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: totalIncome - totalExpenses >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(totalIncome - totalExpenses, region)}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Alerts */}
      {allInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 28 }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAlertTriangle style={{ color: 'var(--accent-orange)' }} />
            Your Alerts
          </h3>
          <div className="insights-grid">
            <AnimatePresence>
              {allInsights.map((insight, i) => {
                const Icon = INSIGHT_ICONS[insight.type] || FiInfo;
                return (
                  <motion.div
                    key={i}
                    className={`insight-card ${insight.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="insight-icon"><Icon /></div>
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

      {/* Smart Money Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiZap style={{ color: 'var(--accent-primary)' }} />
          Where to Use Your Money
        </h3>
        <div className="insights-grid">
          {SMART_TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={i}
                className="insight-card tip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{ borderColor: `${tip.color}25` }}
              >
                <div className="insight-icon" style={{ background: `${tip.color}15`, color: tip.color }}>
                  <Icon />
                </div>
                <div className="insight-content">
                  <h4>{tip.title}</h4>
                  <p>{tip.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
