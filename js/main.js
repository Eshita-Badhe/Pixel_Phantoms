/* ============================
   MAIN.JS - GLOBAL SCRIPTS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================
     GLOBAL LOADER
     ============================ */
  const loader = document.getElementById('global-loader');

  const showLoader = () => {
    if (loader) loader.classList.remove('hidden');
  };

  const hideLoader = () => {
    if (loader) loader.classList.add('hidden');
  };

  // Hide loader after page fully loads
  window.addEventListener('load', hideLoader);

  // ✅ Event delegation (works even if navbar links are added later)
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore hash links, external links, mailto/tel
    if (
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    // Show loader for internal navigation
    showLoader();
  });

  /* ============================
     SERVICE WORKER REGISTRATION
     ============================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Improved path handling for subdirectories (e.g. GitHub Pages)
      const swPath = window.location.pathname.includes('/Pixel_Phantoms/')
        ? '/Pixel_Phantoms/sw.js'
        : '/sw.js';

      navigator.serviceWorker
        .register(swPath)
        .then(registration => {
          console.log('SW registered: ', registration.scope);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});
