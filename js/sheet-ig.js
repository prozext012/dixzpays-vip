// Dipecah dari script.js asli

    // ===== SHEET INPUT IG =====
    const igSheetOverlay = document.getElementById('igSheetOverlay');
    const igInputSheet = document.getElementById('igInputSheet');
    const igInputView = document.getElementById('igInputView');
    const igLoadingView = document.getElementById('igLoadingView');
    const igUsernameInput = document.getElementById('igUsernameInput');
    const igFollowersBtns = document.querySelectorAll('.ig-followers-btn');
    const igPriceDisplay = document.getElementById('igPriceDisplay');
    const btnLanjutkanIG = document.getElementById('btnLanjutkanIG');

    let selectedFollowers = null;

    function openIGSheet(platform) {
        const platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram';
        const igSheetTitle = document.getElementById('igSheetTitle');
        const igUsernameLabel = document.getElementById('igUsernameLabel');
        if (igSheetTitle) igSheetTitle.textContent = `Detail Pesanan ${platformName}`;
        if (igUsernameLabel) igUsernameLabel.textContent = `Username ${platformName}`;

        igUsernameInput.value = '';
        igUsernameInput.placeholder = `@username_${platform === 'tiktok' ? 'tiktok' : 'kamu'}`;
        igFollowersBtns.forEach(b => b.classList.remove('selected'));
        igPriceDisplay.textContent = 'Pilih jumlah dulu';
        igPriceDisplay.style.color = '#aaa';
        btnLanjutkanIG.disabled = true;
        selectedFollowers = null;
        igInputView.style.display = '';
        igLoadingView.classList.remove('active');

        igSheetOverlay.classList.add('active');
        igInputSheet.classList.add('active');
    }

    function closeIGSheet() {
        igSheetOverlay.classList.remove('active');
        igInputSheet.classList.remove('active');
    }

    igSheetOverlay.addEventListener('click', closeIGSheet);

    igFollowersBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            igFollowersBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedFollowers = parseInt(this.dataset.amount);

            // Ambil data dari produk yang sedang aktif (IG atau TikTok)
            const data = products[currentProductId];
            if (!data || !data.followerData) return;
            const tier = data.followerData[selectedFollowers];
            if (!tier) return;
            igPriceDisplay.textContent = tier.price;
            igPriceDisplay.style.color = 'var(--green)';

            checkIGReady();
        });
    });

    igUsernameInput.addEventListener('input', checkIGReady);

    function checkIGReady() {
        const usernameOk = igUsernameInput.value.trim().length > 0;
        const followersOk = selectedFollowers !== null;
        btnLanjutkanIG.disabled = !(usernameOk && followersOk);
    }

    btnLanjutkanIG.addEventListener('click', function() {
        if (this.disabled) return;

        const data = products[currentProductId];
        const tier = data.followerData[selectedFollowers];
        const platformName = data.type === 'tiktok' ? 'TikTok' : 'Instagram';

        // Simpan data untuk pesan WA
        window._igOrderData = {
            username: igUsernameInput.value.trim(),
            followers: selectedFollowers,
            price: tier.pricePayment,
            platform: platformName
        };

        // Set data ke halaman pembayaran
        paymentQrisImg.src = tier.qris;
        qrisPriceText.textContent = tier.pricePayment;
        btnDownloadQris.href = tier.qris;

        // Tampilkan loading - sembunyikan view isi
        igInputView.style.display = 'none';
        igLoadingView.classList.add('active');

        // Jalankan progress bar setelah 1 frame (biar transisi smooth)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const fill = document.getElementById('igProgressFill');
                if (fill) fill.classList.add('run');
            });
        });

        setTimeout(function() {
            // Tutup IG sheet TANPA memunculkan lagi igInputView dulu
            igSheetOverlay.classList.remove('active');
            igInputSheet.classList.remove('active');

            // Buka method sheet setelah animasi tutup selesai (300ms)
            setTimeout(function() {
                // Reset IG sheet (hidden, biar next open bersih)
                igInputView.style.display = '';
                igLoadingView.classList.remove('active');
                const fill = document.getElementById('igProgressFill');
                if (fill) fill.classList.remove('run');

                openMethodSheet();
            }, 320);
        }, 2000);
    });

    // Guard back button: tutup IG sheet dulu kalau lagi kebuka
    window.addEventListener('popstate', function(e) {
        if (igInputSheet && igInputSheet.classList.contains('active')) {
            closeIGSheet();
            history.pushState(e.state || { page: 'product' }, '');
            return;
        }
        if (paymentMethodSheet.classList.contains('active')) {
            closeMethodSheet();
            history.pushState(e.state || { page: 'product' }, '');
            return;
        }
        const state = e.state;
        if (state && state.page === 'payment') {
            showPaymentPage();
        } else if (state && state.page === 'product') {
            showProductPage();
        } else if (state && state.page === 'notif') {
            showNotifPage();
        } else {
            showMain();
        }
    });

    console.log('✅ Toko Andika siap!');

