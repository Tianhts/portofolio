import { skillRows } from '../data/skills.js';
import { escapeHtml } from '../utils/icons.js';

export function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  const skills = skillRows.flat();
  grid.innerHTML = skills.map(skill => `
    <div class="skill-item" data-action="like">
      <div class="skill-icon-box">
        <i class="${escapeHtml(skill.icon)} ${/github-original|express-original|nextjs-plain/.test(skill.icon) ? 'skill-icon-adaptive' : ''}" aria-hidden="true"></i>
        ${skill.badge ? `<span class="skill-badge">${escapeHtml(skill.badge)}</span>` : ''}
      </div>
      <span class="skill-label">${escapeHtml(skill.name)}</span>
    </div>`).join('');
  [...grid.children].forEach((item, index) => {
    item.style.setProperty('--skill-glow', skills[index].background);
    item.style.setProperty('--skill-border', skills[index].border);
  });
}
