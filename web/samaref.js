// La navegación usa anclas nativas. Solo se actualiza el capítulo visible.
const chapters = [...document.querySelectorAll('.chapters a')];
const sections = chapters.map(link => document.querySelector(link.hash));
const chapterNav = document.querySelector('.chapters');
let scheduled = false;

function updateChapter() {
  scheduled = false;
  const marker = chapterNav.offsetHeight + window.innerHeight * 0.25;
  let active = 0;
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= marker) active = index;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) {
    active = sections.length - 1;
  }
  chapters.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateChapter);
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updateChapter();

// WhatsApp se abre solo al seguir el enlace y permite editar el mensaje.
const brief = document.querySelector('#brief');
const whatsapp = document.querySelector('#whatsapp');
const destination = new URL(whatsapp.href);
const greeting = destination.searchParams.get('text');

function prepareMessage() {
  const activity = brief.elements.actividad.value;
  const detail = brief.elements.detalle.value.trim();
  const lines = [greeting];
  if (activity) lines.push('Mi actividad: ' + activity + '.');
  if (brief.elements.equipo.value) lines.push('Referencia: ' + brief.elements.equipo.value + '.');
  if (detail) lines.push(detail);
  destination.searchParams.set('text', lines.join('\n'));
  whatsapp.href = destination.href;
}

brief.hidden = false;
brief.addEventListener('input', prepareMessage);
window.addEventListener('pageshow', prepareMessage);

document.querySelectorAll('[data-equipo]').forEach(link => {
  link.addEventListener('click', () => {
    brief.elements.equipo.value = link.dataset.equipo;
    prepareMessage();
  });
});

// Mantén la documentación accesible cuando el servidor de la foto no responda.
for (const photo of document.querySelectorAll('.machine-photo')) {
  function showImageStatus() {
    const stage = photo.closest('figure');
    const failed = !photo.naturalWidth;
    stage.classList.toggle('photo-unavailable', failed);
    stage.querySelector('.photo-fallback').hidden = !failed;
    stage.querySelector('figcaption').textContent = failed
      ? 'Fotografía no disponible'
      : 'Fotografía de referencia';
  }
  photo.addEventListener('load', showImageStatus);
  photo.addEventListener('error', showImageStatus);
  if (photo.complete) showImageStatus();
}

const film = document.querySelector('.vapor');
const filmControl = document.querySelector('#film-control');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let requested = !reduced.matches && !navigator.connection?.saveData;
let visible = false;

function syncPlayback() {
  if (!requested || !visible || document.hidden) {
    film.pause();
    return;
  }
  if (!film.hasAttribute('src')) film.src = film.dataset.film;
  film.play().catch(() => {});
}

function labelControl() {
  filmControl.textContent = film.paused ? 'Reproducir vapor' : 'Pausar vapor';
}
filmControl.hidden = false;
film.addEventListener('play', labelControl);
film.addEventListener('pause', labelControl);
film.addEventListener('error', () => { filmControl.hidden = true; });
filmControl.addEventListener('click', () => {
  requested = film.paused;
  syncPlayback();
});
reduced.addEventListener('change', () => {
  requested = !reduced.matches && !navigator.connection?.saveData;
  syncPlayback();
});
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  syncPlayback();
}).observe(film);
document.addEventListener('visibilitychange', syncPlayback);
