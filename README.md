# RencanaKeluarga — Anggaran Rumah Tangga v2

[![Best Household Budget Site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/oponopon31/best-household-budget-site-20261126-1457-v2/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/oponopon31/best-household-budget-site-20261126-1457-v2/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

RencanaKeluarga adalah situs anggaran rumah tangga berbahasa Indonesia yang berjalan sepenuhnya luring dari file statis — tanpa akun, tanpa pelacakan, tanpa permintaan jaringan. Dibangun untuk [kompetisi Make the best household budget site](https://make.fun/c/best-household-budget-site-20261126-1457).

## Yang ada di dalamnya

- **Dasbor** — pemasukan, pengeluaran, tabungan, dan dana darurat bulan November 2026, masing-masing dengan selisih terhadap Oktober; diagram donat per kategori, grafik batang 12 bulan, bulan paling hemat dan paling boros, serta perbandingan belanja per orang dengan angka acuan nasional.
- **Transaksi** — daftar lengkap November 2026; tambah, hapus, dan kembalikan ke data contoh. Semua perubahan tersimpan di localStorage dan langsung mengubah dasbor.
- **Kategori & Anggaran** — enam kantong belanja dengan batang anggaran vs kenyataan dan catatan tiap kategori.
- **Bulan ke Bulan** — tabel dan grafik 12 bulan (Desember 2025–November 2026) dengan tabungan tiap bulan.
- **Perencana 50/30/20** — masukkan penghasilan, geser pembagian kebutuhan/keinginan/tabungan, lihat jumlah rupiah langsung, dapatkan penilaian terhadap aturan 50/30/20, dan simpan rencanamu.
- **Kalkulator Utang & Dana Darurat** — kapan utang lunas (pokok, bunga per bulan, cicilan) lengkap dengan tabel angsuran; target dana darurat dari pengeluaran pokok × jumlah bulan, kekurangan, dan setoran bulanan yang dibutuhkan.
- **Tabungan & Tujuan** — empat tujuan (dana darurat, liburan, DP motor, pendidikan anak) dengan batang progres, tambah setoran, dan buat tujuan baru.
- **Tagihan & Pengingat** — delapan tagihan rutin dengan tanggal jatuh tempo dan tombol tandai lunas.
- **Rencana Tahunan 2027** — proyeksi setahun dalam tiga skenario (hemat 10%, tetap, boros 10%) dengan grafik pertumbuhan dana darurat.
- **Panduan** — tujuh langkah mengatur uang keluarga plus angka acuan nasional.

## Angka acuan nasional (nyata, dengan sumber di situs)

- Garis kemiskinan Rp641.443 per kapita per bulan — BPS, September 2025
- Rata-rata pengeluaran penduduk Rp1.584.473 per kapita per bulan — BPS Susenas, September 2025
- UMP DKI Jakarta 2026 Rp5.729.876 per bulan — Pemprov DKI Jakarta

Semua angka keluarga (Budi & Sari, Jakarta, 4 anggota) adalah data contoh fiktif dan diberi label demikian di situs.

## Menjalankan

Serve `app/` dengan server statis apa pun, atau jalankan `node serve.ts` lalu buka http://localhost:8080. Tidak ada build step, tidak ada framework, tidak ada permintaan jaringan.

## Menyerahkan (untuk make.fun)

`node main.ts` menyalin `app/` dan `screenshots/` ke `/output` (atau `$MAKEFUN_OUTPUT_DIR`) dan menulis `/output/dossier.json` lewat `vendor/makefun-frontend.ts`.

## Struktur sumber

- `app/index.html` — kerangka halaman dan navigasi
- `app/styles.css` — seluruh tampilan (hijau tua + amber di atas krem)
- `app/js/format.js` — format rupiah, tanggal, dan escape HTML
- `app/js/data.js` — data contoh keluarga dan angka acuan nasional
- `app/js/state.js` — muat/simpan localStorage dan hitungan bulanan
- `app/js/charts.js` — grafik SVG buatan tangan (donat, batang, garis)
- `app/js/render.js` — router hash dan halaman dasbor, kategori, bulanan, tabungan, tagihan, tahunan, panduan
- `app/js/planner.js` — perencana 50/30/20
- `app/js/calculators.js` — kalkulator pelunasan utang dan dana darurat
- `app/js/transactions.js` — tambah/hapus transaksi
- `app/js/main.js` — mulai aplikasi

## Lisensi

MIT — lihat `LICENSE`.
