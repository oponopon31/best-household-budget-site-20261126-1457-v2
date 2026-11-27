// planner.js — one job: the interactive 50/30/20 budget planner.
// The user sets monthly income and the three shares; the page shows live
// rupiah amounts, a stacked bar, and a verdict against the 50/30/20 rule.
// The plan is saved to localStorage so it survives a reload.

import { rupiah } from './format.js';
import { esc } from './format.js';

const RULE = { needs: 50, wants: 30, save: 20 };

export function plannerPage(state) {
  const p = state.planner;
  return `<section class="page-head">
    <h1>Perencana 50/30/20</h1>
    <p class="lede">Bagi penghasilan bulanan jadi tiga kantong: <strong>kebutuhan</strong>, <strong>keinginan</strong>, dan <strong>tabungan</strong>. Aturan 50/30/20 dari Senator Elizabeth Warren: paling banyak 50% untuk kebutuhan, 30% untuk keinginan, dan setidaknya 20% untuk tabungan dan bayar utang.</p>
  </section>
  <div class="grid-2">
    <div class="card">
      <h2>Atur pembagianmu</h2>
      <label class="field"><span>Penghasilan per bulan</span>
        <input id="pl-income" type="number" min="0" step="50000" value="${p.income}" inputmode="numeric">
      </label>
      ${sliderRow('pl-needs', 'Kebutuhan', p.needs, 'Sewa, makan, listrik, transport, sekolah')}
      ${sliderRow('pl-wants', 'Keinginan', p.wants, 'Makan di luar, hiburan, langganan')}
      ${sliderRow('pl-save', 'Tabungan', p.save, 'Dana darurat, investasi, bayar utang')}
      <p class="total-line">Total pembagian: <strong id="pl-total">${p.needs + p.wants + p.save}%</strong> <span id="pl-total-note"></span></p>
      <div class="btn-row">
        <button class="btn" id="pl-save-btn" type="button">Simpan rencanaku</button>
        <button class="btn ghost" id="pl-reset-btn" type="button">Kembali ke 50/30/20</button>
      </div>
      <p class="saved-note" id="pl-saved" hidden>Rencana tersimpan di peramban ini.</p>
    </div>
    <div class="card">
      <h2>Hasil pembagian</h2>
      <div id="pl-results"></div>
      <div id="pl-verdict"></div>
    </div>
  </div>
  <div class="card">
    <h2>Rencana vs kenyataan bulan ini</h2>
    <p>Pengeluaran November keluarga contoh: kebutuhan sekitar Rp5.430.000, keinginan Rp640.000, tabungan Rp1.360.000 dari penghasilan Rp8.500.000. Kebutuhan keluarga ini 64% — di atas 50% — karena kontrakan dan sekolah anak. Itu wajar untuk keluarga dengan anak; yang dijaga adalah tabungan tetap 20% atau lebih.</p>
    <p class="fineprint">Angka kenyataan dihitung dari transaksi November 2026 (data contoh). Kebutuhan = makanan + rumah + transport + pendidikan + kesehatan.</p>
  </div>`;
}

function sliderRow(id, label, value, hint) {
  return `<label class="field"><span>${label} — <strong id="${id}-val">${value}%</strong></span>
    <input id="${id}" type="range" min="0" max="100" step="5" value="${value}">
    <small>${hint}</small>
  </label>`;
}

function amounts(income, needs, wants, save) {
  return [
    { key: 'needs', label: 'Kebutuhan', pct: needs, amount: income * needs / 100, color: '#15803d' },
    { key: 'wants', label: 'Keinginan', pct: wants, amount: income * wants / 100, color: '#d97706' },
    { key: 'save', label: 'Tabungan', pct: save, amount: income * save / 100, color: '#0e7490' },
  ];
}

function verdictText(needs, wants, save) {
  const notes = [];
  if (needs <= 50) notes.push('Kebutuhanmu ' + needs + '% — pas, tidak lebih dari 50%.');
  else notes.push('Kebutuhanmu ' + needs + '% — di atas 50%. Coba pangkas langganan atau belanja yang bisa ditunda.');
  if (wants <= 30) notes.push('Keinginanmu ' + wants + '% — masih dalam batas 30%.');
  else notes.push('Keinginanmu ' + wants + '% — di atas 30%. Hiburan dan makan di luar paling gampang dipangkas.');
  if (save >= 20) notes.push('Tabunganmu ' + save + '% — bagus, sudah 20% atau lebih.');
  else notes.push('Tabunganmu ' + save + '% — di bawah 20%. Naikkan sedikit demi sedikit, mulai dari 1–2%.');
  const score = (needs <= 50 ? 1 : 0) + (wants <= 30 ? 1 : 0) + (save >= 20 ? 1 : 0);
  const head = score === 3 ? 'Sesuai aturan 50/30/20.' : score === 2 ? 'Hampir sesuai aturan 50/30/20.' : 'Belum sesuai aturan 50/30/20 — masih bisa diperbaiki.';
  return { head, notes };
}

export function mountPlanner(state, save) {
  const $ = (id) => document.getElementById(id);
  const incomeEl = $('pl-income');
  const sliders = { needs: $('pl-needs'), wants: $('pl-wants'), save: $('pl-save') };

  function read() {
    return {
      income: Math.max(Number(incomeEl.value) || 0, 0),
      needs: Number(sliders.needs.value),
      wants: Number(sliders.wants.value),
      save: Number(sliders.save.value),
    };
  }

  function render() {
    const v = read();
    for (const k of ['needs', 'wants', 'save']) $(`pl-${k}-val`).textContent = v[k] + '%';
    const total = v.needs + v.wants + v.save;
    $('pl-total').textContent = total + '%';
    const note = $('pl-total-note');
    const saveBtn = $('pl-save-btn');
    if (total === 100) { note.textContent = '— pas 100%, bagus.'; note.className = 'ok'; saveBtn.disabled = false; }
    else if (total < 100) { note.textContent = '— masih sisa ' + (100 - total) + '% belum dibagi.'; note.className = 'warn'; saveBtn.disabled = true; }
    else { note.textContent = '— kelebihan ' + (total - 100) + '%, kurangi salah satu.'; note.className = 'bad'; saveBtn.disabled = true; }
    const rows = amounts(v.income, v.needs, v.wants, v.save);
    $('pl-results').innerHTML = rows.map((r) => `
      <div class="plan-row"><span class="dot" style="background:${r.color}"></span>
        <span>${r.label} <strong>${r.pct}%</strong></span><strong class="plan-amt">${rupiah(r.amount)}</strong></div>`).join('')
      + `<div class="stack-bar">${rows.map((r) => `<div style="width:${r.pct}%;background:${r.color}" title="${r.label} ${r.pct}%"></div>`).join('')}</div>
      <p class="fineprint">Per bulan, dari penghasilan ${rupiah(v.income)}.</p>`;
    const vd = verdictText(v.needs, v.wants, v.save);
    $('pl-verdict').innerHTML = `<div class="verdict"><strong>${esc(vd.head)}</strong><ul>${vd.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`;
  }

  for (const el of [incomeEl, ...Object.values(sliders)]) {
    el.addEventListener('input', render);
  }
  $('pl-reset-btn').addEventListener('click', () => {
    incomeEl.value = 8500000;
    sliders.needs.value = RULE.needs;
    sliders.wants.value = RULE.wants;
    sliders.save.value = RULE.save;
    render();
  });
  $('pl-save-btn').addEventListener('click', () => {
    const v = read();
    state.planner = { income: v.income, needs: v.needs, wants: v.wants, save: v.save };
    save();
    $('pl-saved').hidden = false;
  });
  render();
}
