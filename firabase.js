// ===== FIREBASE (Firestore) — buat notifikasi & testimoni realtime =====
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
    import { getFirestore, collection, onSnapshot, query, orderBy, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

    const firebaseConfig = {
        apiKey: "AIzaSyDztQD-U1k8Oz1Vnw7z3yUKzSzSP0RN1vg",
        authDomain: "kasir-warung-c9479.firebaseapp.com",
        projectId: "kasir-warung-c9479",
        storageBucket: "kasir-warung-c9479.firebasestorage.app",
        messagingSenderId: "765164639630",
        appId: "1:765164639630:web:f7f4fefd1753bfc0e080df",
        measurementId: "G-739VXW44QZ"
    };

    const fbApp = initializeApp(firebaseConfig);
    const db = getFirestore(fbApp);

    // ----- Daftar produk didaftarkan otomatis ke Firestore, biar web admin selalu ikut update -----
    const PRODUCT_LIST = [
        { id: 1, key: 'apk-jam', name: 'APK Widget Jam' },
        { id: 2, key: 'ig', name: 'Followers IG' },
        { id: 3, key: 'ebook', name: '2.000+ Buku Digital Premium' },
        { id: 4, key: 'tiktok', name: 'Followers TikTok' }
    ];
    PRODUCT_LIST.forEach(p => {
        setDoc(doc(db, 'productMeta', String(p.id)), p).catch(() => {});
    });

    // ----- Status Online/Offline (dikontrol dari website admin) -----
    onSnapshot(doc(db, 'settings', 'status'), (snap) => {
        const online = snap.exists() ? (snap.data().online !== false) : true;
        const badge = document.querySelector('.online-badge');
        if (badge) {
            badge.querySelector('span').textContent = online ? 'Online' : 'Offline';
            badge.style.borderColor = 'var(--dark)';
            badge.querySelector('.online-dot').style.background = online ? 'var(--green)' : 'var(--soft-red)';
        }
    });

    // ----- Profil (foto profil, banner, nama, bio) — bisa diedit dari website admin -----
    function applyProfileToDom(p) {
        if (!p) return;
        if (p.avatar) { const el = document.getElementById('profileAvatarImg'); if (el) el.src = p.avatar; }
        if (p.banner) { const el = document.getElementById('profileCoverImg'); if (el) el.src = p.banner; }
        if (p.nama) { const el = document.getElementById('profileNameText'); if (el) el.textContent = p.nama; }
        if (p.bio) { const el = document.getElementById('profileBioText'); if (el) el.textContent = p.bio; }
    }
    // Tampilkan dulu versi yang tersimpan di HP (kalau ada), jadi gak perlu nunggu server duluan —
    // ini yang bikin sebelumnya sempat kelihatan data lama dulu baru beberapa detik kemudian berubah.
    try {
        const cachedProfile = localStorage.getItem('cachedProfile');
        if (cachedProfile) applyProfileToDom(JSON.parse(cachedProfile));
    } catch (e) {}
    onSnapshot(doc(db, 'settings', 'profile'), (snap) => {
        if (!snap.exists()) return;
        const p = snap.data();
        applyProfileToDom(p);
        try { localStorage.setItem('cachedProfile', JSON.stringify(p)); } catch (e) {}
    });

    // ----- Badge jumlah notifikasi belum dibaca -----
    window.__notifData = [];
    function getSeenNotifIds() {
        try { return JSON.parse(localStorage.getItem('seenNotifIds') || '[]'); }
        catch (e) { return []; }
    }
    function updateNotifBadges() {
        const seen = getSeenNotifIds();
        const unread = window.__notifData.filter(n => seen.indexOf(n.id) === -1).length;
        document.querySelectorAll('.notif-count-badge').forEach(el => {
            if (unread > 0) {
                el.textContent = unread > 99 ? '99+' : String(unread);
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }
    onSnapshot(query(collection(db, 'notifikasi'), orderBy('createdAt', 'desc')), (snap) => {
        window.__notifData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        updateNotifBadges();
        renderNotifPage();
    });

    function formatWaktuNotif(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const startOfDay = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());
        const diffHari = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
        const jam = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        if (diffHari <= 0) return `hari ini ${jam}`;
        if (diffHari === 1) return `kemarin ${jam}`;
        return `${diffHari} hari yang lalu ${jam}`;
    }

    function renderNotifPage() {
        const listEl = document.getElementById('notifPageList');
        const emptyEl = document.getElementById('notifEmptyState');
        if (!listEl) return;
        listEl.innerHTML = '';
        if (window.__notifData.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        window.__notifData.forEach(d => {
            const card = document.createElement('div');
            card.className = 'notif-page-card';
            card.innerHTML = `
                ${d.img ? `<img src="${d.img}" alt="Notifikasi" loading="lazy" />` : ''}
                <div class="notif-page-body">
                    <div class="notif-page-desc">${(d.desc || '').replace(/</g, '&lt;')}</div>
                    <div class="notif-page-time">${formatWaktuNotif(d.createdAt)}</div>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    // Dipanggil pas halaman notifikasi dibuka: tandai semua sudah dibaca
    window.markNotifSeen = function () {
        try { localStorage.setItem('seenNotifIds', JSON.stringify(window.__notifData.map(n => n.id))); } catch (e) {}
        updateNotifBadges();
    };

    // ----- Overlay preview notifikasi terbaru (muncul 2 detik setelah buka web, sekali per sesi) -----
    window.hideNotifOverlay = function () {
        try { sessionStorage.setItem('notifOverlaySeen', '1'); } catch (e) {}
        const el = document.getElementById('notifOverlayPreview');
        if (el) el.classList.remove('show');
    };
    function maybeShowNotifOverlay() {
        try { if (sessionStorage.getItem('notifOverlaySeen')) return; } catch (e) {}
        if (!window.__notifData || window.__notifData.length === 0) return;
        const el = document.getElementById('notifOverlayPreview');
        if (!el) return;
        const latest = window.__notifData[0];
        el.querySelector('.notif-overlay-latest').textContent = 'Terbaru ' + formatWaktuNotif(latest.createdAt);
        el.querySelector('.notif-overlay-text').textContent = latest.desc || '';
        el.classList.add('show');
    }
    window.addEventListener('load', () => setTimeout(maybeShowNotifOverlay, 2000));

    // ----- Testimoni tambahan dari website notifikasi (ditampilkan silang ke SEMUA produk) -----
    const productKeyMap = { 1: 'apk-jam', 2: 'ig', 3: 'ebook', 4: 'tiktok' };
    const productNameMap = { 'apk-jam': 'APK Widget Jam', 'ig': 'Followers IG', 'ebook': '2.000+ Buku Digital Premium', 'tiktok': 'Followers TikTok' };
    window.__testimoniData = {};
    window.__testimoniUpdateCbs = [];
    window.onTestimoniUpdate = function (cb) { window.__testimoniUpdateCbs.push(cb); };
    window.getExtraTestimoni = function (productDbId) {
        const key = productKeyMap[productDbId];
        // testimoni "legacy" = hasil import data lama, sudah tampil lewat data.testimoni bawaan produknya sendiri,
        // jadi di sini dilewati biar gak dobel — tapi tetap ikut kalau posisinya jadi testimoni "pinjaman" produk lain.
        const own = (window.__testimoniData[key] || []).filter(t => !t.legacy)
            .map(t => ({ ...t, productLabel: productNameMap[key] }));
        const borrowed = [];
        Object.keys(window.__testimoniData).forEach(k => {
            if (k === key) return;
            (window.__testimoniData[k] || []).forEach(t => borrowed.push({ ...t, productLabel: productNameMap[k] || k }));
        });
        return own.concat(borrowed);
    };
    onSnapshot(collection(db, 'testimoni'), (snap) => {
        const grouped = {};
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const key = d.productId;
            if (!key) return;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ id: docSnap.id, nama: d.nama || '', img: d.img || '', stars: d.stars || 5, createdAt: d.createdAt || 0, legacy: !!d.legacy });
        });
        Object.keys(grouped).forEach(k => grouped[k].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
        window.__testimoniData = grouped;
        window.__testimoniUpdateCbs.forEach(fn => fn());
    });

    // ----- Sinkron data produk (nama/foto/harga/deskripsi/QRIS/tambahan) dari website admin -----
    function formatRp(n) {
        n = Number(n) || 0;
        return 'Rp ' + Math.round(n).toLocaleString('id-ID');
    }
    // Tampilkan dulu versi produk yang tersimpan di HP (kalau ada), biar gak nunggu server dulu —
    // ini yang bikin sebelumnya produk baru sempat "hilang" pas refresh terus muncul lagi beberapa saat kemudian.
    try {
        const cachedProducts = JSON.parse(localStorage.getItem('cachedProducts') || 'null');
        if (cachedProducts && window.products) {
            Object.keys(cachedProducts).forEach(id => { window.products[id] = cachedProducts[id]; });
            if (window.renderProductGrid) window.renderProductGrid();
        }
    } catch (e) {}
    onSnapshot(collection(db, 'products'), (snap) => {
        if (!window.products) return; // script.js belum siap
        let changed = false;
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            const existing = window.products[id] || {};
            const p = { ...existing };
            p.key = d.key || existing.key;
            p.name = d.name || existing.name;
            p.order = (d.order !== undefined) ? d.order : (existing.order ?? 999);
            p.gridShortDesc = d.gridShortDesc || '';
            if (d.images && d.images.length) p.mainImages = d.images;
            p.gallery = d.gallery || existing.gallery || [];
            if (d.descBlocks) p.descSections = d.descBlocks;
            p.type = d.type || existing.type || 'digital';

            if (p.type === 'digital') {
                p.adminFee = d.adminFee || 0;
                if (d.priceMode === 'coret') {
                    p.priceOld = formatRp(d.priceOriginal);
                    p.price = formatRp(d.priceSale);
                    p.pricePayment = formatRp((d.priceSale || 0) + (d.adminFee || 0));
                } else {
                    p.priceOld = null;
                    p.price = formatRp(d.priceNormal);
                    p.pricePayment = formatRp((d.priceNormal || 0) + (d.adminFee || 0));
                }
                if (d.qris) p.qris = d.qris;
                if (d.addon) {
                    const a = d.addon;
                    p.addon = {
                        name: a.name || '',
                        img: (a.images && a.images[0]) || '',
                        desc: a.desc || '',
                        price: a.priceNormal || 0,
                        priceLabel: formatRp(a.priceNormal),
                        priceCombo: a.priceComboSale || (a.priceNormal || 0),
                        priceComboPayment: formatRp((a.priceComboSale || a.priceNormal || 0) + (existing.adminFee || 0)),
                        adminFeeCombo: existing.adminFee || 0,
                        qrisCombo: a.qrisCombo || p.qris
                    };
                } else if (d.addon === null) {
                    delete p.addon;
                }
            } else {
                p.gridPriceLabel = d.gridPriceLabel || existing.gridPriceLabel;
            }
            window.products[id] = p;
            changed = true;
        });
        if (changed) {
            try {
                const cacheObj = {};
                snap.forEach(docSnap => { cacheObj[docSnap.id] = window.products[docSnap.id]; });
                localStorage.setItem('cachedProducts', JSON.stringify(cacheObj));
            } catch (e) {}
        }
        if (changed && window.renderProductGrid) window.renderProductGrid();
    });
