let initialized = false;

export function initInteractions() {
  if (initialized) return;
  initialized = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-action="like"]');
    if (!target || reducedMotion.matches) return;
    const heart = document.createElement('div');
    heart.className = 'like-pop';
    heart.innerHTML = '<i class="fas fa-heart" aria-hidden="true"></i>';
    const bounds = target.getBoundingClientRect();
    heart.style.left = (event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX) + 'px';
    heart.style.top = (event.detail === 0 ? bounds.top + bounds.height / 2 : event.clientY) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 460);
  });

  // Image errors do not bubble, so fallbacks are handled during capture.
  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    const fallback = image.dataset.imageFallback;
    if (fallback === '.3' || fallback === '.2') image.style.opacity = fallback;
    else if (fallback === 'profile') image.style.background = '#1a1a2a';
    else if (fallback === 'hide') image.style.display = 'none';
  }, true);
}
