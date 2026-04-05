// ============================================================
// WealthPortfolio - Main App Controller
// ============================================================

const App = (() => {

  // ---- Format Helpers ----
  function fmtUSD(val) {
    if (Math.abs(val) >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
    if (Math.abs(val) >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
    if (Math.abs(val) >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
    return '$' + val.toLocaleString();
  }
  function fmtPct(v, showSign = true) {
    return (showSign && v > 0 ? '+' : '') + v.toFixed(2) + '%';
  }
  function animateCounter(el, target, prefix = '', suffix = '', duration = 1400) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = prefix + Math.round(start).toLocaleString() + suffix;
      if (start >= target) clearInterval(timer);
    }, 16);
  }

  // ---- Sidebar Toggle ----
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content');
    const headerBtn = document.getElementById('sidebar-header');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
      });
    }

    // Nav items
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        navigateTo(view);

        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });
  }

  // ---- Navigation ----
  function navigateTo(view) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.tabs-container').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${view}`)?.classList.add('active');

    // Update topbar title
    const titles = {
      dashboard: { title: 'Dashboard Overview', subtitle: 'Portfolio Analytics · Demo Mode' },
      portfolio: { title: 'Portfolio Holdings', subtitle: 'All accounts & positions' },
      risk:      { title: 'Risk & Analytics', subtitle: 'Risk models & stress testing' },
      rebalancing:{ title: 'Rebalancing', subtitle: 'Target vs. current allocations' },
      clients:   { title: 'Client Management', subtitle: 'Households & accounts' },
      reports:   { title: 'Reports & Export', subtitle: 'Generate & download reports' }
    };
    const t = titles[view] || titles.dashboard;
    document.getElementById('topbar-title').textContent = t.title;
    document.getElementById('topbar-subtitle').textContent = t.subtitle;
  }

  // ---- KPI Tiles ----
  function initKPIs() {
    const kpi = DUMMY_DATA.kpi;

    // Animate AUM counter
    const aumEl = document.getElementById('kpi-aum');
    if (aumEl) animateCounter(aumEl, kpi.totalAUM, '$', '', 1600);

    // PnL
    const pnlEl = document.getElementById('kpi-daily-pnl');
    if (pnlEl) {
      pnlEl.textContent = (kpi.dailyPnL >= 0 ? '+' : '') + fmtUSD(kpi.dailyPnL);
      pnlEl.className = 'kpi-value mono ' + (kpi.dailyPnL >= 0 ? 'pct-positive' : 'pct-negative');
    }

    const pnlPctEl = document.getElementById('kpi-daily-pnl-pct');
    if (pnlPctEl) pnlPctEl.textContent = fmtPct(kpi.dailyPnLPct);

    // Returns
    ['weekly', 'monthly', 'ytd'].forEach(period => {
      const el = document.getElementById(`kpi-return-${period}`);
      if (el) {
        const val = kpi[`${period}Return`];
        el.textContent = fmtPct(val);
        el.className = val >= 0 ? 'pct-positive' : 'pct-negative';
      }
    });

    // Risk score gauge
    Charts.drawGauge('risk-gauge', kpi.riskScore, 100, 'RISK SCORE', '#f59e0b');

    // Sharpe / Sortino
    if (document.getElementById('kpi-sharpe')) document.getElementById('kpi-sharpe').textContent = kpi.sharpeRatio.toFixed(2);
    if (document.getElementById('kpi-sortino')) document.getElementById('kpi-sortino').textContent = kpi.sortinoRatio.toFixed(2);
    if (document.getElementById('kpi-clients')) document.getElementById('kpi-clients').textContent = kpi.clientCount;
    if (document.getElementById('kpi-accounts')) document.getElementById('kpi-accounts').textContent = kpi.accountCount;
    if (document.getElementById('kpi-aum-total')) document.getElementById('kpi-aum-total').textContent = fmtUSD(kpi.totalAUM);
    if (document.getElementById('kpi-drawdown')) document.getElementById('kpi-drawdown').textContent = kpi.maxDrawdown + '%';

    // AUM animated counter in KPI bar
    const aumSmall = document.getElementById('kpi-aum-small');
    if (aumSmall) animateCounter(aumSmall, Math.round(kpi.totalAUM / 1e6 * 100) / 100 * 1e6, '$', '', 1400);
  }

  // ---- Holdings Table ----
  function initHoldingsTable() {
    const tbody = document.getElementById('holdings-tbody');
    if (!tbody) return;

    let sortCol = null, sortDir = 1;

    function render(holdings) {
      tbody.innerHTML = '';
      holdings.forEach(h => {
        const chgClass = h.dayChg >= 0 ? 'pct-positive' : 'pct-negative';
        const retClass = h.return1y >= 0 ? 'pct-positive' : 'pct-negative';
        tbody.innerHTML += `
          <tr>
            <td><span class="ticker-badge">${h.ticker}</span></td>
            <td>${h.name}</td>
            <td style="color:var(--text-secondary)">${h.class}</td>
            <td class="text-mono">${h.qty.toLocaleString()}</td>
            <td class="text-mono">$${h.price.toFixed(2)}</td>
            <td class="text-mono">$${h.value.toLocaleString()}</td>
            <td class="text-mono">${h.weight.toFixed(2)}%</td>
            <td class="text-mono ${chgClass}">${h.dayChg >= 0 ? '+' : ''}${h.dayChg}%</td>
            <td class="text-mono ${retClass}">${h.return1y >= 0 ? '+' : ''}${h.return1y}%</td>
          </tr>`;
      });
    }

    render(DUMMY_DATA.holdings);

    // Sorting
    document.querySelectorAll('#holdings-table th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = 1; }
        const sorted = [...DUMMY_DATA.holdings].sort((a, b) => {
          const va = a[col], vb = b[col];
          return typeof va === 'number' ? (va - vb) * sortDir : String(va).localeCompare(String(vb)) * sortDir;
        });
        render(sorted);
      });
    });

    // Search/filter
    document.getElementById('holdings-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = DUMMY_DATA.holdings.filter(h =>
        h.ticker.toLowerCase().includes(q) || h.name.toLowerCase().includes(q) || h.class.toLowerCase().includes(q)
      );
      render(filtered);
    });

    // Class filter
    document.getElementById('class-filter')?.addEventListener('change', e => {
      const cls = e.target.value;
      const filtered = cls ? DUMMY_DATA.holdings.filter(h => h.class === cls) : DUMMY_DATA.holdings;
      render(filtered);
    });
  }

  // ---- Rebalancing UI ----
  function initRebalancingUI() {
    const driftContainer = document.getElementById('drift-bars');
    const tradeContainer = document.getElementById('trade-suggestions');
    if (!driftContainer) return;

    const targets = DUMMY_DATA.rebalancing.targets;
    driftContainer.innerHTML = '';
    targets.forEach(t => {
      const drift = t.current - t.target;
      const absDrift = Math.abs(drift).toFixed(1);
      const driftClass = Math.abs(drift) > 2 ? (drift > 0 ? 'danger' : 'warning') : 'success';
      const driftColor = driftClass === 'danger' ? '#ef4444' : driftClass === 'warning' ? '#f59e0b' : '#10b981';
      const barWidth = Math.min((t.current / 50) * 100, 100);
      const targetPos = Math.min((t.target / 50) * 100, 100);

      driftContainer.innerHTML += `
        <div class="rebal-drift">
          <div class="rebal-class">${t.class}</div>
          <div class="rebal-bar-wrap" style="flex:1;position:relative;height:20px;display:flex;align-items:center">
            <div class="rebal-target-bar" style="width:100%;background:rgba(255,255,255,0.06);height:8px;border-radius:99px;position:relative">
              <div class="rebal-current-bar" style="width:${barWidth}%;height:8px;background:${t.color};border-radius:99px;position:absolute;top:0;left:0;opacity:0.8"></div>
              <div class="rebal-target-line" style="left:${targetPos}%;position:absolute;width:2px;height:16px;top:-4px;background:rgba(255,255,255,0.6);border-radius:1px"></div>
            </div>
          </div>
          <div class="rebal-pct text-mono">${t.current}%</div>
          <span class="rebal-drift-badge" style="background:${driftColor}22;color:${driftColor};border:1px solid ${driftColor}44;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;width:54px;text-align:center">
            ${drift > 0 ? '+' : ''}${drift.toFixed(1)}%
          </span>
        </div>`;
    });

    if (!tradeContainer) return;
    const trades = DUMMY_DATA.rebalancing.trades;
    tradeContainer.innerHTML = '';
    trades.forEach(t => {
      tradeContainer.innerHTML += `
        <div class="trade-row">
          <span class="trade-action ${t.action}">${t.action}</span>
          <div class="trade-info">
            <div class="trade-ticker">${t.ticker}</div>
            <div class="trade-reason">${t.reason}</div>
          </div>
          <div>
            <div class="trade-value text-mono">$${t.value.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--text-muted);text-align:right">${t.shares} shares</div>
          </div>
        </div>`;
    });
  }

  // ---- Client Cards ----
  function initClientsUI() {
    const grid = document.getElementById('client-grid');
    if (!grid) return;

    DUMMY_DATA.clients.forEach(client => {
      const initials = client.name.split(' ').map(w => w[0]).slice(0, 2).join('');
      const statusClass = client.status === 'Active' ? 'active' : 'review';
      const retClass = client.return1y >= 8 ? 'pct-positive' : client.return1y >= 5 ? '' : 'pct-negative';

      const card = document.createElement('div');
      card.className = 'client-card';
      card.innerHTML = `
        <div class="client-header">
          <div class="client-avatar">${initials}</div>
          <div style="flex:1">
            <div class="client-name">${client.name}</div>
            <div class="client-meta">Advisor: ${client.advisor} · ${client.accounts} Accounts</div>
          </div>
          <span class="status-badge ${statusClass}">${client.status}</span>
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="cs-label">AUM</div>
            <div class="cs-value">${fmtUSD(client.aum)}</div>
          </div>
          <div class="client-stat">
            <div class="cs-label">1Y Return</div>
            <div class="cs-value ${retClass}">${fmtPct(client.return1y)}</div>
          </div>
          <div class="client-stat">
            <div class="cs-label">Risk Profile</div>
            <div class="cs-value" style="font-size:11px">${client.riskProfile}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn-secondary btn-sm" onclick="openClientModal('${client.id}')"><i class="ph ph-chart-pie-slice"></i> View Details</button>
          <button class="btn btn-primary btn-sm" onclick="ExportUtil.generateFullReport('${client.id}')"><i class="ph ph-file-pdf"></i> Report</button>
        </div>`;
      grid.appendChild(card);
    });
  }

  // ---- Client Modal ----
  function initClientModal() {
    window.openClientModal = (clientId) => {
      const client = DUMMY_DATA.clients.find(c => c.id === clientId);
      if (!client) return;

      const modal = document.getElementById('client-modal');
      const body = document.getElementById('client-modal-body');

      const initials = client.name.split(' ').map(w => w[0]).slice(0, 2).join('');
      body.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white">${initials}</div>
          <div>
            <div style="font-family:var(--font-display);font-size:22px;font-weight:700">${client.name}</div>
            <div style="color:var(--text-secondary);font-size:13px">Advisor: ${client.advisor} · Risk: ${client.riskProfile}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
          ${[['Total AUM', fmtUSD(client.aum)], ['1Y Return', fmtPct(client.return1y)], ['Accounts', client.accounts],
             ['Last Review', client.lastReview], ['Status', client.status], ['Households', client.households.length]
          ].map(([l, v]) => `<div style="background:var(--bg-surface);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">${l}</div>
            <div style="font-size:15px;font-weight:700">${v}</div>
          </div>`).join('')}
        </div>
        <div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.08em">Linked Accounts</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${client.accounts_detail.map(acc => `
            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px">
              <div style="background:rgba(99,102,241,0.15);border-radius:6px;padding:6px 10px;font-size:11px;font-weight:700;color:var(--accent-tertiary)">${acc.type}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600">${acc.name}</div>
                <div style="font-size:11px;color:var(--text-secondary)">Custodian: ${acc.custodian}</div>
              </div>
              <div style="font-family:var(--font-mono);font-size:14px;font-weight:700">${fmtUSD(acc.value)}</div>
            </div>`).join('')}
        </div>`;

      modal.classList.add('open');
    };

    document.getElementById('client-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('client-modal')) {
        document.getElementById('client-modal').classList.remove('open');
      }
    });
    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      document.getElementById('client-modal').classList.remove('open');
    });
  }

  // ---- Alerts Panel ----
  function initAlerts() {
    const alertsBody = document.getElementById('alerts-panel-body');
    if (!alertsBody) return;

    DUMMY_DATA.alerts.forEach(alert => {
      alertsBody.innerHTML += `
        <div class="alert-item ${alert.level}">
          <div style="display:flex;align-items:flex-start;gap:0">
            <div>
              <div class="alert-msg">${alert.message}</div>
              <div class="alert-time">${alert.time}</div>
            </div>
          </div>
        </div>`;
    });

    const btn = document.getElementById('alerts-btn');
    const panel = document.getElementById('alerts-panel');
    const closeBtn = document.getElementById('alerts-panel-close');

    btn?.addEventListener('click', () => panel?.classList.toggle('open'));
    closeBtn?.addEventListener('click', () => panel?.classList.remove('open'));
  }

  // ---- Transactions Feed ----
  function initTransactionsFeed() {
    const feed = document.getElementById('transactions-feed');
    if (!feed) return;

    const typeIcons = { BUY: '<i class="ph ph-trend-up"></i>', SELL: '<i class="ph ph-trend-down"></i>', DIVIDEND: '<i class="ph ph-currency-dollar"></i>', WITHDRAWAL: '<i class="ph ph-money"></i>', CONTRIBUTION: '<i class="ph ph-bank"></i>' };
    const typeColors = { BUY: '#10b981', SELL: '#ef4444', DIVIDEND: '#f59e0b', WITHDRAWAL: '#f97316', CONTRIBUTION: '#6366f1' };

    DUMMY_DATA.transactions.forEach(tx => {
      const icon = typeIcons[tx.type] || '📋';
      const color = typeColors[tx.type] || '#94a3b8';
      const valStr = tx.amount ? fmtUSD(tx.amount) : (tx.shares ? `${tx.shares} × $${tx.price?.toFixed(2)}` : '');

      feed.innerHTML += `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
          <div style="font-size:20px;color:${color}">${icon}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:${color}">${tx.type}${tx.ticker ? ' ' + tx.ticker : ''}</div>
            <div style="font-size:11px;color:var(--text-secondary)">${tx.account} · ${tx.date}</div>
          </div>
          <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:${color}">${valStr}</div>
        </div>`;
    });
  }

  // ---- Stress Test Slider ----
  function initStressTest() {
    const slider = document.getElementById('stress-slider');
    const display = document.getElementById('stress-value');
    if (!slider) return;
    Charts.updateStressTest(parseInt(slider.value));
    slider.addEventListener('input', () => {
      display.textContent = slider.value + '%';
      Charts.updateStressTest(parseInt(slider.value));
    });
  }

  // ---- Risk Metrics ----
  function initRiskMetrics() {
    const risk = DUMMY_DATA.risk;
    const metricMap = {
      'rm-var95': { val: risk.var95 + '%', cls: 'danger' },
      'rm-var99': { val: risk.var99 + '%', cls: 'danger' },
      'rm-cvar95': { val: risk.cvar95 + '%', cls: 'danger' },
      'rm-cvar99': { val: risk.cvar99 + '%', cls: 'danger' },
      'rm-vol':    { val: risk.volatility + '%', cls: 'warning' },
      'rm-beta':   { val: risk.beta, cls: 'info' },
      'rm-sharpe': { val: DUMMY_DATA.kpi.sharpeRatio, cls: 'success' },
      'rm-sortino':{ val: DUMMY_DATA.kpi.sortinoRatio, cls: 'success' },
      'rm-alpha':  { val: DUMMY_DATA.kpi.alpha + '%', cls: 'success' },
      'rm-drawdown':{ val: risk.maxDrawdown + '%', cls: 'danger' }
    };

    Object.entries(metricMap).forEach(([id, { val, cls }]) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val; el.className = `rm-value ${cls}`; }
    });
  }

  // ---- Reports Page ----
  function initReportsPage() {
    document.querySelectorAll('.generate-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const clientSelect = document.getElementById('report-client-select');
        const clientId = clientSelect ? clientSelect.value : 'C001';
        ExportUtil.generateFullReport(clientId);
      });
    });
  }

  // ---- Export Setup ----
  function initExports() {
    // Performance tile
    ExportUtil.setupExportDropdown('export-performance', 'tile-performance', 'Portfolio_Performance',
      () => DUMMY_DATA.performance.labels.map((d, i) => ({
        date: d,
        portfolio_value: DUMMY_DATA.performance.portfolio[i].toFixed(2),
        benchmark_value: DUMMY_DATA.performance.benchmark[i].toFixed(2)
      }))
    );

    // Allocation tile
    ExportUtil.setupExportDropdown('export-allocation', 'tile-allocation', 'Asset_Allocation',
      () => DUMMY_DATA.allocation.byClass.map(a => ({ asset_class: a.label, allocation_pct: a.value }))
    );

    // Holdings tile
    ExportUtil.setupExportDropdown('export-holdings', 'tile-holdings', 'Holdings',
      () => DUMMY_DATA.holdings.map(h => ({
        ticker: h.ticker, name: h.name, class: h.class,
        quantity: h.qty, price: h.price, value: h.value,
        weight_pct: h.weight, day_change_pct: h.dayChg, return_1y_pct: h.return1y
      }))
    );

    // Risk tile
    ExportUtil.setupExportDropdown('export-risk', 'tile-risk', 'Risk_Metrics',
      () => {
        const r = DUMMY_DATA.risk;
        return [
          { metric: 'VaR 95%', value: r.var95 + '%' },
          { metric: 'VaR 99%', value: r.var99 + '%' },
          { metric: 'CVaR 95%', value: r.cvar95 + '%' },
          { metric: 'CVaR 99%', value: r.cvar99 + '%' },
          { metric: 'Volatility', value: r.volatility + '%' },
          { metric: 'Max Drawdown', value: r.maxDrawdown + '%' },
          { metric: 'Beta', value: r.beta },
          { metric: 'Sharpe Ratio', value: DUMMY_DATA.kpi.sharpeRatio },
          { metric: 'Sortino Ratio', value: DUMMY_DATA.kpi.sortinoRatio }
        ];
      }
    );

    // Monte Carlo tile
    ExportUtil.setupExportDropdown('export-montecarlo', 'tile-montecarlo', 'MonteCarlo_Percentiles',
      () => {
        const bands = getMCBands(DUMMY_DATA.risk.monteCarlo, 252);
        return bands.days.map((d, i) => ({
          day: d, p5: bands.p5[i].toFixed(0), p25: bands.p25[i].toFixed(0),
          median: bands.p50[i].toFixed(0), p75: bands.p75[i].toFixed(0), p95: bands.p95[i].toFixed(0)
        }));
      }
    );

    // Rebalancing tile
    ExportUtil.setupExportDropdown('export-rebalancing', 'tile-rebalancing', 'Rebalancing_Proposals',
      () => DUMMY_DATA.rebalancing.trades.map(t => ({
        action: t.action, ticker: t.ticker, shares: t.shares,
        estimated_value: t.value, reason: t.reason
      }))
    );

    // Clients
    ExportUtil.setupExportDropdown('export-clients', 'tile-clients', 'Clients_Summary',
      () => DUMMY_DATA.clients.map(c => ({
        client_id: c.id, name: c.name, advisor: c.advisor,
        aum: c.aum, return_1y_pct: c.return1y, risk_profile: c.riskProfile,
        accounts: c.accounts, status: c.status, last_review: c.lastReview
      }))
    );

    // Dashboard tile (KPIs)
    ExportUtil.setupExportDropdown('export-kpis', 'kpi-grid-container', 'KPI_Summary',
      () => {
        const k = DUMMY_DATA.kpi;
        return [
          { metric: 'Total AUM', value: k.totalAUM },
          { metric: 'Daily P&L', value: k.dailyPnL },
          { metric: 'Daily P&L %', value: k.dailyPnLPct + '%' },
          { metric: 'YTD Return', value: k.ytdReturn + '%' },
          { metric: 'Sharpe Ratio', value: k.sharpeRatio },
          { metric: 'Max Drawdown', value: k.maxDrawdown + '%' },
          { metric: 'Beta', value: k.beta }
        ];
      }
    );
  }

  // ---- Top Holdings Mini Table ----
  function initTopHoldingsTable() {
    const tb = document.getElementById('top-holdings-tbody');
    if (!tb) return;
    DUMMY_DATA.holdings.slice(0, 6).forEach(h => {
      const cc = h.dayChg >= 0 ? 'pct-positive' : 'pct-negative';
      const rc = h.return1y >= 0 ? 'pct-positive' : 'pct-negative';
      tb.innerHTML += `<tr>
        <td><span class="ticker-badge">${h.ticker}</span></td>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis">${h.name}</td>
        <td class="text-mono">$${h.value.toLocaleString()}</td>
        <td class="text-mono">${h.weight}%</td>
        <td class="text-mono ${cc}">${h.dayChg >= 0 ? '+' : ''}${h.dayChg}%</td>
        <td class="text-mono ${rc}">${h.return1y >= 0 ? '+' : ''}${h.return1y}%</td>
      </tr>`;
    });
  }

  // ---- Allocation Table (Portfolio page) ----
  function initAllocationTable() {
    const tb = document.getElementById('allocation-tbody');
    if (!tb) return;
    DUMMY_DATA.allocation.byClass.forEach(a => {
      tb.innerHTML += `<tr>
        <td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${a.color};margin-right:6px;vertical-align:middle"></span>${a.label}</td>
        <td class="text-mono">${a.value}%</td>
      </tr>`;
    });
  }

  // ---- Region Bars ----
  function initRegionBars() {
    const container = document.getElementById('region-bars');
    if (!container) return;
    const colors = ['#6366f1', '#22d3ee', '#a78bfa', '#f59e0b', '#34d399'];
    DUMMY_DATA.allocation.byRegion.forEach((r, i) => {
      const width = (r.value / 55 * 100).toFixed(0);
      container.innerHTML += `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:12px;color:var(--text-secondary);width:120px">${r.label}</span>
          <div style="flex:1;background:var(--bg-surface);border-radius:99px;height:8px">
            <div style="width:${width}%;height:8px;background:${colors[i]};border-radius:99px;transition:width 0.8s"></div>
          </div>
          <span class="text-mono" style="font-size:12px;width:40px;text-align:right">${r.value}%</span>
        </div>`;
    });
  }

  // ---- Factors Table ----
  function initFactorsTable() {
    const tb = document.getElementById('factors-tbody');
    if (!tb) return;
    DUMMY_DATA.factors.forEach(f => {
      const active = (f.exposure - f.benchmark).toFixed(2);
      const ac = parseFloat(active) >= 0 ? 'pct-positive' : 'pct-negative';
      tb.innerHTML += `<tr>
        <td>${f.name}</td>
        <td class="text-mono">${f.exposure}</td>
        <td class="text-mono">${f.benchmark}</td>
        <td class="text-mono ${ac}">${parseFloat(active) >= 0 ? '+' : ''}${active}</td>
      </tr>`;
    });
  }

  // ---- Second Allocation Chart (Portfolio page) ----
  function initAllocationChart2() {
    const ctx2 = document.getElementById('allocationChart2');
    if (!ctx2) return;
    const alloc = DUMMY_DATA.allocation.byClass;
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: alloc.map(a => a.label),
        datasets: [{ data: alloc.map(a => a.value), backgroundColor: alloc.map(a => a.color), borderColor: '#07090f', borderWidth: 3, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11, family: "'Inter', sans-serif" }, usePointStyle: true } },
          tooltip: { backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1, callbacks: { label: c => ` ${c.label}: ${c.parsed.toFixed(1)}%` } }
        }
      }
    });
  }

  // ---- Lazy Chart Initialization ----
  // Track which charts have been initialized to avoid double-init
  const _chartInited = {};

  function initChartsForView(view) {
    if (_chartInited[view]) return;
    _chartInited[view] = true;

    if (view === 'dashboard') {
      // Performance & Allocation charts are on the always-visible dashboard
      // Set explicit height on canvas before init to bypass display:none layout issues
      ['performanceChart', 'allocationChart'].forEach(id => {
        const c = document.getElementById(id);
        if (c && !c.style.height) { c.style.height = '220px'; c.style.width = '100%'; }
      });
      Charts.initAll();
      initStressTest();
      setTimeout(() => Charts.initCorrelationHeatmap(), 100);
    } else if (view === 'portfolio') {
      const c2 = document.getElementById('allocationChart2');
      if (c2) { c2.style.height = '280px'; c2.style.width = '100%'; }
      initAllocationChart2();
    } else if (view === 'risk') {
      // Charts for risk page — varChart, monteCarloChart, factorChart
      ['varChart', 'monteCarloChart', 'factorChart'].forEach(id => {
        const c = document.getElementById(id);
        if (c && !c.style.height) { c.style.height = '220px'; c.style.width = '100%'; }
      });
      // Already initialized in Charts.initAll, so just trigger stress test
      initStressTest();
    } else if (view === 'rebalancing') {
      const c = document.getElementById('rebalancingChart');
      if (c && !c.style.height) { c.style.height = '320px'; c.style.width = '100%'; }
      // Already covered in initAll
    } else if (view === 'clients') {
      // No charts on clients page
    } else if (view === 'reports') {
      // No charts on reports page
    }
  }

  // ---- Navigation (patched to fire chart init) ----
  const _originalNavigateTo = navigateTo;
  function navigateToWithCharts(view) {
    _originalNavigateTo(view);
    // Init charts for this view after paint
    requestAnimationFrame(() => initChartsForView(view));
  }

  // ---- Init ----
  function init() {
    initSidebar();

    // Patch sidebar nav handlers to use chart-aware navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      // Remove any old listeners by cloning
      const clone = item.cloneNode(true);
      item.parentNode.replaceChild(clone, item);
      clone.addEventListener('click', () => {
        const view = clone.dataset.view;
        navigateToWithCharts(view);
        if (window.innerWidth < 768) {
          document.getElementById('sidebar')?.classList.remove('mobile-open');
        }
      });
    });

    navigateTo('dashboard');
    initKPIs();
    initTopHoldingsTable();
    initHoldingsTable();
    initAllocationTable();
    initRegionBars();
    initFactorsTable();
    initRebalancingUI();
    initClientsUI();
    initClientModal();
    initAlerts();
    initTransactionsFeed();
    initRiskMetrics();
    initReportsPage();
    initExports();

    // Init ALL charts by temporarily making all tabs visible
    // This ensures Chart.js can measure dimensions correctly
    requestAnimationFrame(() => {
      // Temporarily show all tab containers
      const hiddenTabs = [];
      document.querySelectorAll('.tabs-container:not(.active)').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'hidden';  // hidden from user, but has layout
        el.style.position = 'absolute';  // off-screen
        el.style.pointerEvents = 'none';
        hiddenTabs.push(el);
      });

      // Also make hidden tab-panels briefly visible for chart sizing
      const hiddenPanels = [];
      document.querySelectorAll('.tab-panel:not(.active)').forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'hidden';
        el.style.position = 'absolute';
        el.style.pointerEvents = 'none';
        hiddenPanels.push(el);
      });

      // Init all charts
      Charts.initAll();
      initAllocationChart2();
      initStressTest();

      // Restore visibility
      requestAnimationFrame(() => {
        hiddenTabs.forEach(el => {
          el.style.display = '';
          el.style.visibility = '';
          el.style.position = '';
          el.style.pointerEvents = '';
        });
        hiddenPanels.forEach(el => {
          el.style.display = '';
          el.style.visibility = '';
          el.style.position = '';
          el.style.pointerEvents = '';
        });
      });
    });

    // Page tabs
    document.querySelectorAll('.page-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const panel = tab.closest('.tabs-container');
        panel.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
        panel.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        panel.querySelector(`.tab-panel[data-tab="${tab.dataset.tab}"]`)?.classList.add('active');
      });
    });
  }

  // Call init on load with a slight delay for the start animation
  const START_TIME = Date.now();
  window.addEventListener('load', () => {
    const elapsed = Date.now() - START_TIME;
    const delay = Math.max(0, 1000 - elapsed); // min 1s load screen
    
    setTimeout(() => {
      init();
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }
    }, delay);
  });

  return { navigateTo: navigateToWithCharts };
})();
