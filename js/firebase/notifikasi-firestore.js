// notifikasi-firestore.js — notifikasi ticker, badge, sound/TTS, overlay preview, & bingkai status
import { db } from './firebase-init.js';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

    // ----- Notifikasi V1 (teks berjalan di atas grid produk) -----
    try {
        const cachedTickerV1 = JSON.parse(localStorage.getItem('cachedNotifTickerV1') || 'null');
        if (Array.isArray(cachedTickerV1) && window.renderNotifTickerV1) {
            window.renderNotifTickerV1(cachedTickerV1.map(n => n.text));
        }
    } catch (e) {}
    onSnapshot(query(collection(db, 'notifikasiV1'), orderBy('createdAt', 'asc')), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        window.__notifTickerV1Data = list;
        if (window.renderNotifTickerV1) window.renderNotifTickerV1(list.map(n => n.text));
        try { localStorage.setItem('cachedNotifTickerV1', JSON.stringify(list)); } catch (e) {}
    });

    // ----- Badge jumlah notifikasi belum dibaca -----
    window.__notifData = [];
    // Tampilkan dulu versi tersimpan di HP (kalau ada) — biar badge/overlay gak nunggu server dulu.
    try {
        const cachedNotif = JSON.parse(localStorage.getItem('cachedNotifikasi') || 'null');
        if (Array.isArray(cachedNotif)) window.__notifData = cachedNotif;
    } catch (e) {}
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
    updateNotifBadges();
    renderNotifPage();
    onSnapshot(query(collection(db, 'notifikasi'), orderBy('createdAt', 'desc')), (snap) => {
        window.__notifData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        updateNotifBadges();
        renderNotifPage();
        try { localStorage.setItem('cachedNotifikasi', JSON.stringify(window.__notifData)); } catch (e) {}
        if (window.__onNotifDataReady) window.__onNotifDataReady();
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

    // ----- Sound notifikasi modern (disintesis langsung, gak perlu file audio) -----
    let notifAudioCtx = null;
    function getNotifAudioCtx() {
        if (!notifAudioCtx) {
            try { notifAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
        }
        return notifAudioCtx;
    }
    function playNotifSound() {
        const ctx = getNotifAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Chime 3 nada naik (C6-E6-G6) + lapisan "shimmer" oktaf di atas biar kesannya lebih modern & lembut
        const notes = [
            { freq: 1046.5, start: 0, dur: 0.24 },
            { freq: 1318.5, start: 0.1, dur: 0.28 },
            { freq: 1568.0, start: 0.2, dur: 0.36 }
        ];
        notes.forEach(n => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = n.freq;
            gain.gain.setValueAtTime(0.0001, now + n.start);
            gain.gain.exponentialRampToValueAtTime(0.22, now + n.start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now + n.start);
            osc.stop(now + n.start + n.dur + 0.02);

            const shimmer = ctx.createOscillator();
            const shimmerGain = ctx.createGain();
            shimmer.type = 'sine';
            shimmer.frequency.value = n.freq * 2;
            shimmerGain.gain.setValueAtTime(0.0001, now + n.start);
            shimmerGain.gain.exponentialRampToValueAtTime(0.05, now + n.start + 0.015);
            shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur * 0.8);
            shimmer.connect(shimmerGain); shimmerGain.connect(ctx.destination);
            shimmer.start(now + n.start);
            shimmer.stop(now + n.start + n.dur + 0.02);
        });
    }
    // Suara TTS butuh daftar voice yang terinstall di HP-nya; daftar ini kadang baru siap async,
    // jadi disiapin & disegarkan tiap ada perubahan, biar pas dipakai udah pasti ada isinya.
    let ttsVoices = [];
    function refreshTtsVoices() { try { ttsVoices = window.speechSynthesis.getVoices() || []; } catch (e) {} }
    if ('speechSynthesis' in window) {
        refreshTtsVoices();
        window.speechSynthesis.onvoiceschanged = refreshTtsVoices;
    }
    function speakNotifText(text) {
        if (!text || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume(); // workaround bug: kadang antrian TTS browser "ngunci" sendiri
            const utter = new SpeechSynthesisUtterance(text);
            const idVoice = ttsVoices.find(v => v.lang && v.lang.toLowerCase().indexOf('id') === 0);
            if (idVoice) { utter.voice = idVoice; utter.lang = idVoice.lang; }
            else { utter.lang = 'id-ID'; }
            utter.rate = 1;
            window.speechSynthesis.speak(utter);
        } catch (e) { console.log('[notif-sound] gagal mainin suara TTS:', e); }
    }
    // Sound + suara dijalankan BARENGAN (bukan sound dulu baru nunggu selesai baru suara) —
    // soalnya kalau ada jeda/delay di antaranya, browser (terutama iPhone) nganggep itu udah
    // "kelewat lama" dari sentuhan user dan tetep nge-block audionya.
    function playSoundAndSpeak(pesan) {
        playNotifSound();
        speakNotifText(pesan);
    }

    // Kalau pas overlay muncul browser masih nge-block audio otomatis (belum ada sentuhan
    // sama sekali di halaman), sound/suara ditunda dan langsung dimainkan begitu user
    // pertama kali sentuh/klik apa aja di halaman.
    let pendingNotifSpeech = null;
    function tryPlayNotifSound(pesan) {
        const ctx = getNotifAudioCtx();
        if (!ctx || ctx.state !== 'running') {
            console.log('[notif-sound] diblokir browser (autoplay policy), nunggu sentuhan pertama di layar...');
            pendingNotifSpeech = pesan; // selalu siapin fallback duluan, apapun yang terjadi ke resume()
            if (ctx) ctx.resume().catch(() => {});
            return;
        }
        console.log('[notif-sound] main langsung');
        playSoundAndSpeak(pesan);
    }
    function retryPendingNotifSound() {
        const ctx = getNotifAudioCtx();
        if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
        if (pendingNotifSpeech) {
            console.log('[notif-sound] mainin sound+suara yang ketunda tadi (habis sentuhan pertama)');
            const pesan = pendingNotifSpeech;
            pendingNotifSpeech = null;
            playSoundAndSpeak(pesan);
        }
    }
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.addEventListener(evt, retryPendingNotifSound, { once: true, capture: true });
    });
    window.__unlockNotifSound = retryPendingNotifSound;

    // ----- Overlay preview notifikasi terbaru (muncul 1 detik setelah buka web & data siap, sekali per sesi) -----
    // Kalau URL dibuka dengan ?resetnotif (misal pas testing), status "udah dilihat" direset dulu.
    try {
        if (location.search.indexOf('resetnotif') !== -1) sessionStorage.removeItem('notifOverlaySeen');
    } catch (e) {}
    window.resetNotifOverlay = function () {
        try { sessionStorage.removeItem('notifOverlaySeen'); } catch (e) {}
    };
    window.hideNotifOverlay = function () {
        try { sessionStorage.setItem('notifOverlaySeen', '1'); } catch (e) {}
        document.querySelectorAll('.notif-overlay-preview').forEach(el => el.classList.remove('show'));
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        pendingNotifSpeech = null;
    };
    const pageLoadTs = Date.now();
    let notifOverlayDone = false;
    let notifOverlayTimer = null;
    function renderNotifOverlayNow() {
        if (notifOverlayDone) { console.log('[notif-overlay] sudah pernah jalan, dilewati'); return; }
        try {
            if (sessionStorage.getItem('notifOverlaySeen')) {
                console.log('[notif-overlay] gak ditampilkan: sesi ini udah pernah buka halaman notifikasi. Tambahin ?resetnotif di URL buat tes ulang.');
                notifOverlayDone = true; return;
            }
        } catch (e) {}
        if (!window.__notifData || window.__notifData.length === 0) {
            console.log('[notif-overlay] belum ada data notifikasi dari server (atau memang belum ada notifikasi sama sekali).');
            return;
        }
        // #notifOverlayPreviewStatus sengaja dikecualikan: overlay preview notifikasi
        // gak boleh nongol di ikon lonceng halaman status, cukup di tempat lain.
        const els = document.querySelectorAll('.notif-overlay-preview:not(#notifOverlayPreviewStatus)');
        if (!els.length) { console.log('[notif-overlay] elemen overlay gak ketemu di halaman — pastikan index.html yang dipakai versi terbaru.'); return; }
        notifOverlayDone = true;
        const latest = window.__notifData[0];
        const pesan = latest.desc || '';
        els.forEach(el => {
            el.querySelector('.notif-overlay-latest').textContent = 'Terbaru ' + formatWaktuNotif(latest.createdAt);
            el.querySelector('.notif-overlay-text').textContent = pesan;
            el.classList.add('show');
        });
        console.log('[notif-overlay] tampil:', pesan);
        tryPlayNotifSound(pesan);
    }
    // Data notifikasi kadang nyampe beberapa kali beruntun pas awal buka web (snapshot pertama
    // dari koneksi yang belum lengkap/lambat, disusul snapshot berikutnya yang beneran terbaru).
    // Makanya overlay gak langsung ditampilkan begitu ada data pertama — ditunggu dulu jeda
    // singkat, dan tiap ada data baru masuk jeda itu di-reset. Yang ditampilkan dijamin data
    // paling akhir yang diterima, bukan data pertama yang kebetulan lewat duluan. Ada batas atas
    // total tunggu biar tetap muncul walau notifikasi terus-terusan masuk.
    function scheduleNotifOverlay() {
        if (notifOverlayDone) return;
        if (notifOverlayTimer) clearTimeout(notifOverlayTimer);
        const elapsed = Date.now() - pageLoadTs;
        const minFirstWait = Math.max(0, 150 - elapsed);
        const settleDelay = 400;
        const maxTotalWait = 2500;
        const wait = Math.min(Math.max(minFirstWait, settleDelay), Math.max(minFirstWait, maxTotalWait - elapsed));
        notifOverlayTimer = setTimeout(renderNotifOverlayNow, wait);
    }
    window.addEventListener('load', scheduleNotifOverlay);
    // dipanggil lagi tiap data notifikasi terbaru dari Firestore nyampe —
    // jaga-jaga kalau koneksinya lambat dan data belum ada pas detik pertama tadi,
    // atau kalau data yang nyampe duluan ternyata belum yang paling baru.
    window.__onNotifDataReady = scheduleNotifOverlay;

    // ----- STATUS (story) — dikontrol dari apk admin, tampil sebagai bingkai avatar di web utama -----
    window.__statusData = [];
    function applyStatusRing() {
        const active = window.__statusData.length > 0;
        document.querySelectorAll('.avatar-ring').forEach(el => el.classList.toggle('has-status', active));
    }
    // Tampilkan dulu status yang tersimpan di HP (kalau ada) — biar bingkai langsung nyala
    // begitu web dibuka, gak perlu nunggu balesan dari server dulu.
    try {
        const cachedStatus = JSON.parse(localStorage.getItem('cachedStatusData') || 'null');
        if (Array.isArray(cachedStatus)) {
            const now0 = Date.now();
            window.__statusData = cachedStatus.filter(s => !s.expiresAt || s.expiresAt > now0);
            applyStatusRing();
        }
    } catch (e) {}
    onSnapshot(collection(db, 'statuses'), (snap) => {
        const now = Date.now();
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        window.__statusData = all.filter(s => !s.expiresAt || s.expiresAt > now).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        applyStatusRing();
        try { localStorage.setItem('cachedStatusData', JSON.stringify(all)); } catch (e) {}
        if (window.__onStatusDataReady) window.__onStatusDataReady();
    });
