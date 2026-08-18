// Dipecah dari script.js asli

    // ===== ELEMEN BOTTOM SHEET METODE PEMBAYARAN =====
    const sheetOverlay = document.getElementById('sheetOverlay');
    const paymentMethodSheet = document.getElementById('paymentMethodSheet');
    const sheetMethodView = document.getElementById('sheetMethodView');
    const sheetLoadingView = document.getElementById('sheetLoadingView');
    const btnLanjutkanPayment = document.getElementById('btnLanjutkanPayment');
    const methodOptions = document.querySelectorAll('.method-option:not(.disabled)');

    function openMethodSheet() {
        // reset pilihan & tampilan tiap kali sheet dibuka
        methodOptions.forEach(o => o.classList.remove('selected'));
        btnLanjutkanPayment.disabled = true;
        sheetMethodView.style.display = '';
        sheetLoadingView.classList.remove('active');

        sheetOverlay.classList.add('active');
        paymentMethodSheet.classList.add('active');
    }

    function closeMethodSheet() {
        sheetOverlay.classList.remove('active');
        paymentMethodSheet.classList.remove('active');
    }

    methodOptions.forEach(opt => {
        opt.addEventListener('click', function() {
            methodOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            btnLanjutkanPayment.disabled = false;
        });
    });

    sheetOverlay.addEventListener('click', closeMethodSheet);

    btnLanjutkanPayment.addEventListener('click', function() {
        if (this.disabled) return;

        // Tampilkan animasi loading dengan text QRIS
        const loadingLabel = document.getElementById('sheetLoadingLabel');
        if (loadingLabel) loadingLabel.textContent = 'Menyiapkan QRIS Pembayaran...';

        sheetMethodView.style.display = 'none';
        sheetLoadingView.classList.add('active');

        // Jalankan progress bar
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const fill = document.getElementById('sheetProgressFill');
                if (fill) fill.classList.add('run');
            });
        });

        setTimeout(function() {
            // Reset progress
            const fill = document.getElementById('sheetProgressFill');
            if (fill) fill.classList.remove('run');

            closeMethodSheet();

            setTimeout(function() {
                sheetMethodView.style.display = '';
                sheetLoadingView.classList.remove('active');
                openPayment();
            }, 320);
        }, 2000);
    });

    // ===== EVENT =====
    if (productGrid) {
        productGrid.addEventListener('click', function (e) {
            const card = e.target.closest('.product-card');
            if (card) openProduct(card.dataset.product);
        });
    }

    // Tombol kembali cuma minta browser mundur satu langkah.
    // Tampilan yang sebenarnya selalu diatur lewat popstate di bawah,
    // jadi urutan halaman utama -> produk -> pembayaran selalu konsisten,
    // baik lewat tombol di halaman maupun tombol back browser/HP.
    btnBackProduct.addEventListener('click', () => history.back());
    btnBeliSekarang.addEventListener('click', function() {
        const data = products[currentProductId];
        if (!data) return;
        if (data.type === 'instagram') {
            openIGSheet('instagram');
        } else if (data.type === 'tiktok') {
            openIGSheet('tiktok');
        } else if (currentProductId == 1 && data.addon) {
            openAddonSheet();
        } else {
            openMethodSheet();
        }
    });


// ===== DOWNLOAD QRIS LANGSUNG KE GALERI =====
    if (btnDownloadQris) {
        btnDownloadQris.addEventListener('click', async function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            if (!url) return;
            try {
                const res = await fetch(url, { mode: 'cors' });
                if (!res.ok) throw new Error('Gagal mengambil gambar');
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'QRIS-DixzVip.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                window.open(url, '_blank');
            }
        });
    }

