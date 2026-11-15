import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { projects } from '../assets/js/data/projects.js';
import { projectSlug } from '../assets/js/data/project-details.js';

// Exercise the real route/controller module without a browser dependency.
export async function checkNavigation() {
  const globalNames = ['document', 'window', 'CustomEvent', 'requestAnimationFrame'];
  const originalGlobals = new Map(globalNames.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const emitted = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const mediaListeners = new Map();
  const elements = new Map();
  let mobile = false;

  function listen(listeners, name, callback) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(callback);
  }
  function dispatch(listeners, name, event = {}) {
    for (const callback of listeners.get(name) || []) callback(event);
  }
  function createElement() {
    const classes = new Set();
    const attributes = new Map();
    return {
      classList: {
        add: name => classes.add(name),
        remove: name => classes.delete(name),
        contains: name => classes.has(name),
        toggle(name, value) { value ? classes.add(name) : classes.delete(name); },
      },
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: name => attributes.delete(name),
      getAttribute: name => attributes.get(name),
      inert: false,
    };
  }
  for (const id of [
    'pg-home', 'pg-projects', 'pg-about', 'pg-project', 'top-nav', 'bot-nav', 'scr-top',
    'tn-home', 'tn-projects', 'tn-about', 'bn-home', 'bn-projects', 'bn-about',
  ]) elements.set(id, createElement());
  const routes = () => emitted.filter(event => event.type === 'portfolio:route');
  const transitions = () => emitted.filter(event => event.type === 'portfolio:pagechange');
  const isActive = page => elements.get(`pg-${page}`).classList.contains('on');

  try {
    globalThis.CustomEvent = class {
      constructor(type, options) { this.type = type; this.detail = options.detail; }
    };
    globalThis.document = {
      getElementById: id => elements.get(id),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: (name, callback) => listen(documentListeners, name, callback),
      dispatchEvent(event) {
        emitted.push(event);
        dispatch(documentListeners, event.type, event);
        return true;
      },
    };
    globalThis.window = {
      location: { hash: `#project/${projectSlug(projects[0])}` },
      scrollY: 0,
      history: {
        pushState(_state, _title, hash) { window.location.hash = hash; },
        replaceState(_state, _title, hash) { window.location.hash = hash; },
      },
      scrollTo() { window.scrollY = 0; },
      addEventListener: (name, callback) => listen(windowListeners, name, callback),
      matchMedia(query) {
        return {
          get matches() { return query === '(max-width: 640px)' && mobile; },
          addEventListener: (name, callback) => listen(mediaListeners, `${query}:${name}`, callback),
        };
      },
    };
    globalThis.requestAnimationFrame = callback => { callback(); return 1; };

    const { initNavigation, showPage } = await import('../assets/js/features/navigation.js');
    initNavigation();
    assert.equal(routes().at(-1).detail.initial, true, 'Initial deep link must emit a route');
    assert.equal(routes().at(-1).detail.projectIndex, 0);
    assert(isActive('project'));

    for (let index = 0; index < projects.length; index++) {
      const slug = projectSlug(projects[index]);
      window.location.hash = `#project/${slug}`;
      dispatch(windowListeners, 'hashchange');
      assert(isActive('project'), `Project ${index} must show its detail page`);
      assert.equal(routes().at(-1).detail.projectIndex, index);
      assert.equal(routes().at(-1).detail.slug, slug);
      for (const prefix of ['tn', 'bn']) {
        assert(elements.get(`${prefix}-projects`).classList.contains('on'));
        assert.equal(elements.get(`${prefix}-projects`).getAttribute('aria-current'), 'page');
      }
    }

    window.location.hash = '#project/project-that-does-not-exist';
    dispatch(windowListeners, 'hashchange');
    assert(isActive('projects'), 'Unknown project slug must return to the project list');
    showPage('project', { projectIndex: projects.length + 1 });
    assert.equal(window.location.hash, '#projects');
    assert(isActive('projects'), 'Invalid project index must return to the project list');

    function clickPage(page, modifiers = {}) {
      const link = { dataset: { page } };
      const event = {
        button: 0,
        defaultPrevented: false,
        target: { closest: selector => selector === '[data-page]' ? link : null },
        preventDefault() { this.defaultPrevented = true; },
        ...modifiers,
      };
      dispatch(documentListeners, 'click', event);
      return event;
    }
    assert(clickPage('about').defaultPrevented, 'Normal navigation click must be handled');
    assert.equal(window.location.hash, '#about');
    assert(isActive('about'));
    for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
      const before = routes().length;
      assert.equal(clickPage('home', { [modifier]: true }).defaultPrevented, false);
      assert.equal(window.location.hash, '#about', 'Modified link clicks must keep native browser behavior');
      assert.equal(routes().length, before);
    }

    window.location.hash = '#home';
    const beforeHistory = transitions().length;
    dispatch(windowListeners, 'popstate');
    dispatch(windowListeners, 'hashchange');
    assert(isActive('home'));
    assert.equal(transitions().length, beforeHistory + 1, 'History events must not duplicate the transition');
    assert.equal(elements.get('bot-nav').inert, true, 'Desktop dock starts hidden at the top');

    window.scrollY = 180;
    dispatch(windowListeners, 'scroll');
    assert(elements.get('top-nav').inert, 'Scrolled header must not accept hidden focus');
    assert.equal(elements.get('bot-nav').inert, false);
    assert(elements.get('bot-nav').classList.contains('show'));
    window.scrollY = 0;
    dispatch(windowListeners, 'scroll');
    assert.equal(elements.get('top-nav').inert, false);
    assert.equal(elements.get('bot-nav').inert, true);

    mobile = true;
    dispatch(mediaListeners, '(max-width: 640px):change');
    assert.equal(elements.get('bot-nav').inert, false, 'Mobile dock must remain available at the top');
    assert(elements.get('bot-nav').classList.contains('show'));
    console.log(`OK: navigation smoke — ${projects.length} deep links, active states, invalid projects, clicks, history, desktop/mobile dock.`);
  } finally {
    for (const [name, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await checkNavigation();
}
