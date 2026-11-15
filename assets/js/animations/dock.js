let initialized = false;

const MAGNIFICATION = .32;

// Grow the real flex layout sideways while keeping the navbar at one height.
export function initDock() {
  if (initialized) return;
  const dock = document.getElementById('bot-nav');
  if (!dock) return;
  const items = [...dock.querySelectorAll('.bn-item')].map(element => ({
    element,
    icon: element.querySelector('.bn-icon'),
    size: 44,
    growth: 0,
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

  function canAnimate() {
    return finePointer.matches && !reducedMotion.matches && !document.hidden
      && windowActive && dock.classList.contains('show') && !dock.inert;
  }

  function paintIcon(item) {
    item.growth = Number((item.current * item.size * MAGNIFICATION).toFixed(3));
    item.element.style.setProperty('--dock-growth', `${item.growth}px`);
    item.icon.style.setProperty('--dock-scale', (1 + item.current * MAGNIFICATION).toFixed(4));
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    items.forEach(item => {
      item.current = item.target = 0;
      paintIcon(item);
    });
  }

  function draw(time) {
    if (!canAnimate()) { reset(); return; }
    const elapsed = previousTime ? Math.min(48, time - previousTime) : 16.67;
    const easing = 1 - Math.exp(-elapsed / 100);
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
    frame = moving ? requestAnimationFrame(draw) : 0;
    if (!moving) previousTime = 0;
  }

  function updateTargets() {
    if (!canAnimate()) { pointer = null; reset(); return; }
    const dockBounds = dock.getBoundingClientRect();
    // Measure before writing. Reconstruct the resting centers so flex expansion
    // cannot move the hover targets and make the dock shake under a still cursor.
    const measurements = items.map(item => ({
      item,
      bounds: item.element.getBoundingClientRect(),
      size: item.icon.offsetWidth || 44,
    }));
    const totalGrowth = items.reduce((total, item) => total + item.growth, 0);
    const first = measurements[0].bounds;
    const last = measurements[measurements.length - 1].bounds;
    const inset = first.left - dockBounds.left;
    const baselineWidth = last.right - first.left + inset * 2 - totalGrowth;
    const viewport = window.innerWidth || Infinity;
    const budget = Math.max(0, viewport - 20 - baselineWidth);
    let growthBefore = 0;

    for (const { item, bounds, size } of measurements) {
      const focused = item.element === document.activeElement;
      item.size = size;
      const centerX = bounds.left + bounds.width / 2
        + (dockBounds.width - baselineWidth) / 2 - growthBefore - item.growth / 2;
      const distance = pointer ? Math.abs(pointer.x - centerX) : Infinity;
      const proximity = Math.max(0, 1 - distance / 144);
      item.target = Math.max(focused ? .8 : 0, proximity);
      growthBefore += item.growth;
    }
    const wanted = items.reduce((total, item) => total + item.target * item.size * MAGNIFICATION, 0);
    const limit = wanted ? Math.min(1, budget / wanted) : 1;
    items.forEach(item => { item.target *= limit; });

    // A viewport resize can reduce the available width during an animation.
    const currentWidth = items.reduce((total, item) => total + item.current * item.size * MAGNIFICATION, 0);
    if (currentWidth > budget) {
      items.forEach(item => { item.current *= budget / currentWidth; paintIcon(item); });
    }
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
