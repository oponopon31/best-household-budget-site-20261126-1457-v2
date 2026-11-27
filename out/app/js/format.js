// format.js — one job: turn numbers and dates into readable Indonesian text.
// Nothing here touches the page or storage; every other module imports these helpers.

export function rupiah(n) {
  const v = Math.round(Number(n) || 0);
  return 'Rp' + v.toLocaleString('id-ID');
}

export function rupiahShort(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e9) return 'Rp' + (v / 1e9).toFixed(1).replace('.', ',') + ' M';
  if (Math.abs(v) >= 1e6) return 'Rp' + (v / 1e6).toFixed(1).replace('.', ',') + ' jt';
  if (Math.abs(v) >= 1e3) return 'Rp' + Math.round(v / 1e3) + ' rb';
  return rupiah(v);
}

export function persen(n, digits = 1) {
  return (Number(n) || 0).toFixed(digits).replace('.', ',') + '%';
}

// Signed delta, e.g. +Rp120.000 or -Rp45.000, used on every dashboard card.
export function deltaRupiah(n) {
  const v = Math.round(Number(n) || 0);
  if (v === 0) return 'Rp0';
  return (v >= 0 ? '+' : '−') + 'Rp' + Math.abs(v).toLocaleString('id-ID');
}

export function tanggalIndo(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function bulanIndo(isoMonth) {
  const [y, m] = isoMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Plain number with Indonesian thousand separators, no "Rp" prefix.
export function angka(n) {
  return (Math.round(Number(n) || 0)).toLocaleString('id-ID');
}

// Short month label, e.g. "Nov 2026", for chart axes and tables.
export function bulanSingkat(isoMonth) {
  const [y, m] = isoMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

// Escape user-typed text before it is injected into the page.
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
