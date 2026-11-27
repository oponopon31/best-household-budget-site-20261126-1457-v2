// render.js — one job: turn state into pages and wire up page controls.
// The router reads the hash (#/dashboard, #/transaksi, …) and renders one
// page into #app; each page function returns HTML, each mount function
// wires the controls on that page.

import { BENCHMARKS, CATEGORIES, CURRENT_MONTH, HOUSEHOLD, MONTHLY, PREV_MONTH } from './data.js';
import { averageSpend, bestMonth, categorySpend, monthIncome, monthSpend, resetState, worstMonth } from './state.js';
import { budgetBars, donutChart, lineChart, monthBars } from './charts.js';
import { bulanIndo, deltaRupiah, esc, persen, rupiah, rupiahShort } from './format.js';
import { calculatorsPage, mountCalculators } from './calculators.js';
import { mountPlanner, plannerPage } from './planner.js';
import { mountTransactions, transactionsPage } from './transactions.js';

const ROUTES = [
  ['dashboard', 'Dasbor'],
  ['transaksi', 'Transaksi'],
  ['kategori', 'Kategori'],
  ['bulanan', 'Bulanan'],
  ['perencana', 'Perencana 50/30/20'],
  ['kalkulator', 'Kalkulator'],
  ['tabungan', 'Tabungan'],
  ['tagihan', 'Tagihan'],
  ['tahunan', 'Rencana Tahunan'],
  ['panduan', 'Panduan'],
];

export function navLinks(active) {
  return ROUTES.map(([slug, label]) =>
    `<a href="#/${slug}" class="${slug === active ? 'active' : ''}">${label}</a>`).join('');
}

function deltaChip(delta, goodWhenDown) {
  const good = goodWhenDown ? delta <= 0 : delta >= 0;
  const cls = delta === 0 ? 'flat' : good ? 'good' : 'bad';
  const word = delta === 0 ? 'sama seperti bulan lalu' : (delta > 0 ? 'naik ' : 'turun ') + 'dari bulan lalu';
  return `<span class="delta ${cls}">${deltaRupiah(delta)} · ${word}</span>`;
}

function statCard(label, value, deltaHtml, sub) {
  return `<div class="stat-card"><span>${label}</span><strong>${value}</strong>${deltaHtml}<small>${sub}</small></div>`;
}

// ---- Dashboard (cover page) ----
function dashboardPage(state) {
  const spend = monthSpend(CURRENT_MONTH);
  const prevSpend = monthSpend(PREV_MONTH);
  const income = monthIncome();
  const saved = income - spend;
  const prevSaved = income - prevSpend;
  const spendPerCapita = Math.round(spend / HOUSEHOLD.members);
  const cat = categorySpend(state);
  const parts = CATEGORIES.map((c) => ({ label: c.name, value: cat[c.id], color: c.color }));
  const avg = averageSpend();
  const best = bestMonth();
  const worst = worstMonth();
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const goal = state.goals[0];
  const goalPct = Math.round(goal.saved / goal.target * 100);

  const monthsShort = MONTHLY.map((m) => {
    const [y, mo] = m.month.split('-');
    const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
    return { month: m.month, label, spend: m.spend, short: rupiahShort(m.spend), text: rupiah(m.spend) };
  });

  return `<section class="hero">
    <div>
      <p class="eyebrow">Keluarga Budi &amp; Sari · 4 anggota · Jakarta</p>
      <h1>Uang keluarga bulan ini, jelas dalam satu layar.</h1>
      <p class="lede">Pemasukan Rp8.500.000, belanja Rp7.140.000, sisa Rp1.360.000 masuk tabungan. Semua angka di bawah ini dari transaksi November 2026 — <strong>data contoh</strong> yang bisa diubah, dihapus, dan dihitung ulang.</p>
      <p class="hero-links"><a class="btn" href="#/perencana">Bagi dengan 50/30/20</a> <a class="btn ghost" href="#/kalkulator">Hitung utang &amp; dana darurat</a></p>
    </div>
    <div class="hero-card">
      <span>Sisa untuk ditabung bulan ini</span>
      <strong>${rupiah(saved)}</strong>
      <small>${persen(saved / income * 100, 0)} dari penghasilan · ${deltaRupiah(saved - prevSaved)} dari Oktober</small>
      <div class="progress"><div style="width:${Math.round(saved / income * 100)}%"></div></div>
    </div>
  </section>

  <div class="stat-grid four">
    ${statCard('Pemasukan', rupiah(income), deltaChip(0, false), 'Budi Rp5.500.000 + Sari Rp3.000.000')}
    ${statCard('Pengeluaran', rupiah(spend), deltaChip(spend - prevSpend, true), 'Bulan lalu ' + rupiah(prevSpend))}
    ${statCard('Ditabung', rupiah(saved), deltaChip(saved - prevSaved, false), 'Rata-rata tabungan 12 bulan ' + rupiah(income - avg))}
    ${statCard('Dana darurat', rupiah(goal.saved), `<span class="delta good">${goalPct}% dari target ${rupiahShort(goal.target)}</span>`, 'Target 6 bulan pengeluaran pokok')}
  </div>

  <div class="grid-2">
    <div class="card">
      <h2>Ke mana uang pergi — November 2026</h2>
      <div class="donut-wrap">${donutChart(parts)}
        <ul class="legend">${parts.map((p) => `<li><span class="dot" style="background:${p.color}"></span>${esc(p.label)}<strong>${rupiah(p.value)}</strong></li>`).join('')}</ul>
      </div>
      <p><a href="#/kategori">Lihat anggaran tiap kategori →</a></p>
    </div>
    <div class="card">
      <h2>Belanja 12 bulan terakhir</h2>
      ${monthBars(monthsShort, CURRENT_MONTH)}
      <p class="callouts">Bulan paling hemat: <strong>${bulanIndo(best.month)} (${rupiah(best.spend)})</strong> · Bulan paling boros: <strong>${bulanIndo(worst.month)} (${rupiah(worst.spend)})</strong> · Rata-rata: <strong>${rupiah(avg)}</strong></p>
      <p><a href="#/bulanan">Perbandingan bulan ke bulan →</a></p>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h2>Apakah belanja kami wajar?</h2>
      <p>Belanja per orang di keluarga ini <strong>${rupiah(spendPerCapita)}</strong> per bulan, dari total ${rupiah(spend)} dibagi 4 anggota.</p>
      <ul class="bench">
        ${BENCHMARKS.map((b) => {
          const ref = b.flat ? b.perCapita : b.perCapita * HOUSEHOLD.members;
          const cmp = b.flat
            ? 'Penghasilan keluarga ' + rupiah(income) + ' — ' + persen(income / b.perCapita * 100 - 100, 0) + ' di atas UMP'
            : 'Untuk 4 orang: ' + rupiah(ref) + ' — kami ' + (spend > ref ? 'di atas' : 'di bawah') + ' angka ini';
          return `<li><strong>${esc(b.label)}</strong><span>${b.flat ? rupiah(b.perCapita) : rupiah(b.perCapita) + ' per orang'}</span><small>${esc(b.source)} · ${esc(cmp)}</small></li>`;
        }).join('')}
      </ul>
    </div>
    <div class="card">
      <h2>Yang perlu diperhatikan</h2>
      <ul class="watch">
        <li><strong>Tagihan belum lunas:</strong> ${unpaid.length === 0 ? 'tidak ada — semua tagihan November sudah lunas.' : unpaid.map((b) => esc(b.name) + ' ' + rupiah(b.amount)).join(', ') + ' (total ' + rupiah(unpaidTotal) + ').'}</li>
        <li><strong>Kategori paling besar:</strong> Makanan &amp; Belanja ${rupiah(cat.makanan)} — ${persen(cat.makanan / spend * 100, 0)} dari semua belanja.</li>
        <li><strong>Tren:</strong> November ${spend < prevSpend ? 'lebih hemat' : 'lebih boros'} ${rupiah(Math.abs(spend - prevSpend))} dari Oktober.</li>
        <li><strong>Tabungan:</strong> dana darurat ${goalPct}% — kurang ${rupiah(goal.target - goal.saved)} lagi.</li>
      </ul>
      <p><a href="#/tagihan">Cek tagihan →</a> · <a href="#/tabungan">Cek tabungan →</a> · <a href="#/tahunan">Rencana 2027 →</a></p>
    </div>
  </div>
  <p class="fineprint">Semua angka di situs ini adalah data contoh keluarga fiktif, kecuali tiga angka acuan nasional di atas yang bersumber dari BPS dan Pemprov DKI Jakarta.</p>`;
}

// ---- Categories ----
function categoriesPage(state) {
  const cat = categorySpend(state);
  const total = CATEGORIES.reduce((s, c) => s + cat[c.id], 0);
  const rows = CATEGORIES.map((c) => ({
    name: c.name, color: c.color, budget: c.budget, actual: cat[c.id],
    actualText: rupiah(cat[c.id]), budgetText: rupiah(c.budget),
    overText: rupiah(cat[c.id] - c.budget), leftText: rupiah(c.budget - cat[c.id]),
  }));
  const parts = CATEGORIES.map((c) => ({ label: c.name, value: cat[c.id], color: c.color }));
  return `<section class="page-head">
    <h1>Kategori &amp; Anggaran</h1>
    <p class="lede">Enam kantong belanja keluarga. Garis abu-abu adalah anggaran, batang warna adalah kenyataan bulan November 2026 (total ${rupiah(total)} dari anggaran ${rupiah(CATEGORIES.reduce((s, c) => s + c.budget, 0))}).</p>
  </section>
  <div class="grid-2">
    <div class="card"><h2>Pembagian belanja</h2><div class="donut-wrap">${donutChart(parts)}
      <ul class="legend">${parts.map((p) => `<li><span class="dot" style="background:${p.color}"></span>${esc(p.label)}<strong>${persen(p.value / total * 100, 0)}</strong></li>`).join('')}</ul></div></div>
    <div class="card"><h2>Anggaran vs kenyataan</h2>${budgetBars(rows)}</div>
  </div>
  <div class="card"><h2>Catatan tiap kategori</h2>
    <ul class="watch">
      <li><strong>Makanan &amp; Belanja</strong> — ${rupiah(cat.makanan)} dari anggaran ${rupiah(2500000)}: belanja pasar 3 kali seminggu plus satu kali belanja bulanan.</li>
      <li><strong>Rumah &amp; Utilitas</strong> — ${rupiah(cat.rumah)}: kontrakan ${rupiah(950000)}, internet, listrik, dan air.</li>
      <li><strong>Transportasi</strong> — ${rupiah(cat.transport)}: bensin ${rupiah(320000)} dan cicilan motor ${rupiah(500000)}.</li>
      <li><strong>Pendidikan Anak</strong> — ${rupiah(cat.pendidikan)}: SPP ${rupiah(850000)} dan buku ${rupiah(300000)}.</li>
      <li><strong>Kesehatan</strong> — ${rupiah(cat.kesehatan)}: BPJS ${rupiah(350000)} dan obat ${rupiah(80000)}.</li>
      <li><strong>Hiburan &amp; Lainnya</strong> — ${rupiah(cat.hiburan)}: makan di luar, langganan TV, dan bioskop.</li>
    </ul></div>`;
}

// ---- Monthly comparison ----
function monthlyPage() {
  const income = monthIncome();
  const rows = [...MONTHLY].reverse();
  const avg = averageSpend();
  const best = bestMonth();
  const worst = worstMonth();
  const chartPoints = [...MONTHLY].map((m) => {
    const [y, mo] = m.month.split('-');
    return { label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('id-ID', { month: 'short' }), value: income - m.spend, short: rupiahShort(income - m.spend) };
  });
  return `<section class="page-head">
    <h1>Bulan ke Bulan</h1>
    <p class="lede">Desember 2025 sampai November 2026. Penghasilan tetap ${rupiah(income)} setiap bulan, jadi selisihnya langsung terlihat sebagai tabungan.</p>
  </section>
  <div class="card"><h2>Belanja per bulan</h2>
    ${monthBars(MONTHLY.map((m) => {
      const [y, mo] = m.month.split('-');
      return { month: m.month, label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('id-ID', { month: 'short' }), spend: m.spend, short: rupiahShort(m.spend), text: rupiah(m.spend) };
    }), CURRENT_MONTH)}
    <p class="callouts">Rata-rata belanja <strong>${rupiah(avg)}</strong> · Paling hemat <strong>${bulanIndo(best.month)}</strong> · Paling boros <strong>${bulanIndo(worst.month)}</strong> · Selisih hemat–boros <strong>${rupiah(worst.spend - best.spend)}</strong></p>
  </div>
  <div class="card"><h2>Tabungan tiap bulan</h2>${lineChart(chartPoints)}
    <p class="fineprint">Total ditabung 12 bulan: <strong>${rupiah(MONTHLY.reduce((s, m) => s + (income - m.spend), 0))}</strong>. Bulan Agustus paling kecil tabungannya (${rupiah(income - worst.spend)}) karena belanja paling besar.</p></div>
  <div class="card"><h2>Tabel 12 bulan</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Bulan</th><th>Penghasilan</th><th>Belanja</th><th>Ditabung</th><th>vs bulan lalu</th></tr></thead><tbody>
    ${rows.map((m, i) => {
      const prev = MONTHLY[MONTHLY.findIndex((x) => x.month === m.month) - 1];
      const d = prev ? m.spend - prev.spend : 0;
      return `<tr><td><strong>${bulanIndo(m.month)}</strong></td><td>${rupiah(income)}</td><td>${rupiah(m.spend)}</td><td class="good">${rupiah(income - m.spend)}</td><td>${i === rows.length - 1 ? '—' : deltaRupiah(d)}</td></tr>`;
    }).join('')}</tbody></table></div></div>`;
}

// ---- Savings goals ----
function goalsPage(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `<section class="page-head">
    <h1>Tabungan &amp; Tujuan</h1>
    <p class="lede">Empat tujuan keluarga contoh. Total terkumpul ${rupiah(totalSaved)} dari target ${rupiah(totalTarget)} (${persen(totalSaved / totalTarget * 100, 0)}). Tambah setoran dan lihat batangnya bergerak.</p>
  </section>
  <div class="grid-2">
    ${state.goals.map((g) => {
      const pct = Math.min(Math.round(g.saved / g.target * 100), 100);
      return `<div class="card"><h2>${esc(g.name)}</h2>
        <p class="goal-amount"><strong>${rupiah(g.saved)}</strong> <span>dari ${rupiah(g.target)}</span></p>
        <div class="progress"><div style="width:${pct}%"></div></div>
        <p class="progress-note">${pct}% tercapai · kurang ${rupiah(Math.max(g.target - g.saved, 0))} · ${esc(g.note)}</p>
        <div class="goal-add"><input type="number" min="0" step="50000" placeholder="Setoran (Rp)" inputmode="numeric" data-goal-amount="${g.id}">
        <button class="btn small" type="button" data-goal-add="${g.id}">Tambah setoran</button></div>
      </div>`;
    }).join('')}
  </div>
  <div class="card"><h2>Buat tujuan baru</h2>
    <form id="goal-form" class="field-row">
      <label class="field"><span>Nama tujuan</span><input id="goal-name" type="text" required maxlength="60" placeholder="cth. Umroh keluarga"></label>
      <label class="field"><span>Target (Rp)</span><input id="goal-target" type="number" min="0" step="100000" required placeholder="10000000" inputmode="numeric"></label>
      <button class="btn" type="submit">Buat tujuan</button>
    </form>
    <p class="fineprint">Tujuan dan setoran tersimpan di peramban ini. Dana darurat dihitung dari 6 bulan pengeluaran pokok keluarga contoh (${rupiah(19500000)}).</p></div>`;
}

function mountGoals(state, save, rerender) {
  document.querySelectorAll('[data-goal-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(`[data-goal-amount="${btn.dataset.goalAdd}"]`);
      const amount = Math.abs(Number(input.value) || 0);
      if (amount <= 0) return;
      const goal = state.goals.find((g) => g.id === btn.dataset.goalAdd);
      if (goal) goal.saved += amount;
      save();
      rerender();
    });
  });
  const form = document.getElementById('goal-form');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Math.abs(Number(document.getElementById('goal-target').value) || 0);
    if (!name || target <= 0) return;
    state.goals.push({ id: 'g' + Date.now().toString(36), name, target, saved: 0, note: 'Tujuan baru' });
    save();
    rerender();
  });
}

// ---- Bills ----
function billsPage(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidTotal = state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  return `<section class="page-head">
    <h1>Tagihan &amp; Pengingat</h1>
    <p class="lede">Delapan tagihan rutin keluarga contoh. Total tagihan November ${rupiah(paidTotal + unpaidTotal)} — sudah lunas ${rupiah(paidTotal)}, belum lunas ${rupiah(unpaidTotal)}.</p>
  </section>
  <div class="card"><h2>Jadwal tagihan November 2026</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tagihan</th><th>Jatuh tempo</th><th>Jumlah</th><th>Status</th><th></th></tr></thead><tbody>
    ${[...state.bills].sort((a, b) => a.dueDay - b.dueDay).map((b) => `<tr>
      <td><strong>${esc(b.name)}</strong></td><td>${b.dueDay} Nov 2026</td><td>${rupiah(b.amount)}</td>
      <td>${b.paid ? '<span class="tag ok">Lunas</span>' : '<span class="tag due">Belum lunas</span>'}</td>
      <td><button class="btn small ${b.paid ? 'ghost' : ''}" type="button" data-bill="${b.id}">${b.paid ? 'Batalkan' : 'Tandai lunas'}</button></td>
    </tr>`).join('')}</tbody></table></div>
    <p class="fineprint">Ketuk “Tandai lunas” saat sudah dibayar — status tersimpan di peramban ini. Iuran RT Rp50.000 (5 Nov) masih belum lunas karena dibayar tunai ke ketua RT.</p></div>
  <div class="card"><h2>Tips tagihan</h2><ul class="watch">
    <li>Bayar tagihan tetap (kontrakan, BPJS, internet) di awal bulan, begitu gaji masuk.</li>
    <li>Satu tagihan telat — listrik atau air — bisa kena denda dan pemutusan.</li>
    <li>Catat tanggal jatuh tempo di kalender ponsel, bukan di kepala.</li>
  </ul></div>`;
}

function mountBills(state, save, rerender) {
  document.querySelectorAll('[data-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bill = state.bills.find((b) => b.id === btn.dataset.bill);
      if (bill) bill.paid = !bill.paid;
      save();
      rerender();
    });
  });
}

// ---- Yearly projection ----
function yearlyPage() {
  const income = monthIncome();
  const avg = averageSpend();
  const scenarios = [
    { id: 'hemat', label: 'Hemat 10%', factor: 0.9 },
    { id: 'tetap', label: 'Tetap seperti 2026', factor: 1 },
    { id: 'boros', label: 'Boros 10%', factor: 1.1 },
  ];
  return `<section class="page-head">
    <h1>Rencana Tahunan 2027</h1>
    <p class="lede">Kalau penghasilan tetap ${rupiah(income)} per bulan dan belanja mengikuti rata-rata 2026 (${rupiah(avg)} per bulan), beginilah 2027 keluarga contoh. Pilih skenario untuk melihat bedanya.</p>
  </section>
  <div class="card">
    <h2>Pilih skenario belanja</h2>
    <div class="btn-row" id="year-scenarios">
      ${scenarios.map((s, i) => `<button class="btn ${i === 1 ? '' : 'ghost'}" type="button" data-scenario="${s.factor}">${s.label}</button>`).join('')}
    </div>
    <div id="year-result"></div>
  </div>
  <div class="card"><h2>Anggaran 2027 per kategori</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kategori</th><th>Per bulan</th><th>Setahun</th></tr></thead><tbody>
    ${CATEGORIES.map((c) => `<tr><td><strong>${esc(c.name)}</strong></td><td>${rupiah(c.budget)}</td><td>${rupiah(c.budget * 12)}</td></tr>`).join('')}
    <tr><td><strong>Total anggaran</strong></td><td><strong>${rupiah(CATEGORIES.reduce((s, c) => s + c.budget, 0))}</strong></td><td><strong>${rupiah(CATEGORIES.reduce((s, c) => s + c.budget, 0) * 12)}</strong></td></tr>
    </tbody></table></div>
    <p class="fineprint">Anggaran tahunan = anggaran bulanan × 12. Dana darurat penuh (${rupiah(19500000)}) tercapai pada 2027 bila tabungan bulanan dijaga di atas ${rupiah(1000000)}.</p></div>`;
}

function mountYearly() {
  const income = monthIncome();
  const avg = averageSpend();
  const out = document.getElementById('year-result');
  function render(factor) {
    const spend = Math.round(avg * factor);
    const saveMo = income - spend;
    const saveYr = saveMo * 12;
    const points = [];
    let cum = 12400000;
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 0; i < 12; i++) {
      cum += saveMo;
      points.push({ label: labels[i], value: cum, short: rupiahShort(cum) });
    }
    out.innerHTML = `
      <div class="stat-grid three">
        <div class="stat"><span>Belanja per bulan</span><strong>${rupiah(spend)}</strong></div>
        <div class="stat"><span>Ditabung per bulan</span><strong>${rupiah(saveMo)}</strong></div>
        <div class="stat"><span>Ditabung setahun</span><strong>${rupiah(saveYr)}</strong></div>
      </div>
      <h3>Dana darurat tumbuh sepanjang 2027</h3>
      ${lineChart(points)}
      <p class="fineprint">Mulai dari ${rupiah(12400000)} (posisi November 2026), dana darurat mencapai <strong>${rupiah(cum)}</strong> pada Desember 2027 — ${cum >= 19500000 ? 'melewati target ' + rupiah(19500000) + '.' : 'belum mencapai target ' + rupiah(19500000) + '.'}</p>`;
  }
  document.querySelectorAll('[data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-scenario]').forEach((b) => b.classList.add('ghost'));
      btn.classList.remove('ghost');
      render(Number(btn.dataset.scenario));
    });
  });
  render(1);
}

// ---- Guide ----
function guidePage() {
  return `<section class="page-head">
    <h1>Panduan: Mengatur Uang Keluarga</h1>
    <p class="lede">Tujuh langkah yang dipakai keluarga contoh di situs ini — dari mencatat sampai merencanakan setahun ke depan.</p>
  </section>
  <div class="card"><ol class="steps">
    <li><strong>Catat semua uang masuk.</strong> Gaji, usaha sampingan, apa pun. Keluarga contoh: ${rupiah(8500000)} per bulan.</li>
    <li><strong>Catat semua uang keluar, per kategori.</strong> Jangan mengira-ngira — lihat <a href="#/transaksi">transaksi November</a> sebagai contoh.</li>
    <li><strong>Beri anggaran tiap kategori.</strong> Total anggaran keluarga contoh ${rupiah(7500000)} per bulan; sisanya untuk tabungan.</li>
    <li><strong>Bandingkan bulan ini dengan bulan lalu.</strong> November lebih hemat ${rupiah(170000)} dari Oktober — cari tahu kenapa, lalu ulangi.</li>
    <li><strong>Bagi dengan 50/30/20.</strong> Coba di <a href="#/perencana">perencana</a>: kebutuhan paling banyak 50%, keinginan 30%, tabungan setidaknya 20%.</li>
    <li><strong>Siapkan dana darurat 3–6 bulan pengeluaran pokok.</strong> Hitung kebutuhanmu di <a href="#/kalkulator">kalkulator</a> — keluarga contoh menargetkan ${rupiah(19500000)}.</li>
    <li><strong>Bayar tagihan di awal bulan dan rencanakan setahun ke depan.</strong> Lihat <a href="#/tagihan">tagihan</a> dan <a href="#/tahunan">rencana 2027</a>.</ol></div>
  <div class="card"><h2>Acuan nasional (angka nyata)</h2><ul class="bench">
    ${BENCHMARKS.map((b) => `<li><strong>${esc(b.label)} — ${rupiah(b.perCapita)}${b.flat ? '' : ' per orang per bulan'}</strong><small>${esc(b.source)}</small></li>`).join('')}
  </ul><p class="fineprint">Garis kemiskinan dan rata-rata pengeluaran dari Badan Pusat Statistik (BPS); UMP DKI Jakarta 2026 dari Pemprov DKI Jakarta. Angka-angka ini membantu menilai apakah belanja sebuah keluarga wajar untuk ukurannya — bukan vonis, melainkan pembanding.</p></div>`;
}

// ---- Router ----
export function renderApp(state, save) {
  const app = document.getElementById('app');
  const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const slug = ROUTES.some(([s]) => s === hash) ? hash : 'dashboard';
  const rerender = (reset = false) => {
    if (reset) Object.assign(state, resetState());
    renderApp(state, save);
  };
  let html = '';
  let mount = null;
  if (slug === 'dashboard') html = dashboardPage(state);
  else if (slug === 'transaksi') { html = transactionsPage(state); mount = () => mountTransactions(state, save, rerender); }
  else if (slug === 'kategori') html = categoriesPage(state);
  else if (slug === 'bulanan') html = monthlyPage();
  else if (slug === 'perencana') { html = plannerPage(state); mount = () => mountPlanner(state, save); }
  else if (slug === 'kalkulator') { html = calculatorsPage(); mount = () => mountCalculators(); }
  else if (slug === 'tabungan') { html = goalsPage(state); mount = () => mountGoals(state, save, rerender); }
  else if (slug === 'tagihan') { html = billsPage(state); mount = () => mountBills(state, save, rerender); }
  else if (slug === 'tahunan') { html = yearlyPage(); mount = () => mountYearly(); }
  else if (slug === 'panduan') html = guidePage();
  app.innerHTML = html;
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#/' + slug);
  });
  window.scrollTo(0, 0);
  if (mount) mount();
}
