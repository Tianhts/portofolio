import { projects } from '../data/projects.js';
import { renderTag } from '../utils/icons.js';

export function initModal() {
  const modal = document.getElementById('modal');
  const backdrop = document.getElementById('mb');
  const box = document.getElementById('mi');
  const image = document.getElementById('m-img');
  const dots = document.getElementById('m-dots');
  if (!modal || !backdrop || !box || !image || !dots) return;
  let images = [];
  let activeIndex = 0;
  let activeProject;
  let open = false;
  let returnFocus;
  let closeTimer;
  let openFrame;

  function updateImage() {
    image.src = images[activeIndex];
    image.alt = `${activeProject.name} — gambar ${activeIndex + 1} dari ${images.length}`;
    [...dots.children].forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
      dot.setAttribute('aria-pressed', String(index === activeIndex));
    });
  }

  function openProject(index, trigger) {
    const project = projects[index];
    if (!project) return;
    clearTimeout(closeTimer);
    cancelAnimationFrame(openFrame);
    activeProject = project;
    returnFocus = trigger;
    document.getElementById('m-sub').textContent = project.category;
    document.getElementById('m-title').textContent = project.title;
    document.getElementById('m-desc').textContent = project.description;
    document.getElementById('m-tags').innerHTML = project.tags.map(tag => renderTag(tag)).join('');
    for (const [id, url] of [['m-demo', project.demoUrl], ['m-code', project.sourceUrl]]) {
      const link = document.getElementById(id);
      link.style.display = url ? '' : 'none';
      if (url) link.href = url;
      else link.removeAttribute('href');
    }
    images = project.images.length ? project.images : [project.cover];
    activeIndex = 0;
    dots.innerHTML = images.map((_, slide) => `<button type="button" class="gallery-dot" data-slide="${slide}" aria-label="Gambar ${slide + 1}" aria-pressed="false"></button>`).join('');
    const multiple = images.length > 1;
    for (const id of ['m-prev', 'm-next', 'm-dots']) {
      document.getElementById(id).style.display = multiple ? 'flex' : 'none';
    }
    updateImage();
    open = true;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    openFrame = requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      box.style.transform = 'scale(1)';
      box.style.opacity = '1';
      box.focus({ preventScroll: true });
    });
  }

  function close() {
    if (!open) return;
    open = false;
    cancelAnimationFrame(openFrame);
    backdrop.style.opacity = '0';
    box.style.transform = 'scale(.9)';
    box.style.opacity = '0';
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 270;
    closeTimer = setTimeout(() => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      returnFocus?.focus({ preventScroll: true });
    }, delay);
  }

  function shift(step) {
    if (!open || !images.length) return;
    activeIndex = (activeIndex + step + images.length) % images.length;
    updateImage();
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-project]');
    if (trigger) openProject(Number(trigger.dataset.project), trigger);
    if (event.target.closest('[data-action="close-modal"]') || event.target.id === 'mbox') close();
    const arrow = event.target.closest('[data-gallery-step]');
    if (arrow) shift(Number(arrow.dataset.galleryStep));
    const dot = event.target.closest('[data-slide]');
    if (dot && open) {
      activeIndex = Number(dot.dataset.slide);
      updateImage();
    }
  });

  document.addEventListener('keydown', event => {
    const trigger = event.target.closest('[data-project]');
    if (trigger && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openProject(Number(trigger.dataset.project), trigger);
      return;
    }
    if (!open) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') { event.preventDefault(); shift(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); shift(1); }
    if (event.key !== 'Tab') return;
    const focusable = [...box.querySelectorAll('button, a[href]')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === box)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === box)) {
      event.preventDefault(); first.focus();
    }
  });

  // Existing gallery entries can refer to unavailable files; retain the cover as a fallback.
  image.addEventListener('error', () => {
    if (!activeProject) return;
    const coverUrl = new URL(activeProject.cover, document.baseURI).href;
    if (image.src !== coverUrl) image.src = activeProject.cover;
  });
}
