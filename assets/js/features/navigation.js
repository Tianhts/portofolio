import { observeReveals } from '../animations/reveal.js';

const pages = ['home', 'projects', 'about'];

export function showPage(page) {
  if (!pages.includes(page)) return;
  for (const name of pages) {
    document.getElementById(`pg-${name}`)?.classList.toggle('on', name === page);
    for (const prefix of ['tn', 'bn']) {
      const link = document.getElementById(`${prefix}-${name}`);
      link?.classList.toggle('on', name === page);
      if (name === page) link?.setAttribute('aria-current', 'page');
      else link?.removeAttribute('aria-current');
    }
  }
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  observeReveals();
}

export function initNavigation() {
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-page]');
    if (link) {
      event.preventDefault();
      showPage(link.dataset.page);
    }
    if (event.target.closest('[data-action="scroll-top"]')) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });

  const topNav = document.getElementById('top-nav');
  const bottomNav = document.getElementById('bot-nav');
  const scrollTop = document.getElementById('scr-top');
  let ticking = false;
  const update = () => {
    const scrolled = window.scrollY > 80;
    topNav?.classList.toggle('hidden', scrolled);
    bottomNav?.classList.toggle('show', scrolled);
    scrollTop?.classList.toggle('show', scrolled);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}
