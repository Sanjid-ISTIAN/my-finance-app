// Charts Module - Chart.js visualization
const Charts = {
  charts: {},

  init() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded');
      return;
    }
  },

  getChartColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return {
      primary: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#2980b9',
      text: theme === 'dark' ? '#ecf0f1' : '#2c3e50',
      grid: theme === 'dark' ? '#444' : '#e0e0e0'
    };
  },

  destroyChart(canvasId) {
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
    }
  },

  updateCategoryChart(expenses) {
    const data = Calculations.aggregateByCategory(expenses);
    const labels = data.map(d => d.category);
    const amounts = data.map(d => d.total);
    
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    this.destroyChart('categoryChart');
    
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6', '#1abc9c'];
    const ctx = canvas.getContext('2d');
    
    this.charts['categoryChart'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  },

  updateTrendChart(expenses) {
    const data = Calculations.aggregateDailyExpenses(expenses);
    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const amounts = data.map(d => d.amount);
    
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    this.destroyChart('trendChart');
    
    const ctx = canvas.getContext('2d');
    const colors = this.getChartColors();
    
    this.charts['trendChart'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Expenses',
          data: amounts,
          borderColor: colors.primary,
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: colors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '৳' + value.toLocaleString()
            }
          }
        }
      }
    });
  },

  updateComparisonChart(expenses, income) {
    const data = Calculations.aggregateMonthly(expenses, income);
    const labels = data.map(d => new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    const incomeAmounts = data.map(d => d.income);
    const expenseAmounts = data.map(d => d.expenses);
    
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    
    this.destroyChart('comparisonChart');
    
    const ctx = canvas.getContext('2d');
    const colors = this.getChartColors();
    
    this.charts['comparisonChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeAmounts,
            backgroundColor: colors.success
          },
          {
            label: 'Expenses',
            data: expenseAmounts,
            backgroundColor: colors.danger
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '৳' + (value/1000).toFixed(0) + 'k'
            }
          }
        }
      }
    });
  },

  updateAllCharts(expenses, income) {
    this.updateCategoryChart(expenses);
    this.updateTrendChart(expenses);
    this.updateComparisonChart(expenses, income);
  }
};

// Initialize charts when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Charts.init());
} else {
  Charts.init();
}
