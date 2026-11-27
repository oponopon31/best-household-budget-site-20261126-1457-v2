// charts.js — one job: build hand-rolled SVG charts from plain numbers.
// No library, no canvas, no network: every chart is inline SVG strings.

import { rupiahShort } from './format.js';

// Donut: parts = [{label, value, color}]. Returns an SVG string.
export function donutChart(parts, size = 220) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const stroke = 34;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = parts
    .map((p) => {
      const frac = p.value / total;
      const len = Math.max(frac * circumference - 2, 0);
      const dash = `${len} ${circumference - len}`;
      const rot = (offset / total) * 360 - 90;
      offset += p.value;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${stroke}" stroke-dasharray="${dash}" transform="rotate(${rot.toFixed(1)} ${cx} ${cy})"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Diagram lingkaran pengeluaran per kategori">${arcs}<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${rupiahShort(total)}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">total belanja</text></svg>`;
}

// Horizontal budget-vs-actual bars, one row per category.
export function budgetBars(rows) {
  const max = Math.max(...rows.map((r) => Math.max(r.budget, r.actual)), 1);
  return rows
    .map((r) => {
      const actualPct = Math.min((r.actual / max) * 100, 100);
      const budgetPct = Math.min((r.budget / max) * 100, 100);
      const over = r.actual > r.budget;
      return `<div class="bar-row">
        <div class="bar-head"><span class="bar-name"><span class="dot" style="background:${r.color}"></span>${r.name}</span><span class="bar-nums">${r.actualText} <em>/ ${r.budgetText}</em></span></div>
        <div class="bar-track"><div class="bar-budget" style="width:${budgetPct.toFixed(1)}%"></div><div class="bar-actual" style="width:${actualPct.toFixed(1)}%;background:${r.color}"></div></div>
        <div class="bar-note ${over ? 'over' : 'under'}">${over ? 'Lewat anggaran ' + r.overText : 'Masih sisa ' + r.leftText}</div>
      </div>`;
    })
    .join('');
}

// Vertical bar chart for the 12-month series. Highlights the current month.
export function monthBars(months, highlightMonth) {
  const max = Math.max(...months.map((m) => m.spend), 1);
  const bars = months
    .map((m) => {
      const h = Math.max((m.spend / max) * 100, 4);
      const hot = m.month === highlightMonth;
      return `<div class="mbar ${hot ? 'hot' : ''}" title="${m.label}: ${m.text}">
        <span class="mbar-val">${m.short}</span>
        <div class="mbar-col" style="height:${h.toFixed(0)}%"></div>
        <span class="mbar-lab">${m.label}</span>
      </div>`;
    })
    .join('');
  return `<div class="mbars">${bars}</div>`;
}

// Simple SVG line chart with dots, for the savings / projection view.
export function lineChart(points, width = 640, height = 220) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const span = max - min || 1;
  const padL = 8;
  const padB = 26;
  const padT = 12;
  const stepX = (width - padL * 2) / Math.max(points.length - 1, 1);
  const xy = points.map((p, i) => {
    const x = padL + i * stepX;
    const y = padT + (1 - (p.value - min) / span) * (height - padT - padB);
    return { x, y, ...p };
  });
  const path = xy.map((p, i) => (i === 0 ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}` : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)).join(' ');
  const dots = xy
    .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#14532d"/><text x="${p.x.toFixed(1)}" y="${(p.y - 9).toFixed(1)}" text-anchor="middle" class="line-val">${p.short}</text>`)
    .join('');
  const labels = xy
    .map((p) => `<text x="${p.x.toFixed(1)}" y="${height - 6}" text-anchor="middle" class="line-lab">${p.label}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="line-svg" role="img" aria-label="Grafik garis"><path d="${path}" fill="none" stroke="#15803d" stroke-width="3" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}
