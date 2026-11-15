let initialized = false;

// The native cursor remains available on touch devices and with reduced motion.
export function initCursor() {
  if (initialized) return;
  const dot = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if (!dot || !ring || !window.matchMedia) return;
  initialized = true;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let ringX = 0;
  let ringY = 0;
  let lastTrail = 0;

  function animateRing() {
    ringX += (pointerX - ringX) * .12;
    ringY += (pointerY - ringY) * .12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    frame = requestAnimationFrame(animateRing);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    document.documentElement.classList.remove('custom-cursor');
  }

  function updatePreference() {
    enabled = finePointer.matches && !reducedMotion.matches;
    if (!enabled) stop();
  }

  document.addEventListener('mousemove', event => {
    if (!enabled || document.hidden) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    dot.style.left = pointerX + 'px';
    dot.style.top = pointerY + 'px';
    document.documentElement.classList.add('custom-cursor');
    if (!frame) {
      ringX = pointerX;
      ringY = pointerY;
      animateRing();
    }

    const now = Date.now();
    if (now - lastTrail > 40 && Math.random() > .55) {
      const trail = document.createElement('div');
      const size = (1.5 + Math.random() * 2.5) + 'px';
      trail.className = 'c-tr';
      trail.style.cssText = `left:${pointerX}px;top:${pointerY}px;width:${size};height:${size};`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 550);
      lastTrail = now;
    }

    const hovering = event.target.closest('a,button,[data-action],[data-page],[data-project],.pcard,.pfull,.sbox');
    dot.style.width = hovering ? '14px' : '7px';
    dot.style.height = hovering ? '14px' : '7px';
    ring.style.width = hovering ? '40px' : '26px';
    ring.style.height = hovering ? '40px' : '26px';
    ring.style.borderColor = hovering ? 'rgba(34,197,94,.85)' : 'rgba(34,197,94,.5)';
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    if (enabled) dot.style.transform = 'translate(-50%,-50%) scale(.55)';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(1)';
  });
  document.documentElement.addEventListener('mouseleave', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  finePointer.addEventListener('change', updatePreference);
  reducedMotion.addEventListener('change', updatePreference);
  updatePreference();
}
