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
  if (!button || !currentImage || !nextImage || !caption || !status) return;

  const photos = aboutProfilePhotos.filter((photo, index, all) =>
    photo.src && all.findIndex(item => item.src === photo.src) === index);
  if (!photos.length) return;
  initialized = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const photoCache = new Map();
  let activeIndex = 0;
  let busy = false;
  currentImage.src = photos[0].src;
  currentImage.alt = photos[0].alt || 'Septian Hutasoit';
  button.disabled = photos.length < 2;

  function preparedPhoto(source) {
    if (!photoCache.has(source)) {
      const request = loadPhoto(source).then(async image => {
        if (image.decode) await image.decode().catch(() => {});
        return image;
      });
      photoCache.set(source, request);
      request.catch(() => photoCache.delete(source));
    }
    return photoCache.get(source);
  }

  function prepareNextPhoto() {
    if (photos.length > 1) preparedPhoto(photos[(activeIndex + 1) % photos.length].src).catch(() => {});
  }

  // Warm the next image only when About opens, keeping Home lightweight.
  document.addEventListener('portfolio:route', event => {
    if (event.detail.page === 'about') prepareNextPhoto();
  });

  function syncCaption(announce = false) {
    const position = `Foto ${activeIndex + 1} dari ${photos.length}`;
    button.setAttribute('aria-label', photos.length > 1
      ? `${position}. Tekan untuk mengganti foto profil.`
      : `Foto profil ${currentImage.alt}`);
    caption.textContent = photos.length > 1 ? `${activeIndex + 1} / ${photos.length}` : currentImage.alt;
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
      await preparedPhoto(photo.src);
      nextImage.src = photo.src;
      nextImage.alt = photo.alt || 'Septian Hutasoit';
      currentImage.style.zIndex = '1';
      nextImage.style.zIndex = '2';
      nextImage.hidden = false;
      if (!reducedMotion.matches && typeof nextImage.animate === 'function') {
        // Keep the previous photo opaque below the new one to avoid a dark flash.
        animations.push(nextImage.animate([
          { opacity: 0, transform: 'scale(1.035)', filter: 'blur(2px)' },
          { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
        ], { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' }));
        await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
      }
      currentImage.hidden = true;
      currentImage.setAttribute('aria-hidden', 'true');
      nextImage.removeAttribute('aria-hidden');
      [currentImage, nextImage] = [nextImage, currentImage];
      activeIndex = targetIndex;
      syncCaption(true);
      prepareNextPhoto();
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
