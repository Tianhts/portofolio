// Runs in the head so the first content frame can begin softly blurred.
// The timeout keeps the document readable if a module or CDN fails.
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const state = { expired: false, timer: 0 };
  root.classList.add('intro-pending');
  state.timer = window.setTimeout(() => {
    state.expired = true;
    root.classList.remove('intro-pending');
  }, 1800);
  window.__portfolioIntroBoot = state;
})();
