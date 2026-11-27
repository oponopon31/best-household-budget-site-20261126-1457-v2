// data.js — one job: the seed content of the example household.
// All figures are fictional example data ("data contoh"). The three national
// benchmarks below are real public figures, each with its source named.

// Household: Budi & Sari, two earners, two children, Jakarta. Monthly income
// is the same every month so the planner and the yearly view stay comparable.
export const HOUSEHOLD = {
  name: 'Keluarga Budi & Sari',
  members: 4,
  city: 'Jakarta',
  incomeMonthly: 8500000,
  incomeParts: [
    { label: 'Gaji Budi', amount: 5500000 },
    { label: 'Gaji Sari', amount: 3000000 },
  ],
};

export const CATEGORIES = [
  { id: 'makanan', name: 'Makanan & Belanja', budget: 2500000, color: '#15803d' },
  { id: 'rumah', name: 'Rumah & Utilitas', budget: 1800000, color: '#b45309' },
  { id: 'transport', name: 'Transportasi', budget: 900000, color: '#0e7490' },
  { id: 'pendidikan', name: 'Pendidikan Anak', budget: 1200000, color: '#6d28d9' },
  { id: 'kesehatan', name: 'Kesehatan', budget: 500000, color: '#be123c' },
  { id: 'hiburan', name: 'Hiburan & Lainnya', budget: 600000, color: '#4d7c0f' },
];

// Twelve months, Dec 2025 – Nov 2026. Spending is the household's total
// outgoings each month; income is HOUSEHOLD.incomeMonthly every month.
export const MONTHLY = [
  { month: '2025-12', spend: 6420000 },
  { month: '2026-01', spend: 6980000 },
  { month: '2026-02', spend: 6540000 },
  { month: '2026-03', spend: 7210000 },
  { month: '2026-04', spend: 6870000 },
  { month: '2026-05', spend: 7450000 },
  { month: '2026-06', spend: 7120000 },
  { month: '2026-07', spend: 6610000 },
  { month: '2026-08', spend: 7580000 },
  { month: '2026-09', spend: 6940000 },
  { month: '2026-10', spend: 7310000 },
  { month: '2026-11', spend: 7140000 },
];

// November 2026 spending per category (the month the dashboard shows).
export const NOVEMBER_BY_CATEGORY = {
  makanan: 2350000,
  rumah: 1750000,
  transport: 820000,
  pendidikan: 1150000,
  kesehatan: 430000,
  hiburan: 640000,
};

export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', desc: 'Gaji Budi', cat: 'pemasukan', amount: 5500000 },
  { id: 't02', date: '2026-11-01', desc: 'Gaji Sari', cat: 'pemasukan', amount: 3000000 },
  { id: 't03', date: '2026-11-01', desc: 'Kontrakan rumah November', cat: 'rumah', amount: -950000 },
  { id: 't04', date: '2026-11-02', desc: 'Belanja mingguan pasar', cat: 'makanan', amount: -486000 },
  { id: 't05', date: '2026-11-05', desc: 'Bensin motor & mobil', cat: 'transport', amount: -320000 },
  { id: 't06', date: '2026-11-07', desc: 'SPP sekolah anak', cat: 'pendidikan', amount: -850000 },
  { id: 't07', date: '2026-11-08', desc: 'Belanja bulanan supermarket', cat: 'makanan', amount: -912000 },
  { id: 't08', date: '2026-11-10', desc: 'Internet rumah', cat: 'rumah', amount: -299000 },
  { id: 't09', date: '2026-11-10', desc: 'BPJS Kesehatan', cat: 'kesehatan', amount: -350000 },
  { id: 't10', date: '2026-11-12', desc: 'Buku & alat tulis anak', cat: 'pendidikan', amount: -300000 },
  { id: 't11', date: '2026-11-14', desc: 'Makan di luar keluarga', cat: 'hiburan', amount: -285000 },
  { id: 't12', date: '2026-11-15', desc: 'Cicilan motor', cat: 'transport', amount: -500000 },
  { id: 't13', date: '2026-11-16', desc: 'Belanja mingguan pasar', cat: 'makanan', amount: -452000 },
  { id: 't14', date: '2026-11-18', desc: 'Langganan TV', cat: 'hiburan', amount: -149000 },
  { id: 't15', date: '2026-11-20', desc: 'Listrik PLN', cat: 'rumah', amount: -316000 },
  { id: 't19', date: '2026-11-26', desc: 'Belanja mingguan pasar', cat: 'makanan', amount: -500000 },
  { id: 't16', date: '2026-11-22', desc: 'Obat & vitamin', cat: 'kesehatan', amount: -80000 },
  { id: 't17', date: '2026-11-24', desc: 'Bioskop keluarga', cat: 'hiburan', amount: -206000 },
  { id: 't18', date: '2026-11-25', desc: 'Air PDAM', cat: 'rumah', amount: -185000 },
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Dana darurat', target: 19500000, saved: 12400000, note: '6 bulan pengeluaran pokok' },
  { id: 'g2', name: 'Liburan keluarga', target: 6000000, saved: 3750000, note: 'Libur sekolah akhir tahun' },
  { id: 'g3', name: 'DP motor baru', target: 12000000, saved: 8200000, note: 'Ganti motor lama' },
  { id: 'g4', name: 'Pendidikan anak', target: 10000000, saved: 4600000, note: 'Biaya masuk sekolah baru' },
];

export const SEED_BILLS = [
  { id: 'b1', name: 'Kontrakan rumah', amount: 950000, dueDay: 1, paid: true },
  { id: 'b2', name: 'Internet rumah', amount: 299000, dueDay: 10, paid: true },
  { id: 'b3', name: 'BPJS Kesehatan', amount: 350000, dueDay: 10, paid: true },
  { id: 'b4', name: 'Cicilan motor', amount: 500000, dueDay: 15, paid: true },
  { id: 'b5', name: 'Langganan TV', amount: 149000, dueDay: 18, paid: true },
  { id: 'b6', name: 'Listrik PLN', amount: 316000, dueDay: 20, paid: true },
  { id: 'b7', name: 'Air PDAM', amount: 185000, dueDay: 25, paid: true },
  { id: 'b8', name: 'Iuran RT', amount: 50000, dueDay: 5, paid: false },
];

// Real national benchmarks, shown with their sources on the dashboard.
export const BENCHMARKS = [
  {
    label: 'Garis kemiskinan',
    perCapita: 641443,
    source: 'BPS, September 2025',
  },
  {
    label: 'Rata-rata pengeluaran penduduk',
    perCapita: 1584473,
    source: 'BPS Susenas, September 2025',
  },
  {
    label: 'UMP DKI Jakarta 2026',
    perCapita: 5729876,
    source: 'Pemprov DKI Jakarta, 2026',
    flat: true,
  },
];

export const CURRENT_MONTH = '2026-11';
export const PREV_MONTH = '2026-10';
