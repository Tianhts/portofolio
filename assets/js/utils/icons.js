export function techIcon(technology) {
  const key = String(technology || '').toLowerCase().replace(/[.\s]/g, '');
  const icons = [
    [/laravel/, 'fa-brands fa-laravel'],
    [/php/, 'fa-brands fa-php'],
    [/mysql|postgres|neon|sql/, 'fa-solid fa-database'],
    [/react/, 'fa-brands fa-react'],
    [/next/, 'fa-solid fa-layer-group'],
    [/node/, 'fa-brands fa-node-js'],
    [/tailwind/, 'fa-solid fa-wand-magic-sparkles'],
    [/bootstrap/, 'fa-brands fa-bootstrap'],
    [/python/, 'fa-brands fa-python'],
    [/fastapi/, 'fa-solid fa-bolt'],
    [/n8n/, 'fa-solid fa-diagram-project'],
    [/rag|cohere|ai/, 'fa-solid fa-brain'],
    [/docker/, 'fa-brands fa-docker'],
    [/typescript/, 'fa-brands fa-js'],
    [/api/, 'fa-solid fa-plug'],
  ];
  return icons.find(([pattern]) => pattern.test(key))?.[1] || 'fa-solid fa-code';
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function renderTag(technology, withIcon = true) {
  const icon = withIcon ? `<i class="${techIcon(technology)} tag-icon" aria-hidden="true"></i>` : '';
  return `<span class="tag">${icon}${escapeHtml(technology)}</span>`;
}
