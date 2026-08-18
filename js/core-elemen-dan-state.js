// core-elemen-dan-state.js — notifikasi ticker V1 + referensi elemen DOM & variabel state yang dipakai lintas modul lain

    // ===== NOTIFIKASI V1: teks berjalan kanan ke kiri, nyambung terus antar pesan =====
    function renderNotifTickerV1(messages) {
        const wrap = document.getElementById('notifTickerV1');
        const inner = document.getElementById('notifTickerInner');
        if (!wrap || !inner) return;
        const list = (messages || []).map(t => (t || '').trim()).filter(Boolean);
        if (list.length === 0) {
            wrap.style.display = 'none';
            inner.classList.remove('run');
            inner.innerHTML = '';
            return;
        }
        wrap.style.display = 'flex';
        // digandakan 2x biar pas geser -50% posisinya nyambung mulus jadi kelihatan gak pernah putus
        const setHtml = list.map(t => `<span class="notif-ticker-msg">${t.replace(/</g, '&lt;')}</span><span class="notif-ticker-divider"></span>`).join('');
        inner.innerHTML = setHtml + setHtml;
        inner.classList.remove('run');
        requestAnimationFrame(() => {
            const oneSetWidth = inner.scrollWidth / 2;
            const speedPxPerSecond = 55; // kecepatan sedang
            const duration = Math.max(8, oneSetWidth / speedPxPerSecond);
            inner.style.animationDuration = duration + 's';
            inner.classList.add('run');
        });
    }
    window.renderNotifTickerV1 = renderNotifTickerV1;
    const pageProduct = document.getElementById('pageProduct');
    const pagePayment = document.getElementById('pagePayment');
    const pageNotif = document.getElementById('pageNotif');
    const btnBackNotif = document.getElementById('btnBackNotif');
    const mainContainer = document.getElementById('mainContainer');
    const btnBackProduct = document.getElementById('btnBackProduct');
    const btnBackPayment = document.getElementById('btnBackPayment');
    const btnBeliSekarang = document.getElementById('btnBeliSekarang');
    const btnBeliPrice = document.getElementById('btnBeliPrice');

    const detailTitle = document.getElementById('detailTitle');
    const detailPrice = document.getElementById('detailPrice');
    const detailPriceOld = document.getElementById('detailPriceOld');
    const detailDesc = document.getElementById('detailDesc');
    const galleryScroll = document.getElementById('galleryScroll');

    // Elemen halaman pembayaran (dinamis)
    const paymentQrisImg = document.getElementById('paymentQrisImg');
    const qrisPriceText = document.getElementById('qrisPriceText');
    const btnDownloadQris = document.getElementById('btnDownloadQris');

    // Slider
    const slideTrack = document.getElementById('slideTrack');
    const sliderIndicators = document.getElementById('sliderIndicators');

    let currentProductId = null;
    let currentSlide = 0;
    let totalSlides = 0;

