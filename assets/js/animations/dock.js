let initialized = false;

// Hit areas stay still; only the inner circles respond to pointer proximity.
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
  let pointerX = null;

  function draw() {
    let moving = false;
    for (const item of items) {
      item.current += (item.target - item.current) * .18;
      if (Math.abs(item.target - item.current) < .001) item.current = item.target;
      else moving = true;
      item.icon.style.setProperty('--dock-scale', (1 + item.current * .38).toFixed(4));
      item.icon.style.setProperty('--dock-lift', `${(-item.current * 11).toFixed(3)}px`);
    }
    frame = moving ? requestAnimationFrame(draw) : 0;
  }

  function updateTargets() {
    const interactive = finePointer.matches && !reducedMotion.matches && !document.hidden;
    for (const item of items) {
      const focused = item.element === document.activeElement;
      const bounds = item.element.getBoundingClientRect();
      const distance = pointerX === null ? Infinity : Math.abs(pointerX - bounds.left - bounds.width / 2);
      const proximity = Math.max(0, 1 - distance / 112);
      item.target = interactive ? Math.max(focused ? .8 : 0, proximity * proximity) : 0;
    }
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      items.forEach(item => {
        item.current = 0;
        item.icon.style.setProperty('--dock-scale', '1');
        item.icon.style.setProperty('--dock-lift', '0px');
      });
    } else if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  dock.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    updateTargets();
  }, { passive: true });
  dock.addEventListener('pointerleave', () => { pointerX = null; updateTargets(); });
  dock.addEventListener('focusin', updateTargets);
  dock.addEventListener('focusout', () => requestAnimationFrame(updateTargets));
  document.addEventListener('visibilitychange', () => { pointerX = null; updateTargets(); });
  document.addEventListener('portfolio:pagechange', () => { pointerX = null; updateTargets(); });
  window.addEventListener('resize', updateTargets, { passive: true });
  finePointer.addEventListener('change', updateTargets);
  reducedMotion.addEventListener('change', updateTargets);
}
