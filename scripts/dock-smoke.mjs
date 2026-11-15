import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let smokeRuns = 0;

// Exercise the real controller against centered flex layout, including growth.
export async function checkDock() {
  const names = ['document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver'];
  const originals = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const frames = new Map();
  const mutations = [];
  let nextFrame = 0;
  let time = performance.now();
  let mobile = false;

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
  const baseWidth = () => mobile ? 299 : 363;
  const itemSize = () => mobile ? 44 : 48;
  const iconSize = () => mobile ? 40 : 44;
  const dockHeight = () => mobile ? 60 : 64;
  const offsets = () => mobile ? [8, 54, 100, 155, 201, 247] : [13, 67, 121, 194, 248, 302];
  const growth = item => Number.parseFloat(item.element.style.getPropertyValue('--dock-growth')) || 0;
  const dockWidth = () => baseWidth() + items.reduce((sum, item) => sum + growth(item), 0);
  const items = Array.from({ length: 6 }, (_, index) => {
    const icon = { style: style(), get offsetWidth() { return iconSize(); } };
    const element = {
      ...eventTarget(), style: style(),
      get offsetWidth() { return itemSize() + growth(items[index]); },
      getBoundingClientRect() {
        const left = (window.innerWidth - dockWidth()) / 2 + offsets()[index]
          + items.slice(0, index).reduce((sum, item) => sum + growth(item), 0);
        return rect(left, 700 + (dockHeight() - itemSize()) / 2, itemSize() + growth(items[index]), itemSize());
      },
      querySelector: selector => selector === '.bn-icon' ? icon : null,
      matches: selector => selector === ':focus-visible' && document.activeElement === element,
    };
    icon.getBoundingClientRect = () => {
      const bounds = element.getBoundingClientRect();
      const size = iconSize() * (Number.parseFloat(icon.style.getPropertyValue('--dock-scale')) || 1);
      const lift = Number.parseFloat(icon.style.getPropertyValue('--dock-lift')) || 0;
      return rect(bounds.left + (bounds.width - size) / 2, 700 + (dockHeight() - size) / 2 + lift, size, size);
    };
    return { element, icon };
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
    get offsetWidth() { return dockWidth(); },
    getBoundingClientRect: () => rect((window.innerWidth - dockWidth()) / 2, 700, dockWidth(), dockHeight()),
    contains: element => items.some(item => item.element === element || item.icon === element),
  };
  const fine = { ...eventTarget(), matches: true };
  const reduced = { ...eventTarget(), matches: false };
  const num = (element, property, fallback = 0) => Number.parseFloat(element.style.getPropertyValue(property)) || fallback;
  const pointerAt = index => ({
    pointerType: 'mouse', clientX: (window.innerWidth - baseWidth()) / 2 + offsets()[index] + itemSize() / 2,
    clientY: 700 + dockHeight() / 2, target: items[index].element,
  });
  const move = index => dock.dispatch('pointermove', pointerAt(index));
  function tick(elapsed = 1000 / 60) {
    time += elapsed;
    const pending = [...frames];
    frames.clear();
    for (const [, callback] of pending) callback(time);
    assert(dockWidth() <= window.innerWidth - 20 + .005, 'Every animation frame must respect the viewport width budget');
    for (const item of items) {
      const scale = num(item.icon, '--dock-scale', 1);
      assert(scale >= 1 && scale <= 1.3201, 'Spring motion must keep magnification within its compact bounds');
      assert(growth(item) >= 0 && growth(item) <= iconSize() * .32 + .001,
        'Spring motion must not produce negative or oversized flex growth');
      assert(Math.abs(num(item.icon, '--dock-tilt')) <= 5.001, 'Pointer tilt must stay subtle');
      assert(Math.abs(num(item.icon, '--dock-glyph-x')) <= 2.001, 'Glyph movement must stay inside its button');
      const lift = num(item.icon, '--dock-lift');
      assert(lift >= -14.001 && lift <= .001, 'Icon lift must stay within its compact upward range');
      assert(Math.abs(num(item.element, '--dock-label-lift') + lift) <= .001,
        'Tooltip lift must track the visible icon throughout the animation');
    }
  }
  function settle() {
    for (let count = 0; frames.size && count < 400; count++) tick();
    assert.equal(frames.size, 0, 'Dock must stop requesting frames once its animation settles');
  }
  function neutral() {
    assert.equal(dockWidth(), baseWidth(), 'Inactive dock must return to its resting width');
    for (const item of items) {
      const { icon } = item;
      assert.equal(growth(item), 0);
      assert.equal(num(icon, '--dock-scale', 1), 1);
      assert.equal(num(icon, '--dock-tilt'), 0, 'Inactive icons must reset pointer tilt');
      assert.equal(num(icon, '--dock-glyph-x'), 0, 'Inactive icons must reset glyph movement');
      assert.equal(num(icon, '--dock-lift'), 0, 'Inactive icons must return to their original height');
      assert.equal(num(item.element, '--dock-label-lift'), 0, 'Inactive tooltips must reset their lift');
    }
  }
  function preference(media, value) {
    media.matches = value;
    media.dispatch('change');
  }

  try {
    globalThis.document = { ...eventTarget(), hidden: false, activeElement: null, getElementById: id => id === 'bot-nav' ? dock : null };
    globalThis.window = {
      ...eventTarget(), innerWidth: 1280,
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

    const restingBounds = dock.getBoundingClientRect();
    move(2);
    tick();
    assert(num(items[2].icon, '--dock-scale') > 1, 'Pointer proximity must animate the icon');
    assert(num(items[2].icon, '--dock-scale') < 1.32, 'The first frame must interpolate rather than jump');
    const initialWidth = dockWidth();
    assert(initialWidth > baseWidth(), 'The first visible icon growth must increase actual navbar width');
    settle();
    assert(num(items[2].icon, '--dock-scale') <= 1.3201, 'Hover magnification must stay compact');
    assert(dockWidth() > initialWidth, 'The flex width must continue growing with eased magnification');
    assert(dockWidth() - baseWidth() > 20 && dockWidth() - baseWidth() <= 44.001,
      `Center hover must widen the compact dock by 20-44px; got ${(dockWidth() - baseWidth()).toFixed(3)}px`);
    assert.equal(dock.getBoundingClientRect().top, restingBounds.top, 'Hover must not move the navbar vertically');
    assert.equal(dock.getBoundingClientRect().height, restingBounds.height, 'Hover must not enlarge navbar height');
    dock.dispatch('pointerleave');
    settle();
    neutral();

    for (let index = 0; index < items.length; index++) {
      move(index); settle();
      const bar = dock.getBoundingClientRect();
      assert(items[index].icon.getBoundingClientRect().top < bar.top,
        `Hovered icon ${index} must visibly rise above the navbar top`);
      assert.equal(bar.top, restingBounds.top, 'Only icons may lift; the navbar must stay at its original top');
      assert.equal(bar.height, restingBounds.height, 'Icon lift must not change the navbar height');
      items.forEach((item, otherIndex) => {
        if (otherIndex === index) return;
        assert(num(item.icon, '--dock-lift') > num(items[index].icon, '--dock-lift'),
          'Neighboring icons must respond more gently than the hovered icon');
      });
      dock.dispatch('pointerleave'); settle(); neutral();
    }

    const centerPointer = pointerAt(2);
    dock.dispatch('pointermove', { ...centerPointer, clientX: centerPointer.clientX - 16 }); settle();
    assert(num(items[2].icon, '--dock-tilt') < 0 && num(items[2].icon, '--dock-glyph-x') < 0,
      'The glyph must tilt and move toward the left side of the cursor');
    dock.dispatch('pointermove', { ...centerPointer, clientX: centerPointer.clientX + 16 }); settle();
    assert(num(items[2].icon, '--dock-tilt') > 0 && num(items[2].icon, '--dock-glyph-x') > 0,
      'The glyph must reverse its tilt and movement toward the right side of the cursor');
    dock.dispatch('pointerleave'); settle(); neutral();

    for (const index of [0, 5]) {
      const pointer = pointerAt(index);
      dock.dispatch('pointermove', pointer); settle();
      const expected = items.map(growth);
      for (let repeat = 0; repeat < 12; repeat++) {
        dock.dispatch('pointermove', pointer); settle();
        items.forEach((item, itemIndex) => {
          assert(Math.abs(growth(item) - expected[itemIndex]) <= .005,
            `Fixed pointer at edge ${index} must not feed flex layout changes back into hover targets`);
        });
      }
      dock.dispatch('pointerleave'); settle(); neutral();
    }

    move(0); move(2); move(5);
    assert.equal(frames.size, 1, 'Rapid pointer movement must reuse one animation loop');
    settle();
    dock.dispatch('pointercancel'); settle(); neutral();
    for (let reversal = 0; reversal < 18; reversal++) {
      move(reversal % 2 ? 0 : 5);
      tick(reversal % 3 === 0 ? 120 : 1000 / 60);
    }
    settle();
    dock.dispatch('pointerleave'); settle(); neutral();
    move(3); settle();
    window.dispatch('blur');
    neutral();
    assert.equal(frames.size, 0);
    window.dispatch('focus'); settle(); neutral();

    document.activeElement = items[1].element;
    dock.dispatch('focusin');
    settle();
    assert(num(items[1].icon, '--dock-scale') > 1, 'Keyboard focus must receive the dock effect');
    assert(dockWidth() > baseWidth(), 'Keyboard focus must expand the actual navbar');
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

    mobile = true;
    window.innerWidth = 320;
    window.dispatch('resize'); settle(); neutral();
    preference(fine, false); settle();
    move(2); settle(); neutral();
    preference(fine, true); settle();
    for (let reversal = 0; reversal < 12; reversal++) {
      move(reversal % 2 ? 0 : 5);
      tick(reversal % 3 === 0 ? 120 : 1000 / 60);
    }
    move(2); settle();
    assert(dockWidth() <= 300.001, 'Fine-pointer animation must fit inside a 320px viewport with side margins');
    assert.equal(dock.getBoundingClientRect().height, 60);
    dock.dispatch('pointerleave'); settle(); neutral();
    window.innerWidth = baseWidth() + 20;
    window.dispatch('resize'); settle();
    move(2); settle(); neutral();
    assert.equal(frames.size, 0, 'A zero growth budget must settle without an idle animation loop');
    const [navigation, responsive] = await Promise.all([
      readFile(new URL('../assets/css/navigation.css', import.meta.url), 'utf8'),
      readFile(new URL('../assets/css/responsive.css', import.meta.url), 'utf8'),
    ]);
    assert(!/#bot-nav::(?:before|after)/.test(navigation + responsive), 'The actual navbar must replace the old overlay skins');
    const bar = navigation.match(/#bot-nav\s*\{([^}]+)\}/)?.[1];
    assert(bar && /\bbackground\s*:\s*var\(--nav-bg\)/.test(bar) && /\bborder\s*:/.test(bar) && /\bbackdrop-filter\s*:/.test(bar),
      'The actual navbar must carry its background, border, and backdrop blur');
    assert(/\bheight\s*:\s*64px/.test(bar), 'Desktop navbar must keep its compact fixed height');
    assert(/#bot-nav\s*\{[^}]*\bheight\s*:\s*60px/.test(responsive), 'Mobile navbar must keep its compact fixed height');
    const itemRule = navigation.match(/\.bn-item\s*\{([^}]+)\}/)?.[1];
    assert(itemRule && /\bwidth\s*:\s*calc\(/.test(itemRule) && itemRule.includes('--dock-growth'),
      'Item growth must participate in actual flex width');
    const slotRules = [...(navigation + responsive).matchAll(/(?:#bot-nav|\.bn-item)\s*\{([^}]+)\}/g)]
      .map(match => match[1]).join('');
    assert(!/\boverflow(?:-[xy])?\s*:\s*(?:hidden|clip)/.test(slotRules),
      'The navbar and clickable slots must not clip raised icons');
    const iconRule = navigation.match(/\.bn-icon\s*\{([^}]+)\}/)?.[1];
    assert(iconRule && /translateY\s*\(\s*var\s*\(\s*--dock-lift\b/.test(iconRule),
      'Icon lift must affect the rendered transform');
    const labelRule = navigation.match(/\.bn-label\s*\{([^}]+)\}/)?.[1];
    assert(labelRule && labelRule.includes('--dock-label-lift'), 'Tooltip positioning must follow icon lift');
    console.log('OK: compact dock - raised icons, tracking tooltips, spring flex growth, fixed navbar height, mobile budget, reset states, finite animation frames.');
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
