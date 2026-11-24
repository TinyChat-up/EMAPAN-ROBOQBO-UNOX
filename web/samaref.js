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

document.querySelectorAll('.product-photo').forEach(figure => {
  const button = figure.querySelector('button');
  const photo = figure.querySelector('img');
  const status = figure.querySelector('figcaption');
  button.hidden = false;
  button.addEventListener('click', () => {
    button.hidden = true;
    status.textContent = 'Cargando fotografía…';
    photo.addEventListener('load', () => {
      photo.hidden = false;
      status.textContent = photo.alt;
    }, { once: true });
    photo.addEventListener('error', () => {
      status.textContent = 'La fotografía no está disponible. Puedes consultar la ficha del equipo.';
    }, { once: true });
    photo.referrerPolicy = 'no-referrer';
    photo.src = figure.dataset.src;
  }, { once: true });
});
