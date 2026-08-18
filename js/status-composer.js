// Dipecah dari script.js asli

    // ===== KIRIM PESAN TEKS / TOGGLE MIC<->SEND =====
    function updateMicSendIcon() {
        const hasText = statusReplyInput.value.trim().length > 0;
        statusMicIcon.style.display = hasText ? 'none' : '';
        statusSendIcon.style.display = hasText ? '' : 'none';
        statusReplyRow.classList.toggle('is-typing', hasText);
    }
    statusReplyInput.addEventListener('input', updateMicSendIcon);
    statusReplyInput.addEventListener('focus', pauseProgress);
    statusReplyInput.addEventListener('blur', resumeProgress);
    statusReplyInput.addEventListener('focus', () => statusReplyRow.classList.add('is-focused'));
    statusReplyInput.addEventListener('blur', () => {
        if (!statusReplyInput.value.trim()) statusReplyRow.classList.remove('is-focused');
    });

    // ===== TOMBOL STIKER: buka/tutup popover quick emoji =====
    const statusBtnSticker = document.getElementById('statusBtnSticker');
    if (statusBtnSticker && statusEmojiQuick) {
        statusBtnSticker.addEventListener('click', function (e) {
            e.stopPropagation();
            statusEmojiQuick.classList.toggle('show');
        });
        document.addEventListener('click', function (e) {
            if (!statusEmojiQuick.classList.contains('show')) return;
            if (e.target === statusBtnSticker || statusBtnSticker.contains(e.target)) return;
            if (statusEmojiQuick.contains(e.target)) return;
            statusEmojiQuick.classList.remove('show');
        });
    }

    // ===== KOMPOSER MENGAMBANG DI ATAS KEYBOARD =====
    // Cuma status-bottom-bar yang harus naik ngikutin keyboard, konten status (foto/video)
    // di belakangnya harus tetap diam di tempat, gak boleh ikut kekompres/naik.
    function updateComposerViewportPosition() {
        if (!window.visualViewport || !statusBottomBar) return;
        const vv = window.visualViewport;
        const keyboardGap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        if (keyboardGap > 60) {
            statusBottomBar.classList.add('kb-floating');
            statusBottomBar.style.bottom = keyboardGap + 'px';
        } else {
            statusBottomBar.classList.remove('kb-floating');
            statusBottomBar.style.bottom = '';
        }
    }
    function startComposerViewportWatch() {
        if (!window.visualViewport) return;
        updateComposerViewportPosition();
        window.visualViewport.addEventListener('resize', updateComposerViewportPosition);
        window.visualViewport.addEventListener('scroll', updateComposerViewportPosition);
    }
    function stopComposerViewportWatch() {
        if (!window.visualViewport) return;
        window.visualViewport.removeEventListener('resize', updateComposerViewportPosition);
        window.visualViewport.removeEventListener('scroll', updateComposerViewportPosition);
        if (statusBottomBar) {
            statusBottomBar.classList.remove('kb-floating');
            statusBottomBar.style.bottom = '';
        }
    }
    statusReplyInput.addEventListener('focus', startComposerViewportWatch);
    statusReplyInput.addEventListener('blur', stopComposerViewportWatch);

    function sendTextReply() {
        const text = statusReplyInput.value.trim();
        if (!text) return;
        const list = window.__statusData || [];
        const current = list[statusIndex];
        // Reset input & ikon LANGSUNG (gak nunggu hasil kirim), biar selalu ada respon instan pas diklik.
        statusReplyInput.value = '';
        updateMicSendIcon();
        if (window.__sendPesanMasuk) {
            window.__sendPesanMasuk({ type: 'text', text: text, statusId: current ? current.id : null })
                .then(() => showSentOverlay())
                .catch(() => showToast('Gagal mengirim pesan, coba lagi'));
        } else {
            showToast('Koneksi belum siap, coba lagi sebentar');
        }
    }

    // ===== EMOJI CEPAT =====
    if (statusEmojiQuick) {
        statusEmojiQuick.querySelectorAll('span').forEach(span => {
            span.addEventListener('click', function () {
                const emoji = this.dataset.emoji;
                const list = window.__statusData || [];
                const current = list[statusIndex];
                if (statusEmojiQuick) statusEmojiQuick.classList.remove('show');
                if (window.__sendPesanMasuk) {
                    window.__sendPesanMasuk({ type: 'emoji', text: emoji, statusId: current ? current.id : null })
                        .then(() => showSentOverlay())
                        .catch(() => showToast('Gagal mengirim reaksi, coba lagi'));
                }
            });
        });
    }

    // ===== LIKE (LOVE) =====
    let statusLiked = false;
    statusBtnLike.addEventListener('click', function () {
        statusLiked = !statusLiked;
        this.classList.toggle('liked', statusLiked);
        if (statusLiked) {
            const list = window.__statusData || [];
            const current = list[statusIndex];
            if (window.__sendPesanMasuk) {
                window.__sendPesanMasuk({ type: 'emoji', text: '❤️', statusId: current ? current.id : null })
                    .then(() => showToast('Kamu menyukai status ini'))
                    .catch(() => {});
            }
        }
    });

    // ===== SHARE =====
    statusBtnShare.addEventListener('click', function () {
        const shareUrl = location.href.split('#')[0].split('?')[0];
        if (navigator.share) {
            navigator.share({ title: document.title, url: shareUrl }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => showToast('Link disalin')).catch(() => showToast('Gagal menyalin link'));
        } else {
            showToast('Berbagi tidak didukung di browser ini');
        }
    });

    // ===== KOMPRESI GAMBAR KE BASE64 (dipakai buat kirim foto balasan) =====
    function fileToCompressedBase64(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Gagal memuat gambar.'));
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = Math.round(h * (maxWidth / w)); w = maxWidth; }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Firestore membatasi 1 dokumen maksimal ~1MB, jadi base64 foto harus jauh di bawah itu
    // (sisa buat field lain). Kalau kompresi pertama masih kegedean, coba turunkan lagi
    // bertahap (bukan langsung gagal) — ini yang bikin foto sering "gagal terkirim" sebelumnya.
    const STATUS_IMG_MAX_BASE64 = 650000;
    function compressUntilFits(file, attempts) {
        const step = attempts[0];
        if (!step) return Promise.reject(new Error('Foto terlalu besar'));
        return fileToCompressedBase64(file, step.w, step.q).then(base64 => {
            if (base64.length > STATUS_IMG_MAX_BASE64) {
                if (attempts.length > 1) return compressUntilFits(file, attempts.slice(1));
                return Promise.reject(new Error('Foto terlalu besar'));
            }
            return base64;
        });
    }

    function handlePickedImage(file) {
        if (!file) return;
        pauseProgress();
        const list = window.__statusData || [];
        const current = list[statusIndex];
        compressUntilFits(file, [
            { w: 900, q: 0.7 },
            { w: 700, q: 0.55 },
            { w: 500, q: 0.4 }
        ]).then(base64 => {
            if (!window.__sendPesanMasuk) {
                showToast('Koneksi belum siap, coba lagi sebentar');
                resumeProgress();
                return;
            }
            window.__sendPesanMasuk({ type: 'image', img: base64, statusId: current ? current.id : null })
                .then(() => showSentOverlay())
                .catch(() => showToast('Gagal mengirim foto, coba lagi'));
            resumeProgress();
        }).catch(() => { showToast('Ukuran foto terlalu besar, coba foto lain'); resumeProgress(); });
    }

    statusBtnCamera.addEventListener('click', () => statusCameraCapture.click());
    statusBtnGallery.addEventListener('click', () => statusGalleryPick.click());
    statusCameraCapture.addEventListener('change', function () { handlePickedImage(this.files[0]); this.value = ''; });
    statusGalleryPick.addEventListener('change', function () { handlePickedImage(this.files[0]); this.value = ''; });

    // ===== REKAM PESAN SUARA =====
    let mediaRecorder = null;
    let recordedChunks = [];
    let recordStartTs = 0;
    let recordTimerInterval = null;

    function formatRecordTime(ms) {
        const s = Math.floor(ms / 1000);
        const mm = Math.floor(s / 60);
        const ss = s % 60;
        return mm + ':' + String(ss).padStart(2, '0');
    }

    function startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('Perekaman suara tidak didukung di browser ini');
            return;
        }
        pauseProgress();
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            recordedChunks = [];
            try {
                mediaRecorder = new MediaRecorder(stream);
            } catch (e) {
                showToast('Gagal memulai rekaman');
                resumeProgress();
                return;
            }
            mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
            mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
            mediaRecorder.start();
            recordStartTs = Date.now();
            statusReplyRow.style.display = 'none';
            statusVoiceRecording.classList.add('active');
            statusBtnMicSend.classList.add('recording');
            statusVoiceTime.textContent = '0:00';
            recordTimerInterval = setInterval(() => {
                statusVoiceTime.textContent = formatRecordTime(Date.now() - recordStartTs);
                if (Date.now() - recordStartTs > 60000) stopRecordingAndSend(false);
            }, 250);
        }).catch(() => {
            showToast('Akses mikrofon ditolak');
            resumeProgress();
        });
    }

    function resetRecordingUI() {
        clearInterval(recordTimerInterval);
        statusReplyRow.style.display = '';
        statusVoiceRecording.classList.remove('active');
        statusBtnMicSend.classList.remove('recording');
        resumeProgress();
    }

    function stopRecordingAndSend(send) {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') { resetRecordingUI(); return; }
        mediaRecorder.addEventListener('stop', function onStop() {
            mediaRecorder.removeEventListener('stop', onStop);
            if (!send) { resetRecordingUI(); return; }
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            // Base64 bikin ukurannya membengkak ~33%, jadi batas blob mentah harus jauh
            // di bawah limit dokumen Firestore (1MB) biar gak gagal kirim.
            if (blob.size > 650000) {
                showToast('Rekaman terlalu panjang, coba lebih singkat');
                resetRecordingUI();
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const list = window.__statusData || [];
                const current = list[statusIndex];
                if (window.__sendPesanMasuk) {
                    window.__sendPesanMasuk({ type: 'voice', audio: reader.result, statusId: current ? current.id : null })
                        .then(() => showSentOverlay())
                        .catch(() => showToast('Gagal mengirim pesan suara, coba lagi'));
                }
                resetRecordingUI();
            };
            reader.readAsDataURL(blob);
        });
        mediaRecorder.stop();
    }

    statusBtnMicSend.addEventListener('click', function () {
        const hasText = statusReplyInput.value.trim().length > 0;
        if (hasText) { sendTextReply(); return; }
        startRecording();
    });
    statusVoiceSend.addEventListener('click', () => stopRecordingAndSend(true));
    statusVoiceDel.addEventListener('click', () => stopRecordingAndSend(false));

    // Guard tombol back: tutup status viewer, KECUALI kalau baru balik dari sub-halaman
    // (misal notifikasi) yang dibuka dari dalam status — status-nya harus tetap kebuka.
    window.addEventListener('popstate', function (e) {
        if (pageStatus.classList.contains('active')) {
            const state = e.state;
            if (state && state.page === 'status') { resumeProgress(); return; }
            segGeneration++;
            stopAdvanceTimer();
            clearMedia();
            window.__statusCurrentVideo = null;
            pageStatus.classList.remove('active');
            document.body.style.overflow = '';
            stopComposerViewportWatch();
            statusReplyInput.blur();
        }
    });
