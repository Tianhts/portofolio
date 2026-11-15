import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { projects } from '../assets/js/data/projects.js';
import { projectSlug } from '../assets/js/data/project-details.js';

let smokeRuns = 0;

// Exercise the real route controller with URL-backed history, without a browser.
export async function checkNavigation() {
  const globalNames = ['document', 'window', 'CustomEvent', 'requestAnimationFrame'];
  const originalGlobals = new Map(globalNames.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const emitted = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const mediaListeners = new Map();
  const elements = new Map();
  let mobile = false;
  let currentUrl = new URL(`https://portfolio.test/project/${projectSlug(projects[0])}`);
  const entries = [currentUrl.href];
  let historyIndex = 0;
  let pushed = 0;

  function listen(listeners, name, callback) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(callback);
  }
  function dispatch(listeners, name, event = {}) {
    for (const callback of listeners.get(name) || []) callback(event);
  }
  function visit(path, event = 'popstate') {
    currentUrl = new URL(path, currentUrl.origin);
    dispatch(windowListeners, event);
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
      location: {
        get pathname() { return currentUrl.pathname; },
        get search() { return currentUrl.search; },
        get hash() { return currentUrl.hash; },
      },
      scrollY: 0,
      history: {
        pushState(_state, _title, path) {
          currentUrl = new URL(path, currentUrl);
          entries.splice(historyIndex + 1);
          entries.push(currentUrl.href);
          historyIndex++;
          pushed++;
        },
        replaceState(_state, _title, path) {
          currentUrl = new URL(path, currentUrl);
          entries[historyIndex] = currentUrl.href;
        },
        back() {
          if (historyIndex === 0) return;
          currentUrl = new URL(entries[--historyIndex]);
          dispatch(windowListeners, 'popstate');
        },
        forward() {
          if (historyIndex >= entries.length - 1) return;
          currentUrl = new URL(entries[++historyIndex]);
          dispatch(windowListeners, 'popstate');
        },
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

    const { initNavigation, showPage } = await import(`../assets/js/features/navigation.js?smoke=${++smokeRuns}`);
    initNavigation();
    assert.equal(routes().at(-1).detail.initial, true, 'Initial deep link must emit a route');
    assert.equal(routes().at(-1).detail.projectIndex, 0);
    assert(isActive('project'));

    for (let index = 0; index < projects.length; index++) {
      const slug = projectSlug(projects[index]);
      visit(`/project/${slug}`);
      assert(isActive('project'), `Project ${index} must show its detail page`);
      assert.equal(routes().at(-1).detail.projectIndex, index);
      assert.equal(routes().at(-1).detail.slug, slug);
      assert.equal(window.location.hash, '');
      for (const prefix of ['tn', 'bn']) {
        assert(elements.get(`${prefix}-projects`).classList.contains('on'));
        assert.equal(elements.get(`${prefix}-projects`).getAttribute('aria-current'), 'page');
      }
    }

    visit('/project/project-that-does-not-exist');
    assert(isActive('projects'), 'Unknown project slug must return to the project list');
    assert.equal(window.location.pathname, '/projects');
    visit('/project/%E0%A4%A');
    assert(isActive('projects'), 'Invalid encoded slug must not throw');
    visit('/project');
    assert.equal(window.location.pathname, '/projects');
    showPage('project', { projectIndex: projects.length + 1 });
    assert.equal(window.location.pathname, '/projects');

    function click(selector, dataset, modifiers = {}) {
      const link = { dataset };
      const event = {
        button: 0,
        defaultPrevented: false,
        target: { closest: query => query === selector ? link : null },
        preventDefault() { this.defaultPrevented = true; },
        ...modifiers,
      };
      dispatch(documentListeners, 'click', event);
      return event;
    }
    assert(click('[data-page]', { page: 'about' }).defaultPrevented);
    assert.equal(window.location.pathname, '/about');
    assert.equal(window.location.hash, '');
    assert(isActive('about'));
    const beforeSamePage = pushed;
    click('[data-page]', { page: 'about' });
    assert.equal(pushed, beforeSamePage, 'Repeated current-page clicks must not add history');
    for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
      const before = routes().length;
      assert.equal(click('[data-page]', { page: 'home' }, { [modifier]: true }).defaultPrevented, false);
      assert.equal(window.location.pathname, '/about');
      assert.equal(routes().length, before);
    }
    click('[data-project]', { project: '2' });
    assert.equal(window.location.pathname, `/project/${projectSlug(projects[2])}`);
    assert(isActive('project'));

    showPage('home');
    showPage('projects');
    window.history.back();
    assert.equal(window.location.pathname, '/home');
    assert(isActive('home'));
    window.history.forward();
    assert.equal(window.location.pathname, '/projects');
    assert(isActive('projects'));
    const afterPopstate = transitions().length;
    dispatch(windowListeners, 'hashchange');
    assert.equal(transitions().length, afterPopstate, 'Companion history events must not duplicate transitions');

    visit('/?source=old#about', 'hashchange');
    assert.equal(window.location.pathname, '/about');
    assert.equal(window.location.search, '?source=old');
    assert.equal(window.location.hash, '');
    visit(`/#project/${projectSlug(projects[1])}`, 'hashchange');
    assert.equal(window.location.pathname, `/project/${projectSlug(projects[1])}`);
    assert.equal(window.location.hash, '');
    for (const path of ['/', '/index.html', '/unknown-page']) {
      visit(path);
      assert.equal(window.location.pathname, '/home');
      assert(isActive('home'));
    }
    visit('/about/');
    assert.equal(window.location.pathname, '/about');
    const beforeAnchor = routes().length;
    visit('/about#main-content', 'hashchange');
    assert.equal(routes().length, beforeAnchor, 'Same-page anchor must not rerender');
    assert.equal(window.location.hash, '#main-content');
    visit('/about?campaign=test');
    showPage('projects');
    assert.equal(window.location.search, '?campaign=test', 'Navigation preserves query parameters');
    assert.equal(window.location.hash, '');

    showPage('home');
    assert.equal(elements.get('bot-nav').inert, true, 'Desktop dock starts hidden at the top');
    window.scrollY = 180;
    dispatch(windowListeners, 'scroll');
    assert(elements.get('top-nav').inert);
    assert.equal(elements.get('bot-nav').inert, false);
    assert(elements.get('bot-nav').classList.contains('show'));
    window.scrollY = 0;
    dispatch(windowListeners, 'scroll');
    assert.equal(elements.get('top-nav').inert, false);
    assert.equal(elements.get('bot-nav').inert, true);
    mobile = true;
    dispatch(mediaListeners, '(max-width: 640px):change');
    assert.equal(elements.get('bot-nav').inert, false);
    assert(elements.get('bot-nav').classList.contains('show'));
    console.log(`OK: clean URL navigation - ${projects.length} direct project paths, legacy links, query/anchor handling, clicks, Back/Forward, desktop/mobile dock.`);
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