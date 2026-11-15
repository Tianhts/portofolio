export function initTheme() {
  const root = document.documentElement;
  const sync = () => {
    const light = root.classList.contains('light');
    for (const id of ['th-icon', 'bth-icon']) {
      const icon = document.getElementById(id);
      if (icon) icon.className = `fas ${light ? 'fa-moon' : 'fa-sun'}`;
    }
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(button => {
      button.setAttribute('aria-label', light ? 'Aktifkan tema gelap' : 'Aktifkan tema terang');
    });
  };
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-action="toggle-theme"]')) return;
    root.classList.toggle('light');
    sync();
  });
  sync();
}
