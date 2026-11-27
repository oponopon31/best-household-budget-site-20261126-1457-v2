// state.js — one job: keep the household's editable data in localStorage.
// Seed data lives in data.js; this module owns loading, saving, resetting,
// and the small sums the pages need (this month vs last month).

import {
  CATEGORIES, HOUSEHOLD, MONTHLY, NOVEMBER_BY_CATEGORY,
  SEED_BILLS, SEED_GOALS, SEED_TRANSACTIONS,
} from './data.js';

const KEY = 'rencana-keluarga-v2';

function freshState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    bills: SEED_BILLS.map((b) => ({ ...b })),
    planner: { income: HOUSEHOLD.incomeMonthly, needs: 50, wants: 30, save: 20 },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions)) return freshState();
    return { ...freshState(), ...parsed };
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
  return freshState();
}

// Spending per category for November, from the transaction list itself,
// so the category bars and the transaction list can never disagree.
export function novemberByCategory(state) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of state.transactions) {
    if (t.amount < 0 && t.cat in out) out[t.cat] += -t.amount;
  }
  return out;
}

// Fall back to the seed split when a category has no transactions yet.
export function categorySpend(state) {
  const fromTx = novemberByCategory(state);
  const out = {};
  for (const c of CATEGORIES) {
    out[c.id] = fromTx[c.id] > 0 ? fromTx[c.id] : NOVEMBER_BY_CATEGORY[c.id];
  }
  return out;
}

export function monthSpend(isoMonth) {
  const row = MONTHLY.find((m) => m.month === isoMonth);
  return row ? row.spend : 0;
}

export function monthIncome() {
  return HOUSEHOLD.incomeMonthly;
}

// Average monthly spending across the 12-month series.
export function averageSpend() {
  const total = MONTHLY.reduce((s, m) => s + m.spend, 0);
  return Math.round(total / MONTHLY.length);
}

export function bestMonth() {
  return MONTHLY.reduce((a, b) => (b.spend < a.spend ? b : a));
}

export function worstMonth() {
  return MONTHLY.reduce((a, b) => (b.spend > a.spend ? b : a));
}

// Savings rate for a month: share of income left after spending.
export function savingsRate(isoMonth) {
  const income = monthIncome();
  if (income <= 0) return 0;
  return (income - monthSpend(isoMonth)) / income;
}
