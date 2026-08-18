// visitor-tracking.js — identitas pengunjung, deteksi device, sesi online/offline, kirim pesan status
import { db } from './firebase-init.js';
import { collection, doc, setDoc, updateDoc, addDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

    // ----- Identitas pengunjung anonim (dipakai buat kirim balasan status ke apk admin) -----
    function getVisitorId() {
        try {
            let id = localStorage.getItem('visitorId');
            if (!id) {
                id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                localStorage.setItem('visitorId', id);
            }
            return id;
        } catch (e) { return 'v_anon_' + Date.now(); }
    }
    function getVisitorName() {
        try {
            let nama = localStorage.getItem('visitorName');
            if (!nama) {
                nama = 'Pengunjung' + Math.floor(1000 + Math.random() * 9000);
                localStorage.setItem('visitorName', nama);
            }
            return nama;
        } catch (e) { return 'Pengunjung' + Math.floor(1000 + Math.random() * 9000); }
    }
    window.__visitorId = getVisitorId();
    window.__visitorName = getVisitorName();

    // ----- Deteksi nama perangkat HP -----
    // Catatan: Chrome versi baru sengaja menyembunyikan nama model asli di navigator.userAgent
    // (demi privasi). Nama model asli (mis. "Tecno KI5j") cuma bisa didapat lewat API khusus
    // "User-Agent Client Hints" (navigator.userAgentData). Kalau browser tidak mendukungnya
    // (misal Safari/iPhone), baru dipakai cara lama (baca dari userAgent).
    function getDeviceNameFallback() {
        const ua = navigator.userAgent || '';
        if (/iPhone/i.test(ua)) return 'iPhone';
        if (/iPad/i.test(ua)) return 'iPad';
        const androidMatch = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|\))/i);
        if (androidMatch && androidMatch[1]) {
            let model = androidMatch[1].trim().replace(/\bwv\b/gi, '').trim();
            if (model && !/^K$/i.test(model)) return model;
        }
        if (/Android/i.test(ua)) return 'Android';
        if (/Windows/i.test(ua)) return 'Windows';
        if (/Macintosh/i.test(ua)) return 'Mac';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Tidak diketahui';
    }
    async function getDeviceName() {
        try {
            if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                const info = await navigator.userAgentData.getHighEntropyValues(['model', 'platform']);
                if (info.model && info.model.trim()) return info.model.trim();
                if (info.platform) return info.platform;
            }
        } catch (e) {}
        return getDeviceNameFallback();
    }
    window.__deviceNamePromise = Promise.race([
        getDeviceName(),
        new Promise(resolve => setTimeout(() => resolve(getDeviceNameFallback()), 3000))
    ]);

    // ================================================================
    // ===== FITUR DATA PENGUNJUNG (sesi masuk/keluar, online, page view) =====
    // ================================================================
    (function visitorTracking() {
        const deviceId = window.__visitorId;
        // pengunjung baru vs lama: ditandai per-device di HP ini, sekali seumur hidup device tsb
        let isNew = false;
        try {
            if (!localStorage.getItem('everVisited')) {
                isNew = true;
                localStorage.setItem('everVisited', '1');
            }
        } catch (e) {}

        const sessionRef = doc(collection(db, 'visitorSessions'));
        const now = Date.now();
        // Catat sesi SEGERA pakai deteksi nama HP versi cepat (sinkron), jangan nunggu apa-apa dulu.
        // Dengan cache lokal aktif, panggilan setDoc ini langsung tersimpan di HP pengunjung dalam
        // hitungan milidetik (gak perlu nunggu balasan server) — jadi walau pengunjung buru-buru
        // pindah halaman (misal langsung checkout ke WhatsApp) atau koneksinya jelek, datanya tetap
        // aman kesimpan dan otomatis terkirim ke server begitu ada kesempatan.
        setDoc(sessionRef, {
            deviceId,
            device: getDeviceNameFallback(),
            masuk: now,
            keluar: null,
            status: 'online',
            lastSeen: now,
            isNew
        }).catch(e => console.log('[visitor] gagal catat sesi:', e));

        // Tempel nama HP yang lebih akurat begitu terdeteksi (gak perlu nunggu konfirmasi server dulu,
        // cache lokal yang jaga urutan tulisannya)
        window.__deviceNamePromise.then(name => {
            if (name && name !== getDeviceNameFallback()) {
                updateDoc(sessionRef, { device: name }).catch(() => {});
            }
        }).catch(() => {});

        // heartbeat: nandain sesi masih online, tiap 20 detik
        const heartbeatId = setInterval(() => {
            updateDoc(sessionRef, { status: 'online', lastSeen: Date.now() }).catch(() => {});
        }, 20000);

        function markOffline() {
            updateDoc(sessionRef, { status: 'offline', keluar: Date.now(), lastSeen: Date.now() }).catch(() => {});
        }
        window.addEventListener('pagehide', markOffline);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') markOffline();
            else updateDoc(sessionRef, { status: 'online', lastSeen: Date.now() }).catch(() => {});
        });

        // ----- Catat halaman/produk yang dibuka (buat statistik "paling sering dibuka") -----
        window.__trackPageView = function (label) {
            if (!label) return;
            addDoc(collection(db, 'visitorPageViews'), { deviceId, page: label, ts: Date.now() }).catch(() => {});
        };
        window.__trackPageView('Beranda');
    })();

    // ----- Catat penayangan status per-device (jangan dobel kalau device sama nonton ulang) -----
    window.__recordStatusView = function (statusId) {
        if (!statusId) return;
        updateDoc(doc(db, 'statuses', statusId), { viewedBy: arrayUnion(window.__visitorId) }).catch(() => {});
    };

    // ----- Kirim pesan balasan status (masuk ke koleksi pesanMasuk, dibaca di apk admin) -----
    window.__sendPesanMasuk = function (payload) {
        const data = {
            visitorId: window.__visitorId,
            visitorName: window.__visitorName,
            type: payload.type,
            createdAt: Date.now()
        };
        if (payload.text) data.text = payload.text;
        if (payload.img) data.img = payload.img;
        if (payload.audio) data.audio = payload.audio;
        if (payload.statusId) data.statusId = payload.statusId;
        return addDoc(collection(db, 'pesanMasuk'), data);
    };
