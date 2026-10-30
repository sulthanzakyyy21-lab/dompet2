const state = {
  defaultWallets: [
    { id: 'holiday', name: 'Liburan & Hiburan', budget: 2900000, maxLimit: 750000, monthlyLimit: 2500000, color: 'bg-emerald-500', hex: '#10b981' },
    { id: 'personal', name: 'Operasional Harian', budget: 1600000, maxLimit: 400000, monthlyLimit: 1500000, color: 'bg-blue-500', hex: '#0284c7' },
    { id: 'emergency', name: 'Dana Cadangan', budget: 1500000, maxLimit: 0, monthlyLimit: 0, color: 'bg-amber-500', hex: '#d97706' }
  ],
  defaultCategories: [
    'Makanan',
    'Bensin',
    'Belanja',
    'Tagihan',
    'Transportasi',
    'Hiburan',
    'Kesehatan',
    'Lainnya'
  ],
  colors: [
    { color: 'bg-blue-600', hex: '#0284c7' },
    { color: 'bg-emerald-600', hex: '#059669' },
    { color: 'bg-amber-600', hex: '#d97706' },
    { color: 'bg-purple-600', hex: '#7c3aed' },
    { color: 'bg-rose-600', hex: '#e11d48' },
    { color: 'bg-cyan-600', hex: '#0891b2' },
    { color: 'bg-slate-600', hex: '#475569' }
  ],
  wallets: [],
  categories: [],
  transactions: [],
  notifications: [],
  currentTxType: 'out',
  filterMonth: new Date().getMonth(),
  filterYear: new Date().getFullYear(),

  init() {
    this.wallets = JSON.parse(localStorage.getItem('my_wallets')) || this.defaultWallets;
    this.wallets = this.wallets.map(w => ({
      ...w,
      maxLimit: w.maxLimit !== undefined && w.maxLimit !== null ? Number(w.maxLimit) : 0,
      monthlyLimit: w.monthlyLimit !== undefined && w.monthlyLimit !== null ? Number(w.monthlyLimit) : 0,
      hex: w.hex || this.colors.find(c => c.color === w.color)?.hex || '#0284c7'
    }));
    this.categories = JSON.parse(localStorage.getItem('my_categories')) || this.defaultCategories;
    this.transactions = JSON.parse(localStorage.getItem('my_tx')) || [];
  },

  saveData() {
    localStorage.setItem('my_wallets', JSON.stringify(this.wallets));
    localStorage.setItem('my_categories', JSON.stringify(this.categories));
    localStorage.setItem('my_tx', JSON.stringify(this.transactions));
  }
};

state.init();
