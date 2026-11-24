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
  if (detail) lines.push(detail);
  destination.searchParams.set('text', lines.join('\n'));
  whatsapp.href = destination.href;
}

brief.hidden = false;
brief.addEventListener('input', prepareMessage);
window.addEventListener('pageshow', prepareMessage);
