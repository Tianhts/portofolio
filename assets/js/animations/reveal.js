let observer;
let listening = false;
const observed = new WeakSet();

// The baseline is visible. Only elements backed by an observer are hidden.
export function observeReveals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const elements = document.querySelectorAll('.pg.on [data-aos]:not([data-intro])');
  if (!listening) {
    reducedMotion.addEventListener('change', observeReveals);
    listening = true;
  }
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-aos]').forEach(element => {
      element.classList.add('aon');
      element.classList.remove('will-reveal');
    });
    observer?.disconnect();
    observer = undefined;
    return;
  }
  if (!observer) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('aon');
        observer.unobserve(entry.target);
      });
    }, { threshold: .06, rootMargin: '0px 0px -24px 0px' });
  }
  elements.forEach(element => {
    if (element.classList.contains('aon') || observed.has(element)) return;
    observed.add(element);
    element.classList.add('will-reveal');
    observer.observe(element);
  });
}
