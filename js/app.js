// Main App Controller
const App = {
  state: { expenses: [], income: [], budget: 0, theme: 'light' },
  
  init() {
    this.loadState();
    this.setupEventListeners();
    this.applyTheme();
    this.render();
  },
  
  loadState() {
    this.state.expenses = Storage.getExpenses();
    this.state.income = Storage.getIncome();
    this.state.budget = Storage.getBudget();
    this.state.theme = Storage.getTheme();
  },
  
  setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => this.handleNavigation(e));
    });
    
    document.getElementById('expense-form').addEventListener('submit', e => this.handleAddExpense(e));
    document.getElementById('income-form').addEventListener('submit', e => this.handleAddIncome(e));
    document.getElementById('budget-form').addEventListener('submit', e => this.handleSetBudget(e));
    document.getElementById('exp-search').addEventListener('input', () => this.renderExpenses());
    document.getElementById('inc-search').addEventListener('input', () => this.renderIncome());
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    hamburger?.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });
    
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
    
    document.getElementById('export-csv')?.addEventListener('click', () => {
      Storage.exportCSV('expenses');
      Storage.exportCSV('income');
      this.showNotification('CSV exported', 'success');
    });
    
    document.getElementById('backup-data')?.addEventListener('click', () => {
      Storage.backupData();
      this.showNotification('Data backed up', 'success');
    });
    
    document.getElementById('restore-data')?.addEventListener('click', () => {
      document.getElementById('restore-file').click();
    });
    
    document.getElementById('restore-file')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target.result);
            if (Storage.restoreData(data)) {
              this.loadState();
              this.render();
              this.showNotification('Data restored', 'success');
            }
          } catch (err) {
            this.showNotification('Invalid file', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
  },
  
  handleNavigation(e) {
    e.preventDefault();
    const section = e.currentTarget.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    e.currentTarget.classList.add('active');
    if (section === 'analytics') {
      setTimeout(() => Charts.updateAllCharts(this.state.expenses, this.state.income), 100);
    }
  },
  
  handleAddExpense(e) {
    e.preventDefault();
    const form = e.target;
    const amount = parseFloat(form.querySelector('#exp-amount').value);
    const category = form.querySelector('#exp-category').value;
    const date = form.querySelector('#exp-date').value;
    const notes = form.querySelector('#exp-notes').value;
    if (!amount || !category || !date) {
      this.showNotification('Fill required fields', 'error');
      return;
    }
    Storage.addExpense({ amount, category, date, notes });
    this.state.expenses = Storage.getExpenses();
    form.reset();
    form.querySelector('#exp-date').valueAsDate = new Date();
    this.render();
    this.showNotification('Expense added', 'success');
  },
  
  handleAddIncome(e) {
    e.preventDefault();
    const form = e.target;
    const amount = parseFloat(form.querySelector('#inc-amount').value);
    const source = form.querySelector('#inc-source').value;
    const date = form.querySelector('#inc-date').value;
    const notes = form.querySelector('#inc-notes').value;
    if (!amount || !source || !date) {
      this.showNotification('Fill required fields', 'error');
      return;
    }
    Storage.addIncome({ amount, source, date, notes });
    this.state.income = Storage.getIncome();
    form.reset();
    form.querySelector('#inc-date').valueAsDate = new Date();
    this.render();
    this.showNotification('Income added', 'success');
  },
  
  handleSetBudget(e) {
    e.preventDefault();
    const amount = parseFloat(e.target.querySelector('#budget-amount').value);
    if (!amount || amount <= 0) {
      this.showNotification('Enter valid amount', 'error');
      return;
    }
    Storage.setBudget(amount);
    this.state.budget = amount;
    e.target.reset();
    this.render();
    this.showNotification('Budget set', 'success');
  },
  
  render() {
    this.renderMetrics();
    this.renderExpenses();
    this.renderIncome();
    this.renderBudget();
  },
  
  renderMetrics() {
    const today = Calculations.calculateTodayExpenses(this.state.expenses);
    const week = Calculations.calculateWeekExpenses(this.state.expenses);
    const month = Calculations.calculateMonthExpenses(this.state.expenses);
    const totalIncome = Calculations.calculateTotalIncome(this.state.income);
    const balance = Calculations.calculateBalance(this.state.income, this.state.expenses);
    
    document.getElementById('today-expenses').textContent = Calculations.formatCurrency(today);
    document.getElementById('week-expenses').textContent = Calculations.formatCurrency(week);
    document.getElementById('month-expenses').textContent = Calculations.formatCurrency(month);
    document.getElementById('total-income').textContent = Calculations.formatCurrency(totalIncome);
    document.getElementById('balance').textContent = Calculations.formatCurrency(balance);
    document.getElementById('budget-status').textContent = Calculations.formatCurrency(this.state.budget);
    
    const balanceEl = document.getElementById('balance');
    balanceEl.style.color = balance < 0 ? '#e74c3c' : balance > 0 ? '#27ae60' : '#2c3e50';
  },
  
  renderExpenses() {
    const tbody = document.querySelector('#exp-table tbody');
    const search = document.getElementById('exp-search').value.toLowerCase();
    let filtered = this.state.expenses.filter(e => e.category.toLowerCase().includes(search) || e.notes.toLowerCase().includes(search));
    
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No expenses</td></tr>';
      return;
    }
    
    tbody.innerHTML = filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => {
      const dateStr = new Date(e.date).toLocaleDateString();
      return '<tr><td>' + dateStr + '</td><td>' + e.category + '</td><td>' + Calculations.formatCurrency(e.amount) + '</td><td>' + e.notes + '</td><td><button onclick="App.deleteExpense(\'' + e.id + '\')" style="background:#e74c3c;padding:4px 8px;font-size:12px;color:white;border:none;border-radius:4px;cursor:pointer;">Delete</button></td></tr>';
    }).join('');
  },
  
  renderIncome() {
    const tbody = document.querySelector('#inc-table tbody');
    const search = document.getElementById('inc-search').value.toLowerCase();
    let filtered = this.state.income.filter(i => i.source.toLowerCase().includes(search) || i.notes.toLowerCase().includes(search));
    
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No income</td></tr>';
      return;
    }
    
    tbody.innerHTML = filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(i => {
      const dateStr = new Date(i.date).toLocaleDateString();
      return '<tr><td>' + dateStr + '</td><td>' + i.source + '</td><td>' + Calculations.formatCurrency(i.amount) + '</td><td>' + i.notes + '</td><td><button onclick="App.deleteIncome(\'' + i.id + '\')" style="background:#e74c3c;padding:4px 8px;font-size:12px;color:white;border:none;border-radius:4px;cursor:pointer;">Delete</button></td></tr>';
    }).join('');
  },
  
  renderBudget() {
    if (this.state.budget <= 0) {
      document.getElementById('budget-text').textContent = 'No budget set';
      document.getElementById('budget-fill').style.width = '0%';
      return;
    }
    const spent = Calculations.calculateMonthExpenses(this.state.expenses);
    const usage = Calculations.calculateBudgetUsage(this.state.expenses, this.state.budget);
    const fill = document.getElementById('budget-fill');
    fill.style.width = Math.min(100, usage) + '%';
    fill.className = 'progress-fill';
    if (usage >= 100) fill.classList.add('critical');
    else if (usage >= 80) fill.classList.add('warning');
    document.getElementById('budget-text').textContent = Calculations.formatCurrency(spent) + ' / ' + Calculations.formatCurrency(this.state.budget) + ' (' + usage.toFixed(0) + '%)';
  },
  
  deleteExpense(id) {
    if (confirm('Delete this expense?')) {
      Storage.deleteExpense(id);
      this.state.expenses = Storage.getExpenses();
      this.render();
      this.showNotification('Deleted', 'success');
    }
  },
  
  deleteIncome(id) {
    if (confirm('Delete this income?')) {
      Storage.deleteIncome(id);
      this.state.income = Storage.getIncome();
      this.render();
      this.showNotification('Deleted', 'success');
    }
  },
  
  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.state.theme = newTheme;
    Storage.setTheme(newTheme);
    this.applyTheme();
  },
  
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
  },
  
  showNotification(msg, type = 'success') {
    const notif = document.getElementById('notification');
    notif.textContent = msg;
    notif.className = 'notification show ' + (type === 'error' ? 'error' : '');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.getElementById('exp-date').valueAsDate = new Date();
  document.getElementById('inc-date').valueAsDate = new Date();
});

