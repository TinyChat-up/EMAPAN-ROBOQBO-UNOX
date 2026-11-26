(() => {
  const section = document.querySelector('.qbo-uses');
  const videos = [...section.querySelectorAll('video')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = null;
  let frame = 0;

  // Una sola demostración sigue la lectura. Los controles nativos permiten
  // detenerla y mantienen esa decisión mientras se siga viendo el mismo uso.
  function update() {
    frame = 0;
    const line = innerHeight * .5;
    let next = null;
    let nearest = Infinity;
    for (const video of videos) {
      const rect = video.getBoundingClientRect();
      const visible = Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top);
      const distance = Math.abs(rect.top + rect.height / 2 - line);
      if (visible >= rect.height * .55 && distance < nearest) {
        next = video;
        nearest = distance;
      }
    }
    if (next === current) return;
    current?.pause();
    current = next;
    if (current && !motion.matches && !navigator.connection?.saveData &&
        !document.hidden && !document.querySelector('dialog[open]')) {
      current.play().catch(() => {});
    }
  }

  function queueUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  for (const video of videos) {
    video.addEventListener('play', () => {
      for (const other of videos) if (other !== video) other.pause();
      current = video;
    });
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      addEventListener('scroll', queueUpdate, { passive: true });
      addEventListener('resize', queueUpdate);
      queueUpdate();
    } else {
      removeEventListener('scroll', queueUpdate);
      removeEventListener('resize', queueUpdate);
      current?.pause();
      current = null;
    }
  });
  observer.observe(section);
  motion.addEventListener('change', () => {
    if (motion.matches) current?.pause();
    else { current = null; queueUpdate(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) current?.pause();
  });
})();
