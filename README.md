# mywifi-router

Situs **R STUDIO LABS — Sewa WiFi** (Rp5.000/jam), terpasang di proyek Vercel
**mywifi-router** (tim rodiiis-projects) dan domain **mywifi.rstudiolab.tech**.

## Halaman

- `index.html` — halaman utama sewa WiFi. Pilih durasi (1/2/3/5/10/24 jam atau
  atur sendiri), ringkasan struk dengan total otomatis (biaya layanan 11%, maks.
  Rp1.000), pembayaran QRIS dinamis, kode pesanan, dan status pembayaran realtime
  lewat Firestore.
  - **Fitur:** pengalih tema terang/gelap, nomor WhatsApp tersimpan di browser,
    cek status pesanan & hitung mundur sisa sewa langsung di halaman, FAQ, toast,
    salin ID transaksi, dan transaksi aktif yang pulih otomatis setelah refresh.
  - **Waktu sewa** dihitung dari field `startedAt`, bukan `confirmedAt`. Field ini
    diisi admin lewat tombol **Mulai Sewa** setelah SSID & password dikirim ke
    WhatsApp pembeli. Sebelum tombol ditekan, pelanggan melihat status
    "waktu sewa belum dimulai" (tidak ada hitung mundur yang berjalan mundur).
- `verify-user.html` (`/verify-user`) — cek status pesanan lengkap berdasarkan ID
  transaksi atau nomor WhatsApp, dengan timeline progres dan sisa waktu sewa.
- `petugas.html` (`/petugas`) — panel admin (login Discord, role admin dari
  Firestore). Konfigurasi merchant/QRIS, daftar transaksi realtime, konfirmasi
  pembayaran, struk cetak & gambar struk, notifikasi suara.
  - **Fitur baru:** kartu statistik (transaksi/pendapatan hari ini, perlu
    diproses, total transaksi), pencarian & filter status, export CSV, konfirmasi
    massal, dan waktu relatif.
  - Tombol **▶ Mulai Sewa** muncul di setiap transaksi yang sudah terkonfirmasi.
    Menekannya menyimpan `startedAt` + `startedBy` ke Firestore setelah konfirmasi
    bahwa kredensial WiFi sudah dikirim; setelah itu tampil hitung mundur sisa
    sewa secara live.
- `admin.html` (`/admin`) — peluncur ke panel router rumah (`192.168.0.1`).
- `404.html` — halaman tidak ditemukan.
- `terms-of-service.html` (`/terms-of-service`) dan `privacy-policy.html`
  (`/privacy-policy`) — dokumen layanan.
- `styles.css` — design system bersama untuk halaman konten.
- `logo.svg` — logo merek.

## Desain

Design system modern: tipografi Plus Jakarta Sans + JetBrains Mono, kartu glass,
mesh gradient, animasi halus, responsif, dukungan dark mode (otomatis maupun
manual melalui tombol di header), dan `prefers-reduced-motion`.

## Deploy

Setiap push ke branch `main` memicu deployment produksi otomatis di Vercel.
`vercel.json` mengatur clean URL dan rewrite untuk rute di atas.
