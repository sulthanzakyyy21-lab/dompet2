const analytics = {
  trendChart: null,
  doughnutChart: null,

  renderCharts() {
    const filteredTxs = state.transactions.filter(tx => {
      const d = new Date(tx.fullDate);
      return d.getMonth() === state.filterMonth && d.getFullYear() === state.filterYear;
    });

    this.renderTrendChart(filteredTxs);
    this.renderDoughnutChart(filteredTxs);
  },

  renderTrendChart(filteredTxs) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const daysInMonth = new Date(state.filterYear, state.filterMonth + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => `Tgl ${i + 1}`);
    const incomeData = new Array(daysInMonth).fill(0);
    const expenseData = new Array(daysInMonth).fill(0);

    filteredTxs.forEach(tx => {
      const day = new Date(tx.fullDate).getDate();
      if (tx.type === 'in') {
        incomeData[day - 1] += Number(tx.amount);
      } else if (tx.type === 'out') {
        expenseData[day - 1] += Number(tx.amount);
      }
    });

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    Chart.defaults.color = '#64748b'; // slate-500
    Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    // Create subtle gradient fills
    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGradient.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    incomeGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 300);
    expenseGradient.addColorStop(0, 'rgba(239, 68, 68, 0.16)');
    expenseGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Arus Kas Masuk',
            data: incomeData,
            borderColor: '#059669', // emerald-600
            backgroundColor: incomeGradient,
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointBackgroundColor: '#059669',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 2.5,
            pointHoverRadius: 5
          },
          {
            label: 'Arus Kas Keluar',
            data: expenseData,
            borderColor: '#dc2626', // red-600
            backgroundColor: expenseGradient,
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointBackgroundColor: '#dc2626',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 2.5,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top',
            align: 'end',
            labels: { 
              boxWidth: 8, 
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: { size: 12, weight: '600' } 
            } 
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: '700' },
            bodyFont: { size: 12, weight: '500' },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${utils.formatRupiah(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { display: false }, 
            ticks: { 
              font: { size: 11, weight: '500' },
              maxTicksLimit: 10
            } 
          },
          y: { 
            beginAtZero: true, 
            grid: { color: '#f1f5f9' },
            ticks: { 
              font: { size: 11, weight: '500' },
              callback: (value) => value >= 1000000 ? 'Rp ' + (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? 'Rp ' + (value / 1000).toFixed(0) + 'k' : 'Rp ' + value
            } 
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  },

  renderDoughnutChart(filteredTxs) {
    const canvas = document.getElementById('doughnutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const walletExpenses = {};
    state.wallets.forEach(w => walletExpenses[w.id] = 0);

    filteredTxs.forEach(tx => {
      if (tx.type === 'out' && walletExpenses[tx.walletId] !== undefined) {
        walletExpenses[tx.walletId] += Number(tx.amount);
      }
    });

    const labels = [];
    const data = [];
    const backgroundColors = [];

    state.wallets.forEach(w => {
      if (walletExpenses[w.id] > 0) {
        labels.push(w.name);
        data.push(walletExpenses[w.id]);
        backgroundColors.push(w.hex || '#0284c7');
      }
    });

    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }

    if (data.length === 0) {
      labels.push('Belum ada transaksi');
      data.push(1);
      backgroundColors.push('#f1f5f9');
    }

    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              boxWidth: 8, 
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
              font: { size: 11, weight: '600' } 
            } 
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                if (data.length === 1 && data[0] === 1 && labels[0] === 'Belum ada transaksi') return ' Rp 0';
                return ' ' + context.label + ': ' + utils.formatRupiah(context.raw);
              }
            }
          }
        },
        cutout: '72%'
      }
    });
  }
};
