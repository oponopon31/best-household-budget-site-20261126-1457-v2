// main.js — one job: start the site.
// Loads the saved household state, renders the page for the current hash,
// and re-renders whenever the hash changes. No network, no framework.

import { loadState, saveState } from './state.js';
import { navLinks, renderApp } from './render.js';

const state = loadState();
const save = () => saveState(state);

const nav = document.getElementById('main-nav');
if (nav) nav.innerHTML = navLinks('dashboard');

const TITLES = {
  dashboard: 'Dasbor — RencanaKeluarga',
  transaksi: 'Transaksi — RencanaKeluarga',
  kategori: 'Kategori & Anggaran — RencanaKeluarga',
  bulanan: 'Bulan ke Bulan — RencanaKeluarga',
  perencana: 'Perencana 50/30/20 — RencanaKeluarga',
  kalkulator: 'Kalkulator Utang & Dana Darurat — RencanaKeluarga',
  tabungan: 'Tabungan & Tujuan — RencanaKeluarga',
  tagihan: 'Tagihan & Pengingat — RencanaKeluarga',
  tahunan: 'Rencana Tahunan 2027 — RencanaKeluarga',
  panduan: 'Panduan — RencanaKeluarga',
};

function show() {
  const slug = location.hash.replace(/^#\/?/, '') || 'dashboard';
  document.title = TITLES[slug] ?? TITLES.dashboard;
  renderApp(state, save);
}

window.addEventListener('hashchange', show);
show();
