let initialized = false;

export function initParticles() {
  if (initialized) return;
  const canvas = document.getElementById('hero-cv');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  initialized = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let inView = true;
  const points = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    points.forEach(point => {
      point.x = Math.min(point.x, canvas.width);
      point.y = Math.min(point.y, canvas.height);
    });
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
      if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
      context.fillStyle = 'rgba(34,197,94,.25)';
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    });

    for (let a = 0; a < points.length; a++) {
      for (let b = a + 1; b < points.length; b++) {
        const distance = Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
        if (distance >= 80) continue;
        context.strokeStyle = `rgba(34,197,94,${.13 * (1 - distance / 80)})`;
        context.lineWidth = .25;
        context.beginPath();
        context.moveTo(points[a].x, points[a].y);
        context.lineTo(points[b].x, points[b].y);
        context.stroke();
      }
    }
    frame = requestAnimationFrame(draw);
  }

  function updatePlayback() {
    if (reducedMotion.matches || document.hidden || !inView) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reducedMotion.matches) context.clearRect(0, 0, canvas.width, canvas.height);
    } else if (!frame) {
      draw();
    }
  }

  resize();
  for (let index = 0; index < 120; index++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      radius: Math.random() * 1.3 + .4
    });
  }
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updatePlayback();
    });
    observer.observe(canvas);
  }
  updatePlayback();
}
