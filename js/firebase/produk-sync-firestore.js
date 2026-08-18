// produk-sync-firestore.js — sinkron data produk (harga/foto/deskripsi/qris) dari web admin
import { db } from './firebase-init.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

    // ----- Sinkron data produk (nama/foto/harga/deskripsi/QRIS/tambahan) dari website admin -----
    function formatRp(n) {
        n = Number(n) || 0;
        return 'Rp ' + Math.round(n).toLocaleString('id-ID');
    }
    // Tampilkan dulu versi produk yang tersimpan di HP (kalau ada), biar gak nunggu server dulu —
    // ini yang bikin sebelumnya produk baru sempat "hilang" pas refresh terus muncul lagi beberapa saat kemudian.
    try {
        const cachedProducts = JSON.parse(localStorage.getItem('cachedProducts') || 'null');
        if (cachedProducts && window.products) {
            Object.keys(cachedProducts).forEach(id => { window.products[id] = cachedProducts[id]; });
            if (window.renderProductGrid) window.renderProductGrid();
        }
    } catch (e) {}
    onSnapshot(collection(db, 'products'), (snap) => {
        if (!window.products) return; // script.js belum siap
        let changed = false;
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            const existing = window.products[id] || {};
            const p = { ...existing };
            p.key = d.key || existing.key;
            p.name = d.name || existing.name;
            p.order = (d.order !== undefined) ? d.order : (existing.order ?? 999);
            p.gridShortDesc = d.gridShortDesc || '';
            if (d.images && d.images.length) p.mainImages = d.images;
            p.gallery = d.gallery || existing.gallery || [];
            if (d.descBlocks) p.descSections = d.descBlocks;
            p.type = d.type || existing.type || 'digital';

            if (p.type === 'digital') {
                p.adminFee = d.adminFee || 0;
                if (d.priceMode === 'coret') {
                    p.priceOld = formatRp(d.priceOriginal);
                    p.price = formatRp(d.priceSale);
                    p.pricePayment = formatRp((d.priceSale || 0) + (d.adminFee || 0));
                } else {
                    p.priceOld = null;
                    p.price = formatRp(d.priceNormal);
                    p.pricePayment = formatRp((d.priceNormal || 0) + (d.adminFee || 0));
                }
                if (d.qris) p.qris = d.qris;
                if (d.addon) {
                    const a = d.addon;
                    p.addon = {
                        name: a.name || '',
                        img: (a.images && a.images[0]) || '',
                        desc: a.desc || '',
                        price: a.priceNormal || 0,
                        priceLabel: formatRp(a.priceNormal),
                        priceCombo: a.priceComboSale || (a.priceNormal || 0),
                        priceComboPayment: formatRp((a.priceComboSale || a.priceNormal || 0) + (a.adminFeeCombo || 0)),
                        adminFeeCombo: a.adminFeeCombo || 0,
                        qrisCombo: a.qrisCombo || p.qris
                    };
                } else if (d.addon === null) {
                    delete p.addon;
                }
            } else {
                if (d.followerData) {
                    const fd = {};
                    Object.keys(d.followerData).forEach(qty => {
                        const row = d.followerData[qty] || {};
                        fd[qty] = {
                            price: formatRp(row.price),
                            pricePayment: formatRp((row.price || 0) + 100),
                            qris: row.qris || ''
                        };
                    });
                    p.followerData = fd;
                    // Selalu pakai format "Rp X" dari harga tier 100 (bukan "Mulai X")
                    if (fd[100]) p.gridPriceLabel = fd[100].price;
                    else p.gridPriceLabel = d.gridPriceLabel || existing.gridPriceLabel;
                } else {
                    p.gridPriceLabel = d.gridPriceLabel || existing.gridPriceLabel;
                }
            }
            window.products[id] = p;
            changed = true;
        });
        if (changed) {
            try {
                const cacheObj = {};
                snap.forEach(docSnap => { cacheObj[docSnap.id] = window.products[docSnap.id]; });
                localStorage.setItem('cachedProducts', JSON.stringify(cacheObj));
            } catch (e) {}
        }
        if (changed && window.renderProductGrid) window.renderProductGrid();
    });
