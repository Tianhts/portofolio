import { skillRows } from '../data/skills.js';
import { escapeHtml } from '../utils/icons.js';

export function renderSkills() {
  const directions = ['sl', 'sr', 'sl'];
  skillRows.forEach((skills, rowIndex) => {
    const track = document.getElementById(`sr${rowIndex + 1}`);
    if (!track) return;
    track.className = `s-track ${directions[rowIndex]}`;
    // Three copies retain the existing continuous marquee.
    track.innerHTML = [0, 1, 2].map(copy => skills.map(skill => `
      <div class="sbox" data-action="like" ${copy ? 'aria-hidden="true"' : ''}>
        <i class="${escapeHtml(skill.icon)} ${/github-original|express-original|nextjs-plain/.test(skill.icon) ? 'skill-icon-adaptive' : ''}" aria-hidden="true"></i>
        <span>${escapeHtml(skill.name)}</span>
      </div>`).join('')).join('');
    [...track.children].forEach((box, index) => {
      const skill = skills[index % skills.length];
      box.style.setProperty('--sb-color', skill.background);
      box.style.setProperty('--sb-border', skill.border);
    });
  });
}
