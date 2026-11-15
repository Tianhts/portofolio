import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let smokeRuns = 0;

// Check the real controller with a finite animation clock and stationary hit areas.
export async function checkDock() {
  const names = ['document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver'];
  const originals = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const frames = new Map();
  const mutations = [];
  let nextFrame = 0;
  let time = performance.now();

  function eventTarget() {
    const listeners = new Map();
    return {
      addEventListener(type, callback) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(callback);
      },
      dispatch(type, event = {}) {
        for (const callback of listeners.get(type) || []) callback(event);
      },
    };
  }
  function style() {
    const values = new Map();
    return {
      setProperty: (name, value) => values.set(name, String(value)),
      getPropertyValue: name => values.get(name) || '',
      removeProperty: name => values.delete(name),
    };
  }
  function rect(left, top, width, height) {
    return { left, top, width, height, right: left + width, bottom: top + height };
  }
  const items = Array.from({ length: 6 }, (_, index) => {
    const bounds = rect(118 + index * 58, 709, 52, 52);
    const icon = { style: style(), getBoundingClientRect: () => bounds };
    const element = {
      ...eventTarget(), style: style(),
      getBoundingClientRect: () => bounds,
      querySelector: selector => selector === '.bn-icon' ? icon : null,
      matches: selector => selector === ':focus-visible' && document.activeElement === element,
    };
    return { element, icon, bounds };
  });
  const classes = new Set(['show']);
  const dock = {
    ...eventTarget(), style: style(), inert: false,
    classList: {
      contains: name => classes.has(name),
      add: name => classes.add(name),
      remove: name => classes.delete(name),
    },
    querySelectorAll: selector => selector === '.bn-item' ? items.map(item => item.element) : [],
    getBoundingClientRect: () => rect(100, 700, 390, 70),
    contains: element => items.some(item => item.element === element || item.icon === element),
  };
  const fine = { ...eventTarget(), matches: true };
  const reduced = { ...eventTarget(), matches: false };
  const num = (element, property, fallback = 0) => Number.parseFloat(element.style.getPropertyValue(property)) || fallback;
  const move = index => dock.dispatch('pointermove', {
    pointerType: 'mouse', clientX: items[index].bounds.left + 26, clientY: 735,
    target: items[index].element,
  });
  function tick() {
    time += 1000 / 60;
    const pending = [...frames];
    frames.clear();
    for (const [, callback] of pending) callback(time);
  }
  function settle() {
    for (let count = 0; frames.size && count < 400; count++) tick();
    assert.equal(frames.size, 0, 'Dock must stop requesting frames once its animation settles');
  }
  function neutral() {
    assert.equal(num(dock, '--dock-glow'), 0, 'Inactive dock must not retain its moving background');
    for (const { icon } of items) {
      assert.equal(num(icon, '--dock-scale', 1), 1);
      assert.equal(num(icon, '--dock-lift'), 0);
    }
  }
  function preference(media, value) {
    media.matches = value;
    media.dispatch('change');
  }

  try {
    globalThis.document = { ...eventTarget(), hidden: false, activeElement: null, getElementById: id => id === 'bot-nav' ? dock : null };
    globalThis.window = {
      ...eventTarget(),
      matchMedia: query => query.includes('prefers-reduced-motion') ? reduced : fine,
    };
    globalThis.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    globalThis.MutationObserver = class {
      constructor(callback) { mutations.push(callback); }
      observe() {}
      disconnect() {}
    };
    const { initDock } = await import(`../assets/js/animations/dock.js?smoke=${++smokeRuns}`);
    initDock();
    settle();
    neutral();
    dock.dispatch('pointermove', { pointerType: 'touch', clientX: 260, clientY: 735 });
    settle();
    neutral();

    move(2);
    tick();
    assert(num(items[2].icon, '--dock-scale') > 1, 'Pointer proximity must animate the icon');
    assert(num(items[2].icon, '--dock-scale') < 1.18, 'The first frame must interpolate rather than jump');
    settle();
    assert(num(items[2].icon, '--dock-scale') <= 1.1801, 'Hover magnification must stay compact');
    assert(num(items[2].icon, '--dock-lift') >= -5.001, 'Hover lift must stay compact');
    assert(num(dock, '--dock-glow') > 0 && num(dock, '--dock-glow') <= 1);
    const firstX = num(dock, '--dock-x');
    move(5);
    settle();
    assert(num(dock, '--dock-x') > firstX + 100, 'Background must follow the hovered button');
    assert.equal(items[2].element.style.getPropertyValue('transform'), '', 'Clickable hit areas must remain stationary');
    dock.dispatch('pointerleave');
    settle();
    neutral();

    move(0); move(2); move(5);
    assert.equal(frames.size, 1, 'Rapid pointer movement must reuse one animation loop');
    settle();
    dock.dispatch('pointercancel'); settle(); neutral();
    move(3); settle();
    window.dispatch('blur');
    neutral();
    assert.equal(frames.size, 0);
    window.dispatch('focus'); settle(); neutral();

    document.activeElement = items[1].element;
    dock.dispatch('focusin');
    settle();
    assert(num(items[1].icon, '--dock-scale') > 1, 'Keyboard focus must receive the dock effect');
    assert(num(dock, '--dock-glow') > 0);
    document.activeElement = null;
    dock.dispatch('focusout');
    await Promise.resolve();
    settle();
    neutral();

    for (const event of ['scroll', 'resize']) {
      move(3); settle();
      window.dispatch(event); settle(); neutral();
    }
    move(3); settle();
    document.dispatch('portfolio:pagechange'); settle(); neutral();

    for (const [media, disabledValue, enabledValue] of [[reduced, true, false], [fine, false, true]]) {
      move(3); settle();
      preference(media, disabledValue);
      neutral();
      assert.equal(frames.size, 0, 'Disabling pointer motion must cancel the pending frame');
      move(3); settle(); neutral();
      preference(media, enabledValue); settle();
    }
    move(3); settle();
    document.hidden = true;
    document.dispatch('visibilitychange');
    neutral();
    assert.equal(frames.size, 0);
    document.hidden = false;
    document.dispatch('visibilitychange'); settle();
    for (const hiddenBy of ['class', 'inert']) {
      move(3); settle();
      if (hiddenBy === 'class') classes.delete('show'); else dock.inert = true;
      for (const callback of mutations) callback([{ type: 'attributes', target: dock }]);
      neutral();
      move(3); settle(); neutral();
      classes.add('show'); dock.inert = false;
      for (const callback of mutations) callback([{ type: 'attributes', target: dock }]);
      settle();
    }
    console.log('OK: compact dock - pointer/focus effects, following background, reset states, reduced motion, touch, finite animation frames.');
  } finally {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await checkDock();
}
