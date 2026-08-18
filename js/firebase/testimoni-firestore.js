// testimoni-firestore.js — sinkron testimoni realtime, dipakai silang ke semua produk
import { db } from './firebase-init.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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
