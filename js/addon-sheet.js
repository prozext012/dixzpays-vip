// Dipecah dari script.js asli

    // ===== ADDON SHEET LOGIC =====
    const addonSheetOverlay = document.getElementById('addonSheetOverlay');
    const addonSheet = document.getElementById('addonSheet');
    const addonSheetView = document.getElementById('addonSheetView');
    const addonLoadingView = document.getElementById('addonLoadingView');
    const addonCard = document.getElementById('addonCard');
    const addonCardImg = document.getElementById('addonCardImg');
    const addonCardName = document.getElementById('addonCardName');
    const addonCardDesc = document.getElementById('addonCardDesc');
    const addonCardPrice = document.getElementById('addonCardPrice');
    const addonTotalValue = document.getElementById('addonTotalValue');
    const btnLanjutkanAddon = document.getElementById('btnLanjutkanAddon');
    let addonSelected = false;

    function formatRp(n) {
        return 'Rp ' + n.toLocaleString('id-ID');
    }
    // Ambil angka murni dari harga produk yang formatnya string "Rp X.XXX" (bisa berubah-ubah
    // sesuai yang diedit admin), biar gak ada harga yang ke-hardcode dan ketinggalan pas diedit.
    function parseRpToNumber(str) {
        return Number(String(str || '').replace(/[^\d]/g, '')) || 0;
    }

    function openAddonSheet() {
        const data = products[1];
        const addon = data.addon;
        addonSelected = false;
        addonCard.classList.remove('selected');
        addonCardImg.src = addon.img;
        addonCardName.textContent = addon.name;
        addonCardDesc.textContent = addon.desc;
        addonCardPrice.textContent = '+' + addon.priceLabel;
        const basePrice = parseRpToNumber(data.price);
        addonTotalValue.textContent = formatRp(basePrice);
        btnLanjutkanAddon.textContent = `Lanjutkan • ${formatRp(basePrice)}`;
        addonSheetView.style.display = '';
        addonLoadingView.classList.remove('active');
        const fill = document.getElementById('addonProgressFill');
        if (fill) fill.classList.remove('run');
        addonSheetOverlay.classList.add('active');
        addonSheet.classList.add('active');
    }

    function closeAddonSheet() {
        addonSheetOverlay.classList.remove('active');
        addonSheet.classList.remove('active');
    }

    addonCard.addEventListener('click', function() {
        addonSelected = !addonSelected;
        addonCard.classList.toggle('selected', addonSelected);
        const data = products[1];
        const addon = data.addon;
        const basePrice = parseRpToNumber(data.price);
        const total = addonSelected ? addon.priceCombo : basePrice;
        addonTotalValue.textContent = formatRp(total);
        btnLanjutkanAddon.textContent = `Lanjutkan • ${formatRp(total)}`;
    });

    addonSheetOverlay.addEventListener('click', closeAddonSheet);

    btnLanjutkanAddon.addEventListener('click', function() {
        const data = products[1];
        const addon = data.addon;
        // Set QRIS dan harga di payment page sesuai pilihan
        if (addonSelected) {
            paymentQrisImg.src = addon.qrisCombo;
            qrisPriceText.textContent = addon.priceComboPayment;
            btnDownloadQris.href = addon.qrisCombo;
            const qrisAdminText = document.getElementById('qrisAdminText');
            if (qrisAdminText) qrisAdminText.textContent = `${addon.adminFeeCombo}+ biaya admin`;
        } else {
            paymentQrisImg.src = data.qris;
            qrisPriceText.textContent = data.pricePayment;
            btnDownloadQris.href = data.qris;
            const qrisAdminText = document.getElementById('qrisAdminText');
            if (qrisAdminText) qrisAdminText.textContent = `${data.adminFee}+ biaya admin`;
        }

        addonSheetView.style.display = 'none';
        addonLoadingView.classList.add('active');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            const fill = document.getElementById('addonProgressFill');
            if (fill) fill.classList.add('run');
        }));

        setTimeout(function() {
            closeAddonSheet();
            setTimeout(function() {
                addonSheetView.style.display = '';
                addonLoadingView.classList.remove('active');
                const fill = document.getElementById('addonProgressFill');
                if (fill) fill.classList.remove('run');
                openMethodSheet();
            }, 320);
        }, 2000);
    });
    btnBackPayment.addEventListener('click', () => history.back());

