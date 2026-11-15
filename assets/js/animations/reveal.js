let observer;
let listening = false;
const observed = new WeakSet();

// Navigation can call this again after a page becomes visible.
export function observeReveals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const elements = document.querySelectorAll('[data-aos]');

  if (!listening) {
    reducedMotion.addEventListener('change', observeReveals);
    listening = true;
  }

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('aon'));
    observer?.disconnect();
    return;
  }

  if (!observer) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('aon');
        observer.unobserve(entry.target);
      });
    }, { threshold: .1 });
  }

  elements.forEach(element => {
    if (element.classList.contains('aon') || observed.has(element)) return;
    observed.add(element);
    observer.observe(element);
  });
}
