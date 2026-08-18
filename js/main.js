// main.js — entry point.
// 1) Ambil semua partial HTML & suntikkan ke #app (urutan dijaga persis kayak index.html asli)
// 2) Baru load semua modul script.js (classic script, urut) supaya semua elemen udah ada di DOM
// 3) Terakhir load modul firebase (ES module)

const PARTIALS = [
    'partials/main-content.html',
    'partials/page-product.html',
    'partials/page-payment.html',
    'partials/page-notif.html',
    'partials/sheet-metode.html',
    'partials/sheet-ig.html',
    'partials/sheet-addon.html',
    'partials/page-status.html'
];

const SCRIPTS = [
    'js/helpers.js',
    'js/data-produk.js',
    'js/core-elemen-dan-state.js',
    'js/slider.js',
    'js/produk-detail.js',
    'js/navigasi-halaman.js',
    'js/bottom-sheet-metode.js',
    'js/addon-sheet.js',
    'js/sheet-ig.js',
    'js/status-viewer.js',
    'js/status-composer.js',
    'js/favicon-sync.js'
];

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = false; // jaga urutan eksekusi persis sesuai array SCRIPTS
        s.onload = resolve;
        s.onerror = () => reject(new Error('Gagal load ' + src));
        document.body.appendChild(s);
    });
}

async function boot() {
    const app = document.getElementById('app');

    // 1) Ambil semua partial paralel (lebih cepat), tapi suntikkan sesuai urutan array
    const htmlList = await Promise.all(
        PARTIALS.map(url => fetch(url).then(r => r.text()))
    );
    htmlList.forEach(html => {
        app.insertAdjacentHTML('beforeend', html);
    });

    // 2) Load semua modul JS lama secara berurutan (sequential, bukan paralel)
    for (const src of SCRIPTS) {
        await loadScript(src);
    }

    // 3) Baru load firebase (ES module, urutan internalnya dijaga lewat import di dalam index.js)
    await import('./firebase/index.js');
}

boot().catch(err => console.error('[main.js] gagal boot:', err));
