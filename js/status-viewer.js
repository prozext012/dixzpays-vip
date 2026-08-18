// Dipecah dari script.js asli

    // Template gradasi buat status teks — ID harus sama persis dengan yang ada di apk admin
    const STATUS_TEXT_TEMPLATES = {
        t1: 'linear-gradient(135deg,#4b6cb7,#182848)',
        t2: 'linear-gradient(135deg,#ff5f6d,#ffc371)',
        t3: 'linear-gradient(135deg,#11998e,#38ef7d)',
        t4: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
        t5: 'linear-gradient(135deg,#f7971e,#ffd200)',
        t6: 'linear-gradient(135deg,#232526,#414345)'
    };

    const pageStatus = document.getElementById('pageStatus');
    if (!pageStatus) return;

    const statusProgressRow = document.getElementById('statusProgressRow');
    const statusHeaderAvatar = document.getElementById('statusHeaderAvatar');
    const statusHeaderName = document.getElementById('statusHeaderName');
    const statusHeaderTime = document.getElementById('statusHeaderTime');
    const statusHeaderClose = document.getElementById('statusHeaderClose');
    const statusBottomBar = document.getElementById('statusBottomBar');
    const statusMediaWrap = document.getElementById('statusMediaWrap');
    const statusTapLeft = document.getElementById('statusTapLeft');
    const statusTapRight = document.getElementById('statusTapRight');
    const statusReplyInput = document.getElementById('statusReplyInput');
    const statusBtnCamera = document.getElementById('statusBtnCamera');
    const statusBtnGallery = document.getElementById('statusBtnGallery');
    const statusBtnMicSend = document.getElementById('statusBtnMicSend');
    const statusMicIcon = document.getElementById('statusMicIcon');
    const statusSendIcon = document.getElementById('statusSendIcon');
    const statusBtnLike = document.getElementById('statusBtnLike');
    const statusBtnShare = document.getElementById('statusBtnShare');
    const statusReplyRow = document.querySelector('.status-reply-row');
    const statusVoiceRecording = document.getElementById('statusVoiceRecording');
    const statusVoiceDel = document.getElementById('statusVoiceDel');
    const statusVoiceSend = document.getElementById('statusVoiceSend');
    const statusVoiceTime = document.getElementById('statusVoiceTime');
    const statusCameraCapture = document.getElementById('statusCameraCapture');
    const statusGalleryPick = document.getElementById('statusGalleryPick');
    const statusToast = document.getElementById('statusToast');
    const statusEmojiQuick = document.getElementById('statusEmojiQuick');

    let statusIndex = 0;
    let statusPaused = false;
    let statusHoldTimer = null;
    let currentSegDuration = 5000;
    let currentSegElapsed = 0;
    let currentSegStartTs = 0;
    let advanceTimer = null;
    let segGeneration = 0; // dinaikkan tiap ganti status, biar event dari status lama (video/gambar) diabaikan

    // ===== CACHE MEDIA STATUS — biar gak loading ulang tiap buka lagi / ganti status =====
    const STATUS_CACHE_NAME = 'status-media-cache-v1';
    const statusMediaReady = new Set(); // url yang sudah pasti siap tampil (dari cache atau baru selesai load)
    const statusSrcCache = new Map(); // url asli -> blob url (kalau berhasil dicache lewat Cache Storage)

    function getStatusMediaSrc(url) {
        return new Promise((resolve) => {
            if (!url) { resolve(url); return; }
            // Foto status disimpan sebagai base64 (data:...) langsung di dokumen Firestore —
            // itu sudah siap pakai di memori, jadi TIDAK perlu di-fetch lagi ke Cache Storage.
            // Sebelumnya semua jenis media (termasuk base64) dipaksa lewat fetch+blob+cache,
            // padahal buat base64 itu cuma nambah proses konversi yang bikin loading kerasa
            // lebih lama, apalagi di HP yang baru pertama kali buka (belum ada cache).
            if (url.startsWith('data:')) { statusMediaReady.add(url); resolve(url); return; }
            if (statusSrcCache.has(url)) { statusMediaReady.add(url); resolve(statusSrcCache.get(url)); return; }
            if (!window.caches) { resolve(url); return; }
            caches.open(STATUS_CACHE_NAME).then(cache => {
                cache.match(url).then(resp => {
                    if (resp) return resp;
                    return fetch(url).then(fresh => {
                        if (fresh && fresh.ok) cache.put(url, fresh.clone());
                        return fresh;
                    });
                }).then(resp => resp.blob()).then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    statusSrcCache.set(url, blobUrl);
                    statusMediaReady.add(url);
                    resolve(blobUrl);
                }).catch(() => resolve(url));
            }).catch(() => resolve(url));
        });
    }

    // ===== VIDEO: cek cache dulu (instan, gak makan kuota kalau udah pernah nonton),
    // kalau belum ada baru stream langsung + simpan ke cache di belakang layar =====
    function getVideoFromCache(url) {
        return new Promise((resolve) => {
            if (!url || !window.caches) { resolve(null); return; }
            caches.open(STATUS_CACHE_NAME).then(cache => {
                cache.match(url).then(resp => {
                    if (!resp) { resolve(null); return; }
                    resp.blob().then(blob => {
                        const blobUrl = URL.createObjectURL(blob);
                        statusMediaReady.add(url);
                        resolve(blobUrl);
                    }).catch(() => resolve(null));
                }).catch(() => resolve(null));
            }).catch(() => resolve(null));
        });
    }

    function cacheVideoInBackground(url) {
        if (!url || !window.caches) return;
        caches.open(STATUS_CACHE_NAME).then(cache => {
            cache.match(url).then(existing => {
                if (existing) { statusMediaReady.add(url); return; }
                fetch(url).then(fresh => {
                    if (fresh && fresh.ok) {
                        cache.put(url, fresh.clone());
                        statusMediaReady.add(url);
                    }
                }).catch(() => {});
            });
        }).catch(() => {});
    }

    function preloadStatusMedia(data) {
        if (!data || !data.mediaUrl) return;
        if (data.type === 'video') {
            // Video TIDAK di-preload lewat blob (itu yang bikin berat/lama).
            // Cukup pancing browser mulai buffering sendiri di background lewat
            // elemen <video> tersembunyi, biarkan mekanisme streaming bawaan browser yang jalan.
            if (window.__statusVideoPreloadEl) {
                try { window.__statusVideoPreloadEl.src = ''; } catch (e) {}
            }
            const pre = document.createElement('video');
            pre.preload = 'auto';
            pre.muted = true;
            pre.style.display = 'none';
            pre.src = data.mediaUrl;
            window.__statusVideoPreloadEl = pre;
            return;
        }
        if (statusMediaReady.has(data.mediaUrl)) return;
        getStatusMediaSrc(data.mediaUrl).catch(() => {});
    }

    function createLoadingOverlay() {
        const ov = document.createElement('div');
        ov.className = 'status-media-loading';
        ov.innerHTML = '<div class="status-media-spinner"></div>';
        return ov;
    }

    function showToast(msg) {
        statusToast.textContent = msg;
        statusToast.classList.add('show');
        setTimeout(() => statusToast.classList.remove('show'), 1800);
    }
    window.__statusShowToast = showToast;

    function formatStatusTime(ts) {
        if (!ts) return '';
        const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000));
        if (diffMin < 1) return 'Baru saja';
        if (diffMin < 60) return diffMin + ' mnt lalu';
        const diffJam = Math.round(diffMin / 60);
        if (diffJam < 24) return diffJam + ' jam lalu';
        return Math.round(diffJam / 24) + ' hari lalu';
    }

    function renderProgressRow() {
        const list = window.__statusData || [];
        statusProgressRow.innerHTML = list.map(() => '<div class="status-progress-seg"><div class="status-progress-fill"></div></div>').join('');
    }

    function segFillEl(i) {
        const segs = statusProgressRow.querySelectorAll('.status-progress-seg');
        return segs[i] ? segs[i].querySelector('.status-progress-fill') : null;
    }

    function markSegsBefore(i) {
        // PENTING: bar yang sedang berjalan punya inline style transition (dari startProgress),
        // yang prioritasnya lebih tinggi dari class CSS. Kalau cuma ganti class tanpa reset
        // inline style, transisi lama tetap jalan pelan-pelan sampai penuh/kosong (bug lama).
        // Makanya di sini transition dipaksa 'none' dulu SEBELUM ganti width, biar perubahannya instan.
        const segs = statusProgressRow.querySelectorAll('.status-progress-fill');
        segs.forEach((el, idx) => {
            el.style.transition = 'none';
            if (idx < i) {
                el.style.width = '100%';
                el.classList.remove('run');
                el.classList.add('filled');
            } else if (idx > i) {
                el.style.width = '0%';
                el.classList.remove('run', 'filled');
            }
            // paksa reflow biar browser "menerima" perubahan instan sebelum style lain menimpa lagi
            void el.offsetWidth;
        });
    }

    function clearMedia() {
        const vid = window.__statusCurrentVideo;
        if (vid) {
            try {
                vid.pause();
                vid.removeAttribute('src');
                vid.load();
            } catch (e) {}
            window.__statusCurrentVideo = null;
        }
        statusMediaWrap.querySelectorAll('.status-media-img, .status-media-video, .status-media-text, .status-media-caption, .status-media-loading').forEach(el => el.remove());
    }

    function stopAdvanceTimer() {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    }

    function goNext() {
        stopAdvanceTimer();
        const list = window.__statusData || [];
        if (statusIndex < list.length - 1) {
            statusIndex++;
            showSegment(statusIndex);
        } else {
            closeStatusViewer();
        }
    }

    function goPrev() {
        stopAdvanceTimer();
        const list = window.__statusData || [];
        if (statusIndex > 0) {
            statusIndex--;
            showSegment(statusIndex);
        } else {
            showSegment(statusIndex);
        }
    }

    function showSegment(i) {
        const list = window.__statusData || [];
        const data = list[i];
        if (!data) { closeStatusViewer(); return; }
        if (data.id && window.__recordStatusView) window.__recordStatusView(data.id);
        stopAdvanceTimer();
        clearMedia();
        markSegsBefore(i);
        segGeneration++;
        const myGen = segGeneration;

        statusHeaderAvatar.src = document.getElementById('profileAvatarImg') ? document.getElementById('profileAvatarImg').src : '';
        statusHeaderName.textContent = document.getElementById('profileNameText') ? document.getElementById('profileNameText').textContent : '';
        statusHeaderTime.textContent = formatStatusTime(data.createdAt);

        const fill = segFillEl(i);

        // preload status berikutnya di belakang layar, biar begitu lanjut udah siap
        preloadStatusMedia(list[i + 1]);

        if (data.type === 'image') {
            const loadingOv = createLoadingOverlay();
            const img = document.createElement('img');
            img.className = 'status-media-img';
            statusMediaWrap.insertBefore(img, statusTapLeft);
            statusMediaWrap.insertBefore(loadingOv, statusTapLeft);
            const alreadyReady = statusMediaReady.has(data.mediaUrl);
            if (!alreadyReady) img.classList.add('is-loading');
            getStatusMediaSrc(data.mediaUrl).then(src => {
                if (myGen !== segGeneration) return;
                img.src = src;
                const start = () => {
                    if (myGen !== segGeneration) return;
                    img.classList.remove('is-loading');
                    loadingOv.remove();
                    currentSegDuration = 5000;
                    startProgress(fill, currentSegDuration);
                    if (data.caption) addCaption(data.caption);
                };
                if (img.complete) start(); else img.addEventListener('load', start, { once: true });
            });
        } else if (data.type === 'video') {
            const loadingOv = createLoadingOverlay();
            const vid = document.createElement('video');
            vid.className = 'status-media-video';
            vid.autoplay = true;
            vid.playsInline = true;
            vid.muted = false;
            statusMediaWrap.insertBefore(vid, statusTapLeft);
            statusMediaWrap.insertBefore(loadingOv, statusTapLeft);
            window.__statusCurrentVideo = vid;
            const alreadyReady = statusMediaReady.has(data.mediaUrl);
            if (!alreadyReady) vid.classList.add('is-loading');

            vid.addEventListener('loadedmetadata', () => {
                if (myGen !== segGeneration) return;
                currentSegDuration = (vid.duration && isFinite(vid.duration) ? vid.duration * 1000 : 8000);
                startProgress(fill, currentSegDuration);
            });
            vid.addEventListener('canplay', () => {
                if (myGen !== segGeneration) return;
                statusMediaReady.add(data.mediaUrl);
                vid.classList.remove('is-loading');
                loadingOv.remove();
            }, { once: true });
            vid.addEventListener('waiting', () => {
                if (myGen !== segGeneration) return;
                vid.classList.add('is-loading');
                if (!statusMediaWrap.contains(loadingOv)) statusMediaWrap.insertBefore(loadingOv, statusTapLeft);
            });
            vid.addEventListener('playing', () => {
                if (myGen !== segGeneration) return;
                vid.classList.remove('is-loading');
                loadingOv.remove();
            });
            vid.addEventListener('ended', () => { if (myGen === segGeneration) goNext(); });
            if (data.caption) addCaption(data.caption);

            // Cek cache dulu — kalau video ini sudah pernah ditonton, langsung pakai
            // itu (instan, TANPA kuota lagi). Kalau belum ada, baru stream dari URL asli
            // (cepat, gak perlu nunggu download penuh) sambil disimpan ke cache di
            // belakang layar buat nonton berikutnya.
            getVideoFromCache(data.mediaUrl).then(cachedSrc => {
                if (myGen !== segGeneration) return;
                if (cachedSrc) {
                    vid.src = cachedSrc;
                } else {
                    vid.src = data.mediaUrl;
                    cacheVideoInBackground(data.mediaUrl);
                }
                vid.load();
                vid.play().catch(() => {});
            });
        } else {
            const box = document.createElement('div');
            box.className = 'status-media-text';
            box.style.background = STATUS_TEXT_TEMPLATES[data.template] || STATUS_TEXT_TEMPLATES.t1;
            box.textContent = data.text || '';
            statusMediaWrap.insertBefore(box, statusTapLeft);
            currentSegDuration = 5000;
            startProgress(fill, currentSegDuration);
        }
    }

    function addCaption(text) {
        const cap = document.createElement('div');
        cap.className = 'status-media-caption';
        cap.textContent = text;
        statusMediaWrap.insertBefore(cap, statusTapLeft);
    }

    function startProgress(fillEl, durationMs) {
        stopAdvanceTimer();
        if (!fillEl) { advanceTimer = setTimeout(goNext, durationMs); return; }
        fillEl.classList.remove('filled');
        fillEl.style.transition = 'none';
        fillEl.style.width = '0%';
        currentSegDuration = durationMs;
        currentSegElapsed = 0;
        currentSegStartTs = Date.now();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fillEl.style.transition = `width ${durationMs}ms linear`;
                fillEl.style.width = '100%';
            });
        });
        advanceTimer = setTimeout(goNext, durationMs);
    }

    function pauseProgress() {
        if (statusPaused) return;
        statusPaused = true;
        stopAdvanceTimer();
        const fill = segFillEl(statusIndex);
        if (fill) {
            const computedWidth = getComputedStyle(fill).width;
            const wrapWidth = fill.parentElement.offsetWidth;
            const pct = wrapWidth ? (parseFloat(computedWidth) / wrapWidth) * 100 : 0;
            fill.style.transition = 'none';
            fill.style.width = pct + '%';
            currentSegElapsed = (pct / 100) * currentSegDuration;
        }
        if (window.__statusCurrentVideo) window.__statusCurrentVideo.pause();
    }

    function resumeProgress() {
        if (!statusPaused) return;
        statusPaused = false;
        const remaining = Math.max(300, currentSegDuration - currentSegElapsed);
        const fill = segFillEl(statusIndex);
        // PENTING: requestAnimationFrame di bawah ini baru jalan di frame berikutnya.
        // Kalau di antara sekarang dan frame itu user keburu pindah status (maju/mundur),
        // showSegment() sudah mereset bar ini duluan — makanya generasi status (myGen) harus
        // dicek dulu sebelum benar-benar menjalankan animasinya, biar gak "menimpa" reset
        // yang sudah terjadi (ini penyebab bug bar status sebelumnya lanjut keisi lagi
        // padahal seharusnya langsung kosong pas mundur).
        const myGen = segGeneration;
        if (fill) {
            requestAnimationFrame(() => {
                if (myGen !== segGeneration) return;
                fill.style.transition = `width ${remaining}ms linear`;
                fill.style.width = '100%';
            });
        }
        advanceTimer = setTimeout(() => {
            if (myGen !== segGeneration) return;
            goNext();
        }, remaining);
        if (window.__statusCurrentVideo) window.__statusCurrentVideo.play().catch(() => {});
    }

    window.openStatusViewer = function () {
        const list = window.__statusData || [];
        if (!list.length) return;
        statusIndex = 0;
        renderProgressRow();
        pageStatus.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (window.markStatusHeaderNotif) window.markStatusHeaderNotif();
        showSegment(0);
        history.pushState({ page: 'status' }, '');
    };

    function closeStatusViewer() {
        segGeneration++;
        stopAdvanceTimer();
        clearMedia();
        window.__statusCurrentVideo = null;
        pageStatus.classList.remove('active');
        document.body.style.overflow = '';
        stopComposerViewportWatch();
        statusReplyInput.blur();
        if (history.state && history.state.page === 'status') history.back();
    }
    window.__closeStatusViewer = closeStatusViewer;
    window.__statusPauseForOverlay = pauseProgress;

    statusHeaderClose.addEventListener('click', closeStatusViewer);

    statusTapRight.addEventListener('click', goNext);
    statusTapLeft.addEventListener('click', goPrev);

    [statusTapLeft, statusTapRight].forEach(zone => {
        zone.addEventListener('touchstart', pauseProgress, { passive: true });
        zone.addEventListener('touchend', resumeProgress, { passive: true });
        zone.addEventListener('mousedown', pauseProgress);
        zone.addEventListener('mouseup', resumeProgress);
    });

    // ===== OVERLAY CENTANG SUKSES TERKIRIM =====
    const statusSentOverlay = document.getElementById('statusSentOverlay');
    let sentOverlayTimer = null;
    function showSentOverlay() {
        if (!statusSentOverlay) return;
        statusSentOverlay.classList.remove('show');
        void statusSentOverlay.offsetWidth; // reset animasi kalau dipanggil beruntun
        statusSentOverlay.classList.add('show');
        clearTimeout(sentOverlayTimer);
        sentOverlayTimer = setTimeout(() => statusSentOverlay.classList.remove('show'), 1000);
    }
    window.__statusShowSentOverlay = showSentOverlay;

