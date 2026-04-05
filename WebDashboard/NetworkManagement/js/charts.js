// Network Management Dashboard - Chart initializations

// Generic Chart Defaults for premium look
Chart.defaults.color = '#a1a1aa'; // default muted text
Chart.defaults.font.family = "'Inter', sans-serif";

let charts = {};

function getThemeColors() {
    return {
        gridColor: document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        textColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#52525b' : '#a1a1aa'
    };
}

function initScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    const { gridColor, textColor } = getThemeColors();
    
    // Split data into good vs bad for different coloring
    const data = window.MockData.gmroii;
    
    charts.scatter = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Products (Size = Revenue)',
                data: data,
                backgroundColor: data.map(d => {
                    // Bottom left quadrant is bad (low turnover, low gmroii)
                    if(d.x < 2 && d.y < 2) return 'rgba(239, 68, 68, 0.6)'; // Danger
                    if(d.x > 6 && d.y > 3) return 'rgba(16, 185, 129, 0.6)'; // Success
                    return 'rgba(59, 130, 246, 0.6)'; // Primary
                }),
                borderColor: data.map(d => {
                    if(d.x < 2 && d.y < 2) return 'rgba(239, 68, 68, 1)';
                    if(d.x > 6 && d.y > 3) return 'rgba(16, 185, 129, 1)';
                    return 'rgba(59, 130, 246, 1)';
                }),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.label} (${ctx.raw.category}) - Turns: ${ctx.raw.x}, GMROII: ${ctx.raw.y}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Turnover Ratio' },
                    grid: { color: gridColor }
                },
                y: {
                    title: { display: true, text: 'GMROII' },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function initVelocityFunnel() {
    // using a bar chart rotated (horizontal) to simulate a ordered velocity
    const ctx = document.getElementById('velocityChart').getContext('2d');
    const { gridColor } = getThemeColors();
    const data = window.MockData.velocity;

    charts.velocity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                label: 'Sales Velocity (Units/Day)',
                data: data.map(d => d.velocity),
                backgroundColor: data.map(d => d.color),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: gridColor } },
                y: { grid: { display: false } }
            }
        }
    });
}

function initCongestionChart() {
    const ctx = document.getElementById('congestionChart').getContext('2d');
    const data = window.MockData.congestion;

    charts.congestion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Storage Utilization (%)',
                data: data.data,
                backgroundColor: data.turnoverIndication,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10 } },
                tooltip: {
                    callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}% Space` }
                }
            }
        }
    });
}

function initForecastChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    const { gridColor } = getThemeColors();
    const data = window.MockData.forecast;

    charts.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: [
                {
                    label: 'Actual Sales',
                    data: data.actual,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Forecast',
                    data: data.forecast,
                    borderColor: '#3b82f6',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Upper Limit (Tolerance)',
                    data: data.upperLimit,
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: '+1', // fill to lower limit
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Lower Limit',
                    data: data.lowerLimit,
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false, // Ensures hover tracks all lines at once
            },
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: gridColor }, title: { display: true, text: 'Units' } }
            }
        }
    });
}

function initStoreCharts() {
    const { gridColor } = getThemeColors();
    const data = window.MockData.store;
    
    if(document.getElementById('storeFootfallChart')) {
        charts.storeFootfall = new Chart(document.getElementById('storeFootfallChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    { label: 'Footfall', data: data.footfall, backgroundColor: 'rgba(59, 130, 246, 0.7)' },
                    { label: 'Conversion (%)', data: data.conversion, type: 'line', borderColor: '#10b981', yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: gridColor }, type: 'linear', position: 'left' },
                    y1: { grid: { display: false }, type: 'linear', position: 'right', max: 100 }
                }
            }
        });
    }

    if(document.getElementById('storeStockoutChart')) {
        charts.storeStockout = new Chart(document.getElementById('storeStockoutChart').getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.stockoutRisk,
                    backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)', 'rgba(59,130,246,0.7)']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

function initRedistributionCharts() {
    const { gridColor } = getThemeColors();
    
    if(document.getElementById('redistributionNetwork')) {
        const routeData = window.MockData.redistribution;
        charts.redisNetwork = new Chart(document.getElementById('redistributionNetwork').getContext('2d'), {
            type: 'bar',
            data: {
                labels: routeData.map(r => r.from + ' ➔ ' + r.to),
                datasets: [{ label: 'Transfer Volume (Units)', data: routeData.map(r => r.volume), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 4 }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor } }, y: { grid: { display: false } } } }
        });
    }

    if(document.getElementById('savingsChart')) {
        charts.savings = new Chart(document.getElementById('savingsChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{ label: 'Savings from Transfers ($)', data: [1200, 2500, 1800, 3200], borderColor: '#10b981', tension: 0.4, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.1)' }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }}, y: { grid: { color: gridColor } } } }
        });
    }
}

function initRegionalCharts() {
    const { gridColor } = getThemeColors();
    const data = window.MockData.regional;

    if(document.getElementById('regionalBarChart')) {
        charts.regionalBar = new Chart(document.getElementById('regionalBarChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ["Electronics", "Seasonal Veg", "Leafy Veg", "Drinks", "Clothes", "Beauty"],
                datasets: [
                    { label: 'North', data: data.dominance[0], backgroundColor: '#3b82f6' },
                    { label: 'South', data: data.dominance[1], backgroundColor: '#10b981' },
                    { label: 'East', data: data.dominance[2], backgroundColor: '#f59e0b' },
                    { label: 'West', data: data.dominance[3], backgroundColor: '#8b5cf6' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: gridColor } } } }
        });
    }

    if(document.getElementById('regionalPieChart')) {
        charts.regionalPie = new Chart(document.getElementById('regionalPieChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels: data.labels, datasets: [{ data: data.marketShare, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
        });
    }

    if(document.getElementById('regionalTrendChart')) {
        charts.regionalTrend = new Chart(document.getElementById('regionalTrendChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: data.trend.months,
                datasets: data.labels.map((region, i) => ({
                    label: region, data: data.trend[region], borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i], tension: 0.4
                }))
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }}, y: { grid: { color: gridColor } } } }
        });
    }
}

function initSupplierCharts() {
    const { gridColor } = getThemeColors();
    const data = window.MockData.supplier;

    if(document.getElementById('supplierLeadTime')) {
        charts.suppLead = new Chart(document.getElementById('supplierLeadTime').getContext('2d'), {
            type: 'bar',
            data: { labels: data.labels, datasets: [{ label: 'Lead Time Variance (Days)', data: data.leadTimeVar, backgroundColor: 'rgba(245, 158, 11, 0.7)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display:false }}, y: { grid: { color: gridColor } } } }
        });
    }

    if(document.getElementById('supplierDefect')) {
        charts.suppDefect = new Chart(document.getElementById('supplierDefect').getContext('2d'), {
            type: 'bar',
            data: { labels: data.labels, datasets: [{ label: 'Defect Rate (%)', data: data.defectRate, backgroundColor: 'rgba(239, 68, 68, 0.7)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display:false }}, y: { grid: { color: gridColor } } } }
        });
    }
}

function initPredictiveCharts() {
    const { gridColor } = getThemeColors();
    const data = window.MockData.predictive;
    
    if(document.getElementById('predictiveModelChart')) {
        charts.predictiveModel = new Chart(document.getElementById('predictiveModelChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                    { label: 'Base Demand', data: [100, 105, 110, 130, 150, 160, 170, 160, 140, 120, 130, 150], borderColor: '#10b981', tension: 0.4 },
                    { label: 'Seasonal Overlay (AI)', data: [110, 90, 130, 150, 180, 200, 210, 190, 150, 110, 150, 190], borderColor: '#3b82f6', borderDash: [5,5], tension: 0.4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display:false }}, y: { grid: { color: gridColor } } } }
        });
    }

    if(document.getElementById('confidenceChart')) {
        charts.predictiveConf = new Chart(document.getElementById('confidenceChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ["Model A", "Model B", "Model C", "Ensemble"],
                datasets: [{ label: 'Score (%)', data: [75, 82, 68, 92], backgroundColor: ['rgba(16, 185, 129, 0.4)','rgba(16, 185, 129, 0.6)','rgba(16, 185, 129, 0.2)','rgba(16, 185, 129, 0.9)'], borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display:false }}, y: { grid: { color: gridColor }, max: 100 } } }
        });
    }

    if(document.getElementById('variablesChart')) {
        charts.predictiveVars = new Chart(document.getElementById('variablesChart').getContext('2d'), {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{ label: 'Variable Weight', data: data.weights, backgroundColor: 'rgba(139, 92, 246, 0.3)', borderColor: '#8b5cf6', pointBackgroundColor: '#8b5cf6' }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: gridColor }, grid: { color: gridColor } } } }
        });
    }
}

window.initializeCharts = function() {
    initScatterChart();
    initVelocityFunnel();
    initCongestionChart();
    initForecastChart();
    
    // Init new tabs
    initStoreCharts();
    initRedistributionCharts();
    initRegionalCharts();
    initSupplierCharts();
    initPredictiveCharts();
}

window.updateChartsTheme = function() {
    const { gridColor, textColor } = getThemeColors();
    Chart.defaults.color = textColor;
    
    // Update grid colors for all charts manually
    Object.values(charts).forEach(chart => {
        if (chart.options.scales) {
            if (chart.options.scales.x && chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
            if (chart.options.scales.y && chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
        }
        chart.update();
    });
}
