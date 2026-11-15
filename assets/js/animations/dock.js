let initialized = false;

const MAGNIFICATION = .32;
const ICON_LIFT = 14;

function spring(position, velocity, target, elapsed) {
  const steps = Math.max(1, Math.ceil(elapsed / .008));
  const step = elapsed / steps;
  for (let index = 0; index < steps; index++) {
    velocity += ((target - position) * 360 - velocity * 30) * step;
    position += velocity * step;
  }
  return Math.abs(target - position) < .001 && Math.abs(velocity) < .01
    ? [target, 0] : [position, velocity];
}

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
    velocity: 0,
    tilt: 0,
    tiltTarget: 0,
    tiltVelocity: 0,
  })).filter(item => item.icon);
  if (!items.length) return;
  initialized = true;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let previousTime = 0;
  let pointer = null;
  let windowActive = true;
  let growthBudget = Infinity;

  function canAnimate() {
    return finePointer.matches && !reducedMotion.matches && !document.hidden
      && windowActive && dock.classList.contains('show') && !dock.inert;
  }

  function paintIcon(item) {
    const lift = Number((item.current * ICON_LIFT).toFixed(3));
    item.growth = Math.floor(item.current * item.size * MAGNIFICATION * 1000) / 1000;
    item.element.style.setProperty('--dock-growth', `${item.growth}px`);
    item.element.style.setProperty('--dock-label-lift', `${lift}px`);
    item.icon.style.setProperty('--dock-scale', (1 + item.current * MAGNIFICATION).toFixed(4));
    item.icon.style.setProperty('--dock-lift', `${-lift}px`);
    item.icon.style.setProperty('--dock-tilt', `${item.tilt.toFixed(3)}deg`);
    item.icon.style.setProperty('--dock-glyph-x', `${(item.tilt * .4).toFixed(3)}px`);
  }

  function paint() {
    const width = items.reduce((sum, item) => sum + item.current * item.size * MAGNIFICATION, 0);
    // Spring momentum must never grow the dock beyond the available viewport.
    if (width > growthBudget) {
      items.forEach(item => {
        item.current *= growthBudget / width;
        item.velocity = 0;
      });
    }
    items.forEach(paintIcon);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    items.forEach(item => {
      item.current = item.target = 0;
      item.velocity = item.tilt = item.tiltTarget = item.tiltVelocity = 0;
      paintIcon(item);
    });
  }

  function draw(time) {
    if (!canAnimate()) { reset(); return; }
    const elapsed = (previousTime ? Math.min(48, time - previousTime) : 16.67) / 1000;
    previousTime = time;

    for (const item of items) {
      [item.current, item.velocity] = spring(item.current, item.velocity, item.target, elapsed);
      [item.tilt, item.tiltVelocity] = spring(item.tilt, item.tiltVelocity, item.tiltTarget, elapsed);
      if (item.current < 0 || item.current > 1) {
        item.current = Math.max(0, Math.min(1, item.current));
        item.velocity = 0;
      }
      if (Math.abs(item.tilt) > 5) {
        item.tilt = Math.sign(item.tilt) * 5;
        item.tiltVelocity = 0;
      }
    }
    paint();
    const moving = items.some(item => item.current !== item.target || item.velocity !== 0
      || item.tilt !== item.tiltTarget || item.tiltVelocity !== 0);
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
    growthBudget = Math.max(0, viewport - 20 - baselineWidth - .05);
    let growthBefore = 0;

    for (const { item, bounds, size } of measurements) {
      const focused = item.element === document.activeElement;
      item.size = size;
      const centerX = bounds.left + bounds.width / 2
        + (dockBounds.width - baselineWidth) / 2 - growthBefore - item.growth / 2;
      const distance = pointer ? Math.abs(pointer.x - centerX) : Infinity;
      const proximity = distance < 144 ? .5 + .5 * Math.cos(Math.PI * distance / 144) : 0;
      item.target = Math.max(focused ? .8 : 0, proximity);
      const offset = pointer ? Math.max(-1, Math.min(1, (pointer.x - centerX) / (size * .8))) : 0;
      item.tiltTarget = offset * 5 * item.target;
      growthBefore += item.growth;
    }
    const wanted = items.reduce((total, item) => total + item.target * item.size * MAGNIFICATION, 0);
    const limit = wanted ? Math.min(1, growthBudget / wanted) : 1;
    items.forEach(item => { item.target *= limit; item.tiltTarget *= limit; });

    // A viewport resize can reduce the available width during an animation.
    const currentWidth = items.reduce((total, item) => total + item.current * item.size * MAGNIFICATION, 0);
    if (currentWidth > growthBudget) paint();
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
