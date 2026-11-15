let initialized = false;

export function initTypewriter() {
  if (initialized) return;
  const element = document.getElementById('role-txt');
  if (!element) return;
  initialized = true;

  const roles = ['Software Engineer', 'Fullstack Developer', 'AI/ML Enthusiast', 'Backend Developer'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let roleIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  let timer = 0;

  function type() {
    const role = roles[roleIndex];
    characterIndex += deleting ? -1 : 1;
    element.textContent = role.substring(0, characterIndex);
    let speed = deleting ? 40 : 75;
    if (!deleting && characterIndex === role.length) {
      speed = 2200;
      deleting = true;
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 400;
    }
    timer = window.setTimeout(type, speed);
  }

  function updatePlayback() {
    window.clearTimeout(timer);
    if (reducedMotion.matches) {
      element.textContent = roles[0];
      roleIndex = 0;
      characterIndex = 0;
      deleting = false;
    } else if (!document.hidden) {
      timer = window.setTimeout(type, 700);
    }
  }

  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  updatePlayback();
}
