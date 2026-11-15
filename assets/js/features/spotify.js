let initialized = false;

export function initSpotify() {
  if (initialized) return;
  const panel = document.getElementById('sp-wrap');
  const button = document.getElementById('sp-btn');
  const frame = document.getElementById('sp-frame');
  if (!panel || !button || !frame) return;
  initialized = true;
  panel.hidden = true;
  button.setAttribute('aria-controls', panel.id);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    const expanded = panel.hidden;
    panel.hidden = !expanded;
    // Request Spotify only once, after the visitor opens the player.
    // Keeping the same iframe preserves its playback position across toggles.
    if (expanded && !frame.getAttribute('src')) {
      frame.src = frame.dataset.src;
    }
    button.textContent = expanded ? 'Tutup panel' : 'Buka pemutar';
    button.setAttribute('aria-expanded', String(expanded));
  });
}
