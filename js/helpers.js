// Dipecah dari script.js asli

// ===== HELPER: FORMAT RUPIAH =====
    function formatRupiah(n) {
        n = Number(n) || 0;
        return 'Rp ' + Math.round(n).toLocaleString('id-ID');
    }
    window.formatRupiah = formatRupiah;

    // ===== HELPER: BUAT HTML DESKRIPSI =====
    function makeDesc(sections) {
        return sections.map(s => {
            if (s.type === 'heading') return `<span class="desc-heading">${s.text}</span>`;
            if (s.type === 'paragraph') return `<span class="desc-paragraph"${s.bold ? ' style="font-weight:800;"' : ''}>${s.text}</span>`;
            if (s.type === 'tagline') return `<span class="desc-tagline">${s.text}</span>`;
            if (s.type === 'divider') return `<span class="desc-divider"></span>`;
            if (s.type === 'cta') return `<span class="desc-cta">${s.text}</span>`;
            if (s.type === 'list') return `<ul class="desc-list">${s.items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
            if (s.type === 'image') return `<img src="${s.src}" alt="Foto produk" loading="lazy" decoding="async" style="width:100%;border-radius:12px;margin:8px 0;display:block;" />`;
            return '';
        }).join('');
    }

