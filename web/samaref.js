// La navegación usa anclas nativas. Solo se actualiza el capítulo visible.
const chapters = [...document.querySelectorAll('.chapters a')];
const sections = chapters.map(link => document.querySelector(link.hash));
const chapterNav = document.querySelector('.chapters');
const models = [...document.querySelectorAll('.machines .machine')];
const modelLinks = [...document.querySelectorAll('.model-nav a')];
const modelStage = document.querySelector('.model-stage');
const modelNav = document.querySelector('.model-nav');
let selectedModel = -1;
let lastPosition = -1;
let selectedChapter = -1;
let scheduled = false;

// Los artículos mantienen el contenido y sus enlaces en el flujo de lectura.
for (const model of models) {
  const image = model.querySelector('figure img').cloneNode();
  image.alt = '';
  modelStage.append(image);
}
document.querySelector('.showroom').classList.add('with-stage');
modelNav.style.setProperty('--model-count', models.length);

function updateModel() {
  const margin = parseFloat(getComputedStyle(models[0]).scrollMarginTop) || 0;
  const available = Math.max(1, window.innerHeight - margin);
  const marker = margin + available * 0.45;
  const blendDistance = Math.max(60, Math.min(220, available * 0.32));
  let position = 0;
  for (const model of models.slice(1)) {
    const top = model.getBoundingClientRect().top;
    const t = Math.max(0, Math.min(1, 0.5 + (marker - top) / blendDistance));
    position += t * t * (3 - 2 * t);
  }
  if (position === lastPosition) return;
  lastPosition = position;
  modelNav.style.setProperty('--indicator-x', (position * 100).toFixed(2) + '%');
  Array.from(modelStage.children).forEach((image, index) => {
    const offset = Math.max(-1, Math.min(1, index - position));
    image.style.opacity = 1 - Math.abs(offset);
    image.style.transform = 'translateY(' + (offset * 12).toFixed(2) + 'px)';
  });
  const active = Math.round(position);
  if (active === selectedModel) return;
  selectedModel = active;
  modelLinks.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function updateChapter() {
  scheduled = false;
  updateModel();
  const marker = chapterNav.offsetHeight + window.innerHeight * 0.25;
  let active = 0;
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= marker) active = index;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) {
    active = sections.length - 1;
  }
  if (active === selectedChapter) return;
  selectedChapter = active;
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
const showroom = document.querySelector('.showroom');
function measureNavigation() {
  showroom.style.setProperty('--chapter-height', chapterNav.offsetHeight + 'px');
  showroom.style.setProperty('--model-nav-height', modelNav.offsetHeight + 'px');
  scheduleUpdate();
}
const geometry = new ResizeObserver(measureNavigation);
geometry.observe(chapterNav);
geometry.observe(modelNav);
geometry.observe(document.querySelector('.machines'));
measureNavigation();
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

// La portada es suficiente para movimiento reducido y ahorro de datos.
const film = document.getElementById('film');
const playback = document.getElementById('playback');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let wantsPlayback = !motion.matches && !navigator.connection?.saveData;
let inView = false;

function updateFilm() {
  if (!wantsPlayback || !inView || document.hidden) {
    film.pause();
    return;
  }
  if (!film.hasAttribute('src')) film.src = film.dataset.film;
  film.play().catch(() => {});
}

playback.hidden = false;
playback.addEventListener('click', () => {
  wantsPlayback = film.paused;
  updateFilm();
});
film.addEventListener('play', () => { playback.textContent = 'Pausar vídeo'; });
film.addEventListener('pause', () => { playback.textContent = 'Reproducir vídeo'; });
film.addEventListener('error', () => { playback.hidden = true; });
motion.addEventListener('change', () => {
  wantsPlayback = !motion.matches && !navigator.connection?.saveData;
  updateFilm();
});
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  updateFilm();
}).observe(film);
document.addEventListener('visibilitychange', updateFilm);
