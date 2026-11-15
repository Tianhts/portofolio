import { projects } from '../data/projects.js';
import { escapeHtml, renderTag } from '../utils/icons.js';

function projectCard(project, index, featured) {
  const cardClass = featured ? 'pcard' : 'pfull';
  return `
    <div class="${cardClass}" role="button" tabindex="0" data-project="${index}"
      aria-label="Lihat detail ${escapeHtml(project.name)}" aria-haspopup="dialog">
      <div class="${featured ? 'pcard-iw' : 'project-image-wrap'}">
        <img class="${featured ? 'pcard-img' : 'project-image'}" src="${escapeHtml(project.cover)}"
          alt="${escapeHtml(project.name)}" data-image-fallback="${featured ? '.3' : '.2'}" loading="lazy" />
      </div>
      <div class="project-card-body ${featured ? 'project-card-body-featured' : ''}">
        <div class="project-card-heading ${featured ? 'project-card-heading-featured' : ''}">
          <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
          <i class="fas fa-arrow-right project-card-arrow" aria-hidden="true"></i>
        </div>
        <p class="project-card-description ${featured ? 'project-card-description-featured' : ''}">${escapeHtml(project.description)}</p>
        <div class="project-card-tags">${project.tags.slice(0, 3).map(tag => renderTag(tag, featured)).join('')}</div>
      </div>
    </div>`;
}

export function renderProjects() {
  const featured = document.getElementById('feat-grid');
  const all = document.getElementById('all-grid');
  if (featured) featured.innerHTML = projects.slice(0, 6).map((project, index) => projectCard(project, index, true)).join('');
  if (all) all.innerHTML = projects.map((project, index) => projectCard(project, index, false)).join('');
}
