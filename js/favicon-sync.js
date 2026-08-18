// favicon-sync.js — favicon otomatis ikut foto profil
(function () {
    const avatarImg = document.getElementById('profileAvatarImg');
    const faviconLink = document.getElementById('dynamicFavicon');
    if (!avatarImg || !faviconLink) return;

    function syncFavicon() {
        if (avatarImg.src) {
            faviconLink.href = avatarImg.src;
        }
    }

    // Set favicon pas pertama kali foto sudah termuat
    if (avatarImg.complete) {
        syncFavicon();
    } else {
        avatarImg.addEventListener('load', syncFavicon, { once: true });
    }

    // Pantau kalau src foto profil berubah (misal setelah update dari web admin)
    const observer = new MutationObserver(syncFavicon);
    observer.observe(avatarImg, { attributes: true, attributeFilter: ['src'] });
})();
