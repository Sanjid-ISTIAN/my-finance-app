// Storage Module - Data persistence layer
const Storage = {
  KEY_EXPENSES: 'expenses',
  KEY_INCOME: 'income',
  KEY_BUDGET: 'budget',
  KEY_THEME: 'theme',

  init() {
    if (!this.get(this.KEY_EXPENSES)) this.set(this.KEY_EXPENSES, []);
    if (!this.get(this.KEY_INCOME)) this.set(this.KEY_INCOME, []);
    if (!this.get(this.KEY_BUDGET)) this.set(this.KEY_BUDGET, 0);
    if (!this.get(this.KEY_THEME)) this.set(this.KEY_THEME, 'light');
  },

  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  addExpense(expense) {
    const expenses = this.get(this.KEY_EXPENSES) || [];
    const newExpense = {
      id: this.generateId(),
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
      createdAt: Date.now()
    };
    expenses.push(newExpense);
    this.set(this.KEY_EXPENSES, expenses);
    return newExpense;
  },

  getExpenses() {
    return this.get(this.KEY_EXPENSES) || [];
  },

  updateExpense(id, updates) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates };
      this.set(this.KEY_EXPENSES, expenses);
      return expenses[index];
    }
    return null;
  },

  deleteExpense(id) {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.set(this.KEY_EXPENSES, expenses);
  },

  addIncome(income) {
    const incomes = this.get(this.KEY_INCOME) || [];
    const newIncome = {
      id: this.generateId(),
      amount: parseFloat(income.amount),
      source: income.source,
      date: income.date,
      notes: income.notes || '',
      createdAt: Date.now()
    };
    incomes.push(newIncome);
    this.set(this.KEY_INCOME, incomes);
    return newIncome;
  },

  getIncome() {
    return this.get(this.KEY_INCOME) || [];
  },

  updateIncome(id, updates) {
    const incomes = this.getIncome();
    const index = incomes.findIndex(i => i.id === id);
    if (index !== -1) {
      incomes[index] = { ...incomes[index], ...updates };
      this.set(this.KEY_INCOME, incomes);
      return incomes[index];
    }
    return null;
  },

  deleteIncome(id) {
    const incomes = this.getIncome().filter(i => i.id !== id);
    this.set(this.KEY_INCOME, incomes);
  },

  getBudget() {
    return this.get(this.KEY_BUDGET) || 0;
  },

  setBudget(amount) {
    this.set(this.KEY_BUDGET, parseFloat(amount));
  },

  getTheme() {
    return this.get(this.KEY_THEME) || 'light';
  },

  setTheme(theme) {
    this.set(this.KEY_THEME, theme);
  },

  exportCSV(type) {
    const data = type === 'expenses' ? this.getExpenses() : this.getIncome();
    const headers = type === 'expenses'
      ? ['Date', 'Category', 'Amount', 'Notes']
      : ['Date', 'Source', 'Amount', 'Notes'];
    
    let csv = headers.join(',') + '\n';
    data.forEach(item => {
      const row = [
        item.date,
        type === 'expenses' ? item.category : item.source,
        item.amount,
        `"${item.notes}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  },

  backupData() {
    const backup = {
      expenses: this.getExpenses(),
      income: this.getIncome(),
      budget: this.getBudget(),
      theme: this.getTheme(),
      date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().getTime()}.json`;
    a.click();
  },

  restoreData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.set(this.KEY_EXPENSES, data.expenses || []);
      this.set(this.KEY_INCOME, data.income || []);
      this.set(this.KEY_BUDGET, data.budget || 0);
      this.set(this.KEY_THEME, data.theme || 'light');
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Storage.init());
} else {
  Storage.init();
}
