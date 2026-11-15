import { aboutProfilePhotos } from '../data/profile.js';

let initialized = false;

function loadPhoto(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Profile photo could not be loaded'));
    image.src = source;
  });
}

export function initAboutProfile() {
  if (initialized) return;
  const button = document.getElementById('about-photo-switch');
  let currentImage = document.getElementById('about-photo-image');
  let nextImage = document.getElementById('about-photo-next');
  const caption = document.getElementById('about-photo-caption');
  const status = document.getElementById('about-photo-status');
  const hint = button?.querySelector('.about-photo-hint');
  if (!button || !currentImage || !nextImage || !caption || !status) return;

  const photos = aboutProfilePhotos.filter((photo, index, all) =>
    photo.src && all.findIndex(item => item.src === photo.src) === index);
  if (!photos.length) return;
  initialized = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let busy = false;
  currentImage.src = photos[0].src;
  currentImage.alt = photos[0].alt || 'Septian Hutasoit';
  button.disabled = photos.length < 2;
  if (hint) hint.hidden = photos.length < 2;

  function syncCaption(announce = false) {
    const position = `Foto ${activeIndex + 1} dari ${photos.length}`;
    button.setAttribute('aria-label', photos.length > 1
      ? `${position}. Tekan untuk mengganti foto profil.`
      : `Foto profil ${currentImage.alt}`);
    if (photos.length > 1) caption.textContent = `Klik foto untuk mengganti · ${activeIndex + 1} / ${photos.length}`;
    if (announce) status.textContent = position;
  }
  syncCaption();

  button.addEventListener('click', async () => {
    if (busy || photos.length < 2) return;
    busy = true;
    button.setAttribute('aria-busy', 'true');
    const targetIndex = (activeIndex + 1) % photos.length;
    const photo = photos[targetIndex];
    const animations = [];
    try {
      const loaded = await loadPhoto(photo.src);
      if (loaded.decode) await loaded.decode().catch(() => {});
      nextImage.src = photo.src;
      nextImage.alt = photo.alt || 'Septian Hutasoit';
      nextImage.hidden = false;
      if (!reducedMotion.matches && typeof nextImage.animate === 'function') {
        const timing = { duration: 190, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'both' };
        animations.push(
          currentImage.animate([
            { opacity: 1, transform: 'perspective(800px) rotateY(0deg)' },
            { opacity: .3, transform: 'perspective(800px) rotateY(-90deg)' },
          ], timing),
          nextImage.animate([
            { opacity: .3, transform: 'perspective(800px) rotateY(90deg)' },
            { opacity: 1, transform: 'perspective(800px) rotateY(0deg)' },
          ], { ...timing, delay: timing.duration }),
        );
        await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
      }
      currentImage.hidden = true;
      currentImage.setAttribute('aria-hidden', 'true');
      nextImage.removeAttribute('aria-hidden');
      [currentImage, nextImage] = [nextImage, currentImage];
      activeIndex = targetIndex;
      syncCaption(true);
    } catch {
      nextImage.hidden = true;
      status.textContent = 'Foto berikutnya belum dapat dimuat. Coba lagi nanti.';
    } finally {
      animations.forEach(animation => animation.cancel());
      busy = false;
      button.removeAttribute('aria-busy');
    }
  });
}
