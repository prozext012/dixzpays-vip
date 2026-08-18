<div align="center">

# 🛍️ Andika Store

**Toko online modern dengan status/story viewer, notifikasi realtime, dan pembayaran QRIS — 100% vanilla JS, tanpa framework, tanpa build step.**

[![Made with Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firestore-Realtime-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## ✨ Fitur

- 🛒 **Katalog produk** dinamis, disinkron realtime dari Firestore
- 📖 **Status/Story viewer** ala Instagram — foto, video, teks, balas pesan & suara
- 🔔 **Notifikasi realtime** dengan suara + text-to-speech
- 💳 **Pembayaran QRIS** otomatis per produk, termasuk addon & bundling
- 📊 **Tracking pengunjung** (sesi online/offline, halaman yang dibuka)
- ⭐ **Testimoni silang** antar produk
- 📱 Full responsive, dioptimalkan buat mobile

## 🗂️ Struktur Proyek

Proyek ini sengaja **dipecah jadi banyak file kecil** (bukan 1 file raksasa) supaya lebih gampang dibaca, di-maintain, dan di-debug.

```
andika-store/
├── index.html                  # Shell utama — head, link CSS, & loader
├── vercel.json                 # Konfigurasi cache & security header
│
├── css/                        # Semua style, dipecah per bagian halaman
│   ├── base.css
│   ├── profile-card.css
│   ├── notif.css
│   ├── product-grid.css
│   ├── product-detail.css
│   ├── ig-sheet.css
│   ├── payment.css
│   ├── bottom-sheet-metode.css
│   ├── addon-sheet.css
│   └── status-viewer.css
│
├── partials/                   # Potongan HTML, di-suntik ke DOM saat runtime
│   ├── main-content.html       # Profile card + grid produk + footer
│   ├── page-product.html
│   ├── page-payment.html
│   ├── page-notif.html
│   ├── sheet-metode.html
│   ├── sheet-ig.html
│   ├── sheet-addon.html
│   └── page-status.html
│
└── js/
    ├── main.js                 # 🚦 Entry point — orkestrasi loading semua di atas
    ├── helpers.js
    ├── data-produk.js
    ├── core-elemen-dan-state.js
    ├── slider.js
    ├── produk-detail.js
    ├── navigasi-halaman.js
    ├── bottom-sheet-metode.js
    ├── addon-sheet.js
    ├── sheet-ig.js
    ├── status-viewer.js
    ├── status-composer.js
    ├── favicon-sync.js
    └── firebase/
        ├── index.js             # Entry point modul firebase
        ├── firebase-init.js
        ├── notifikasi-firestore.js
        ├── visitor-tracking.js
        ├── testimoni-firestore.js
        └── produk-sync-firestore.js
```

## ⚙️ Cara Kerja

Karena HTML-nya dipecah jadi partial, halaman ini butuh sedikit orkestrasi saat pertama dibuka. Alurnya diatur penuh oleh `js/main.js`:

```
1. fetch() semua file di partials/  →  suntik ke <div id="app">
2. load semua modul js/*.js secara berurutan (biar semua elemen sudah ada di DOM)
3. import modul js/firebase/index.js (Firestore realtime sync)
```

> 💡 Karena pakai `fetch()`, situs ini **wajib diakses lewat server (http/https)** — tidak akan jalan kalau `index.html` dibuka langsung dari file lokal (`file://`).

## 🚀 Menjalankan di Lokal

```bash
# Opsi 1 — pakai Node
npx serve .

# Opsi 2 — pakai Python
python3 -m http.server 8000
```

Lalu buka `http://localhost:3000` (atau port yang muncul di terminal).

## ☁️ Deploy ke Vercel

1. Push isi repo ini ke GitHub
2. Import repo di [vercel.com/new](https://vercel.com/new)
3. Framework preset: **Other** (static site, tanpa build command)
4. Deploy 🎉

Konfigurasi cache & security header sudah diatur otomatis lewat `vercel.json`.

## 🔥 Firebase

Data produk, notifikasi, status, dan testimoni disinkron realtime lewat **Firestore**, dan dikontrol dari aplikasi admin terpisah. Konfigurasi project ada di `js/firebase/firebase-init.js`.

---

<div align="center">
<sub>Dibuat dengan ❤️ oleh Andika</sub>
</div>
