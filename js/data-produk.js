// Dipecah dari script.js asli

    // ===== DATA PRODUK (fallback default, bisa dioverride dari Firestore lewat firebase.js) =====
    let products = {
        1: {
            key: "apk-jam",
            order: 0,
            gridShortDesc: "Widget jam estetik buat HP kamu",
            name: "APK Widget Jam",
            price: "Rp 500",
            priceOld: "Rp 1.999",
            pricePayment: "Rp 550",
            adminFee: 50,
            type: "digital",
            qris: "https://i.ibb.co.com/23wpZQfn/IMG-20260702-121127-628.jpg",
            addon: {
                name: "Wallpaper Kaya Aku",
                price: 500,
                priceLabel: "Rp 500",
                img: "https://i.ibb.co.com/ZpftJz0J/WALLPAPER-YANG-AKU-PAKE-YAH-20260711-085443-0000.png",
                desc: "Wallpaper estetik pilihan yang aku pakai",
                qrisCombo: "https://i.ibb.co.com/7JrkgP9b/IMG-20260710-181634-982.jpg",
                priceCombo: 1000,
                priceComboPayment: "Rp 1.100",
                adminFeeCombo: 100
            },
            testimoni: [
                { nama: "Pembeli 1",  img: "https://i.ibb.co.com/1J0VmFw9/IMG-20260710-182323-507.jpg" },
                { nama: "Pembeli 2",  img: "https://i.ibb.co.com/xSGJKTWF/IMG-20260710-182353-008.jpg" },
                { nama: "Pembeli 3",  img: "https://i.ibb.co.com/ym388RmY/IMG-20260710-182444-954.jpg" },
                { nama: "Pembeli 4",  img: "https://i.ibb.co.com/9mpz0kwN/IMG-20260710-182507-305.jpg" },
                { nama: "Pembeli 5",  img: "https://i.ibb.co.com/QjzhTXC1/IMG-20260710-182529-021.jpg" },
                { nama: "Pembeli 6",  img: "https://i.ibb.co.com/TBLGXHKR/IMG-20260710-182544-870.jpg" },
                { nama: "Pembeli 7",  img: "https://i.ibb.co.com/kVLK16SP/IMG-20260710-182605-318.jpg" },
                { nama: "Pembeli 8",  img: "https://i.ibb.co.com/6RNz91Zv/IMG-20260710-182625-762.jpg" },
                { nama: "Pembeli 9",  img: "https://i.ibb.co.com/JwRrkGyF/IMG-20260710-182658-357.jpg" },
                { nama: "Pembeli 10", img: "https://i.ibb.co.com/WNFn6XB9/IMG-20260710-182716-521.jpg" }
            ],
            mainImages: [
                "https://i.ibb.co.com/FSDJ1pT/Link-apk-jam-20260630-113614-0000.png",
                "https://i.ibb.co.com/h1tBdFSc/Link-apk-jam-20260630-113614-0001.png"
            ],
            gallery: [
                "https://i.ibb.co.com/rK0HfDH7/Screenshot-20260630-112210.jpg",
                "https://i.ibb.co.com/RpH9qvPf/Screenshot-20260630-112225.jpg",
                "https://i.ibb.co.com/MDGTvzZL/Screenshot-20260630-112233.jpg",
                "https://i.ibb.co.com/chGMfwc9/Screenshot-20260630-112239.jpg",
                "https://i.ibb.co.com/tTP3KqQB/Screenshot-20260630-112249.jpg",
                "https://i.ibb.co.com/tp18V090/Screenshot-20260630-112258.jpg"
            ],
            descSections: [
                { type: 'paragraph', text: 'Buat kalian yang sering nanya APK widget jam nya yang keren di mana — ini dia jawabannya 😘' },
                { type: 'divider' },
                { type: 'heading', text: 'APA YANG KAMU DAPAT' },
                { type: 'list', items: [
                    'APK widget jam estetik siap pakai',
                    'Tampilan home screen langsung jadi keren',
                    'Berbagai pilihan desain jam yang bisa dikustomisasi',
                    'Ringan dan tidak membebani HP'
                ]},
                { type: 'divider' },
                { type: 'heading', text: 'KENAPA WAJIB PUNYA?' },
                { type: 'paragraph', text: 'Home screen yang biasa-biasa aja itu membosankan. Dengan widget jam premium ini, tampilan HP kamu langsung beda dari yang lain. Harga segini buat hasil yang langsung keliatan — worth it banget.' },
                { type: 'divider' },
                { type: 'cta', text: '⚡ Sekali bayar, langsung punya. Tanpa langganan, tanpa biaya tambahan.' }
            ]
        },
        2: {
            key: "ig",
            order: 3,
            gridShortDesc: "Dari 100 – 1.000 followers",
            gridPriceLabel: "Rp 3.000",
            name: "Followers IG",
            price: "Mulai 3.000",
            priceOld: null,
            type: "instagram",
            testimoni: [
                { nama: "Pembeli 1", img: "https://i.ibb.co.com/yFpCBP5h/IMG-20260710-184434-523.jpg" }
            ],
            mainImages: [
                "https://i.ibb.co.com/kgPd0L6q/100-FOLOWERS-3-K-20260715-184840-0002.png",
                "https://i.ibb.co.com/SwFHYw8m/100-FOLOWERS-3-K-20260715-184840-0003.png"
            ],
            gallery: [
                "https://i.ibb.co.com/B598xnf6/Screenshot-20260702-115854.jpg",
                "https://i.ibb.co.com/yjg3zBV/Screenshot-20260702-115920.jpg",
                "https://i.ibb.co.com/LdYqjhWT/Screenshot-20260715-183559.jpg",
                "https://i.ibb.co.com/7N6LnjRR/Screenshot-20260715-183548.jpg",
                "https://i.ibb.co.com/N2FTVc3b/Screenshot-20260715-183543.jpg"
            ],
            // QRIS dan harga per jumlah followers — JANGAN KETUKAR (INI KHUSUS IG)
            followerData: {
                100:  { price: 'Rp 3.000',  pricePayment: 'Rp 3.100',  qris: 'https://i.ibb.co.com/xK19DV5G/IMG-20260702-120934-860.jpg' },
                200:  { price: 'Rp 5.000',  pricePayment: 'Rp 5.100',  qris: 'https://i.ibb.co.com/hRqcb2LS/IMG-20260702-171434-132.jpg' },
                300:  { price: 'Rp 7.000',  pricePayment: 'Rp 7.100',  qris: 'https://i.ibb.co.com/dwVT1LP7/IMG-20260702-171907-062.jpg' },
                400:  { price: 'Rp 9.000',  pricePayment: 'Rp 9.100',  qris: 'https://i.ibb.co.com/QFwycW1h/IMG-20260702-172322-550.jpg' },
                500:  { price: 'Rp 10.000', pricePayment: 'Rp 10.100', qris: 'https://i.ibb.co.com/VcPvHT7Y/IMG-20260702-WA0022.jpg' },
                600:  { price: 'Rp 12.000', pricePayment: 'Rp 12.100', qris: 'https://i.ibb.co.com/0pTcWtGk/IMG-20260702-173043-973.jpg' },
                700:  { price: 'Rp 14.000', pricePayment: 'Rp 14.100', qris: 'https://i.ibb.co.com/FkM9sBcw/IMG-20260702-173251-600.jpg' },
                800:  { price: 'Rp 16.000', pricePayment: 'Rp 16.100', qris: 'https://i.ibb.co.com/QFSbtFbm/IMG-20260702-173442-576.jpg' },
                900:  { price: 'Rp 18.000', pricePayment: 'Rp 18.100', qris: 'https://i.ibb.co.com/8nzMxJTN/IMG-20260702-173558-726.jpg' },
                1000: { price: 'Rp 20.000', pricePayment: 'Rp 20.100', qris: 'https://i.ibb.co.com/1JtqP5Hb/IMG-20260702-173715-389.jpg' }
            },
            descSections: [
                { type: 'paragraph', text: 'Pengen akun Instagram kamu keliatan lebih kredibel dan ramai? Tambah followers sekarang dengan harga terjangkau dan proses cepat 🔥' },
                { type: 'divider' },
                { type: 'heading', text: 'KEUNGGULAN' },
                { type: 'list', items: [
                    'Proses cepat, langsung masuk ke akun kamu',
                    'Aman, tidak perlu kasih password',
                    'Pilih sendiri jumlah yang kamu inginkan',
                    'Mulai dari 100 sampai 1.000 followers'
                ]},
                { type: 'divider' },
                { type: 'heading', text: 'CARA PESAN' },
                { type: 'list', items: [
                    'Pilih jumlah followers yang kamu mau',
                    'Masukkan username Instagram kamu',
                    'Bayar sesuai nominal',
                    'Kirim bukti ke WhatsApp admin'
                ]},
                { type: 'divider' },
                { type: 'cta', text: '⚡ Satu langkah buat akunmu makin stand out.' }
            ]
        },
        3: {
            key: "ebook",
            order: 2,
            gridShortDesc: "2.000+ e-book premium, sekali beli",
            name: "2.000+ Buku Digital Premium",
            price: "Rp 5.000",
            priceOld: "Rp 10.000",
            pricePayment: "Rp 5.500",
            adminFee: 500,
            type: "digital",
            qris: "https://i.ibb.co.com/vvXzscCx/IMG-20260702-165849-384.jpg",
            mainImages: [
                "https://i.ibb.co.com/PsWRYXD2/AIRetouch-20260702-163825169.jpg",
                "https://i.ibb.co.com/bjhqvjpr/AIRetouch-20260702-163853045.jpg"
            ],
            gallery: [
                "https://i.ibb.co.com/nNpvPQFs/Screenshot-20260702-164802.jpg",
                "https://i.ibb.co.com/SDwk1P0W/Screenshot-20260702-164740.jpg",
                "https://i.ibb.co.com/B5y7Hz7d/Screenshot-20260702-164851.jpg",
                "https://i.ibb.co.com/ccGJ90xf/Screenshot-20260702-164847.jpg",
                "https://i.ibb.co.com/W4CjPR41/Screenshot-20260702-164842.jpg",
                "https://i.ibb.co.com/jZHH7X3F/Screenshot-20260702-164836.jpg",
                "https://i.ibb.co.com/Mx750N0j/Screenshot-20260702-164930.jpg",
                "https://i.ibb.co.com/Ld9tzT1h/Screenshot-20260702-164752.jpg",
                "https://i.ibb.co.com/fYB3x9W1/Screenshot-20260702-164925.jpg"
            ],
            descSections: [
                { type: 'tagline', text: 'BUNDLE MEGA 2000+ E-Book Premium | Perpustakaan Digital Terlengkap' },
                { type: 'paragraph', text: 'Bukan sekedar kumpulan buku. Ini adalah investasi pengetahuan terbesar yang pernah kamu lakukan dengan harga yang tidak akan kamu sangka.' },
                { type: 'paragraph', text: 'Ribuan judul. Semua genre. Satu harga.' },
                { type: 'divider' },
                { type: 'heading', text: 'APA YANG KAMU DAPATKAN' },
                { type: 'paragraph', text: 'Lebih dari 2.000 e-book dari berbagai kategori yang sudah dikurasi secara lengkap:' },
                { type: 'list', items: [
                    'AI & Teknologi — keterampilan yang paling dicari',
                    'Bisnis & Kewirausahaan — dari ide sampai bisnis',
                    'Crypto & Forex — pahami investasi dari dasarnya',
                    'Pola Pikir & Peningkatan Diri — bangun versi terbaikmu',
                    'Psikologi — kenali dirimu dan orang lain',
                    'Novel & Manga — hiburan berkualitas',
                    'Koleksi Lengkap Tere Liye — semua karya',
                    'Hukum — referensi penting yang selalu relevan',
                    'Islami & Pengembangan Spiritual — untuk jiwa',
                    'Persiapan UTBK & SKD/SKB — belajar lebih efektif',
                    'Motivasi & Kutipan — untuk hari-harimu'
                ]},
                { type: 'divider' },
                { type: 'heading', text: 'MENGAPA INI LAYAK BANGET?' },
                { type: 'paragraph', text: 'Coba hitung sendiri — kalau satu buku fisik rata-rata Rp80.000, maka 2.000 buku bernilai lebih dari Rp160.000.000. Kamu bisa mendapatkan semuanya hari ini dengan harga yang jauh, jauh lebih terjangkau.' },
                { type: 'list', items: [
                    'Lebih dari 2.000 judul siap diakses',
                    'Format digital, tidak perlu menunggu pengiriman',
                    'Bisa dibaca di HP, tablet, maupun laptop',
                    'Cocok untuk semua kalangan',
                    'Tidak ada biaya tambahan, tidak ada langganan',
                    'Sekali beli, selamanya milikmu'
                ]},
                { type: 'divider' },
                { type: 'heading', text: 'SIAPA YANG COCOK BELI INI?' },
                { type: 'paragraph', text: 'Kamu yang sedang berjuang lulus ujian. Kamu yang ingin membangun bisnis tapi belum tahu harus mulai dari mana. Kamu yang membutuhkan bacaan berkualitas tapi tidak mau mengeluarkan banyak uang. Kamu yang ingin terus berkembang tapi waktunya terbatas.' },
                { type: 'paragraph', text: 'Semua ada di sini. Dalam satu paket.' },
                { type: 'divider' },
                { type: 'cta', text: '⚡ Jangan tunda lagi. Setiap hari tanpa ilmu baru adalah hari yang terlewat begitu saja. Dapatkan MEGA BUNDLE 2000+ E-Book sekarang dan mulai perjalanan terbaikmu hari ini.' }
            ]
        },
        4: {
            key: "tiktok",
            order: 1,
            gridShortDesc: "Dari 100 – 1.000 followers",
            gridPriceLabel: "Rp 6.000",
            name: "Followers TikTok",
            price: "Mulai 6.000",
            priceOld: null,
            type: "tiktok",
            testimoni: [],
            mainImages: [
                "https://i.ibb.co.com/4w9qCX8R/100-FOLOWERS-3-K-20260715-184840-0000.png",
                "https://i.ibb.co.com/cXpMchH6/100-FOLOWERS-3-K-20260715-184840-0001.png"
            ],
            gallery: [
                "https://i.ibb.co.com/vC50VBk7/Screenshot-20260715-193223.jpg",
                "https://i.ibb.co.com/Lhhz530G/Screenshot-20260715-175015.jpg",
                "https://i.ibb.co.com/9m6fXWY4/Screenshot-20260715-175006.jpg",
                "https://i.ibb.co.com/S4QWpGrS/Screenshot-20260715-174956.jpg"
            ],
            // QRIS KHUSUS TIKTOK — JANGAN KETUKAR DENGAN IG
            followerData: {
                100:  { price: 'Rp 6.000',  pricePayment: 'Rp 6.100',  qris: 'https://i.ibb.co.com/RpN5QNZT/IMG-20260715-190402-037.jpg' },
                200:  { price: 'Rp 12.000', pricePayment: 'Rp 12.100', qris: 'https://i.ibb.co.com/5Wc0sC3S/IMG-20260715-190630-120.jpg' },
                300:  { price: 'Rp 18.000', pricePayment: 'Rp 18.100', qris: 'https://i.ibb.co.com/MkGG64c9/IMG-20260715-190728-340.jpg' },
                400:  { price: 'Rp 24.000', pricePayment: 'Rp 24.100', qris: 'https://i.ibb.co.com/b5nwDXgR/IMG-20260715-190828-089.jpg' },
                500:  { price: 'Rp 30.000', pricePayment: 'Rp 30.100', qris: 'https://i.ibb.co.com/ymfSJ6xd/IMG-20260715-190926-861.jpg' },
                600:  { price: 'Rp 36.000', pricePayment: 'Rp 36.100', qris: 'https://i.ibb.co.com/fV62zCjY/IMG-20260715-191036-590.jpg' },
                700:  { price: 'Rp 42.000', pricePayment: 'Rp 42.100', qris: 'https://i.ibb.co.com/BXJ2J2x/IMG-20260715-191128-153.jpg' },
                800:  { price: 'Rp 48.000', pricePayment: 'Rp 48.100', qris: 'https://i.ibb.co.com/Vptc7LDS/IMG-20260715-191227-913.jpg' },
                900:  { price: 'Rp 54.000', pricePayment: 'Rp 54.100', qris: 'https://i.ibb.co.com/hxgHYwqs/IMG-20260715-191320-930.jpg' },
                1000: { price: 'Rp 60.000', pricePayment: 'Rp 60.100', qris: 'https://i.ibb.co.com/jkFYwBVB/IMG-20260715-191432-690.jpg' }
            },
            descSections: [
                { type: 'paragraph', text: 'Mau akun TikTok kamu makin ramai dan terlihat lebih credible? Tambah followers sekarang dengan harga terjangkau dan proses cepat 🎵🔥' },
                { type: 'divider' },
                { type: 'heading', text: 'KEUNGGULAN' },
                { type: 'list', items: [
                    'Proses cepat, langsung masuk ke akun TikTok kamu',
                    'Aman, tidak perlu kasih password',
                    'Pilih sendiri jumlah yang kamu inginkan',
                    'Mulai dari 100 sampai 1.000 followers'
                ]},
                { type: 'divider' },
                { type: 'heading', text: 'CARA PESAN' },
                { type: 'list', items: [
                    'Pilih jumlah followers yang kamu mau',
                    'Masukkan username TikTok kamu',
                    'Bayar sesuai nominal',
                    'Kirim bukti ke WhatsApp admin'
                ]},
                { type: 'divider' },
                { type: 'cta', text: '⚡ Satu langkah buat konten kamu makin dilihat banyak orang.' }
            ]
        }
    };
    window.products = products;
    window.productKeyToId = {};
    Object.keys(products).forEach(id => { window.productKeyToId[products[id].key] = id; });
    const productGrid = document.getElementById('productGrid');
    // Pastikan harga di daftar produk selalu format "Rp X", bukan "Mulai X" —
    // jaga-jaga kalau data lama (default atau tersimpan di Firestore) masih pakai format lama.
    function normalizeGridPriceLabel(label) {
        if (!label) return '';
        label = String(label).trim();
        if (/^mulai/i.test(label)) {
            const rest = label.replace(/^mulai\s*/i, '').trim();
            return /^rp/i.test(rest) ? rest : ('Rp ' + rest);
        }
        return label;
    }
    function renderProductGrid() {
        if (!productGrid) return;
        const ids = Object.keys(products).sort((a, b) => (products[a].order ?? 999) - (products[b].order ?? 999));
        productGrid.innerHTML = ids.map(id => {
            const p = products[id];
            const thumb = (p.mainImages && p.mainImages[0]) || '';
            const priceHtml = p.priceOld
                ? `<span class="product-price-old">${p.priceOld}</span><span class="product-price">${p.price}</span>`
                : `<span class="product-price">${normalizeGridPriceLabel(p.gridPriceLabel || p.price || '')}</span>`;
            return `
                <div class="product-card" data-product="${id}">
                    <img src="${thumb}" alt="${p.name}" loading="lazy" decoding="async" />
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price-wrap">${priceHtml}</div>
                        <div class="product-desc">${p.gridShortDesc || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    window.renderProductGrid = renderProductGrid;
    renderProductGrid();

