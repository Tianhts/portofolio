let initialized = false;
const activeAnimations = new Set();

function stopAnimations() {
  activeAnimations.forEach(animation => animation.cancel());
  activeAnimations.clear();
}

function revealPage(firstVisit) {
  stopAnimations();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const boot = window.__portfolioIntroBoot;
  if (boot) window.clearTimeout(boot.timer);
  const nodes = [...document.querySelectorAll('.pg.on [data-intro]')];
  root.classList.remove('intro-pending');
  if (reducedMotion || (firstVisit && boot?.expired)) return;

  nodes.filter(node => {
    const bounds = node.getBoundingClientRect();
    return bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0;
  }).forEach((node, index) => {
    if (typeof node.animate !== 'function') return;
    const computed = window.getComputedStyle(node);
    const transform = computed.transform === 'none' ? '' : computed.transform;
    const animation = node.animate([
      { opacity: 0, filter: `blur(${firstVisit ? 12 : 6}px)`, transform: `translateY(${firstVisit ? 14 : 10}px) ${transform}`.trim() },
      { opacity: computed.opacity, filter: 'blur(0px)', transform: transform || 'none' },
    ], {
      duration: firstVisit ? 780 : 560,
      delay: Math.min(index, 5) * (firstVisit ? 95 : 55),
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both',
    });
    activeAnimations.add(animation);
    animation.finished.then(() => {
      activeAnimations.delete(animation);
      animation.cancel();
    }).catch(() => activeAnimations.delete(animation));
  });
}

export function initIntro() {
  if (initialized) return;
  initialized = true;
  revealPage(true);
  document.addEventListener('portfolio:pagechange', () => revealPage(false));
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    stopAnimations();
    document.documentElement.classList.remove('intro-pending');
  });
  window.addEventListener('pagehide', stopAnimations);
}
