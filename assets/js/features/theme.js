export function initTheme() {
  const root = document.documentElement;
  const sync = () => {
    const light = root.classList.contains('light');
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(button => {
      button.setAttribute('aria-label', light ? 'Aktifkan tema gelap' : 'Aktifkan tema terang');
      const label = button.querySelector('.bn-label');
      if (label) label.textContent = light ? 'Dark theme' : 'Light theme';
    });
  };
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-action="toggle-theme"]')) return;
    root.classList.toggle('light');
    sync();
  });
  sync();
}
