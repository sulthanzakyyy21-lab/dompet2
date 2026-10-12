const ui = {
  // Flag to manage notification dropdown
  isNotificationOpen: false,

  // State untuk filter tab dompet pada riwayat transaksi
  selectedTxWalletTab: 'all',

  init() {
    // Menutup dropdown notifikasi ketika mengklik di luar area
    document.addEventListener('click', (e) => {
      const bellBtnDesktop = document.getElementById('notif-bell-desktop');
      const bellBtnMobile = document.getElementById('notif-bell-mobile');
      const popover = document.getElementById('notif-dropdown');

      if (!popover || popover.classList.contains('hidden')) return;

      const isClickInsideBell = (bellBtnDesktop && bellBtnDesktop.contains(e.target)) ||
                                (bellBtnMobile && bellBtnMobile.contains(e.target));
      const isClickInsidePopover = popover.contains(e.target);

      if (!isClickInsideBell && !isClickInsidePopover) {
        this.toggleNotification(false);
      }
    });

    // Event listener untuk tombol ESC menutup modal dan dropdown
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleNotification(false);
        this.toggleModalWallet(false);
      }
    });
  },

  // Tab Management
  switchTab(tabId) {
    // Sembunyikan semua tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
      tab.classList.add('hidden');
    });
    
    // Tampilkan tab yang dipilih
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
      targetTab.classList.remove('hidden');
      targetTab.classList.add('active');
    }

    // Reset Desktop Sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active-nav');
    });
    const activeSidebar = document.getElementById(`nav-${tabId}`);
    if (activeSidebar) {
      activeSidebar.classList.add('active-nav');
    }

    // Reset Mobile Bottom Nav
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
      btn.classList.remove('active-bnav');
    });
    const activeBottomNav = document.getElementById(`bnav-${tabId}`);
    if (activeBottomNav) {
      activeBottomNav.classList.add('active-bnav');
    }

    // Render ulang charts jika berpindah ke analitik
    if (tabId === 'analytics') {
      analytics.renderCharts();
    }

    // Render tabel transaksi jika berpindah ke tab riwayat
    if (tabId === 'transactions') {
      this.renderTransactions();
    }

    // Scroll ke atas dengan halus
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setTxWalletFilter(walletId) {
    this.selectedTxWalletTab = walletId;
    this.renderTransactions();
  },

  initFilters() {
    const monthSelect = document.getElementById('filter-month');
    const yearSelect = document.getElementById('filter-year');
    if (!monthSelect || !yearSelect) return;
    
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    monthSelect.innerHTML = months.map((m, i) => `<option value="${i}" ${i === state.filterMonth ? 'selected' : ''}>${m}</option>`).join('');
    
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    yearSelect.innerHTML = years.map(y => `<option value="${y}" ${y === state.filterYear ? 'selected' : ''}>${y}</option>`).join('');
  },

  setTxType(type) {
    state.currentTxType = type;
    const btnOut = document.getElementById('btn-type-out');
    const btnIn = document.getElementById('btn-type-in');
    const btnSubmit = document.getElementById('btn-submit-tx');

    if (type === 'out') {
      btnOut.className = "flex-1 py-2.5 text-xs font-semibold rounded-lg bg-white text-rose-700 shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2";
      btnIn.className = "flex-1 py-2.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2";
      btnSubmit.className = "w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2";
      btnSubmit.innerHTML = `
        <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        <span>Simpan Pengeluaran</span>
      `;
    } else {
      btnIn.className = "flex-1 py-2.5 text-xs font-semibold rounded-lg bg-white text-emerald-700 shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2";
      btnOut.className = "flex-1 py-2.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2";
      btnSubmit.className = "w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2";
      btnSubmit.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        <span>Simpan Pemasukan</span>
      `;
    }
  },

  toggleModalWallet(forceState) {
    const modal = document.getElementById('modal-wallet');
    if (!modal) return;
    
    if (typeof forceState === 'boolean') {
      if (forceState) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      } else {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    } else {
      modal.classList.toggle('hidden');
      modal.classList.toggle('flex');
    }
  },

  resetWalletForm() {
    document.getElementById('wallet-edit-id').value = '';
    document.getElementById('wallet-name').value = '';
    document.getElementById('wallet-budget').value = '';
    document.getElementById('wallet-max-limit').value = '';
    document.getElementById('wallet-monthly-limit').value = '';
    document.getElementById('modal-wallet-title').innerText = 'Tambah Rekening / Akun';
  },

  // Toggle Dropdown Notifikasi Limit
  toggleNotification(forceState) {
    const popover = document.getElementById('notif-dropdown');
    if (!popover) return;

    const willOpen = typeof forceState === 'boolean' ? forceState : popover.classList.contains('hidden');

    if (willOpen) {
      popover.classList.remove('hidden');
      popover.classList.add('animate-scale-in');
      this.isNotificationOpen = true;
    } else {
      popover.classList.add('hidden');
      popover.classList.remove('animate-scale-in');
      this.isNotificationOpen = false;
    }
  },

  // Render detail peringatan limit di dalam popover
  renderNotifications() {
    const listEl = document.getElementById('notif-list');
    const badgeDesktop = document.getElementById('notif-badge-desktop');
    const badgeMobile = document.getElementById('notif-badge-mobile');
    const countLabel = document.getElementById('notif-count-label');
    const summaryBadge = document.getElementById('notif-summary-badge');

    const notifs = state.notifications || [];
    const count = notifs.length;

    // Tampilkan/sembunyikan red dot (badge)
    if (count > 0) {
      if (badgeDesktop) badgeDesktop.classList.remove('hidden');
      if (badgeMobile) badgeMobile.classList.remove('hidden');
      if (summaryBadge) {
        summaryBadge.innerText = `${count} Perhatian`;
        summaryBadge.className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200';
      }
      if (countLabel) countLabel.innerText = `${count} peringatan limit aktif`;
    } else {
      if (badgeDesktop) badgeDesktop.classList.add('hidden');
      if (badgeMobile) badgeMobile.classList.add('hidden');
      if (summaryBadge) {
        summaryBadge.innerText = 'Normal';
        summaryBadge.className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      if (countLabel) countLabel.innerText = 'Semua pengeluaran dalam batas aman';
    }

    if (!listEl) return;

    if (count === 0) {
      listEl.innerHTML = `
        <div class="py-8 px-4 text-center">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2.5">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-xs font-semibold text-slate-700">Tidak ada limit yang terlampaui</p>
          <p class="text-[11px] text-slate-400 mt-1">Seluruh akun dompet beroperasi dalam batas anggaran yang ditentukan.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(item => {
      const isCritical = item.percent >= 100;
      return `
        <div class="p-3.5 hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0 flex items-start gap-3">
          <div class="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isCritical ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <p class="text-xs font-bold ${isCritical ? 'text-rose-700' : 'text-amber-800'} truncate">
                ${item.title}
              </p>
              <span class="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded ${isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">
                ${item.percent}%
              </span>
            </div>
            <p class="text-[11px] text-slate-600 leading-snug">
              Akun <span class="font-semibold text-slate-800">${item.walletName}</span> telah mencapai pengeluaran 
              <span class="font-medium text-slate-800">${utils.formatRupiah(item.spent)}</span> dari limit 
              <span class="font-medium text-slate-800">${utils.formatRupiah(item.limit)}</span>.
            </p>
            <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div class="h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}" style="width: ${Math.min(item.percent, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderModalWalletList() {
    const modalList = document.getElementById('modal-wallet-list');
    if (!modalList) return;

    modalList.innerHTML = state.wallets.map(w => {
      const hasWeekly = w.maxLimit && w.maxLimit > 0;
      const hasMonthly = w.monthlyLimit && w.monthlyLimit > 0;
      const limitText = [];
      if (hasWeekly) limitText.push(`Mgg: ${utils.formatRupiah(w.maxLimit)}`);
      if (hasMonthly) limitText.push(`Bln: ${utils.formatRupiah(w.monthlyLimit)}`);
      if (limitText.length === 0) limitText.push('Tanpa Limit');

      return `
        <div class="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition">
          <div class="flex items-center gap-3">
            <div class="w-3.5 h-3.5 rounded-full flex-shrink-0" style="background-color: ${w.hex};"></div>
            <div>
              <p class="font-semibold text-xs text-slate-900">${w.name}</p>
              <p class="text-[11px] text-slate-500 mt-0.5 font-medium">${limitText.join(' • ')}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" onclick="app.editWallet('${w.id}')" class="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition shadow-xs">Edit</button>
            <button type="button" onclick="app.deleteWallet('${w.id}')" class="text-xs bg-white border border-slate-200 hover:border-rose-200 hover:text-rose-600 text-slate-500 px-2.5 py-1.5 rounded-lg font-medium transition shadow-xs">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderMain() {
    const walletStats = {};
    state.wallets.forEach(w => walletStats[w.id] = { spent: 0, weeklySpent: 0, monthlySpent: 0, income: 0 });

    let totalNetBalance = 0;
    state.wallets.forEach(w => totalNetBalance += Number(w.budget || 0));

    // Summary Bulanan Berdasarkan Filter
    let sumIncome = 0;
    let sumExpense = 0;

    state.transactions.forEach(tx => {
      const amount = Number(tx.amount);
      const txDate = new Date(tx.fullDate);
      const isSelectedMonth = txDate.getMonth() === state.filterMonth && txDate.getFullYear() === state.filterYear;

      if (walletStats[tx.walletId]) {
        if (tx.type === 'in') {
          walletStats[tx.walletId].income += amount;
          totalNetBalance += amount;
          if (isSelectedMonth) sumIncome += amount;
        } else {
          walletStats[tx.walletId].spent += amount;
          totalNetBalance -= amount;
          if (isSelectedMonth) sumExpense += amount;

          // Peringatan menggunakan waktu riil (minggu berjalan & bulan kalender berjalan)
          if (utils.isWithinCurrentWeek(tx.fullDate)) walletStats[tx.walletId].weeklySpent += amount;
          if (utils.isWithinCurrentMonth(tx.fullDate)) walletStats[tx.walletId].monthlySpent += amount;
        }
      }
    });

    // Perbarui teks total saldo
    const totalSaldoEl = document.getElementById('total-saldo');
    if (totalSaldoEl) totalSaldoEl.innerText = utils.formatRupiah(totalNetBalance);
    
    // Perbarui statistik KPI
    const incEl = document.getElementById('summary-income');
    const expEl = document.getElementById('summary-expense');
    const netEl = document.getElementById('summary-net');
    if (incEl) incEl.innerText = utils.formatRupiah(sumIncome);
    if (expEl) expEl.innerText = utils.formatRupiah(sumExpense);
    if (netEl) netEl.innerText = utils.formatRupiah(sumIncome - sumExpense);

    // Kumpulkan peringatan limit ke state.notifications
    state.notifications = [];

    const walletListEl = document.getElementById('wallet-list');
    if (walletListEl) walletListEl.innerHTML = '';

    state.wallets.forEach(w => {
      const stats = walletStats[w.id] || { spent: 0, weeklySpent: 0, monthlySpent: 0, income: 0 };
      const remaining = Number(w.budget || 0) + stats.income - stats.spent;
      const maxLimit = Number(w.maxLimit) || 0;
      const monthlyLimit = Number(w.monthlyLimit) || 0;
      
      const hasWeeklyLimit = maxLimit > 0;
      const hasMonthlyLimit = monthlyLimit > 0;

      const percentWeekly = hasWeeklyLimit ? Math.round((stats.weeklySpent / maxLimit) * 100) : 0;
      const percentMonthly = hasMonthlyLimit ? Math.round((stats.monthlySpent / monthlyLimit) * 100) : 0;

      // Peringatan Mingguan (jika limit diset dan >= 80%)
      if (hasWeeklyLimit && percentWeekly >= 80) {
        state.notifications.push({
          type: 'weekly',
          walletId: w.id,
          walletName: w.name,
          percent: percentWeekly,
          spent: stats.weeklySpent,
          limit: maxLimit,
          title: percentWeekly >= 100 ? 'Limit Mingguan Terlampaui' : 'Peringatan Limit Mingguan'
        });
      }

      // Peringatan Bulanan (jika limit diset dan >= 80%)
      if (hasMonthlyLimit && percentMonthly >= 80) {
        state.notifications.push({
          type: 'monthly',
          walletId: w.id,
          walletName: w.name,
          percent: percentMonthly,
          spent: stats.monthlySpent,
          limit: monthlyLimit,
          title: percentMonthly >= 100 ? 'Limit Bulanan Terlampaui' : 'Peringatan Limit Bulanan'
        });
      }

      // Render Kartu Akun / Dompet
      if (walletListEl) {
        const hexColor = w.hex || '#0284c7';
        const progressPercent = hasMonthlyLimit ? Math.min(percentMonthly, 100) : 0;
        let progressColorClass = 'bg-sky-600';
        if (hasMonthlyLimit) {
          if (percentMonthly >= 100) progressColorClass = 'bg-rose-500';
          else if (percentMonthly >= 80) progressColorClass = 'bg-amber-500';
          else progressColorClass = 'bg-sky-600';
        }

        walletListEl.innerHTML += `
          <div class="bg-white border border-slate-200/90 hover:border-sky-300/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs" style="background-color: ${hexColor}15; color: ${hexColor}; border: 1px solid ${hexColor}30;">
                  ${w.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 class="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition">${w.name}</h3>
                  <p class="text-[11px] text-slate-400">Saldo Tersedia</p>
                </div>
              </div>
              ${hasMonthlyLimit ? `
                <span class="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md ${percentMonthly >= 100 ? 'bg-rose-50 text-rose-700 border border-rose-200' : percentMonthly >= 80 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-100'}">
                  ${percentMonthly}% Terpakai
                </span>
              ` : `
                <span class="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  Tanpa Limit
                </span>
              `}
            </div>

            <div class="mb-4">
              <p class="text-2xl font-bold tracking-tight text-slate-900 font-mono">${utils.formatRupiah(remaining)}</p>
            </div>

            <div class="pt-3 border-t border-slate-100 space-y-2">
              <div class="flex justify-between text-[11px] text-slate-500">
                <span>Pengeluaran Bulan Ini</span>
                <span class="font-semibold text-slate-800 font-mono">${utils.formatRupiah(stats.monthlySpent)}</span>
              </div>
              ${hasMonthlyLimit ? `
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="${progressColorClass} h-1.5 rounded-full transition-all duration-500" style="width: ${progressPercent}%;"></div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Limit: ${utils.formatRupiah(monthlyLimit)}</span>
                  <span>Sisa: ${utils.formatRupiah(Math.max(0, monthlyLimit - stats.monthlySpent))}</span>
                </div>
              ` : `
                <div class="text-[10px] text-slate-400">
                  Mingguan: <span class="font-medium text-slate-600 font-mono">${utils.formatRupiah(stats.weeklySpent)}</span>
                </div>
              `}
            </div>
          </div>
        `;
      }
    });

    // Perbarui dropdown notifikasi dan indikator lonceng
    this.renderNotifications();

    const selectEl = document.getElementById('tx-wallet');
    if (selectEl) {
      selectEl.innerHTML = state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    }

    this.renderTransactions();
    this.renderModalWalletList();
    
    // Auto switch to Dashboard jika belum ada tab aktif
    if (!document.querySelector('.tab-content.active')) {
      this.switchTab('dashboard');
    }
  },

  renderTransactions() {
    const listEl = document.getElementById('monthly-tx-list');
    const recentListEl = document.getElementById('recent-tx-list');
    const filterTabsContainer = document.getElementById('tx-wallet-filter-tabs');
    
    // 1. Hitung Running Balance per Dompet secara kronologis (dari awal waktu)
    const runningBalanceMap = new Map(); // realIndex -> balanceAfterTx
    const walletFinalBalances = {};

    state.wallets.forEach(wallet => {
      let currentBal = Number(wallet.budget || 0);
      
      const chronoTxs = state.transactions
        .map((tx, idx) => ({ ...tx, realIndex: idx }))
        .filter(tx => tx.walletId === wallet.id)
        .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

      chronoTxs.forEach(tx => {
        const amt = Number(tx.amount || 0);
        if (tx.type === 'in') {
          currentBal += amt;
        } else {
          currentBal -= amt;
        }
        runningBalanceMap.set(tx.realIndex, currentBal);
      });

      walletFinalBalances[wallet.id] = currentBal;
    });

    // 2. Ambil transaksi yang sesuai dengan filter bulan dan tahun terpilih
    const allFilteredTxs = state.transactions
      .map((tx, idx) => ({ ...tx, realIndex: idx }))
      .filter(tx => {
        const d = new Date(tx.fullDate);
        return d.getMonth() === state.filterMonth && d.getFullYear() === state.filterYear;
      })
      .reverse(); // Transaksi terbaru di atas

    // Generator template Tabel Mutasi per Rekening (Buku Pembukuan Bank)
    const buildWalletMutationTable = (wallet, txList, isCompact = false) => {
      let income = 0;
      let expense = 0;
      txList.forEach(tx => {
        if (tx.type === 'in') income += Number(tx.amount || 0);
        else expense += Number(tx.amount || 0);
      });

      const hex = wallet.hex || '#0284c7';
      const finalBal = walletFinalBalances[wallet.id] ?? Number(wallet.budget || 0);

      if (txList.length === 0) {
        if (isCompact) return ''; // Lewati dompet kosong pada preview dashboard
        return `
          <div class="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-5">
            <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs" style="background-color: ${hex}18; color: ${hex}; border: 1px solid ${hex}30;">
                  ${wallet.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 class="font-bold text-xs sm:text-sm text-slate-900">${wallet.name}</h3>
                  <p class="text-[10px] text-slate-400">Saldo saat ini: <span class="font-mono font-semibold text-slate-700">${utils.formatRupiah(finalBal)}</span></p>
                </div>
              </div>
              <span class="text-[10px] text-slate-400 italic">Belum ada mutasi</span>
            </div>
            <div class="py-6 text-center text-slate-400 text-xs">
              Tidak ada catatan mutasi transaksi pada rekening ini di periode terpilih.
            </div>
          </div>
        `;
      }

      return `
        <div class="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-6 transition-all hover:border-slate-300">
          
          <!-- Header Mutasi Dompet -->
          <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-sky-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0" style="background-color: ${hex}18; color: ${hex}; border: 1px solid ${hex}30;">
                ${wallet.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-sm text-slate-900">${wallet.name}</h3>
                  <span class="text-[10px] font-semibold font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    ${txList.length} Mutasi
                  </span>
                </div>
                <p class="text-[11px] text-slate-400">Buku pembukuan mutasi & running balance</p>
              </div>
            </div>

            <!-- Ringkasan Arus Kas Dompet (Kredit, Debit, Saldo) -->
            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono">
              <div class="px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-700">
                <span class="text-[10px] font-sans font-medium text-emerald-600 mr-1">Masuk (CR):</span>
                <span class="font-bold">+${utils.formatRupiah(income)}</span>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-rose-50/80 border border-rose-100 text-rose-700">
                <span class="text-[10px] font-sans font-medium text-rose-600 mr-1">Keluar (DB):</span>
                <span class="font-bold">-${utils.formatRupiah(expense)}</span>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-sky-50/80 border border-sky-100 text-sky-800">
                <span class="text-[10px] font-sans font-medium text-sky-600 mr-1">Saldo:</span>
                <span class="font-bold">${utils.formatRupiah(finalBal)}</span>
              </div>
            </div>
          </div>

          <!-- Tabel Mutasi Rekening -->
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th class="py-3 px-4 sm:px-5">Tanggal</th>
                  <th class="py-3 px-4">Keterangan / Uraian</th>
                  <th class="py-3 px-4 text-right">Kredit (Masuk)</th>
                  <th class="py-3 px-4 text-right">Debit (Keluar)</th>
                  <th class="py-3 px-4 text-right">Sisa Saldo</th>
                  <th class="py-3 px-4 sm:px-5 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${txList.map(tx => {
                  const isIncome = tx.type === 'in';
                  const balanceAfter = runningBalanceMap.get(tx.realIndex) ?? 0;
                  return `
                    <tr class="hover:bg-sky-50/30 transition-colors">
                      <td class="py-3 px-4 sm:px-5 text-slate-500 font-medium whitespace-nowrap">${tx.date}</td>
                      <td class="py-3 px-4 text-slate-900 font-semibold min-w-[140px]">
                        <div class="flex items-center gap-2">
                          <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                          <span>${tx.desc}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right font-mono whitespace-nowrap">
                        ${isIncome ? `<span class="font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">+${utils.formatRupiah(tx.amount)}</span>` : '<span class="text-slate-300">-</span>'}
                      </td>
                      <td class="py-3 px-4 text-right font-mono whitespace-nowrap">
                        ${!isIncome ? `<span class="font-bold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100">-${utils.formatRupiah(tx.amount)}</span>` : '<span class="text-slate-300">-</span>'}
                      </td>
                      <td class="py-3 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        ${utils.formatRupiah(balanceAfter)}
                      </td>
                      <td class="py-3 px-4 sm:px-5 text-center whitespace-nowrap">
                        <button onclick="app.deleteTransaction(${tx.realIndex})" class="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-600 inline-flex items-center justify-center transition" title="Hapus Transaksi">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    // 3. Render di Dashboard: Tabel Mutasi per Rekening
    if (recentListEl) {
      if (allFilteredTxs.length === 0) {
        recentListEl.innerHTML = `
          <div class="flex flex-col items-center justify-center py-8 px-4 bg-white border border-slate-200/80 rounded-2xl text-center">
            <p class="text-xs font-semibold text-slate-500">Belum ada aktivitas mutasi transaksi pada bulan ini.</p>
          </div>
        `;
      } else {
        let dashboardTablesHTML = '';
        state.wallets.forEach(wallet => {
          const walletTxs = allFilteredTxs.filter(tx => tx.walletId === wallet.id);
          if (walletTxs.length > 0) {
            dashboardTablesHTML += buildWalletMutationTable(wallet, walletTxs.slice(0, 5), true);
          }
        });
        recentListEl.innerHTML = dashboardTablesHTML || `
          <div class="py-6 px-4 bg-white border border-slate-200/80 rounded-2xl text-center text-xs text-slate-400">
            Belum ada aktivitas transaksi pada bulan ini.
          </div>
        `;
      }
    }

    if (!listEl) return;

    // 4. Render Tab Filter Dompet untuk Halaman Mutasi
    if (filterTabsContainer) {
      const activeAll = this.selectedTxWalletTab === 'all' 
        ? 'bg-sky-600 text-white shadow-xs font-semibold' 
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 font-medium';

      let filterBtnsHTML = `
        <button type="button" onclick="ui.setTxWalletFilter('all')" class="px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ${activeAll}">
          <span>Semua Dompet</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full ${this.selectedTxWalletTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 font-mono'}">${allFilteredTxs.length}</span>
        </button>
      `;

      state.wallets.forEach(w => {
        const count = allFilteredTxs.filter(tx => tx.walletId === w.id).length;
        const isActive = this.selectedTxWalletTab === w.id;
        const btnClass = isActive 
          ? 'bg-sky-600 text-white shadow-xs font-semibold' 
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 font-medium';
        const hex = w.hex || '#0284c7';

        filterBtnsHTML += `
          <button type="button" onclick="ui.setTxWalletFilter('${w.id}')" class="px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ${btnClass}">
            <span class="w-2 h-2 rounded-full" style="background-color: ${isActive ? '#ffffff' : hex};"></span>
            <span>${w.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 font-mono'}">${count}</span>
          </button>
        `;
      });

      filterTabsContainer.innerHTML = filterBtnsHTML;
    }

    // 5. Tampilkan Tabel Mutasi Sendiri-Sendiri per Dompet di Tab Mutasi
    const targetWallets = this.selectedTxWalletTab === 'all' 
      ? state.wallets 
      : state.wallets.filter(w => w.id === this.selectedTxWalletTab);

    if (allFilteredTxs.length === 0) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-white border border-slate-200/80 rounded-2xl text-center">
          <div class="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-700">Belum ada catatan mutasi transaksi pada periode ini</p>
          <p class="text-xs text-slate-400 mt-1 max-w-xs">Data mutasi pada bulan yang dipilih masih kosong. Tambahkan transaksi baru untuk memulai pembukuan.</p>
        </div>
      `;
      return;
    }

    let tablesHTML = '';
    targetWallets.forEach(wallet => {
      const walletTxs = allFilteredTxs.filter(tx => tx.walletId === wallet.id);
      tablesHTML += buildWalletMutationTable(wallet, walletTxs, false);
    });

    listEl.innerHTML = tablesHTML;
  }
};
