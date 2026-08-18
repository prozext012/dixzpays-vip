// firebase-init.js — inisialisasi Firebase App & Firestore, dipakai bareng semua modul firebase lain
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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
    // Penyimpanan offline diaktifkan: setiap tulisan data (termasuk catat pengunjung) langsung
    // masuk ke penyimpanan lokal HP pengunjung (IndexedDB) dalam hitungan milidetik, baru
    // dikirim ke server di belakang layar. Ini mencegah data hilang kalau pengunjung buru-buru
    // pindah halaman / tutup tab sebelum proses kirim ke server sempat selesai.
    export let db;
    try {
        db = initializeFirestore(fbApp, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
    } catch (e) {
        // Fallback kalau browser gak dukung IndexedDB (mode private/incognito ketat, dll)
        db = initializeFirestore(fbApp, {});
    }

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
