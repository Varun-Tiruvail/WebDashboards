// Main App Controller

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme
    const themeBtn = document.getElementById('theme-toggle-btn');
    const htmlEl = document.documentElement;
    
    // Default to dark as requested
    let currentTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
        if(window.updateChartsTheme) window.updateChartsTheme();
    });

    function updateThemeIcon() {
        const icon = themeBtn.querySelector('i');
        if (currentTheme === 'dark') {
            icon.setAttribute('data-feather', 'sun');
        } else {
            icon.setAttribute('data-feather', 'moon');
        }
        feather.replace(); // Refresh icon
    }

    // 2. Populate ABC-XYZ Table
    const tbody = document.getElementById('abc-table-body');
    const data = window.MockData.abcXyz.slice(0, 5); // Take top 5 for the small table
    
    data.forEach(item => {
        const tr = document.createElement('tr');
        
        // Coloring badge based on classification
        let badgeClass = 'badge-success'; // A-X
        if(item.class.includes('C-Z')) badgeClass = 'badge-danger';
        else if(item.class.includes('B') || item.class.includes('Y')) badgeClass = 'badge-warning';

        tr.innerHTML = `
            <td>${item.subCat}</td>
            <td><span class="badge ${badgeClass}">${item.class}</span></td>
            <td>$${(item.revenue/1000).toFixed(1)}k</td>
            <td>${item.turnoverRatio}x</td>
        `;
        tbody.appendChild(tr);
    });

    // 3. Populate Alert Ticker
    const tickerList = document.getElementById('ticker-list');
    const operationalAlerts = [
        `🔴 Storage anomaly detected in Warehouse 3 (Green Leafy Veg overstock)`,
        `🟡 Supplier 'TechCorp' delayed by 2 days for Laptops`,
        `🟢 High GMROII achieved on Winter Jackets last week`,
        `🔴 Shrinkage risk: Beauty Products category (Face Serum)`,
        `🟡 Approaching stockout for Cola in Store B`
    ];

    operationalAlerts.forEach(alertText => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        // Give icon based on first character
        let icon = 'info';
        if(alertText.startsWith('🔴')) icon = 'alert-circle';
        if(alertText.startsWith('🟡')) icon = 'alert-triangle';
        if(alertText.startsWith('🟢')) icon = 'check-circle';
        
        div.innerHTML = `<i data-feather="${icon}"></i> ${alertText.substring(2)}`;
        tickerList.appendChild(div);
    });

    // 4. Populate AI Action List (Panel 4)
    const actionList = document.getElementById('action-list-container');
    const actions = window.MockData.alerts;

    actions.forEach(action => {
        const div = document.createElement('div');
        div.className = `action-card action-${action.type}`;
        
        let icon = 'arrow-right';
        if(action.type === 'reduce') icon = 'trending-down';
        if(action.type === 'increase') icon = 'trending-up';
        if(action.type === 'transfer') icon = 'refresh-cw';

        div.innerHTML = `
            <div class="action-icon"><i data-feather="${icon}"></i></div>
            <div class="action-details">
                <div class="action-title">${action.type.toUpperCase()}: ${action.target}</div>
                <div class="action-desc">${action.desc}</div>
            </div>
            <button class="theme-toggle" style="border:none;background:transparent;align-self:center;"><i data-feather="check"></i></button>
        `;
        actionList.appendChild(div);
    });

    // 5. Populate Redistribution Actions (Tab 3)
    const redisActions = document.getElementById('redistribution-actions');
    if (redisActions) {
        window.MockData.redistribution.forEach(route => {
            const div = document.createElement('div');
            div.className = 'action-card action-transfer';
            div.innerHTML = `
                <div class="action-icon"><i data-feather="refresh-cw"></i></div>
                <div class="action-details">
                    <div class="action-title">${route.from} ➔ ${route.to}</div>
                    <div class="action-desc">Transfer ${route.volume} units of ${route.category}</div>
                </div>
            `;
            redisActions.appendChild(div);
        });
    }

    // 6. Sidebar Navigation Logic (SPA Routing)
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const topbarTitle = document.getElementById('topbar-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            // Hide all views
            views.forEach(view => {
                view.classList.remove('active');
                // Force a reflow to restart CSS animation when they become active again
                void view.offsetWidth; 
            });

            // Show target view
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Update top title
            if(topbarTitle) {
                topbarTitle.innerText = item.innerText;
            }

            // Important: Chart.js sometimes needs to resize when a hidden canvas becomes visible
            // We dispatch a window resize event to force Chart.js to recalculate on the new visible canvas
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        });
    });

    // Initialize Feather Icons
    feather.replace();

    // Initialize Charts
    if(window.initializeCharts) {
        window.initializeCharts();
    }
});
