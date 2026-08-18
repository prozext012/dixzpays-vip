// Dipecah dari script.js asli

    // ===== FUNGSI SLIDER =====
    function buildSlider(images) {
        slideTrack.innerHTML = '';
        sliderIndicators.innerHTML = '';
        totalSlides = images.length;
        currentSlide = 0;

        images.forEach((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Foto produk';
            img.draggable = false;
            slideTrack.appendChild(img);
        });

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                goToSlide(parseInt(this.dataset.index));
            });
            sliderIndicators.appendChild(dot);
        }

        updateSlider();
    }

    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        currentSlide = index;
        updateSlider();
    }

    function updateSlider() {
        const offset = -currentSlide * 100;
        slideTrack.style.transform = `translateX(${offset}%)`;
        // update indicators
        const dots = sliderIndicators.querySelectorAll('span');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // ===== SWIPE / GESER FOTO UTAMA =====
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isSwiping = false;

    slideTrack.addEventListener('touchstart', function(e) {
        if (totalSlides <= 1) return;
        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
        isSwiping = true;
        slideTrack.style.transition = 'none';
    }, { passive: true });

    slideTrack.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        touchCurrentX = e.touches[0].clientX;
        let diff = touchCurrentX - touchStartX;
        if (currentSlide === 0 && diff > 0) diff = 0;
        if (currentSlide === totalSlides - 1 && diff < 0) diff = 0;
        const offset = -currentSlide * 100 + (diff / slideTrack.offsetWidth) * 100;
        slideTrack.style.transform = `translateX(${offset}%)`;
    }, { passive: true });

    slideTrack.addEventListener('touchend', function() {
        if (!isSwiping) return;
        isSwiping = false;
        slideTrack.style.transition = '';

        const diff = touchCurrentX - touchStartX;
        const threshold = slideTrack.offsetWidth * 0.15;

        if (diff > threshold && currentSlide > 0) {
            goToSlide(currentSlide - 1);
        } else if (diff < -threshold && currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else {
            updateSlider();
        }
        touchStartX = 0;
        touchCurrentX = 0;
    });

    // Dukungan drag mouse juga (kalau dibuka lewat browser desktop)
    let mouseDownX = 0;
    let isMouseDragging = false;

    slideTrack.addEventListener('mousedown', function(e) {
        if (totalSlides <= 1) return;
        mouseDownX = e.clientX;
        isMouseDragging = true;
        slideTrack.style.transition = 'none';
    });

    window.addEventListener('mousemove', function(e) {
        if (!isMouseDragging) return;
        let diff = e.clientX - mouseDownX;
        if (currentSlide === 0 && diff > 0) diff = 0;
        if (currentSlide === totalSlides - 1 && diff < 0) diff = 0;
        const offset = -currentSlide * 100 + (diff / slideTrack.offsetWidth) * 100;
        slideTrack.style.transform = `translateX(${offset}%)`;
    });

    window.addEventListener('mouseup', function(e) {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        slideTrack.style.transition = '';

        const diff = e.clientX - mouseDownX;
        const threshold = slideTrack.offsetWidth * 0.15;

        if (diff > threshold && currentSlide > 0) {
            goToSlide(currentSlide - 1);
        } else if (diff < -threshold && currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else {
            updateSlider();
        }
    });

