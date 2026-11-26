(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [...document.querySelectorAll('.qbo-use video')].map(video => {
    const button = video.parentElement.querySelector('.use-playback');
    const sector = video.closest('article').id === 'hosteleria' ? 'hostelería' : 'heladería';
    let visible = false;
    let enabled = !motion.matches;

    function updateControl() {
      button.classList.toggle('is-playing', !video.paused);
      button.setAttribute('aria-label', (video.paused ? 'Reproducir' : 'Pausar') + ' el vídeo de ' + sector);
    }

    function sync() {
      if (!visible || !enabled || document.hidden || document.querySelector('dialog[open]')) {
        video.pause();
      } else if (video.paused) {
        video.play().catch(updateControl);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      sync();
    });
    observer.observe(video);
    button.addEventListener('click', () => {
      enabled = video.paused;
      sync();
    });
    video.addEventListener('play', updateControl);
    video.addEventListener('pause', updateControl);
    motion.addEventListener('change', () => { enabled = !motion.matches; sync(); });
    video.controls = false;
    button.hidden = false;
    return sync;
  });

  const refresh = () => clips.forEach(sync => sync());
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
  // Brasa y el selector pueden abrirse justo cuando un vídeo entra en pantalla.
  const dialogs = new MutationObserver(refresh);
  document.querySelectorAll('dialog').forEach(dialog => {
    dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
})();
