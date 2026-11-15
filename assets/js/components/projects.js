import { projects } from '../data/projects.js';
import { projectSlug } from '../data/project-details.js';
import { escapeHtml, renderTag } from '../utils/icons.js';

function projectCard(project, index) {
  const visibleTags = project.tags.slice(0, 4);
  const extraTags = project.tags.length - visibleTags.length;
  return `
    <article class="project-card-wrap" data-aos>
      <a class="project-card" data-project="${index}" href="/project/${projectSlug(project)}"
        aria-label="Lihat detail ${escapeHtml(project.name)}">
        <div class="project-card-image">
          <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.name)}"
            data-image-fallback=".3" loading="lazy" decoding="async" width="800" height="450" />
        </div>
        <div class="project-card-body">
          <p class="project-card-category">${escapeHtml(project.category)}</p>
          <div class="project-card-heading">
            <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
            <i class="fas fa-arrow-up-right-from-square project-card-arrow" aria-hidden="true"></i>
          </div>
          <p class="project-card-description">${escapeHtml(project.description)}</p>
          <div class="project-card-tags">
            ${visibleTags.map(tag => renderTag(tag, false)).join('')}
            ${extraTags ? `<span class="tag tag-more" aria-label="${extraTags} teknologi lainnya">+${extraTags}</span>` : ''}
          </div>
          <div class="project-card-footer">
            <span>View project</span><i class="fas fa-arrow-right" aria-hidden="true"></i>
          </div>
        </div>
      </a>
    </article>`;
}

export function renderProjects() {
  const count = document.getElementById('project-count');
  if (count) count.textContent = String(projects.length);
  const featured = document.getElementById('feat-grid');
  const all = document.getElementById('all-grid');
  if (featured) featured.innerHTML = projects.slice(0, 6).map(projectCard).join('');
  if (all) all.innerHTML = projects.map(projectCard).join('');
}
