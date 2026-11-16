# mywifi-router

Situs **R STUDIO LABS — Sewa WiFi** (Rp5.000/jam), terpasang di proyek Vercel
**mywifi-router** (tim rodiiis-projects) dan domain **mywifi.rstudiolab.tech**.

## Halaman

- `index.html` — halaman utama sewa WiFi. Pilih durasi, struk otomatis (biaya
  layanan 11%, maks. Rp1.000), QRIS dinamis, kode pesanan, dan status realtime.
  - Theme toggle terang/gelap, nomor WhatsApp tersimpan, cek status + hitung
    mundur, FAQ, toast, salin ID, transaksi pulih setelah refresh.
  - **Kode promo** (voucher) dengan diskon Rp / persen, kuota, dan minimal belanja.
  - **Perpanjang sewa** langsung dari halaman sukses (+1/+2/+3/+5 jam).
  - Progress bar sisa waktu (hijau → kuning → merah) dan tombol **Bagikan Status**.
  - Installable via PWA (lihat bawah).
- `verify-user.html` (`/verify-user`) — cek status lengkap: timeline progres,
  sisa waktu + progress bar, **daftar semua transaksi per nomor WhatsApp**, dan
  bagikan tautan status. Auto-refresh tiap 15 detik.
- `petugas.html` (`/petugas`) — panel admin login Discord (role admin dari
  Firestore): konfigurasi merchant/QRIS, transaksi realtime, konfirmasi, struk
  cetak/gambar, notifikasi suara.
  - Statistik + **grafik pendapatan 7 hari**, pencarian/filter status, export CSV,
    konfirmasi massal, waktu relatif.
  - Tombol **▶ Mulai Sewa** per transaksi → menyimpan `startedAt` + `startedBy`.
    Klik **Selesai** / tombol **Tandai yang sudah habis**, atau auto-expire tiap
    menit → status `expired`.
  - Kelola **voucher**: buat kode, diskon Rp/%, kuota, aktif/nonaktif, hapus.
  - Transaksi perpanjangan otomatis menambah `hours` transaksi induk saat dikonfirmasi.
- `admin.html` (`/admin`) — peluncur ke panel router rumah (`192.168.0.1`).
- `404.html`, `terms-of-service.html`, `privacy-policy.html` — halaman pendukung.
- `styles.css` — design system bersama untuk halaman konten.

## PWA

`manifest.webmanifest`, `sw.js`, `pwa.js`, dan `icon-512.png` membuat situs bisa
dipasang ke home screen. Service worker memakai **network-first untuk navigasi**
dan **cache-first untuk aset lokal**; permintaan ke Firebase/Google Fonts tidak
di-cache. Tombol pasang muncul otomatis saat browser mendukung prompt install.

## Model data Firestore

- `transactions/{id}` — field baru: `startedAt`, `startedBy`, `type` (`wifi` /
  `extension`), `extensionOf`, `voucher`, `discount`, `endedAt`, status `expired`.
- `vouchers/{KODE}` — `code`, `type` (`fixed`/`percent`), `value`, `quota`,
  `used`, `active`, `createdAt`.

> **Catatan deployment:** aturan Firestore harus mengizinkan `read` pada
> `vouchers` untuk pelanggan dan `write` untuk admin, serta `update` pada
> `transactions` (field baru). Domain produksi juga harus terdaftar di
> Firebase → Authentication → Authorized Domains agar query Firestore jalan.

## Deploy

Setiap push ke branch `main` memicu deployment produksi otomatis di Vercel.
`vercel.json` mengatur clean URL dan rewrite untuk rute di atas.
