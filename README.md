# mywifi-router

Halaman pintasan untuk membuka halaman admin router rumah.

- Menghitung mundur 3 detik, lalu mengalihkan pengunjung ke `http://192.168.0.1`
  (alamat router di jaringan rumah pengunjung sendiri).
- Ada tombol "Buka sekarang" dan "Batalkan", plus fallback `tplinkwifi.net`.
- Halaman ini hanya berfungsi saat perangkat tersambung ke WiFi rumah.

## Deploy ke Vercel

Impor repo ini di [vercel.com/new](https://vercel.com/new) sebagai proyek statis
(tanpa framework, tanpa perintah build). `index.html` di root adalah halamannya.
