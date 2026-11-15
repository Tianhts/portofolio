import { observeReveals } from '../animations/reveal.js';
import { projects } from '../data/projects.js';
import { projectSlug } from '../data/project-details.js';

const pages = ['home', 'projects', 'about', 'project'];
let initialized = false;
let activeRoute;
let updateNavigation = () => {};

function projectRoute(encodedSlug) {
  let slug;
  try { slug = decodeURIComponent(encodedSlug); }
  catch { return { page: 'projects' }; }
  const projectIndex = projects.findIndex(project => projectSlug(project) === slug);
  return projectIndex < 0 ? { page: 'projects' } : { page: 'project', projectIndex, slug };
}

function legacyRoute() {
  const hash = window.location.hash;
  if (/^#(?:home|projects|about)$/.test(hash)) return { page: hash.slice(1) };
  const match = hash.match(/^#project\/([^/?#]+)\/?$/);
  return match ? projectRoute(match[1]) : null;
}

function routeFromLocation() {
  const legacy = legacyRoute();
  if (legacy) return legacy;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/index.html') return { page: 'home' };
  if (/^\/(?:home|projects|about)$/.test(path)) return { page: path.slice(1) };
  const match = path.match(/^\/project\/([^/]+)$/);
  if (match) return projectRoute(match[1]);
  return { page: path.startsWith('/project') ? 'projects' : 'home' };
}

function routePath(route) {
  return route.page === 'project' ? '/project/' + encodeURIComponent(route.slug) : '/' + route.page;
}

function normalizeRoute(page, options) {
  if (!pages.includes(page)) return null;
  if (page !== 'project') return { page };
  const index = options.projectIndex ?? projects.findIndex(project => projectSlug(project) === options.slug);
  if (!Number.isInteger(index) || !projects[index]) return { page: 'projects' };
  return { page, projectIndex: index, slug: projectSlug(projects[index]) };
}

export function showPage(page, options = {}) {
  const route = normalizeRoute(page, options);
  if (!route) return;
  const path = routePath(route);
  const fragment = options.preserveHash && !legacyRoute() ? window.location.hash : '';
  const target = path + window.location.search + fragment;
  const current = window.location.pathname + window.location.search + window.location.hash;
  const method = options.history || 'push';
  if (method !== 'none' && current !== target) {
    window.history[method === 'replace' ? 'replaceState' : 'pushState'](null, '', target);
  }
  const changed = !activeRoute || activeRoute.page !== route.page || activeRoute.slug !== route.slug;
  activeRoute = route;
  for (const name of pages) {
    const section = document.getElementById(`pg-${name}`);
    const visible = name === route.page;
    section?.classList.toggle('on', visible);
    if (section) section.inert = !visible;
  }
  const activeLink = route.page === 'project' ? 'projects' : route.page;
  for (const name of ['home', 'projects', 'about']) {
    for (const prefix of ['tn', 'bn']) {
      const link = document.getElementById(`${prefix}-${name}`);
      link?.classList.toggle('on', name === activeLink);
      if (name === activeLink) link?.setAttribute('aria-current', 'page');
      else link?.removeAttribute('aria-current');
    }
  }
  document.dispatchEvent(new CustomEvent('portfolio:route', { detail: { ...route, initial: !!options.initial } }));
  if (options.scroll !== false) window.scrollTo({ top: 0, behavior: 'instant' });
  updateNavigation();
  observeReveals();
  if (changed) document.dispatchEvent(new CustomEvent('portfolio:pagechange', { detail: route }));
  if (options.focus !== false && !options.initial) {
    const heading = document.querySelector(`#pg-${route.page} h1`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}

export function initNavigation() {
  if (initialized) return;
  initialized = true;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const project = event.target.closest?.('[data-project]');
    if (project) {
      event.preventDefault();
      showPage('project', { projectIndex: Number(project.dataset.project) });
      return;
    }
    const link = event.target.closest?.('[data-page]');
    if (link) {
      event.preventDefault();
      showPage(link.dataset.page);
      return;
    }
    if (event.target.closest?.('[data-action="scroll-top"]')) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });
  document.addEventListener('keydown', event => {
    const trigger = event.target.closest?.('[data-project][role="button"]');
    if (!trigger || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    showPage('project', { projectIndex: Number(trigger.dataset.project) });
  });
  const onHistory = () => {
    const route = routeFromLocation();
    const normalizeUrl = window.location.pathname !== routePath(route) || !!legacyRoute();
    const changed = route.page !== activeRoute?.page || route.slug !== activeRoute?.slug;
    // Same-page anchors keep their native scroll and do not rerender content.
    if (changed || normalizeUrl) {
      showPage(route.page, { ...route, history: normalizeUrl ? 'replace' : 'none', preserveHash: true, focus: false });
    }
  };
  window.addEventListener('hashchange', onHistory);
  window.addEventListener('popstate', onHistory);

  const topNav = document.getElementById('top-nav');
  const bottomNav = document.getElementById('bot-nav');
  const scrollTop = document.getElementById('scr-top');
  const compact = window.matchMedia('(max-width: 640px)');
  let ticking = false;
  updateNavigation = () => {
    const scrolled = window.scrollY > 80;
    const showDock = scrolled || compact.matches;
    topNav?.classList.toggle('hidden', scrolled);
    if (topNav) topNav.inert = scrolled;
    bottomNav?.classList.toggle('show', showDock);
    if (bottomNav) {
      bottomNav.inert = !showDock;
      bottomNav.setAttribute('aria-hidden', String(!showDock));
    }
    scrollTop?.classList.toggle('show', scrolled);
    if (scrollTop) {
      scrollTop.inert = !scrolled;
      scrollTop.setAttribute('aria-hidden', String(!scrolled));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateNavigation);
  }, { passive: true });
  compact.addEventListener('change', updateNavigation);
  const route = routeFromLocation();
  showPage(route.page, { ...route, history: 'replace', preserveHash: true, initial: true, focus: false });
}
