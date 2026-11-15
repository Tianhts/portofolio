export function initSpotify() {
  const panel = document.getElementById('sp-wrap');
  const button = document.getElementById('sp-btn');
  if (!panel || !button) return;
  let expanded = false;
  button.setAttribute('aria-controls', panel.id);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    expanded = !expanded;
    panel.style.display = expanded ? 'block' : 'none';
    button.textContent = expanded ? 'Tutup' : 'Buka';
    button.setAttribute('aria-expanded', String(expanded));
  });
}
