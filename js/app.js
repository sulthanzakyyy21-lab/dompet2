const app = {
  init() {
    ui.init();
    ui.initFilters();
    if (typeof snow !== 'undefined') {
      snow.init();
    }
    this.renderAll();
  },

  renderAll() {
    ui.renderMain();
    analytics.renderCharts();
  },

  onFilterChange() {
    state.filterMonth = Number(document.getElementById('filter-month').value);
    state.filterYear = Number(document.getElementById('filter-year').value);
    this.renderAll();
  },

  addTransaction(e) {
    e.preventDefault();
    const walletId = document.getElementById('tx-wallet').value;
    const amountVal = document.getElementById('tx-amount').value;
    const catSelect = document.getElementById('tx-category-select');
    const categoryVal = catSelect ? catSelect.value : '';
    const descInput = document.getElementById('tx-desc');
    const descVal = descInput ? descInput.value.trim() : '';

    if (!walletId) {
      alert('Silakan pilih atau buat dompet terlebih dahulu.');
      return;
    }

    const amount = utils.parseNumber(amountVal);
    if (isNaN(amount) || amount <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }

    const finalCategory = categoryVal || descVal || 'Lainnya';
    const finalDesc = descVal || categoryVal || (state.currentTxType === 'in' ? 'Pemasukan' : 'Pengeluaran');

    const now = new Date();
    const newTx = {
      walletId,
      amount,
      category: finalCategory,
      desc: finalDesc,
      type: state.currentTxType,
      date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      fullDate: now.toISOString()
    };

    state.transactions.push(newTx);
    state.saveData();

    document.getElementById('tx-amount').value = '';
    if (descInput) descInput.value = '';
    if (catSelect) catSelect.value = '';

    ui.closeModal('modal-transaction');
    this.renderAll();
    ui.switchTab('dashboard');
  },

  deleteTransaction(index) {
    if (confirm('Konfirmasi: Hapus transaksi ini dari pembukuan?')) {
      state.transactions.splice(index, 1);
      state.saveData();
      this.renderAll();
    }
  },

  addCategory(name) {
    name = (name || '').trim();
    if (!name) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }
    if (state.categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      alert('Kategori tersebut sudah ada.');
      return;
    }
    state.categories.push(name);
    state.saveData();
    ui.renderCategories();
    const catInput = document.getElementById('new-category-name');
    if (catInput) catInput.value = '';
  },

  deleteCategory(catName) {
    if (state.categories.length <= 1) {
      alert('Minimal harus ada 1 kategori.');
      return;
    }
    if (confirm(`Hapus kategori "${catName}"?`)) {
      state.categories = state.categories.filter(c => c !== catName);
      state.saveData();
      ui.renderCategories();
    }
  },

  saveWallet(e) {
    e.preventDefault();
    const editId = document.getElementById('wallet-edit-id').value;
    const name = document.getElementById('wallet-name').value.trim();
    const budget = utils.parseNumber(document.getElementById('wallet-budget').value) || 0;
    
    const maxLimitVal = document.getElementById('wallet-max-limit').value.trim();
    const monthlyLimitVal = document.getElementById('wallet-monthly-limit').value.trim();
    const maxLimit = maxLimitVal !== '' ? Math.max(0, utils.parseNumber(maxLimitVal)) : 0;
    const monthlyLimit = monthlyLimitVal !== '' ? Math.max(0, utils.parseNumber(monthlyLimitVal)) : 0;

    if (!name) {
      alert('Nama akun/dompet tidak boleh kosong.');
      return;
    }

    if (editId) {
      const wallet = state.wallets.find(w => w.id === editId);
      if (wallet) {
        wallet.name = name;
        wallet.budget = budget;
        wallet.maxLimit = maxLimit;
        wallet.monthlyLimit = monthlyLimit;
      }
    } else {
      const selectedColorObj = state.colors[state.wallets.length % state.colors.length];
      const newWallet = {
        id: 'w_' + Date.now(),
        name,
        budget,
        maxLimit,
        monthlyLimit,
        color: selectedColorObj.color,
        hex: selectedColorObj.hex
      };
      state.wallets.push(newWallet);
    }

    state.saveData();
    ui.resetWalletForm();
    ui.toggleModalWallet(false);
    this.renderAll();
  },

  editWallet(id) {
    const wallet = state.wallets.find(w => w.id === id);
    if (wallet) {
      document.getElementById('wallet-edit-id').value = wallet.id;
      document.getElementById('wallet-name').value = wallet.name;
      document.getElementById('wallet-budget').value = wallet.budget > 0 ? utils.formatNumber(wallet.budget) : (wallet.budget === 0 ? '0' : '');
      document.getElementById('wallet-max-limit').value = wallet.maxLimit > 0 ? utils.formatNumber(wallet.maxLimit) : '';
      document.getElementById('wallet-monthly-limit').value = wallet.monthlyLimit > 0 ? utils.formatNumber(wallet.monthlyLimit) : '';
      
      const modal = document.getElementById('modal-wallet');
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      ui.setWalletEditMode(wallet);
    }
  },

  deleteWallet(id) {
    if (state.wallets.length <= 1) {
      alert('Minimal harus tersedia 1 akun/dompet aktif dalam sistem.');
      return;
    }
    if (confirm('Konfirmasi: Hapus akun dompet ini? Transaksi terkait akan tetap tersimpan.')) {
      const editId = document.getElementById('wallet-edit-id')?.value;
      state.wallets = state.wallets.filter(w => w.id !== id);
      if (editId === id) {
        ui.resetWalletForm();
      }
      state.saveData();
      this.renderAll();
    }
  },

  exportData() {
    const backupData = { wallets: state.wallets, categories: state.categories, transactions: state.transactions, exportDate: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dompetku_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.wallets && Array.isArray(parsed.wallets) && parsed.transactions && Array.isArray(parsed.transactions)) {
          state.wallets = parsed.wallets;
          if (parsed.categories && Array.isArray(parsed.categories)) {
            state.categories = parsed.categories;
          }
          state.transactions = parsed.transactions;
          state.saveData();
          app.renderAll();
          alert('Data pembukuan berhasil dipulihkan.');
        } else {
          alert('Format file cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
