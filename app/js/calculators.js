// calculators.js — one job: the two money calculators.
// 1) Debt payoff: principal, monthly interest %, monthly payment → months
//    to pay off, total interest, and a month-by-month table.
// 2) Emergency fund: essential monthly spending × months of cover → target,
//    current savings, gap, and the monthly saving needed to close the gap.

import { rupiah } from './format.js';

export function calculatorsPage() {
  return `<section class="page-head">
    <h1>Kalkulator Utang &amp; Dana Darurat</h1>
    <p class="lede">Dua hitungan yang paling sering ditanyakan keluarga: kapan utang lunas, dan berapa dana darurat yang harus disiapkan.</p>
  </section>
  <div class="grid-2">
    <div class="card">
      <h2>Kapan utangku lunas?</h2>
      <label class="field"><span>Sisa utang (Rp)</span>
        <input id="dc-principal" type="number" min="0" step="100000" value="6000000" inputmode="numeric"></label>
      <label class="field"><span>Bunga per bulan (%)</span>
        <input id="dc-rate" type="number" min="0" step="0.1" value="1.2" inputmode="decimal"></label>
      <label class="field"><span>Cicilan per bulan (Rp)</span>
        <input id="dc-payment" type="number" min="0" step="50000" value="500000" inputmode="numeric"></label>
      <p class="fineprint">Contoh terisi: sisa cicilan motor Rp6.000.000, bunga 1,2% per bulan, cicilan Rp500.000 — sama seperti tagihan keluarga contoh.</p>
      <div id="dc-result"></div>
    </div>
    <div class="card">
      <h2>Berapa dana daruratku?</h2>
      <label class="field"><span>Pengeluaran pokok per bulan (Rp)</span>
        <input id="ef-spend" type="number" min="0" step="100000" value="5200000" inputmode="numeric"></label>
      <label class="field"><span>Target simpanan (bulan) — <strong id="ef-months-val">6 bulan</strong></span>
        <input id="ef-months" type="range" min="3" max="12" step="1" value="6"></label>
      <label class="field"><span>Tabungan yang sudah ada (Rp)</span>
        <input id="ef-saved" type="number" min="0" step="100000" value="12400000" inputmode="numeric"></label>
      <label class="field"><span>Target tercapai dalam (bulan) — <strong id="ef-horizon-val">12 bulan</strong></span>
        <input id="ef-horizon" type="range" min="3" max="24" step="1" value="12"></label>
      <p class="fineprint">Aturan umum: dana darurat 3–6 bulan pengeluaran pokok untuk karyawan tetap, 6–12 bulan untuk wiraswasta.</p>
      <div id="ef-result"></div>
    </div>
  </div>`;
}

// Simulate month by month. Returns null when the payment never covers interest.
export function payoffSchedule(principal, monthlyRatePct, payment) {
  const rate = monthlyRatePct / 100;
  if (principal <= 0) return { months: 0, totalInterest: 0, rows: [] };
  if (payment <= 0 || payment <= principal * rate) return null;
  const rows = [];
  let balance = principal;
  let totalInterest = 0;
  let guard = 0;
  while (balance > 0 && guard < 600) {
    const interest = balance * rate;
    const pay = Math.min(payment, balance + interest);
    const principalPart = pay - interest;
    balance = Math.max(balance - principalPart, 0);
    totalInterest += interest;
    rows.push({ month: rows.length + 1, interest, principal: principalPart, balance });
    guard += 1;
  }
  return { months: rows.length, totalInterest, rows };
}

export function mountCalculators() {
  const $ = (id) => document.getElementById(id);

  function renderDebt() {
    const principal = Math.max(Number($('dc-principal').value) || 0, 0);
    const rate = Math.max(Number($('dc-rate').value) || 0, 0);
    const payment = Math.max(Number($('dc-payment').value) || 0, 0);
    const out = $('dc-result');
    const plan = payoffSchedule(principal, rate, payment);
    if (principal === 0) {
      out.innerHTML = '<p class="verdict">Tidak ada utang — bagus, pertahankan.</p>';
      return;
    }
    if (!plan) {
      out.innerHTML = '<p class="verdict bad">Cicilanmu lebih kecil dari bunganya — utang tidak akan pernah lunas. Naikkan cicilan di atas ' + rupiah(principal * rate / 100) + ' per bulan.</p>';
      return;
    }
    const shown = plan.rows.slice(0, 12);
    const more = plan.rows.length - shown.length;
    out.innerHTML = `
      <div class="stat-grid">
        <div class="stat"><span>Lunas dalam</span><strong>${plan.months} bulan</strong></div>
        <div class="stat"><span>Total bunga</span><strong>${rupiah(plan.totalInterest)}</strong></div>
        <div class="stat"><span>Total dibayar</span><strong>${rupiah(principal + plan.totalInterest)}</strong></div>
      </div>
      <table class="tbl"><thead><tr><th>Bulan</th><th>Bunga</th><th>Pokok</th><th>Sisa utang</th></tr></thead>
      <tbody>${shown.map((r) => `<tr><td>${r.month}</td><td>${rupiah(r.interest)}</td><td>${rupiah(r.principal)}</td><td>${rupiah(r.balance)}</td></tr>`).join('')}</tbody></table>
      ${more > 0 ? `<p class="fineprint">+ ${more} bulan berikutnya dengan pola yang sama sampai lunas.</p>` : ''}`;
  }

  function renderEmergency() {
    const spend = Math.max(Number($('ef-spend').value) || 0, 0);
    const months = Number($('ef-months').value);
    const saved = Math.max(Number($('ef-saved').value) || 0, 0);
    const horizon = Number($('ef-horizon').value);
    $('ef-months-val').textContent = months + ' bulan';
    $('ef-horizon-val').textContent = horizon + ' bulan';
    const target = spend * months;
    const gap = Math.max(target - saved, 0);
    const perMonth = Math.ceil(gap / horizon / 1000) * 1000;
    const pct = target > 0 ? Math.min(Math.round(saved / target * 100), 100) : 100;
    $('ef-result').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><span>Target dana darurat</span><strong>${rupiah(target)}</strong></div>
        <div class="stat"><span>Sudah terkumpul</span><strong>${rupiah(saved)}</strong></div>
        <div class="stat"><span>Kekurangan</span><strong>${rupiah(gap)}</strong></div>
      </div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <p class="progress-note">${pct}% dari target tercapai.</p>
      ${gap > 0
        ? `<p class="verdict">Sisihkan <strong>${rupiah(perMonth)}</strong> per bulan selama ${horizon} bulan untuk menutup kekurangan.</p>`
        : `<p class="verdict">Dana daruratmu sudah mencapai target ${months} bulan. Pertahankan, jangan dipakai untuk belanja.</p>`}`;
  }

  for (const id of ['dc-principal', 'dc-rate', 'dc-payment']) {
    $(id).addEventListener('input', renderDebt);
  }
  for (const id of ['ef-spend', 'ef-months', 'ef-saved', 'ef-horizon']) {
    $(id).addEventListener('input', renderEmergency);
  }
  renderDebt();
  renderEmergency();
}
