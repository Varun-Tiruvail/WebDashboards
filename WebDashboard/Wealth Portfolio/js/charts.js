// ============================================================
// WealthPortfolio - Charts Module
// ============================================================

const Charts = (() => {

  const defaultGridOpts = {
    color: 'rgba(255,255,255,0.05)',
    drawBorder: false
  };

  const defaultTickOpts = {
    color: '#64748b',
    font: { family: "'Inter', sans-serif", size: 11 }
  };

  // ---- Helper: Format large numbers ----
  function fmt(val) {
    if (Math.abs(val) >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
    if (Math.abs(val) >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
    if (Math.abs(val) >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
    return '$' + val.toFixed(0);
  }

  function fmtPct(val) { return (val >= 0 ? '+' : '') + val.toFixed(2) + '%'; }

  // ---- Initialize all charts ----
  function initAll() {
    initPerformanceChart();
    initAllocationChart();
    initVaRChart();
    initMonteCarloChart();
    initRebalancingChart();
    initCorrelationHeatmap();
    initSectorChart();
    initFactorChart();
  }

  // ---- 1. Portfolio Performance Line Chart ----
  function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    const perf = DUMMY_DATA.performance;
    const window = 90; // Start with 3M
    const labels = perf.labels.slice(-window);
    const portData = perf.portfolio.slice(-window);
    const benchData = perf.benchmark.slice(-window);

    // Normalize to % return from start
    const portBase = portData[0];
    const benchBase = benchData[0];
    const portPct = portData.map(v => ((v - portBase) / portBase) * 100);
    const benchPct = benchData.map(v => ((v - benchBase) / benchBase) * 100);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Portfolio',
            data: portPct,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#6366f1'
          },
          {
            label: 'Benchmark (S&P 500)',
            data: benchPct,
            borderColor: '#22d3ee',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [5, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#22d3ee'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 11 }, usePointStyle: true, pointStyleWidth: 20 }
          },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
            titleColor: '#f1f5f9', bodyColor: '#94a3b8',
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${fmtPct(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { ...defaultGridOpts },
            ticks: { ...defaultTickOpts, maxRotation: 0, maxTicksLimit: 6,
              callback: (val, idx, ticks) => {
                const d = new Date(labels[val]);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }
          },
          y: {
            grid: { ...defaultGridOpts },
            ticks: { ...defaultTickOpts, callback: v => fmtPct(v) }
          }
        }
      }
    });

    // Time range buttons
    document.querySelectorAll('.perf-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.perf-range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const days = parseInt(btn.dataset.days);
        const L = perf.labels.slice(-days);
        const P = perf.portfolio.slice(-days);
        const B = perf.benchmark.slice(-days);
        const pb = P[0], bb = B[0];
        chart.data.labels = L;
        chart.data.datasets[0].data = P.map(v => ((v - pb) / pb) * 100);
        chart.data.datasets[1].data = B.map(v => ((v - bb) / bb) * 100);
        chart.update('active');
      });
    });

    return chart;
  }

  // ---- 2. Asset Allocation Donut ----
  let allocationChart = null;
  let drillDownActive = false;

  function initAllocationChart() {
    const ctx = document.getElementById('allocationChart');
    if (!ctx) return;

    const alloc = DUMMY_DATA.allocation.byClass;

    allocationChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: alloc.map(a => a.label),
        datasets: [{
          data: alloc.map(a => a.value),
          backgroundColor: alloc.map(a => a.color),
          borderColor: '#07090f',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 11 }, usePointStyle: true, padding: 12 }
          },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`
            }
          }
        },
        onClick: (e, elements) => {
          if (elements.length && !drillDownActive) {
            drillDownActive = true;
            const idx = elements[0].index;
            const item = alloc[idx];
            if (item.sub) {
              drillDownAllocation(item, allocationChart);
              document.getElementById('alloc-back-btn')?.classList.remove('hidden');
            }
          }
        }
      }
    });

    document.getElementById('alloc-back-btn')?.addEventListener('click', () => {
      drillDownActive = false;
      allocationChart.data.labels = alloc.map(a => a.label);
      allocationChart.data.datasets[0].data = alloc.map(a => a.value);
      allocationChart.data.datasets[0].backgroundColor = alloc.map(a => a.color);
      allocationChart.update('active');
      document.getElementById('alloc-back-btn')?.classList.add('hidden');
    });

    return allocationChart;
  }

  function drillDownAllocation(item, chart) {
    const subColors = ['#818cf8', '#a5b4fc', '#c7d2fe', '#ddd6fe', '#e0e7ff'];
    chart.data.labels = item.sub.map(s => s.label);
    chart.data.datasets[0].data = item.sub.map(s => s.value);
    chart.data.datasets[0].backgroundColor = item.sub.map((_, i) => subColors[i % subColors.length]);
    chart.update('active');
  }

  // ---- 3. VaR / CVaR Chart ----
  function initVaRChart() {
    const ctx = document.getElementById('varChart');
    if (!ctx) return;

    const risk = DUMMY_DATA.risk;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['VaR 95%', 'VaR 99%', 'CVaR 95%', 'CVaR 99%'],
        datasets: [{
          label: 'Risk Measure (%)',
          data: [risk.var95, risk.var99, risk.cvar95, risk.cvar99],
          backgroundColor: [
            'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.5)',
            'rgba(239,68,68,0.7)', 'rgba(239,68,68,0.9)'
          ],
          borderColor: ['#f59e0b', '#ef4444', '#ef4444', '#dc2626'],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(239,68,68,0.4)', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(2)}% daily loss` }
          }
        },
        scales: {
          x: {
            grid: { ...defaultGridOpts },
            ticks: { ...defaultTickOpts, callback: v => v + '%' }
          },
          y: { grid: { display: false }, ticks: { ...defaultTickOpts } }
        }
      }
    });
  }

  // ---- 4. Monte Carlo Simulation Fan Chart ----
  function initMonteCarloChart() {
    const ctx = document.getElementById('monteCarloChart');
    if (!ctx) return;

    const bands = getMCBands(DUMMY_DATA.risk.monteCarlo, 252);
    const ndays = 252;
    const labels = Array.from({ length: ndays + 1 }, (_, i) => i === 0 ? 'Now' : `D+${i}`);
    // Only show ~12 labels
    const sparseLabels = labels.map((l, i) => i % 21 === 0 ? l : '');

    const fmtM = v => '$' + (v / 1e6).toFixed(1) + 'M';

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: sparseLabels,
        datasets: [
          {
            label: 'Optimistic (P95)',
            data: bands.p95,
            borderColor: 'rgba(16,185,129,0.5)',
            backgroundColor: 'rgba(16,185,129,0.05)',
            borderWidth: 1, fill: false, tension: 0.3, pointRadius: 0
          },
          {
            label: '75th Pctile',
            data: bands.p75,
            borderColor: 'rgba(99,102,241,0.4)',
            backgroundColor: 'rgba(99,102,241,0.06)',
            borderWidth: 1, fill: '-1', tension: 0.3, pointRadius: 0
          },
          {
            label: 'Median (P50)',
            data: bands.p50,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2.5, fill: false, tension: 0.3, pointRadius: 0
          },
          {
            label: '25th Pctile',
            data: bands.p25,
            borderColor: 'rgba(245,158,11,0.4)',
            backgroundColor: 'rgba(245,158,11,0.04)',
            borderWidth: 1, fill: '+1', tension: 0.3, pointRadius: 0
          },
          {
            label: 'Pessimistic (P5)',
            data: bands.p5,
            borderColor: 'rgba(239,68,68,0.5)',
            backgroundColor: 'rgba(239,68,68,0.04)',
            borderWidth: 1, fill: false, tension: 0.3, pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 10, family: "'Inter', sans-serif" }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtM(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { ...defaultGridOpts }, ticks: { ...defaultTickOpts, maxRotation: 0 } },
          y: {
            grid: { ...defaultGridOpts },
            ticks: { ...defaultTickOpts, callback: v => '$' + (v / 1e6).toFixed(0) + 'M' }
          }
        }
      }
    });
  }

  // ---- 5. Rebalancing Chart ----
  function initRebalancingChart() {
    const ctx = document.getElementById('rebalancingChart');
    if (!ctx) return;

    const targets = DUMMY_DATA.rebalancing.targets;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: targets.map(t => t.class),
        datasets: [
          {
            label: 'Current (%)',
            data: targets.map(t => t.current),
            backgroundColor: targets.map(t => t.color + 'cc'),
            borderColor: targets.map(t => t.color),
            borderWidth: 1.5, borderRadius: 4
          },
          {
            label: 'Target (%)',
            data: targets.map(t => t.target),
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.3)',
            borderWidth: 1.5, borderRadius: 4,
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11, family: "'Inter', sans-serif" }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { ...defaultTickOpts } },
          y: {
            grid: { ...defaultGridOpts },
            ticks: { ...defaultTickOpts, callback: v => v + '%' },
            max: 45
          }
        }
      }
    });
  }

  // ---- 6. Correlation Heatmap (Canvas-drawn) ----
  function initCorrelationHeatmap() {
    const canvas = document.getElementById('correlationHeatmap');
    if (!canvas) return;

    const labels = ASSET_LABELS;
    const matrix = CORRELATION_MATRIX;
    const n = labels.length;
    const size = Math.min(canvas.parentElement.offsetWidth - 80, 340);
    const cellSize = Math.floor(size / n);

    canvas.width = cellSize * n + 80;
    canvas.height = cellSize * n + 60;
    const ctx2 = canvas.getContext('2d');

    function correlationColor(val) {
      if (val >= 0) {
        const r = Math.round(99 + (232 - 99) * val);
        const g = Math.round(102 + (130 - 102) * val);
        const b = Math.round(241 + (241 - 241) * val);
        return `rgba(${r},${g},${b},${0.3 + val * 0.7})`;
      } else {
        const intensity = Math.abs(val);
        return `rgba(239,68,68,${0.2 + intensity * 0.6})`;
      }
    }

    // Draw cells
    matrix.forEach((row, i) => {
      row.forEach((val, j) => {
        const x = j * cellSize + 70;
        const y = i * cellSize + 30;
        ctx2.fillStyle = correlationColor(val);
        ctx2.fillRect(x, y, cellSize - 2, cellSize - 2);
        ctx2.fillStyle = val > 0.3 ? '#f1f5f9' : '#94a3b8';
        ctx2.font = `${Math.floor(cellSize * 0.28)}px JetBrains Mono, monospace`;
        ctx2.textAlign = 'center';
        ctx2.fillText(val.toFixed(2), x + cellSize / 2, y + cellSize / 2 + 4);
      });
    });

    // Row labels
    ctx2.fillStyle = '#94a3b8';
    ctx2.font = '11px Inter, sans-serif';
    ctx2.textAlign = 'right';
    labels.forEach((l, i) => ctx2.fillText(l, 64, i * cellSize + 30 + cellSize / 2 + 4));

    // Column labels
    ctx2.textAlign = 'center';
    labels.forEach((l, j) => ctx2.fillText(l, j * cellSize + 70 + cellSize / 2, 22));
  }

  // ---- 7. Sector Bar Chart ----
  function initSectorChart() {
    const ctx = document.getElementById('sectorChart');
    if (!ctx) return;

    const sectors = DUMMY_DATA.allocation.bySector;
    const sectorColors = ['#6366f1','#22d3ee','#a78bfa','#f59e0b','#34d399','#f97316','#64748b'];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sectors.map(s => s.label),
        datasets: [{
          label: 'Allocation (%)',
          data: sectors.map(s => s.value),
          backgroundColor: sectorColors,
          borderRadius: 5, borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false },
          tooltip: {
            backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.parsed.x}%` }
          }
        },
        scales: {
          x: { grid: { ...defaultGridOpts }, ticks: { ...defaultTickOpts, callback: v => v + '%' } },
          y: { grid: { display: false }, ticks: { ...defaultTickOpts } }
        }
      }
    });
  }

  // ---- 8. Factor Exposure Chart (horizontal bar) ----
  function initFactorChart() {
    const ctx = document.getElementById('factorChart');
    if (!ctx) return;
    const factors = DUMMY_DATA.factors;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: factors.map(f => f.name),
        datasets: [
          {
            label: 'Portfolio Exposure',
            data: factors.map(f => f.exposure),
            backgroundColor: factors.map(f => f.exposure >= 0 ? 'rgba(99,102,241,0.7)' : 'rgba(239,68,68,0.7)'),
            borderRadius: 4, borderSkipped: false
          },
          {
            label: 'Benchmark',
            data: factors.map(f => f.benchmark),
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4, borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11, family: "'Inter', sans-serif" } } },
          tooltip: { backgroundColor: '#1a2234', borderColor: 'rgba(99,102,241,0.4)', borderWidth: 1 }
        },
        scales: {
          x: { grid: { ...defaultGridOpts }, ticks: { ...defaultTickOpts } },
          y: { grid: { display: false }, ticks: { ...defaultTickOpts } }
        }
      }
    });
  }

  // ---- Gauge SVG ----
  function drawGauge(canvasId, value, max, label, color) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const pct = value / max;
    const svgNS = 'http://www.w3.org/2000/svg';
    const r = 60, cx = 90, cy = 80;
    const startAngle = -220 * (Math.PI / 180);
    const endAngle = 40 * (Math.PI / 180);
    const valueAngle = startAngle + (endAngle - startAngle) * pct;

    function polarToCart(angle) {
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    }

    function arcPath(start, end) {
      const [sx, sy] = polarToCart(start);
      const [ex, ey] = polarToCart(end);
      const large = (end - start) > Math.PI ? 1 : 0;
      return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    }

    el.innerHTML = `
      <svg viewBox="0 0 180 140" xmlns="${svgNS}" style="width:100%;height:100%">
        <path d="${arcPath(startAngle, endAngle)}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12" stroke-linecap="round"/>
        <path d="${arcPath(startAngle, valueAngle)}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"
          style="filter:drop-shadow(0 0 8px ${color}88)"/>
        <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="#f1f5f9" font-size="28" font-weight="700" font-family="Outfit, sans-serif">${value}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#64748b" font-size="10" font-family="Inter, sans-serif">${label}</text>
        <text x="${cx}" y="${cy + 34}" text-anchor="middle" fill="${color}" font-size="10" font-weight="600" font-family="Inter, sans-serif">${value} / ${max}</text>
      </svg>`;
  }

  // ---- Stress Test Update ----
  function updateStressTest(shockPct) {
    const scenarios = DUMMY_DATA.risk.stressScenarios;
    const container = document.getElementById('stress-bars');
    if (!container) return;

    const multiplier = shockPct / 30; // scale relative to -30% reference shock
    container.innerHTML = '';

    scenarios.forEach(s => {
      const adjusted = (s.impact * multiplier).toFixed(1);
      const width = Math.min(Math.abs(adjusted) / 35 * 100, 100);
      container.innerHTML += `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:12px;color:var(--text-secondary)">${s.name}</span>
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--accent-red)">${adjusted}%</span>
          </div>
          <div style="background:var(--bg-surface);border-radius:var(--radius-full);height:6px;overflow:hidden">
            <div style="width:${width}%;height:100%;background:linear-gradient(90deg,#ef4444,#f97316);border-radius:var(--radius-full);transition:width 0.4s ease"></div>
          </div>
        </div>`;
    });
  }

  return { initAll, initPerformanceChart, drawGauge, updateStressTest, initCorrelationHeatmap };
})();
