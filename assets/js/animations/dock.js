let initialized = false;

// Keep hit areas still while the icons and green backdrop follow the pointer.
export function initDock() {
  if (initialized) return;
  const dock = document.getElementById('bot-nav');
  if (!dock) return;
  const items = [...dock.querySelectorAll('.bn-item')].map(element => ({
    element,
    icon: element.querySelector('.bn-icon'),
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
  const glow = { x: 0, y: 0, targetX: 0, targetY: 0, current: 0, target: 0 };

  function canAnimate() {
    return finePointer.matches && !reducedMotion.matches && !document.hidden
      && windowActive && dock.classList.contains('show') && !dock.inert;
  }

  function paintIcon(item) {
    item.icon.style.setProperty('--dock-scale', (1 + item.current * .18).toFixed(4));
    item.icon.style.setProperty('--dock-lift', `${(-item.current * 5).toFixed(3)}px`);
  }

  function paintGlow() {
    dock.style.setProperty('--dock-x', `${glow.x.toFixed(3)}px`);
    dock.style.setProperty('--dock-y', `${glow.y.toFixed(3)}px`);
    dock.style.setProperty('--dock-glow', glow.current.toFixed(4));
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    glow.current = glow.target = 0;
    items.forEach(item => {
      item.current = item.target = 0;
      paintIcon(item);
    });
    paintGlow();
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
    glow.x = approach(glow.x, glow.targetX, .05);
    glow.y = approach(glow.y, glow.targetY, .05);
    glow.current = approach(glow.current, glow.target, .001);
    paintGlow();
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
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const distance = pointer ? Math.abs(pointer.x - centerX) : Infinity;
      const proximity = Math.max(0, 1 - distance / 96);
      item.target = Math.max(focused ? .8 : 0, proximity * proximity);
      const position = { x: centerX - dockBounds.left, y: centerY - dockBounds.top };
      if (focused) focusedItem = position;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = position;
      }
    }
    const target = pointer ? nearest : focusedItem;
    glow.target = target ? 1 : 0;
    if (target) {
      // Follow the button with a small amount of cursor movement inside it.
      glow.targetX = target.x + (pointer ? (pointer.x - dockBounds.left - target.x) * .22 : 0);
      glow.targetY = target.y + (pointer ? (pointer.y - dockBounds.top - target.y) * .12 : 0);
      if (!glow.current) {
        glow.x = glow.targetX;
        glow.y = glow.targetY;
      }
    }
    if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  function clearPointer() { pointer = null; updateTargets(); }

  dock.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !canAnimate()) return;
    pointer = { x: event.clientX, y: event.clientY };
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
