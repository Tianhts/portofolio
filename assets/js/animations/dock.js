let initialized = false;

// The rounded navbar surface grows around magnified icons; hit areas stay still.
export function initDock() {
  if (initialized) return;
  const dock = document.getElementById('bot-nav');
  if (!dock) return;
  const items = [...dock.querySelectorAll('.bn-item')].map(element => ({
    element,
    icon: element.querySelector('.bn-icon'),
    size: 48,
    current: 0,
    target: 0,
  })).filter(item => item.icon);
  if (!items.length) return;
  initialized = true;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let previousTime = 0;
  let pointer = null;
  let windowActive = true;
  const surface = { current: 0, target: 0 };

  function canAnimate() {
    return finePointer.matches && !reducedMotion.matches && !document.hidden
      && windowActive && dock.classList.contains('show') && !dock.inert;
  }

  function paintIcon(item) {
    item.icon.style.setProperty('--dock-scale', (1 + item.current * .24).toFixed(4));
    item.icon.style.setProperty('--dock-lift', `${(-item.current * 5).toFixed(3)}px`);
  }

  function paintSurface() {
    let spread = 0;
    let rise = 0;
    let peak = 0;
    for (const item of items) {
      const growth = item.current * item.size * .24;
      spread += growth / 2;
      rise = Math.max(rise, growth + item.current * 5);
      peak = Math.max(peak, item.current);
    }
    dock.style.setProperty('--dock-spread', `${spread.toFixed(3)}px`);
    dock.style.setProperty('--dock-rise', `${rise.toFixed(3)}px`);
    dock.style.setProperty('--dock-sway', `${(surface.current * peak * 3).toFixed(3)}px`);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    surface.current = surface.target = 0;
    items.forEach(item => {
      item.current = item.target = 0;
      paintIcon(item);
    });
    paintSurface();
  }

  function draw(time) {
    if (!canAnimate()) { reset(); return; }
    const elapsed = previousTime ? Math.min(48, time - previousTime) : 16.67;
    const easing = 1 - Math.exp(-elapsed / 85);
    previousTime = time;
    let moving = false;

    function approach(current, target, tolerance) {
      const next = current + (target - current) * easing;
      if (Math.abs(target - next) < tolerance) return target;
      moving = true;
      return next;
    }

    for (const item of items) {
      item.current = approach(item.current, item.target, .001);
      paintIcon(item);
    }
    surface.current = approach(surface.current, surface.target, .001);
    paintSurface();
    frame = moving ? requestAnimationFrame(draw) : 0;
    if (!moving) previousTime = 0;
  }

  function updateTargets() {
    if (!canAnimate()) { pointer = null; reset(); return; }
    const dockBounds = dock.getBoundingClientRect();
    let nearest = null;
    let nearestDistance = Infinity;
    let focusedItem = null;
    for (const item of items) {
      const focused = item.element === document.activeElement;
      const bounds = item.element.getBoundingClientRect();
      item.size = item.icon.offsetWidth || 48;
      const centerX = bounds.left + bounds.width / 2;
      const distance = pointer ? Math.abs(pointer.x - centerX) : Infinity;
      const proximity = Math.max(0, 1 - distance / 96);
      item.target = Math.max(focused ? .8 : 0, proximity * proximity);
      const position = { x: centerX - dockBounds.left };
      if (focused) focusedItem = position;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = position;
      }
    }
    const target = pointer ? nearest : focusedItem;
    surface.target = target ? Math.max(-1, Math.min(1, target.x / dockBounds.width * 2 - 1)) : 0;
    if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  function clearPointer() { pointer = null; updateTargets(); }

  dock.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !canAnimate()) return;
    pointer = { x: event.clientX };
    updateTargets();
  }, { passive: true });
  dock.addEventListener('pointerleave', clearPointer);
  dock.addEventListener('pointercancel', clearPointer);
  dock.addEventListener('focusin', updateTargets);
  dock.addEventListener('focusout', () => queueMicrotask(updateTargets));
  document.addEventListener('visibilitychange', clearPointer);
  document.addEventListener('portfolio:pagechange', clearPointer);
  window.addEventListener('resize', clearPointer, { passive: true });
  window.addEventListener('scroll', clearPointer, { passive: true });
  window.addEventListener('blur', () => { windowActive = false; clearPointer(); });
  window.addEventListener('focus', () => { windowActive = true; updateTargets(); });
  finePointer.addEventListener('change', clearPointer);
  reducedMotion.addEventListener('change', clearPointer);
  // Navigation hides the dock independently of page changes as users scroll.
  const observer = new MutationObserver(() => {
    if (!canAnimate()) clearPointer();
  });
  observer.observe(dock, { attributes: true, attributeFilter: ['class', 'inert', 'aria-hidden'] });
}
