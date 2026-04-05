// ============================================================
// WealthPortfolio - Export Utility
// ============================================================

const ExportUtil = (() => {

  function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ---- Export as PNG using html2canvas ----
  async function exportPNG(elementId, filename = 'export') {
    try {
      showToast('Capturing screenshot...', '');
      // Dynamically load html2canvas if not present
      if (typeof html2canvas === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }
      const el = document.getElementById(elementId);
      const canvas = await html2canvas(el, { backgroundColor: '#111827', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('PNG exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('PNG export failed. Try again.', 'error');
    }
  }

  // ---- Export as PDF (using jsPDF + html2canvas) ----
  async function exportPDF(elementId, filename = 'export', title = 'WealthPortfolio Report') {
    try {
      showToast('Generating PDF...', '');
      if (typeof html2canvas === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }
      if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      const el = document.getElementById(elementId);
      const canvas = await html2canvas(el, { backgroundColor: '#111827', scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });

      // Header
      pdf.setFillColor(7, 9, 15);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`WealthPortfolio — ${title}`, 14, 14);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | DEMO DATA`, 14, 22);

      // Content
      pdf.addImage(imgData, 'PNG', 0, 32, canvas.width / 2, canvas.height / 2 - 32);

      // Footer
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(7);
      pdf.setTextColor(75, 85, 99);
      pdf.text('⚠ This document contains simulated demo data only. Not for investment decisions.', 14, pageH - 8);

      pdf.save(`${filename}.pdf`);
      showToast('PDF exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast(`PDF export failed: ${e.message}`, 'error');
    }
  }

  // ---- Export data as CSV ----
  function exportCSV(data, filename = 'export', columns = null) {
    if (!data || !data.length) {
      showToast('No data to export', 'error');
      return;
    }
    const headers = columns || Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val ?? '';
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    showToast('CSV exported successfully!', 'success');
  }

  // ---- Export data as Excel (XLSX) ----
  async function exportExcel(data, filename = 'export', sheetName = 'Sheet1') {
    if (!data || !data.length) {
      showToast('No data to export', 'error');
      return;
    }
    try {
      if (typeof XLSX === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${filename}.xlsx`);
      showToast('Excel exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Excel export failed.', 'error');
    }
  }

  // ---- Helper: load script dynamically ----
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ---- Generate full report PDF ----
  async function generateFullReport(clientId) {
    showToast('Generating full client report...', '');
    const client = DUMMY_DATA.clients.find(c => c.id === clientId);
    if (!client) return;

    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' });

    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    // Cover page background
    pdf.setFillColor(7, 9, 15);
    pdf.rect(0, 0, W, H, 'F');

    // Accent line
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, W, 6, 'F');

    // Title block
    pdf.setFontSize(28); pdf.setTextColor(241, 245, 249);
    pdf.text('WealthPortfolio', 60, 120);
    pdf.setFontSize(14); pdf.setTextColor(148, 163, 184);
    pdf.text('Portfolio Analytics Report', 60, 148);

    pdf.setFontSize(11); pdf.setTextColor(167, 139, 250);
    pdf.text(`Client: ${client.name}`, 60, 200);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Advisor: ${client.advisor}`, 60, 220);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 60, 240);
    pdf.text(`Report Period: Q1 2026`, 60, 260);

    // Key metrics box
    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(60, 300, W - 120, 160, 8, 8, 'F');
    pdf.setFontSize(10); pdf.setTextColor(99, 102, 241);
    pdf.text('PORTFOLIO SUMMARY', 80, 325);

    const metrics = [
      ['Total AUM', `$${(client.aum / 1e6).toFixed(2)}M`],
      ['1-Year Return', `${client.return1y}%`],
      ['Risk Profile', client.riskProfile],
      ['Accounts', String(client.accounts)],
      ['Last Review', client.lastReview],
      ['Status', client.status]
    ];
    metrics.forEach(([label, value], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 80 + col * 150;
      const y = 345 + row * 50;
      pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
      pdf.text(label, x, y);
      pdf.setFontSize(13); pdf.setTextColor(241, 245, 249);
      pdf.text(value, x, y + 14);
    });

    // Holdings page
    pdf.addPage();
    pdf.setFillColor(7, 9, 15);
    pdf.rect(0, 0, W, H, 'F');
    pdf.setFillColor(99, 102, 241);
    pdf.rect(0, 0, W, 4, 'F');

    pdf.setFontSize(16); pdf.setTextColor(241, 245, 249);
    pdf.text('Holdings Overview', 60, 50);

    // Table header
    const colsH = ['Ticker', 'Name', 'Class', 'Value ($)', 'Weight (%)', '1Y Return (%)'];
    const colWH = [60, 160, 90, 90, 80, 80];
    let xH = 60, yH = 80;
    pdf.setFillColor(17, 24, 39);
    pdf.rect(xH, yH - 14, W - 120, 20, 'F');
    pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
    colsH.forEach((c, i) => { pdf.text(c.toUpperCase(), xH, yH); xH += colWH[i]; });

    yH += 12;
    DUMMY_DATA.holdings.forEach((h, idx) => {
      let xR = 60;
      pdf.setFontSize(9); pdf.setTextColor(241, 245, 249);
      if (idx % 2 === 0) { pdf.setFillColor(17, 24, 39); pdf.rect(60, yH - 10, W - 120, 18, 'F'); }
      const row = [h.ticker, h.name.substring(0, 24), h.class, `$${h.value.toLocaleString()}`, `${h.weight}%`, `${h.return1y > 0 ? '+' : ''}${h.return1y}%`];
      row.forEach((val, j) => {
        if (j === 5) pdf.setTextColor(h.return1y >= 0 ? '#10b981' : '#ef4444');
        else pdf.setTextColor(241, 245, 249);
        pdf.text(String(val), xR, yH + 2);
        xR += colWH[j];
      });
      yH += 20;
    });

    // Footer on all pages
    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7); pdf.setTextColor(75, 85, 99);
      pdf.text('⚠ DEMO DATA ONLY — Not for investment decisions. © WealthPortfolio Analytics.', 60, H - 20);
      pdf.text(`Page ${i} of ${pages}`, W - 80, H - 20);
    }

    pdf.save(`WealthPortfolio_Report_${client.name.replace(/\s+/g, '_')}.pdf`);
    showToast('Full report generated!', 'success');
  }

  // ---- Show export dropdown ----
  function setupExportDropdown(dropdownId, tileId, filenameBase, csvDataFn) {
    const wrapper = document.getElementById(dropdownId);
    if (!wrapper) return;
    const btn = wrapper.querySelector('.export-btn');
    const menu = wrapper.querySelector('.export-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));

    wrapper.querySelector('[data-export="png"]')?.addEventListener('click', (e) => {
      e.stopPropagation(); menu.classList.remove('open');
      exportPNG(tileId, filenameBase);
    });
    wrapper.querySelector('[data-export="pdf"]')?.addEventListener('click', (e) => {
      e.stopPropagation(); menu.classList.remove('open');
      exportPDF(tileId, filenameBase, filenameBase);
    });
    wrapper.querySelector('[data-export="csv"]')?.addEventListener('click', (e) => {
      e.stopPropagation(); menu.classList.remove('open');
      if (csvDataFn) exportCSV(csvDataFn(), filenameBase);
    });
    wrapper.querySelector('[data-export="xlsx"]')?.addEventListener('click', (e) => {
      e.stopPropagation(); menu.classList.remove('open');
      if (csvDataFn) exportExcel(csvDataFn(), filenameBase);
    });
  }

  return { exportPNG, exportPDF, exportCSV, exportExcel, generateFullReport, setupExportDropdown, showToast };
})();
