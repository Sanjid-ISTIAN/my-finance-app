// Calculations Module - Business logic
const Calculations = {
  formatCurrency(amount) {
    return '৳ ' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  },

  isThisWeek(date) {
    const now = new Date();
    const checkDate = new Date(date);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return checkDate >= weekStart && checkDate <= weekEnd;
  },

  isThisMonth(date) {
    const now = new Date();
    const checkDate = new Date(date);
    return checkDate.getMonth() === now.getMonth() && checkDate.getFullYear() === now.getFullYear();
  },

  calculateTodayExpenses(expenses) {
    return expenses
      .filter(e => this.isToday(e.date))
      .reduce((sum, e) => sum + e.amount, 0);
  },

  calculateWeekExpenses(expenses) {
    return expenses
      .filter(e => this.isThisWeek(e.date))
      .reduce((sum, e) => sum + e.amount, 0);
  },

  calculateMonthExpenses(expenses) {
    return expenses
      .filter(e => this.isThisMonth(e.date))
      .reduce((sum, e) => sum + e.amount, 0);
  },

  calculateTotalExpenses(expenses) {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  },

  calculateTotalIncome(income) {
    return income.reduce((sum, i) => sum + i.amount, 0);
  },

  calculateBalance(income, expenses) {
    const totalIncome = this.calculateTotalIncome(income);
    const totalExpenses = this.calculateTotalExpenses(expenses);
    return totalIncome - totalExpenses;
  },

  calculateBudgetUsage(expenses, budget) {
    if (budget <= 0) return 0;
    const monthExpenses = this.calculateMonthExpenses(expenses);
    return (monthExpenses / budget) * 100;
  },

  aggregateByCategory(expenses) {
    const aggregated = {};
    expenses.forEach(e => {
      aggregated[e.category] = (aggregated[e.category] || 0) + e.amount;
    });
    return Object.entries(aggregated).map(([category, total]) => ({
      category,
      total
    }));
  },

  aggregateBySource(income) {
    const aggregated = {};
    income.forEach(i => {
      aggregated[i.source] = (aggregated[i.source] || 0) + i.amount;
    });
    return Object.entries(aggregated).map(([source, total]) => ({
      source,
      total
    }));
  },

  getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  },

  aggregateDailyExpenses(expenses) {
    const daily = {};
    const last30 = this.getLast30Days();
    
    last30.forEach(date => {
      daily[date] = 0;
    });
    
    expenses.forEach(e => {
      if (daily.hasOwnProperty(e.date)) {
        daily[e.date] += e.amount;
      }
    });
    
    return Object.entries(daily).map(([date, amount]) => ({
      date,
      amount
    }));
  },

  aggregateMonthly(expenses, income) {
    const months = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toISOString().slice(0, 7);
      months[key] = { income: 0, expenses: 0 };
    }
    
    expenses.forEach(e => {
      const key = e.date.slice(0, 7);
      if (months[key]) months[key].expenses += e.amount;
    });
    
    income.forEach(i => {
      const key = i.date.slice(0, 7);
      if (months[key]) months[key].income += i.amount;
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    }));
  },

  getBudgetStatus(usage) {
    if (usage < 80) return 'normal';
    if (usage < 100) return 'warning';
    return 'critical';
  }
};
