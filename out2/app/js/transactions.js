// transactions.js — one job: the transaction list and its add / edit /
// delete form. All changes go through state + saveState, so the list the
// user sees is always the list in localStorage.

import { rupiah, tanggalIndo, esc } from './format.js';
import { CATEGORIES } from './data.js';

export function transactionsPage(state) {
  const rows = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const income = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = rows.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  return `<section class="page-head">
    <h1>Transaksi November 2026</h1>
    <p class="lede">Semua uang masuk dan keluar keluarga contoh bulan ini. Tambah, ubah, atau hapus — tersimpan di peramban ini dan langsung mengubah dasbor.</p>
  </section>
  <div class="stat-grid three">
    <div class="stat"><span>Total masuk</span><strong class="good">${rupiah(income)}</strong></div>
    <div class="stat"><span>Total keluar</span><strong class="bad">${rupiah(spend)}</strong></div>
    <div class="stat"><span>Selisih (ditabung)</span><strong>${rupiah(income - spend)}</strong></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <h2>Tambah transaksi</h2>
      <form id="tx-form">
        <label class="field"><span>Keterangan</span>
          <input id="tx-desc" type="text" required maxlength="80" placeholder="cth. Belanja mingguan pasar"></label>
        <div class="field-row">
          <label class="field"><span>Tanggal</span>
            <input id="tx-date" type="date" value="2026-11-27" required></label>
          <label class="field"><span>Jumlah (Rp)</span>
            <input id="tx-amount" type="number" step="1000" required placeholder="500000" inputmode="numeric"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>Kategori</span>
            <select id="tx-cat">${catOptions}<option value="pemasukan">Pemasukan</option></select></label>
          <label class="field"><span>Jenis</span>
            <select id="tx-kind"><option value="out">Pengeluaran</option><option value="in">Pemasukan</option></select></label>
        </div>
        <p class="fineprint">Jumlah pengeluaran ditulis positif — jenisnya yang menentukan tanda.</p>
        <button class="btn" type="submit">Tambah transaksi</button>
        <p class="saved-note" id="tx-saved" hidden>Transaksi ditambahkan.</p>
      </form>
    </div>
    <div class="card">
      <h2>Daftar transaksi</h2>
      <ul class="tx-list">
        ${rows.map((t) => {
          const cat = t.cat === 'pemasukan' ? { name: 'Pemasukan', color: '#15803d' } : CATEGORIES.find((c) => c.id === t.cat) || { name: t.cat, color: '#666' };
          const sign = t.amount < 0 ? '−' : '+';
          return `<li>
            <span class="dot" style="background:${cat.color}"></span>
            <span class="tx-main"><strong>${esc(t.desc)}</strong><small>${tanggalIndo(t.date)} · ${esc(cat.name)}</small></span>
            <strong class="${t.amount < 0 ? 'bad' : 'good'}">${sign}${rupiah(Math.abs(t.amount))}</strong>
            <button class="btn small danger" type="button" data-del="${t.id}">Hapus</button>
          </li>`;
        }).join('')}
      </ul>
      <p class="fineprint">Menghapus transaksi langsung mengubah total di atas dan di dasbor. Data contoh bisa dikembalikan lewat tombol “Kembalikan data contoh” di bawah.</p>
      <button class="btn ghost" id="tx-reset" type="button">Kembalikan data contoh</button>
    </div>
  </div>`;
}

export function mountTransactions(state, save, rerender) {
  const form = document.getElementById('tx-form');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const desc = document.getElementById('tx-desc').value.trim();
    const date = document.getElementById('tx-date').value;
    const rawAmount = Math.abs(Number(document.getElementById('tx-amount').value) || 0);
    const kind = document.getElementById('tx-kind').value;
    const cat = document.getElementById('tx-cat').value;
    if (!desc || !date || rawAmount <= 0) return;
    const amount = kind === 'in' ? rawAmount : -rawAmount;
    state.transactions.push({
      id: 't' + Date.now().toString(36),
      date,
      desc,
      cat: kind === 'in' ? 'pemasukan' : cat,
      amount,
    });
    save();
    document.getElementById('tx-saved').hidden = false;
    form.reset();
    document.getElementById('tx-date').value = '2026-11-27';
    rerender();
  });
  document.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.del);
      save();
      rerender();
    });
  });
  document.getElementById('tx-reset').addEventListener('click', () => {
    if (window.confirm('Kembalikan semua data ke contoh awal?')) rerender(true);
  });
}
