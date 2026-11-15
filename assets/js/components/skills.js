import { skillRows } from '../data/skills.js';
import { escapeHtml } from '../utils/icons.js';

const ADAPTIVE_ICON = /github-original|express-original|nextjs-plain/;

export function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  const skills = skillRows.flat();

  grid.innerHTML = skills.map((skill) => {
    const adaptive = ADAPTIVE_ICON.test(skill.icon) ? ' skill-icon-adaptive' : '';
    const icon = skill.image
      ? `<img class="skill-brand-logo" src="${escapeHtml(skill.image)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="38" height="30">`
      : `<i class="${escapeHtml(skill.icon)}${adaptive}" aria-hidden="true"></i>`;
    return `
    <div class="skill-item" role="listitem">
      <div class="skill-icon-box">
        ${icon}
        ${skill.badge ? `<span class="skill-badge">${escapeHtml(skill.badge)}</span>` : ''}
      </div>
      <span class="skill-label">${escapeHtml(skill.name)}</span>
    </div>`;
  }).join('');

  [...grid.children].forEach((item, index) => {
    const { background, border } = skills[index];
    if (background) item.style.setProperty('--skill-glow', background);
    if (border) item.style.setProperty('--skill-border', border);
  });
}
