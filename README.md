# mywifi-router

Situs **R STUDIO LABS — Sewa WiFi** (Rp5.000/jam), terpasang di proyek Vercel
**mywifi-router** (tim rodiiis-projects) dan domain **mywifi.rstudiolab.tech**.

## Isi

- `index.html` — halaman sewa WiFi ala kasir: pilih durasi (1/2/3/5/10/24 jam
  atau atur sendiri), ringkasan struk dengan total otomatis, metode bayar
  QRIS/tunai, tombol Bayar menghasilkan kode pesanan (format RSL-XXXXXX).
- `admin.html` — halaman peluncur ke menu admin router rumah: langsung
  mengalihkan ke `http://192.168.0.1`. Ditautkan kecil di footer situs
  ("Area petugas: Admin Router"). Hanya berfungsi di WiFi rumah.

## Deploy

Setiap push ke branch `main` memicu deployment produksi otomatis di Vercel.
