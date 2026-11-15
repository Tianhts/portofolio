import { projects } from '../data/projects.js';
import { projectDetails, projectSlug } from '../data/project-details.js';
import { escapeHtml, renderTag } from '../utils/icons.js';

let detailContainer;
let currentIndex = -1;
let currentSlide = 0;
let gallery = [];
let sectionObserver;
let lightbox;
let lightboxTrigger;
let savedOverflow = '';
let inertSiblings = [];
let initialized = false;

const sectionNames = [
  ['overview', 'Overview'], ['gallery', 'Gallery'], ['problem', 'The Problem'],
  ['approach', 'How I Built It'], ['stack', 'Tech Stack'],
];

function projectLink(project, index, className = '') {
  return `<a class="${className}" href="/project/${projectSlug(project)}" data-project="${index}">${escapeHtml(project.name)}</a>`;
}

function actionLink(url, label, icon, primary = false) {
  if (!url) return '';
  return `<a class="pd-action ${primary ? 'pd-action-primary' : ''}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><i class="${icon}" aria-hidden="true"></i>${label}<i class="fas fa-arrow-up-right-from-square pd-external-icon" aria-hidden="true"></i></a>`;
}

function imageMarkup(source, className, alt, extra = '') {
  return `<img class="${className}" src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" data-project-image ${extra} />`;
}

function setCurrentSection(name) {
  detailContainer.querySelectorAll('[data-detail-section]').forEach(button => {
    const active = button.dataset.detailSection === name;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  });
}

function observeSections() {
  sectionObserver?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setCurrentSection(visible[0].target.dataset.detailContent);
  }, { rootMargin: '-12% 0px -58% 0px', threshold: 0 });
  detailContainer.querySelectorAll('[data-detail-content]').forEach(section => sectionObserver.observe(section));
}

function updateGallery() {
  const project = projects[currentIndex];
  if (!project || !gallery.length) return;
  const image = detailContainer.querySelector('[data-gallery-image]');
  if (image) {
    image.removeAttribute('data-fallback-tried');
    image.hidden = false;
    image.src = gallery[currentSlide];
    image.alt = `${project.name} — screenshot ${currentSlide + 1} of ${gallery.length}`;
  }
  detailContainer.querySelectorAll('[data-gallery-select]').forEach(button => {
    const selected = Number(button.dataset.gallerySelect) === currentSlide;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const counter = detailContainer.querySelector('[data-gallery-counter]');
  if (counter) counter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
  if (lightbox && !lightbox.hidden) {
    const fullImage = lightbox.querySelector('[data-lightbox-image]');
    fullImage.removeAttribute('data-fallback-tried');
    fullImage.hidden = false;
    fullImage.src = gallery[currentSlide];
    fullImage.alt = image?.alt || project.name;
    lightbox.querySelector('[data-lightbox-caption]').textContent = `${project.name} · ${currentSlide + 1} / ${gallery.length}`;
  }
}

function shiftSlide(step) {
  if (!gallery.length) return;
  currentSlide = (currentSlide + step + gallery.length) % gallery.length;
  updateGallery();
}

export function renderProjectDetail(index) {
  if (!detailContainer) detailContainer = document.getElementById('project-detail');
  if (!detailContainer) return;
  closeLightbox();
  const project = projects[index];
  if (!project) {
    currentIndex = -1;
    detailContainer.innerHTML = '<div class="pd-not-found"><p class="eyebrow">PROJECT NOT FOUND</p><h1>This project could not be found.</h1><a class="pd-back" href="/projects" data-page="projects"><i class="fas fa-arrow-left" aria-hidden="true"></i>All projects</a></div>';
    return;
  }
  currentIndex = index;
  currentSlide = 0;
  const details = projectDetails[index];
  const galleryImages = details?.gallery ?? project.images;
  gallery = [...new Set([project.cover, ...galleryImages])];
  const previousIndex = (index - 1 + projects.length) % projects.length;
  const nextIndex = (index + 1) % projects.length;
  const otherProjects = projects.map((item, itemIndex) => ({ item, itemIndex })).filter(({ itemIndex }) => itemIndex !== index).slice(0, 5);

  detailContainer.innerHTML = `
    <div class="pd-layout">
      <article class="pd-main">
        <div class="pd-topline" data-intro>
          <a class="pd-back" href="/projects" data-page="projects"><i class="fas fa-arrow-left" aria-hidden="true"></i>All projects</a>
          <div class="pd-project-switcher" aria-label="Browse projects">
            <a href="/project/${projectSlug(projects[previousIndex])}" data-project="${previousIndex}" aria-label="Previous project: ${escapeHtml(projects[previousIndex].name)}"><i class="fas fa-chevron-left" aria-hidden="true"></i></a>
            ${projectLink(projects[nextIndex], nextIndex, 'pd-next-name')}
            <a href="/project/${projectSlug(projects[nextIndex])}" data-project="${nextIndex}" aria-label="Next project: ${escapeHtml(projects[nextIndex].name)}"><i class="fas fa-chevron-right" aria-hidden="true"></i></a>
          </div>
        </div>
        <header class="pd-header" data-intro>
          <p class="pd-eyebrow">${escapeHtml(details?.eyebrow || project.category)}</p>
          <h1 class="pd-title" tabindex="-1">${escapeHtml(project.name)}</h1>
          <p class="pd-subtitle">${escapeHtml(project.title)}</p>
          <div class="pd-actions">${actionLink(project.demoUrl, 'Visit Website', 'fas fa-globe', true)}${actionLink(project.sourceUrl, 'Source Code', 'fab fa-github')}</div>
        </header>
        <button type="button" class="pd-cover" data-open-lightbox="0" aria-label="View ${escapeHtml(project.name)} cover in full size" data-intro>
          ${imageMarkup(project.cover, 'pd-cover-image', `${project.name} — project preview`)}
          <span class="pd-image-expand"><i class="fas fa-expand" aria-hidden="true"></i>View full image</span>
        </button>

        <section class="pd-section" id="detail-overview" data-detail-content="overview" data-aos>
          <p class="pd-section-number">01 / OVERVIEW</p>
          <h2>About the project</h2>
          <p class="pd-lead">${escapeHtml(project.description)}</p>
          <div class="pd-highlights">${(details?.highlights || []).map(highlight => `<div class="pd-highlight"><i class="fas fa-check" aria-hidden="true"></i><span>${escapeHtml(highlight)}</span></div>`).join('')}</div>
        </section>

        <section class="pd-section" id="detail-gallery" data-detail-content="gallery" data-aos>
          <div class="pd-section-heading"><div><p class="pd-section-number">02 / GALLERY</p><h2>A closer look</h2></div><span class="pd-gallery-counter" data-gallery-counter aria-live="polite"></span></div>
          <div class="pd-gallery-stage">
            <button class="pd-gallery-view" type="button" data-open-lightbox aria-label="Open current screenshot in full size">${imageMarkup(gallery[0], 'pd-gallery-image', `${project.name} screenshot`, 'data-gallery-image loading="lazy"')}<span class="pd-image-expand"><i class="fas fa-expand" aria-hidden="true"></i>Expand image</span></button>
            ${gallery.length > 1 ? '<button class="pd-gallery-arrow pd-gallery-previous" type="button" data-gallery-shift="-1" aria-label="Previous screenshot"><i class="fas fa-chevron-left" aria-hidden="true"></i></button><button class="pd-gallery-arrow pd-gallery-next" type="button" data-gallery-shift="1" aria-label="Next screenshot"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>' : ''}
          </div>
          ${gallery.length > 1 ? `<div class="pd-thumbnails" aria-label="Choose a screenshot">${gallery.map((source, slide) => `<button type="button" class="pd-thumbnail" data-gallery-select="${slide}" aria-label="Screenshot ${slide + 1}" aria-pressed="false">${imageMarkup(source, 'pd-thumbnail-image', '', 'loading="lazy"')}</button>`).join('')}</div>` : ''}
          <p class="pd-gallery-hint"><i class="fas fa-expand" aria-hidden="true"></i>Click an image to explore it in full size.</p>
        </section>

        <section class="pd-section" id="detail-problem" data-detail-content="problem" data-aos>
          <p class="pd-section-number">03 / THE PROBLEM</p>
          <h2>What needed to be solved</h2>
          <p>${escapeHtml(details?.problem || project.description)}</p>
        </section>

        <section class="pd-section" id="detail-approach" data-detail-content="approach" data-aos>
          <p class="pd-section-number">04 / HOW I BUILT IT</p>
          <h2>From idea to implementation</h2>
          <p>${escapeHtml(details?.approach || project.description)}</p>
          <div class="pd-architecture">${(details?.architecture || []).map(([technology, description], itemIndex) => `<div class="pd-architecture-item"><span class="pd-step">${String(itemIndex + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(technology)}</h3><p>${escapeHtml(description)}</p></div></div>`).join('')}</div>
        </section>

        <section class="pd-section" id="detail-stack" data-detail-content="stack" data-aos>
          <p class="pd-section-number">05 / TECH STACK</p>
          <h2>Tools behind the project</h2>
          <div class="pd-tech-tags">${project.tags.map(tag => renderTag(tag)).join('')}</div>
        </section>

        <footer class="pd-footer" data-aos><p>Keep exploring</p>${projectLink(projects[nextIndex], nextIndex, 'pd-next-project')}<i class="fas fa-arrow-right" aria-hidden="true"></i></footer>
      </article>

      <aside class="pd-sidebar" aria-label="Project navigation">
        <nav class="pd-toc" aria-label="On this page"><p class="pd-aside-label">ON THIS PAGE</p><div class="pd-toc-links">${sectionNames.map(([name, label], sectionIndex) => `<button type="button" data-detail-section="${name}" class="${sectionIndex === 0 ? 'is-active' : ''}" ${sectionIndex === 0 ? 'aria-current="location"' : ''}>${label}</button>`).join('')}</div></nav>
        <div class="pd-other-projects"><p class="pd-aside-label">OTHER PROJECTS</p>${otherProjects.map(({ item, itemIndex }) => projectLink(item, itemIndex)).join('')}</div>
        <a class="pd-sidebar-contact" href="mailto:septianhts95@gmail.com"><span>Have something in mind?</span><strong>Let's build it.<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></strong></a>
      </aside>
    </div>`;

  updateGallery();
  observeSections();
  document.title = `${project.name} — Septian Hutasoit`;
}

function createLightbox() {
  lightbox = document.createElement('div');
  lightbox.className = 'pd-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Project screenshot viewer');
  lightbox.tabIndex = -1;
  lightbox.innerHTML = '<div class="pd-lightbox-top"><p data-lightbox-caption aria-live="polite"></p><button type="button" class="pd-lightbox-close" data-close-lightbox aria-label="Close screenshot viewer"><i class="fas fa-times" aria-hidden="true"></i></button></div><div class="pd-lightbox-frame"><button type="button" class="pd-lightbox-arrow" data-gallery-shift="-1" aria-label="Previous screenshot"><i class="fas fa-chevron-left" aria-hidden="true"></i></button><img class="pd-lightbox-image" data-lightbox-image data-project-image alt="" /><button type="button" class="pd-lightbox-arrow" data-gallery-shift="1" aria-label="Next screenshot"><i class="fas fa-chevron-right" aria-hidden="true"></i></button></div><p class="pd-lightbox-help">Use arrow keys to browse · Esc to close</p>';
  document.body.appendChild(lightbox);
}

function openLightbox(trigger, index) {
  if (!gallery.length) return;
  if (!lightbox) createLightbox();
  if (Number.isInteger(index)) currentSlide = index;
  lightboxTrigger = trigger;
  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lightbox.hidden = false;
  lightbox.querySelectorAll('[data-gallery-shift]').forEach(button => { button.hidden = gallery.length < 2; });
  inertSiblings = [...document.body.children].filter(element => element !== lightbox && element.tagName !== 'SCRIPT').map(element => [element, element.inert]);
  inertSiblings.forEach(([element]) => { element.inert = true; });
  updateGallery();
  lightbox.querySelector('[data-close-lightbox]').focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = savedOverflow;
  inertSiblings.forEach(([element, wasInert]) => { element.inert = wasInert; });
  inertSiblings = [];
  if (lightboxTrigger?.isConnected) lightboxTrigger.focus({ preventScroll: true });
}

export function initProjectDetail() {
  if (initialized) return;
  detailContainer = document.getElementById('project-detail');
  if (!detailContainer) return;
  initialized = true;
  const pageTitle = document.title;

  document.addEventListener('portfolio:route', event => {
    if (event.detail.page !== 'project') {
      closeLightbox();
      sectionObserver?.disconnect();
      document.title = pageTitle;
      return;
    }
    const index = Number.isInteger(event.detail.projectIndex) ? event.detail.projectIndex : projects.findIndex(project => projectSlug(project) === event.detail.slug);
    renderProjectDetail(index);
  });

  document.addEventListener('click', event => {
    const sectionButton = event.target.closest('[data-detail-section]');
    if (sectionButton && detailContainer.contains(sectionButton)) {
      const target = detailContainer.querySelector(`[data-detail-content="${sectionButton.dataset.detailSection}"]`);
      target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      setCurrentSection(sectionButton.dataset.detailSection);
    }
    const thumbnail = event.target.closest('[data-gallery-select]');
    if (thumbnail && detailContainer.contains(thumbnail)) {
      currentSlide = Number(thumbnail.dataset.gallerySelect);
      updateGallery();
    }
    const arrow = event.target.closest('[data-gallery-shift]');
    if (arrow && (detailContainer.contains(arrow) || lightbox?.contains(arrow))) shiftSlide(Number(arrow.dataset.galleryShift));
    const imageButton = event.target.closest('[data-open-lightbox]');
    if (imageButton && detailContainer.contains(imageButton)) {
      const selected = imageButton.dataset.openLightbox;
      openLightbox(imageButton, selected === '' ? undefined : Number(selected));
    }
    if (event.target.closest('[data-close-lightbox]') || event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', event => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeLightbox(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); shiftSlide(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); shiftSlide(1); }
    if (event.key !== 'Tab') return;
    const buttons = [...lightbox.querySelectorAll('button')].filter(button => !button.hidden);
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.hasAttribute('data-project-image')) return;
    const cover = projects[currentIndex]?.cover;
    if (!cover || image.dataset.fallbackTried) { image.hidden = true; return; }
    image.dataset.fallbackTried = 'true';
    if (image.src !== new URL(cover, document.baseURI).href) image.src = cover;
    else image.hidden = true;
  }, true);
}
