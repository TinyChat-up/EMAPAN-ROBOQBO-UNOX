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
