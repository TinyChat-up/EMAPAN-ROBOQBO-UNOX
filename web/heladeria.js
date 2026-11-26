(() => {
  const chapter = document.querySelector('#heladeria');
  const links = [...chapter.querySelectorAll('.gelato-index nav a')];
  const articles = links.map(link => document.querySelector(link.hash));
  let frame = 0;

  // El navegador resuelve los anclajes por sí solo en móvil y con movimiento reducido.
  // En escritorio, delegar el desplazamiento solo en el Lenis de la portada.
  const entrance = document.querySelector('.film-controls a[href="#heladeria"]');
  for (const link of [entrance, ...links]) {
    link.addEventListener('click', event => {
      if (!lenis || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      const target = document.querySelector(link.hash);
      const top = scrollY + target.getBoundingClientRect().top - document.querySelector('header').offsetHeight - 12;
      lenis.scrollTo(scrollY, { immediate: true });
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      target.focus({ preventScroll: true });
      lenis.scrollTo(top, { duration: .65 });
    });
  }

  function updateIndex() {
    frame = 0;
    const readingLine = innerHeight * .45;
    let current = 0;
    articles.forEach((article, index) => {
      if (article.getBoundingClientRect().top <= readingLine) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateIndex);
  }

  const observer = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('in-gelato', entry.isIntersecting);
    if (entry.isIntersecting) {
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate);
      scheduleUpdate();
    } else {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    }
  }, { rootMargin: '-15% 0px -15% 0px' });
  observer.observe(chapter);

  const videos = [...chapter.querySelectorAll('video')];
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) entry.target.pause();
    }
  });
  for (const video of videos) {
    visibility.observe(video);
    video.addEventListener('play', () => {
      for (const other of videos) if (other !== video) other.pause();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) for (const video of videos) video.pause();
  });
})();
