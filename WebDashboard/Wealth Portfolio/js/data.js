// ============================================================
// WealthPortfolio - Dummy Data Module
// ============================================================

const DUMMY_DATA = {

  // --- Top-Level KPIs ---
  kpi: {
    totalAUM: 47832640,
    dailyPnL: 124530,
    dailyPnLPct: 0.26,
    weeklyReturn: 1.42,
    monthlyReturn: 3.18,
    ytdReturn: 9.74,
    sharpeRatio: 1.84,
    sortinoRatio: 2.31,
    maxDrawdown: -8.43,
    beta: 0.91,
    alpha: 2.14,
    riskScore: 62,
    clientCount: 12,
    accountCount: 34
  },

  // --- Portfolio Performance Time Series ---
  performance: {
    labels: generateDateLabels(365),
    portfolio: generateReturnSeries(365, 100000, 0.00045, 0.008),
    benchmark: generateReturnSeries(365, 100000, 0.00038, 0.007)
  },

  // --- Asset Allocation ---
  allocation: {
    byClass: [
      { label: 'US Equities', value: 38.4, color: '#6366f1', sub: [
        { label: 'Large Cap', value: 22.1 }, { label: 'Mid Cap', value: 10.3 }, { label: 'Small Cap', value: 6.0 }
      ]},
      { label: 'International', value: 18.2, color: '#22d3ee', sub: [
        { label: 'Developed', value: 12.4 }, { label: 'Emerging', value: 5.8 }
      ]},
      { label: 'Fixed Income', value: 22.7, color: '#a78bfa', sub: [
        { label: 'Gov Bonds', value: 12.0 }, { label: 'Corp Bonds', value: 10.7 }
      ]},
      { label: 'Alternatives', value: 11.5, color: '#f59e0b', sub: [
        { label: 'Real Estate', value: 6.2 }, { label: 'Commodities', value: 5.3 }
      ]},
      { label: 'Cash & Equiv', value: 9.2, color: '#34d399', sub: [
        { label: 'Money Market', value: 5.1 }, { label: 'T-Bills', value: 4.1 }
      ]}
    ],
    bySector: [
      { label: 'Technology', value: 24.3 },
      { label: 'Healthcare', value: 14.8 },
      { label: 'Financials', value: 13.2 },
      { label: 'Consumer Disc', value: 10.7 },
      { label: 'Industrials', value: 9.1 },
      { label: 'Energy', value: 7.4 },
      { label: 'Other', value: 20.5 }
    ],
    byRegion: [
      { label: 'North America', value: 52.4 },
      { label: 'Europe', value: 18.7 },
      { label: 'Asia Pacific', value: 16.3 },
      { label: 'Emerging', value: 8.2 },
      { label: 'Other', value: 4.4 }
    ]
  },

  // --- Top Holdings ---
  holdings: [
    { ticker: 'AAPL', name: 'Apple Inc.', class: 'US Equity', qty: 1240, price: 189.42, value: 234881, weight: 4.81, dayChg: 1.23, return1y: 18.4 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', class: 'US Equity', qty: 860, price: 412.18, value: 354475, weight: 7.26, dayChg: 0.87, return1y: 24.1 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', class: 'US Equity', qty: 520, price: 172.34, value: 89617, weight: 1.83, dayChg: -0.42, return1y: 14.7 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', class: 'US Equity', qty: 740, price: 384.22, value: 284323, weight: 5.82, dayChg: 0.31, return1y: 12.8 },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', class: 'US Equity', qty: 380, price: 875.42, value: 332660, weight: 6.81, dayChg: 2.14, return1y: 62.3 },
    { ticker: 'JPM', name: 'JPMorgan Chase', class: 'US Equity', qty: 920, price: 198.74, value: 182841, weight: 3.74, dayChg: -0.18, return1y: 9.4 },
    { ticker: 'AGG', name: 'iShares Core US Agg Bond', class: 'Fixed Income', qty: 2400, price: 96.82, value: 232368, weight: 4.76, dayChg: 0.04, return1y: 2.1 },
    { ticker: 'VEA', name: 'Vanguard FTSE Dev Mkts', class: 'International', qty: 3100, price: 48.92, value: 151652, weight: 3.10, dayChg: 0.22, return1y: 7.8 },
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', class: 'Alternatives', qty: 1800, price: 82.34, value: 148212, weight: 3.03, dayChg: -0.67, return1y: 3.2 },
    { ticker: 'GLD', name: 'SPDR Gold Shares', class: 'Alternatives', qty: 860, price: 187.64, value: 161370, weight: 3.30, dayChg: 0.91, return1y: 11.3 },
    { ticker: 'TLT', name: 'iShares 20+ Yr T-Bond', class: 'Fixed Income', qty: 2100, price: 94.18, value: 197778, weight: 4.05, dayChg: -0.23, return1y: -4.2 },
    { ticker: 'EEM', name: 'iShares MSCI Emg Mkts', class: 'International', qty: 2800, price: 38.72, value: 108416, weight: 2.22, dayChg: 0.48, return1y: 6.1 }
  ],

  // --- Risk Metrics ---
  risk: {
    var95: -2.34,
    var99: -3.87,
    cvar95: -3.12,
    cvar99: -5.43,
    volatility: 11.2,
    beta: 0.91,
    correlation: 0.82,
    maxDrawdown: -8.43,
    drawdownDates: ['2024-07-15', '2024-08-23'],
    stressScenarios: [
      { name: '2008 Global Crisis', impact: -28.4 },
      { name: 'COVID Crash (Mar 2020)', impact: -19.7 },
      { name: 'Stagflation +5% Rate', impact: -14.2 },
      { name: 'Tech Bubble Burst', impact: -22.8 },
      { name: 'Mild Recession -15%', impact: -9.3 }
    ],
    monteCarlo: generateMonteCarloPaths(100, 252, 47832640, 0.0003, 0.007)
  },

  // --- Rebalancing ---
  rebalancing: {
    targets: [
      { class: 'US Equities', target: 35, current: 38.4, color: '#6366f1' },
      { class: 'International', target: 20, current: 18.2, color: '#22d3ee' },
      { class: 'Fixed Income', target: 25, current: 22.7, color: '#a78bfa' },
      { class: 'Alternatives', target: 12, current: 11.5, color: '#f59e0b' },
      { class: 'Cash & Equiv', target: 8, current: 9.2, color: '#34d399' }
    ],
    trades: [
      { action: 'SELL', ticker: 'AAPL', shares: 42, value: 7956, reason: 'US Equity overweight +3.4%' },
      { action: 'SELL', ticker: 'MSFT', shares: 28, value: 11541, reason: 'US Equity overweight +3.4%' },
      { action: 'BUY', ticker: 'VEA', shares: 215, value: 10518, reason: 'Intl underweight -1.8%' },
      { action: 'BUY', ticker: 'AGG', shares: 120, value: 11618, reason: 'Fixed Inc underweight -2.3%' },
      { action: 'SELL', ticker: 'BRK.B', shares: 18, value: 6916, reason: 'US Equity overweight +3.4%' }
    ]
  },

  // --- Clients ---
  clients: [
    {
      id: 'C001', name: 'Anderson Family Trust', advisor: 'Sarah Mitchell', status: 'Active',
      aum: 8420000, return1y: 11.2, riskProfile: 'Moderate', accounts: 4, lastReview: '2025-12-15',
      households: ['Anderson Personal', 'Anderson Foundation'],
      accounts_detail: [
        { id: 'A001', name: 'Anderson Joint Taxable', type: 'Taxable', value: 3240000, custodian: 'Schwab' },
        { id: 'A002', name: 'Anderson IRA', type: 'IRA', value: 2180000, custodian: 'Fidelity' },
        { id: 'A003', name: 'Anderson Roth IRA', type: 'Roth IRA', value: 1420000, custodian: 'Vanguard' },
        { id: 'A004', name: 'Anderson Foundation', type: 'Trust', value: 1580000, custodian: 'Schwab' }
      ]
    },
    {
      id: 'C002', name: 'Nguyen Household', advisor: 'James Park', status: 'Active',
      aum: 4180000, return1y: 9.8, riskProfile: 'Aggressive', accounts: 2, lastReview: '2026-01-08',
      households: ['Nguyen Personal'],
      accounts_detail: [
        { id: 'A005', name: 'Nguyen Taxable', type: 'Taxable', value: 2640000, custodian: 'Interactive Brokers' },
        { id: 'A006', name: 'Nguyen 401k', type: '401(k)', value: 1540000, custodian: 'Fidelity' }
      ]
    },
    {
      id: 'C003', name: 'Rodriguez Family', advisor: 'Sarah Mitchell', status: 'Active',
      aum: 6700000, return1y: 8.4, riskProfile: 'Conservative', accounts: 5, lastReview: '2025-11-22',
      households: ['Rodriguez Personal', 'Rodriguez Business'],
      accounts_detail: [
        { id: 'A007', name: 'Rodriguez Joint', type: 'Taxable', value: 2100000, custodian: 'Schwab' },
        { id: 'A008', name: 'Rodriguez IRA', type: 'IRA', value: 1800000, custodian: 'Vanguard' },
        { id: 'A009', name: 'Rodriguez Roth', type: 'Roth IRA', value: 940000, custodian: 'Fidelity' },
        { id: 'A010', name: 'Rodriguez Trust', type: 'Trust', value: 1200000, custodian: 'Schwab' },
        { id: 'A011', name: 'Rodriguez Solo 401k', type: 'Solo 401(k)', value: 660000, custodian: 'TD Ameritrade' }
      ]
    },
    {
      id: 'C004', name: 'Chen Tech Executive', advisor: 'James Park', status: 'Active',
      aum: 12400000, return1y: 14.7, riskProfile: 'Aggressive', accounts: 3, lastReview: '2026-02-03',
      households: ['Chen Personal'],
      accounts_detail: [
        { id: 'A012', name: 'Chen Taxable (Concentrated)', type: 'Taxable', value: 7800000, custodian: 'Goldman Sachs' },
        { id: 'A013', name: 'Chen IRA', type: 'IRA', value: 2800000, custodian: 'Goldman Sachs' },
        { id: 'A014', name: 'Chen Deferred Comp', type: 'NQDC', value: 1800000, custodian: 'Fidelity' }
      ]
    },
    {
      id: 'C005', name: 'Patel Foundation', advisor: 'David Osei', status: 'Active',
      aum: 9200000, return1y: 7.1, riskProfile: 'Moderate-Conservative', accounts: 2, lastReview: '2025-10-14',
      households: ['Patel Charitable'],
      accounts_detail: [
        { id: 'A015', name: 'Patel Endowment', type: 'Foundation', value: 7400000, custodian: 'JP Morgan' },
        { id: 'A016', name: 'Patel Operating', type: 'Institutional', value: 1800000, custodian: 'JP Morgan' }
      ]
    },
    {
      id: 'C006', name: 'Williams Retiree', advisor: 'David Osei', status: 'Review Needed',
      aum: 2980000, return1y: 5.3, riskProfile: 'Conservative', accounts: 3, lastReview: '2025-08-30',
      households: ['Williams Personal'],
      accounts_detail: [
        { id: 'A017', name: 'Williams Taxable', type: 'Taxable', value: 820000, custodian: 'Vanguard' },
        { id: 'A018', name: 'Williams IRA', type: 'IRA', value: 1620000, custodian: 'Vanguard' },
        { id: 'A019', name: 'Williams Roth', type: 'Roth IRA', value: 540000, custodian: 'Vanguard' }
      ]
    }
  ],

  // --- Transactions Feed ---
  transactions: [
    { date: '2026-04-04', type: 'BUY', ticker: 'NVDA', shares: 20, price: 875.42, account: 'Chen Taxable', client: 'Chen' },
    { date: '2026-04-04', type: 'DIVIDEND', ticker: 'AGG', amount: 1284.32, account: 'Anderson IRA', client: 'Anderson' },
    { date: '2026-04-03', type: 'SELL', ticker: 'TLT', shares: 150, price: 94.18, account: 'Patel Endowment', client: 'Patel' },
    { date: '2026-04-03', type: 'BUY', ticker: 'GLD', shares: 40, price: 187.64, account: 'Rodriguez Trust', client: 'Rodriguez' },
    { date: '2026-04-02', type: 'WITHDRAWAL', amount: 25000, account: 'Williams Taxable', client: 'Williams' },
    { date: '2026-04-02', type: 'CONTRIBUTION', amount: 7000, account: 'Nguyen Roth IRA', client: 'Nguyen' },
    { date: '2026-04-01', type: 'BUY', ticker: 'MSFT', shares: 15, price: 408.92, account: 'Anderson Joint', client: 'Anderson' },
    { date: '2026-04-01', type: 'SELL', ticker: 'AAPL', shares: 30, price: 188.12, account: 'Chen Taxable', client: 'Chen' }
  ],

  // --- Alerts ---
  alerts: [
    { level: 'warning', message: 'Williams Retiree: Annual review overdue (>6 months)', time: '2 days ago' },
    { level: 'danger', message: 'Chen Portfolio: Tech sector concentration at 41.2% (threshold: 35%)', time: '3 hours ago' },
    { level: 'info', message: 'Patel Foundation: Q1 performance report ready to generate', time: '1 hour ago' },
    { level: 'warning', message: 'Anderson Trust: Equity drift +3.4% above target threshold', time: '6 hours ago' },
    { level: 'success', message: 'Rodriguez rebalancing completed successfully', time: '1 day ago' }
  ],

  // --- Factor Exposure ---
  factors: [
    { name: 'Market (Beta)', exposure: 0.91, benchmark: 1.0 },
    { name: 'Size (SMB)', exposure: -0.12, benchmark: 0.0 },
    { name: 'Value (HML)', exposure: 0.28, benchmark: 0.0 },
    { name: 'Momentum', exposure: 0.14, benchmark: 0.0 },
    { name: 'Quality', exposure: 0.38, benchmark: 0.0 },
    { name: 'Low Volatility', exposure: 0.22, benchmark: 0.0 }
  ]
};

// --- Helper: Generate Date Labels ---
function generateDateLabels(days) {
  const labels = [];
  const today = new Date('2026-04-05');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().split('T')[0]);
  }
  return labels;
}

// --- Helper: Generate Return Series ---
function generateReturnSeries(days, start, drift, vol) {
  const values = [start];
  for (let i = 1; i < days; i++) {
    const rand = (Math.random() + Math.random() + Math.random() - 1.5) * vol * Math.sqrt(3);
    values.push(Math.max(values[i - 1] * (1 + drift + rand), start * 0.5));
  }
  return values;
}

// --- Helper: Monte Carlo Paths ---
function generateMonteCarloPaths(npaths, ndays, startVal, mu, sigma) {
  const paths = [];
  for (let p = 0; p < npaths; p++) {
    const path = [startVal];
    for (let d = 1; d <= ndays; d++) {
      const r = (Math.random() - 0.5) * 2;
      const shock = mu + sigma * r * Math.sqrt(3);
      path.push(path[d - 1] * (1 + shock));
    }
    paths.push(path);
  }
  return paths;
}

// Derived: Percentile bands for Monte Carlo display
function getMCBands(paths, ndays) {
  const days = Array.from({ length: ndays + 1 }, (_, i) => i);
  const p5 = [], p25 = [], p50 = [], p75 = [], p95 = [];
  for (let d = 0; d <= ndays; d++) {
    const vals = paths.map(p => p[d]).sort((a, b) => a - b);
    const len = vals.length;
    p5.push(vals[Math.floor(len * 0.05)]);
    p25.push(vals[Math.floor(len * 0.25)]);
    p50.push(vals[Math.floor(len * 0.50)]);
    p75.push(vals[Math.floor(len * 0.75)]);
    p95.push(vals[Math.floor(len * 0.95)]);
  }
  return { days, p5, p25, p50, p75, p95 };
}

// Correlation matrix (6x6 assets)
const ASSET_LABELS = ['AAPL', 'MSFT', 'GOOGL', 'AGG', 'GLD', 'VEA'];
const CORRELATION_MATRIX = [
  [1.00, 0.84, 0.76, -0.22, 0.12, 0.61],
  [0.84, 1.00, 0.79, -0.18, 0.09, 0.58],
  [0.76, 0.79, 1.00, -0.15, 0.07, 0.55],
  [-0.22, -0.18, -0.15, 1.00, 0.28, -0.14],
  [0.12, 0.09, 0.07, 0.28, 1.00, 0.18],
  [0.61, 0.58, 0.55, -0.14, 0.18, 1.00]
];
