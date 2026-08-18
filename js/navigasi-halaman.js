// Dipecah dari script.js asli

    // ===== TAMPILKAN HALAMAN UTAMA =====
    const fabWa = document.getElementById('fabWa');

    function showMain() {
        pagePayment.classList.remove('active');
        pageProduct.classList.remove('active');
        pageNotif.classList.remove('active');
        mainContainer.style.display = 'block';
        document.body.style.overflow = '';
        currentProductId = null;
        if (fabWa) fabWa.style.display = 'flex';
    }

    // ===== TAMPILKAN HALAMAN NOTIFIKASI =====
    function showNotifPage() {
        mainContainer.style.display = 'none';
        pageProduct.classList.remove('active');
        pagePayment.classList.remove('active');
        pageNotif.classList.add('active');
        pageNotif.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        if (fabWa) fabWa.style.display = 'none';
        if (window.renderNotifPage) window.renderNotifPage();
        if (window.markNotifSeen) window.markNotifSeen();
    }

    function openNotifPage() {
        showNotifPage();
        history.pushState({ page: 'notif' }, '');
        if (window.__unlockNotifSound) window.__unlockNotifSound();
        if (window.hideNotifOverlay) window.hideNotifOverlay();
    }
    if (btnBackNotif) btnBackNotif.addEventListener('click', () => history.back());

    // ===== TAMPILKAN HALAMAN PRODUK =====
    function showProductPage() {
        mainContainer.style.display = 'none';
        pageProduct.classList.add('active');
        pagePayment.classList.remove('active');
        pageNotif.classList.remove('active');
        document.body.style.overflow = 'hidden';
        pageProduct.scrollTop = 0;
        btnBackProduct.classList.remove('hidden');
        if (fabWa) fabWa.style.display = 'none';
    }

    // ===== TAMPILKAN HALAMAN PEMBAYARAN =====
    function showPaymentPage() {
        pagePayment.classList.add('active');
        pageProduct.classList.remove('active');
        pageNotif.classList.remove('active');
        pagePayment.scrollTop = 0;
        btnBackPayment.classList.remove('hidden');
        if (fabWa) fabWa.style.display = 'flex';
        if (window.__trackPageView) window.__trackPageView('Pembayaran: ' + (currentProductId && products[currentProductId] ? products[currentProductId].name : ''));
    }

    // ===== BUKA PEMBAYARAN =====
    const btnBuktiWa = document.getElementById('btnBuktiWa');
    const waNumber = '6282129051447';

    function openPayment() {
        // Set pesan WA sesuai produk
        let waText;
        const isSocialProduct = products[currentProductId] && (products[currentProductId].type === 'instagram' || products[currentProductId].type === 'tiktok');
        if (isSocialProduct && window._igOrderData) {
            const d = window._igOrderData;
            waText = `Halo min, saya mau order:\n\nPlatform   : ${d.platform}\nusername   : ${d.username}\njumlah fol : ${d.followers} followers\nharga         : ${d.price}\n\n(Bukti transfer terlampir)`;
        } else {
            const prodName = products[currentProductId] ? products[currentProductId].name : 'Produk';
            waText = `Halo min, saya mau kirim bukti transaksi untuk:\n\nProduk : ${prodName}\n\n(Bukti transfer terlampir)`;
        }

        const instr4 = document.getElementById('paymentInstr4');
        if (instr4) {
            const namaUntukInstr = products[currentProductId] ? products[currentProductId].name : 'Produk';
            instr4.textContent = namaUntukInstr + ' dikirim lewat WA';
        }

        if (btnBuktiWa) {
            btnBuktiWa.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
        }

        showPaymentPage();
        history.pushState({ page: 'payment' }, '');
    }

    // ===== SCROLL ANIMASI BACK BUTTON (PRODUK) =====
    pageProduct.addEventListener('scroll', function() {
        const scrollY = this.scrollTop;
        // Sembunyikan btn back setelah scroll melewati tinggi foto slider
        const sliderH = detailSlider ? detailSlider.offsetHeight : 300;
        if (scrollY > sliderH * 0.6) {
            btnBackProduct.classList.add('hidden');
        } else {
            btnBackProduct.classList.remove('hidden');
        }
    });

    // ===== SCROLL ANIMASI BACK BUTTON (PAYMENT) =====
    pagePayment.addEventListener('scroll', function() {
        const scrollY = this.scrollTop;
        const btnNotifPaymentEl = document.getElementById('btnNotifPayment');
        if (scrollY > 80) {
            btnBackPayment.classList.add('hidden');
            if (btnNotifPaymentEl) btnNotifPaymentEl.classList.add('hidden');
        } else {
            btnBackPayment.classList.remove('hidden');
            if (btnNotifPaymentEl) btnNotifPaymentEl.classList.remove('hidden');
        }
    });

