// ── Currency & Region Helpers ──────────────────────────────────────────

const REGION_CURRENCY_MAP = {
  'IN': { code: 'INR', symbol: '₹', locale: 'en-IN' },
  'US': { code: 'USD', symbol: '$', locale: 'en-US' },
  'GB': { code: 'GBP', symbol: '£', locale: 'en-GB' },
  'EU': { code: 'EUR', symbol: '€', locale: 'de-DE' },
  'JP': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  'AU': { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  'CA': { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  'AE': { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  'CN': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  'KR': { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  'BR': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  'MX': { code: 'MXN', symbol: 'MX$', locale: 'es-MX' },
  'ZA': { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  'RU': { code: 'RUB', symbol: '₽', locale: 'ru-RU' },
  'SG': { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
};

export function detectUserRegion() {
  try {
    const saved = localStorage.getItem('spendwise_region');
    if (saved) return JSON.parse(saved);

    const lang = navigator.language || navigator.languages?.[0] || 'en-US';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // Detect from timezone
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return REGION_CURRENCY_MAP['IN'];
    if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Denver')) return REGION_CURRENCY_MAP['US'];
    if (tz.startsWith('Europe/London')) return REGION_CURRENCY_MAP['GB'];
    if (tz.startsWith('Europe/Berlin') || tz.startsWith('Europe/Paris') || tz.startsWith('Europe/Rome')) return REGION_CURRENCY_MAP['EU'];
    if (tz.startsWith('Asia/Tokyo')) return REGION_CURRENCY_MAP['JP'];
    if (tz.startsWith('Australia')) return REGION_CURRENCY_MAP['AU'];

    // Fallback to locale
    const countryCode = lang.split('-')[1]?.toUpperCase();
    if (countryCode && REGION_CURRENCY_MAP[countryCode]) return REGION_CURRENCY_MAP[countryCode];

    return REGION_CURRENCY_MAP['IN']; // default
  } catch {
    return REGION_CURRENCY_MAP['IN'];
  }
}

export function formatCurrency(amount, region) {
  try {
    return new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${region.symbol}${amount.toLocaleString()}`;
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export function formatFullDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── ID Generator ──────────────────────────────────────────────────────
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Spending Analysis ─────────────────────────────────────────────────
export function analyzeSpending(transactions) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
  });

  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear() && t.type === 'expense';
  });

  const thisMonthTotal = thisMonth.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthTotal = lastMonth.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryTotals = {};
  thisMonth.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Find wasteful categories
  const wastefulCategories = ['entertainment', 'shopping', 'food', 'subscriptions', 'gambling'];
  const essentialCategories = ['rent', 'utilities', 'groceries', 'health', 'education', 'savings', 'investment'];

  const wastefulSpending = Object.entries(categoryTotals)
    .filter(([cat]) => wastefulCategories.includes(cat))
    .reduce((sum, [, amt]) => sum + amt, 0);

  const essentialSpending = Object.entries(categoryTotals)
    .filter(([cat]) => essentialCategories.includes(cat))
    .reduce((sum, [, amt]) => sum + amt, 0);

  const alerts = [];
  const tips = [];

  // Alert: Overspending compared to last month
  if (lastMonthTotal > 0 && thisMonthTotal > lastMonthTotal * 1.2) {
    alerts.push({
      type: 'warning',
      title: 'Spending Up!',
      message: `You've spent ${Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)}% more than last month. Consider cutting back on non-essentials.`,
    });
  }

  // Alert: Too much on entertainment/shopping
  if (wastefulSpending > thisMonthTotal * 0.4 && thisMonthTotal > 0) {
    alerts.push({
      type: 'danger',
      title: 'High Non-Essential Spending',
      message: `${Math.round((wastefulSpending / thisMonthTotal) * 100)}% of spending is on entertainment & shopping. Try redirecting some to savings or investments.`,
    });
  }

  // Tip: Save more
  const savingsPercent = essentialSpending > 0 ? (essentialSpending / thisMonthTotal * 100) : 0;
  if (savingsPercent < 50 && thisMonthTotal > 0) {
    tips.push({
      type: 'tip',
      title: 'Boost Your Savings',
      message: 'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Your essentials ratio could improve!',
    });
  }

  // Top spending category
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > thisMonthTotal * 0.35) {
    tips.push({
      type: 'info',
      title: `Top Spend: ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)}`,
      message: `${Math.round((topCategory[1] / thisMonthTotal) * 100)}% of your budget goes here. Look for ways to optimize!`,
    });
  }

  // General smart tips
  if (thisMonthTotal === 0) {
    tips.push({
      type: 'tip',
      title: 'Start Tracking!',
      message: 'Add your first expense to get personalized insights and smart money recommendations.',
    });
  }

  if (categoryTotals['investment'] || categoryTotals['savings']) {
    tips.push({
      type: 'success',
      title: 'Great Job Saving!',
      message: 'You\'re investing in your future. Keep allocating funds to savings and investments!',
    });
  }

  return {
    thisMonthTotal,
    lastMonthTotal,
    categoryTotals,
    wastefulSpending,
    essentialSpending,
    alerts,
    tips,
    percentChange: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0,
  };
}

// ── Chart Data Helpers ────────────────────────────────────────────────
export function getChartData(transactions, mode) {
  const data = [];
  const now = new Date();
  
  if (mode === 'week') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = transactions.filter(t => t.date.startsWith(dateStr));
      const expenses = dayData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = dayData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({ name: dayStr, expenses, income });
    }
  } else if (mode === 'month') {
    // Last 30 days (Daily format for granularity)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = transactions.filter(t => t.date.startsWith(dateStr));
      const expenses = dayData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = dayData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({ name: dayStr, expenses, income });
    }
  } else if (mode === 'year') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString(undefined, { month: 'short' });
      const month = d.getMonth();
      const year = d.getFullYear();
      
      const monthData = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year;
      });
      const expenses = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({ name: monthStr, expenses, income });
    }
  } else if (mode === 'all') {
    // Group by Year for all-time
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort();
    if(years.length === 0) years.push(now.getFullYear());
    
    years.forEach(year => {
      const yearData = transactions.filter(t => new Date(t.date).getFullYear() === year);
      const expenses = yearData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = yearData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({ name: year.toString(), expenses, income });
    });
  }
  
  return data;
}

export function getExpensePeriods(transactions) {
  const now = new Date();
  
  // Date formatting helpers for comparison
  const tzOffset = now.getTimezoneOffset() * 60000; 
  const localNow = new Date(now.getTime() - tzOffset);
  const todayStr = localNow.toISOString().split('T')[0];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let daily = 0;
  let weekly = 0;
  let monthly = 0;

  transactions.forEach(t => {
    if (t.type !== 'expense') return;
    
    // For daily, strictly check date string string equality
    if (t.date === todayStr || t.date.startsWith(todayStr)) {
      daily += t.amount;
    }

    const tDate = new Date(t.date);
    // ensure the time is set properly for comparison if date is YYYY-MM-DD
    tDate.setHours(12, 0, 0, 0); 
    
    if (tDate >= startOfWeek) {
      weekly += t.amount;
    }
    
    if (tDate >= startOfMonth) {
      monthly += t.amount;
    }
  });

  return { daily, weekly, monthly };
}

