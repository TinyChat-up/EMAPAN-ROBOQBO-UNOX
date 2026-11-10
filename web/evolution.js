/*
 * EMAPAN · capa de evolución (noviembre 2026)
 * ---------------------------------------------------------------------------
 * Añade, sin sustituir la experiencia existente:
 *   1. Selector de necesidades («Encuentra tu Qbo / tu horno»).
 *   2. Contacto contextual: el mensaje de WhatsApp incluye modelo y respuestas.
 *   3. Barra inferior que recuerda la selección del visitante.
 *   4. Cambio de modelo deslizando el dedo sobre la máquina.
 *   5. Entradas suaves de las secciones y del texto de cada modelo.
 *   6. Eventos de analítica (ver analytics.js).
 *
 * Depende de los scripts anteriores de la página: usa `models`, `active`,
 * `lenis` y `reduced` (cinema.js) y escucha el evento `modelchange`.
 *
 * REGLA DE CONTENIDO: el selector solo usa datos que ya están publicados en la
 * web (capacidades de Roboqbo y uso de cada línea UNOX). No añadir cifras,
 * prestaciones ni precios que no procedan de documentación del fabricante.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const brand = document.body.dataset.brand === 'unox' ? 'unox' : 'qbo';
  const track = (name, data) => window.emapanTrack?.(name, { brand, ...data });
  const motionOK = () => !reduced.matches;
  const PHONE = '34615619104';

  /* ------------------------------------------------------------------------
   * 1. Contenido del selector
   * `model` enlaza cada respuesta con una clave de `models` (cinema.js).
   * Las preguntas sin `model` solo dan contexto comercial a EMAPAN.
   * --------------------------------------------------------------------- */
  const FINDER = {
    qbo: {
      kind: 'qbo',
      generic: 'Roboqbo',
      section: '#equipos',
      steps: [
        {
          id: 'negocio',
          label: 'Negocio',
          question: '¿Cómo es tu negocio?',
          note: 'Nos ayuda a preparar la conversación. No cambia la recomendación.',
          options: ['Restaurante u hostelería', 'Pastelería u obrador', 'Heladería', 'Catering o cocina central', 'Industria alimentaria', 'Otro'],
        },
        {
          id: 'volumen',
          label: 'Volumen por elaboración',
          question: '¿Cuánto preparas en cada elaboración?',
          note: '¿Entre dos gamas? Elige la más cercana y lo afinamos contigo.',
          options: [
            { label: 'Hasta 10 litros', model: 'pro' },
            { label: 'De 15 a 70 litros', model: 'top' },
            { label: '120 litros o más', model: 'big' },
            { label: 'No lo tengo claro', model: null },
          ],
        },
      ],
      // models.qbo[key] = [titular corto, titular, descripción, cifra, etiqueta, nombre]
      fact: key => `${models.qbo[key][3]} ${models.qbo[key][4]}`,
      reason: key => `Capacidad publicada por Roboqbo para esta gama: ${models.qbo[key][3]} litros.`,
      disclaimer: 'Orientación a partir de la capacidad publicada por el fabricante. El modelo y la configuración definitivos los confirmamos contigo.',
      adviceTitle: 'Lo vemos contigo.',
      adviceText: 'Estas son las tres gamas y su capacidad. Cuéntanos qué elaboras y te orientamos.',
      primary: 'Pedir prueba gratis',
      intents: {
        demo: 'Me gustaría una prueba gratis y sin compromiso con un chef profesional y la máquina Roboqbo.',
        presupuesto: 'Me interesa Roboqbo y me gustaría recibir un presupuesto.',
        asesoramiento: 'Me interesa Roboqbo y me gustaría que me asesoréis para elegir el equipo adecuado.',
      },
    },
    unox: {
      kind: 'oven',
      generic: 'UNOX',
      section: '#unox',
      steps: [
        {
          id: 'uso',
          label: 'Uso',
          question: '¿Dónde va a trabajar el horno?',
          options: [
            { label: 'Restaurante o cocina profesional', model: 'chef' },
            { label: 'Panadería o pastelería', model: 'baker' },
            { label: 'Servicio rápido o mostrador', model: 'speed' },
            { label: 'No lo tengo claro', model: null },
          ],
        },
        {
          id: 'momento',
          label: 'Momento',
          question: '¿En qué momento estás?',
          note: 'Nos ayuda a preparar la conversación. No cambia la recomendación.',
          options: ['Abro un negocio nuevo', 'Renuevo un horno', 'Amplío producción', 'Solo me estoy informando'],
        },
      ],
      fact: key => models.oven[key][0].split(' · ')[1],
      reason: key => `${models.oven[key][5]} es la línea de UNOX orientada a ${models.oven[key][0].split(' · ')[1].toLowerCase()}.`,
      disclaimer: 'Orientación según el uso al que UNOX destina cada línea. Tamaño, capacidad y configuración los definimos contigo.',
      adviceTitle: 'Lo vemos contigo.',
      adviceText: 'Estas son las tres líneas y el uso al que se destinan. Cuéntanos tu cocina y te orientamos.',
      primary: 'Hablar con EMAPAN',
      intents: {
        asesoramiento: 'Me interesan los hornos UNOX y me gustaría que me asesoréis.',
        presupuesto: 'Me interesan los hornos UNOX y me gustaría recibir un presupuesto.',
      },
    },
  };
  const cfg = FINDER[brand];
  const catalog = models[cfg.kind];
  const modelName = key => catalog[key][5];
  const modelImage = key => $(`[data-model="${cfg.kind}-${key}"]`)?.getAttribute('src') || '';
  const optionOf = option => (typeof option === 'string' ? { label: option } : option);

  /* ------------------------------------------------------------------------
   * 2. Selección del visitante (solo durante la sesión, en su navegador)
   * --------------------------------------------------------------------- */
  const STORE_KEY = 'emapan-seleccion-v1';
  function readSelection() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}')[brand];
      if (saved && (saved.model === null || catalog[saved.model])) return saved;
    } catch { /* almacenamiento no disponible */ }
    return null;
  }
  function writeSelection(selection) {
    try {
      const all = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}');
      if (selection) all[brand] = selection; else delete all[brand];
      sessionStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch { /* la web funciona igual sin guardarlo */ }
    paintDock();
  }

  /* ------------------------------------------------------------------------
   * 3. Diálogos: apertura, cierre, vídeos en pausa y retorno del foco
   * --------------------------------------------------------------------- */
  const contact = $('#demo-dialog');
  const finder = $('#finder-dialog');
  let pausedVideos = null;
  let returnFocus = null;
  let afterClose = null;

  function showDialog(dialog, trigger) {
    if (!pausedVideos) {
      pausedVideos = $$('video').filter(video => !video.paused);
      pausedVideos.forEach(video => video.pause());
      lenis?.stop();
    }
    if (trigger && !trigger.closest('dialog')) returnFocus = trigger;
    if (!dialog.open) dialog.showModal();
  }

  function dialogClosed() {
    if ($('dialog[open]')) return; // se ha pasado de un diálogo a otro
    lenis?.start();
    if (motionOK() && !document.hidden) {
      pausedVideos?.forEach(video => {
        const box = video.getBoundingClientRect();
        if (box.bottom > 0 && box.top < innerHeight) video.play().catch(() => {});
      });
    }
    pausedVideos = null;
    const task = afterClose;
    afterClose = null;
    if (task) task();
    else returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  }

  for (const dialog of [contact, finder]) {
    dialog.setAttribute('data-lenis-prevent', '');
    dialog.addEventListener('close', dialogClosed);
    $('.close', dialog).addEventListener('click', () => dialog.close());
    // Tocar fuera del panel lo cierra.
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      if (outside) dialog.close();
    });
  }

  /* ------------------------------------------------------------------------
   * 4. Selector de necesidades
   * --------------------------------------------------------------------- */
  const finderBody = $('#finder-body');
  const finderBar = $('.finder-progress span', finder);
  let answers = {};
  let chosenModel = null;
  let stepIndex = 0;
  let advancing = false; // evita que un doble toque salte una pregunta

  const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function paintFinder(html, progress) {
    finderBody.innerHTML = html;
    finderBar.style.transform = `scaleX(${progress})`;
    finder.scrollTop = 0;
    if (motionOK()) {
      finderBody.animate(
        [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }],
        { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
    }
    // El lector de pantalla anuncia la nueva pregunta o el resultado.
    $('.finder-question', finderBody)?.focus({ preventScroll: true });
  }

  function showStep(index) {
    stepIndex = index;
    const step = cfg.steps[index];
    const current = answers[step.id];
    const options = step.options.map(optionOf).map((option, n) =>
      `<button type="button" class="finder-option" data-option="${n}" aria-pressed="${option.label === current}">${escapeHtml(option.label)}</button>`).join('');
    paintFinder(
      `<p class="finder-count">Pregunta ${index + 1} de ${cfg.steps.length}</p>
       <h2 class="finder-question" tabindex="-1">${escapeHtml(step.question)}</h2>
       ${step.note ? `<p class="finder-note">${escapeHtml(step.note)}</p>` : ''}
       <div class="finder-options" role="group" aria-label="${escapeHtml(step.question)}">${options}</div>
       ${index > 0 ? '<button type="button" class="finder-link" data-act="back">Volver a la pregunta anterior</button>' : ''}`,
      index / cfg.steps.length,
    );
  }

  function choose(optionIndex, button) {
    if (advancing) return;
    advancing = true;
    const step = cfg.steps[stepIndex];
    const option = optionOf(step.options[optionIndex]);
    answers[step.id] = option.label;
    if ('model' in option) chosenModel = option.model;
    $$('.finder-option', finderBody).forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    track('finder_step', { step: step.id, option: option.label });
    const next = () => {
      advancing = false;
      if (stepIndex + 1 < cfg.steps.length) showStep(stepIndex + 1); else finish();
    };
    // Una pausa mínima deja ver la opción marcada antes de avanzar.
    if (motionOK()) setTimeout(next, 170); else next();
  }

  function finish() {
    writeSelection({ model: chosenModel, answers });
    track('finder_result', { model: chosenModel ? modelName(chosenModel) : 'por definir' });
    showResult();
  }

  function showResult() {
    const foot =
      `<p class="finder-disclaimer">${escapeHtml(cfg.disclaimer)}</p>
       <div class="finder-foot">
         <button type="button" class="finder-link" data-act="restart">Cambiar respuestas</button>
         <a class="finder-link" href="tel:+${PHONE}">Llamar al 615 619 104</a>
       </div>`;

    if (!chosenModel) {
      const range = Object.keys(catalog).map(key =>
        `<button type="button" class="finder-range" data-act="pick" data-model="${key}">
           <span class="finder-thumb"><img src="${modelImage(key)}" alt="" decoding="async"></span>
           <span class="finder-range-text"><b>${escapeHtml(modelName(key))}</b><small>${escapeHtml(cfg.fact(key))}</small></span>
         </button>`).join('');
      paintFinder(
        `<p class="finder-count">Tu punto de partida</p>
         <h2 class="finder-question" tabindex="-1">${escapeHtml(cfg.adviceTitle)}</h2>
         <p class="finder-note">${escapeHtml(cfg.adviceText)}</p>
         <div class="finder-ranges">${range}</div>
         <div class="finder-actions"><button type="button" class="pill" data-act="contact">Que me asesore EMAPAN</button></div>
         ${foot}`,
        1,
      );
      return;
    }

    const name = modelName(chosenModel);
    paintFinder(
      `<p class="finder-count">Tu punto de partida</p>
       <div class="finder-result">
         <span class="finder-thumb"><img src="${modelImage(chosenModel)}" alt="${escapeHtml(name)}" decoding="async"></span>
         <div>
           <h2 class="finder-question" tabindex="-1">${escapeHtml(name)}</h2>
           <p class="finder-fact">${escapeHtml(cfg.fact(chosenModel))}</p>
         </div>
       </div>
       <p class="finder-reason">${escapeHtml(cfg.reason(chosenModel))}</p>
       <div class="finder-actions">
         <button type="button" class="pill" data-act="contact">${escapeHtml(cfg.primary)}</button>
         <button type="button" class="pill outline" data-act="view">Ver ${escapeHtml(name)}</button>
       </div>
       ${foot}`,
      1,
    );
  }

  function openFinder(source, trigger) {
    const saved = readSelection();
    answers = saved ? { ...saved.answers } : {};
    chosenModel = saved ? saved.model : null;
    if (contact.open) contact.close();
    showDialog(finder, trigger);
    if (saved) showResult(); else showStep(0);
    track('finder_open', { source });
  }

  // Lleva al visitante al modelo dentro del recorrido de la gama.
  function viewModel(key) {
    const tab = $(`[data-${cfg.kind}="${key}"]`);
    const section = $(cfg.section);
    if (!tab || !section) return;
    const pinned = section.offsetHeight - $('.product-stage', section).offsetHeight > 100;
    if (!motionOK() || !pinned) section.scrollIntoView({ behavior: 'instant', block: 'start' });
    tab.click();
  }

  finderBody.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.option) return choose(Number(target.dataset.option), target);
    switch (target.dataset.act) {
      case 'back':
        showStep(stepIndex - 1);
        break;
      case 'restart':
        answers = {};
        chosenModel = null;
        showStep(0);
        track('finder_restart');
        break;
      case 'pick':
        chosenModel = target.dataset.model;
        writeSelection({ model: chosenModel, answers });
        track('finder_result', { model: modelName(chosenModel), via: 'gama' });
        showResult();
        break;
      case 'view': {
        const key = chosenModel;
        afterClose = () => viewModel(key);
        track('finder_view_model', { model: modelName(key) });
        finder.close();
        break;
      }
      case 'contact':
        openContact(cfg.generic, null, 'selector');
        finder.close();
        break;
    }
  });

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-finder]');
    if (opener) openFinder(opener.dataset.finder, opener);
  });

  // Brasa también abre el selector: deja de ser solo decorativa.
  $('.brasa-button')?.addEventListener('click', event => openFinder('brasa', event.currentTarget));

  /* ------------------------------------------------------------------------
   * 5. Contacto contextual (WhatsApp con el mensaje preparado)
   * --------------------------------------------------------------------- */
  const form = $('#contact-form');
  const interest = $('#interest');
  const nameField = $('#contact-name');
  const ideaField = $('#contact-idea');
  const send = $('#send-message');
  const contextList = $('#contact-context');
  let context = { equipment: cfg.generic, answers: {}, source: 'pagina' };

  function compose() {
    const who = nameField.value.trim();
    const idea = ideaField.value.trim();
    const intent = form.elements.intent.value;
    const parts = [who ? `Hola, soy ${who}.` : 'Hola.', cfg.intents[intent], `Equipo: ${context.equipment}.`];
    for (const step of cfg.steps) {
      const answer = context.answers[step.id];
      if (answer) parts.push(`${step.label}: ${answer}.`);
    }
    if (idea) parts.push(`Mi receta o idea: ${idea}`);
    send.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(parts.join(' '))}`;
  }

  function paintContext() {
    const undecided = context.equipment === cfg.generic;
    const rows = [
      `<div><dt>Equipo</dt><dd>${escapeHtml(undecided ? `${cfg.generic} · modelo por definir` : context.equipment)}
         <button type="button" class="context-change" data-finder="contacto">${undecided ? 'Ayúdame a elegir' : 'Cambiar'}</button></dd></div>`,
    ];
    for (const step of cfg.steps) {
      const answer = context.answers[step.id];
      if (answer) rows.push(`<div><dt>${escapeHtml(step.label)}</dt><dd>${escapeHtml(answer)}</dd></div>`);
    }
    contextList.innerHTML = rows.join('');
  }

  function openContact(equipment, trigger, source) {
    form.reset();
    const saved = readSelection();
    const savedName = saved?.model ? modelName(saved.model) : null;
    const generic = equipment === cfg.generic;
    // Un botón genérico («Mensaje») hereda la selección; uno de modelo concreto manda.
    const chosen = generic && savedName ? savedName : equipment;
    const related = saved && (generic || savedName === equipment);
    context = { equipment: chosen, answers: related ? { ...saved.answers } : {}, source };
    interest.value = chosen;
    paintContext();
    compose();
    showDialog(contact, trigger);
    track('contact_open', { source, equipment: chosen });
  }

  const sourceOf = element =>
    element.closest('.contact-dock') ? 'barra'
    : element.closest('.product-stage') ? 'gama'
    : element.closest('.contact-finale') ? 'final'
    : element.closest('dialog') ? 'dialogo'
    : element.closest('header') ? 'cabecera'
    : element.closest('footer') ? 'pie'
    : 'pagina';

  $$('[data-demo]').forEach(button => {
    button.addEventListener('click', () => openContact(button.dataset.demo, button, sourceOf(button)));
  });
  form.addEventListener('input', compose);
  form.addEventListener('submit', event => { event.preventDefault(); send.click(); });
  send.addEventListener('click', () => {
    track('contact_whatsapp', { equipment: context.equipment, intent: form.elements.intent.value, source: context.source });
  });

  /* ------------------------------------------------------------------------
   * 6. Barra inferior: recuerda la selección
   * --------------------------------------------------------------------- */
  const dockTitle = $('#dock-title');
  const dockSub = $('#dock-sub');
  const dockDefaults = { title: dockTitle.textContent, sub: dockSub.textContent };
  function paintDock() {
    const saved = readSelection();
    dockTitle.textContent = saved?.model ? modelName(saved.model) : dockDefaults.title;
    dockSub.textContent = saved?.model ? 'Tu selección · cambiar' : dockDefaults.sub;
  }
  paintDock();

  /* ------------------------------------------------------------------------
   * 7. Modelos: deslizar sobre la máquina y transición del texto
   * --------------------------------------------------------------------- */
  const keys = Object.keys(catalog);
  $$('.product-visual').forEach(visual => {
    let start = null;
    visual.addEventListener('pointerdown', event => {
      start = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY, time: performance.now() };
    }, { passive: true });
    visual.addEventListener('pointercancel', () => { start = null; });
    visual.addEventListener('pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const quick = performance.now() - start.time < 800;
      start = null;
      if (!quick || Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      const next = keys[keys.indexOf(active[cfg.kind]) + (dx < 0 ? 1 : -1)];
      if (!next) return;
      $(`[data-${cfg.kind}="${next}"]`)?.click();
      track('model_select', { model: modelName(next), via: 'deslizar' });
    });
  });

  const seenModels = new Set();
  let dwellTimer = 0;
  const stageVisible = () => {
    const box = $('.product-stage')?.getBoundingClientRect();
    return !!box && box.top < innerHeight * 0.6 && box.bottom > innerHeight * 0.4;
  };
  function noteModelView(name) {
    clearTimeout(dwellTimer);
    if (seenModels.has(name)) return;
    // Solo cuenta si el visitante se detiene en el modelo.
    dwellTimer = setTimeout(() => {
      if (!stageVisible() || seenModels.has(name)) return;
      seenModels.add(name);
      track('model_view', { model: name });
    }, 1500);
  }
  document.addEventListener('modelchange', event => {
    if (event.detail.kind !== cfg.kind) return;
    if (motionOK()) {
      $$('.product-copy .model-kicker, .product-copy h2, .product-copy > p, .product-copy .product-fact').forEach((element, index) => {
        element.animate(
          [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }],
          { duration: 460, delay: index * 45, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
        );
      });
    }
    noteModelView(event.detail.name);
  });

  /* ------------------------------------------------------------------------
   * 8. Entrada suave de las secciones (una vez, sin bloquear el contenido)
   * --------------------------------------------------------------------- */
  if ('IntersectionObserver' in window && motionOK()) {
    const targets = $$([
      '.editorial-copy', '.editorial-film .inline-film',
      '.workflow-film .wide-heading', '.workflow-film .inline-film',
      '.unox-craft .wide-heading', '.craft-grid article',
      '.gallery-heading', '.gallery-rail',
      '.finale-speech', '.experience-unox .contact-finale > *',
    ].join(','));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    for (const target of targets) {
      // Lo que ya está en pantalla al cargar no se anima.
      if (target.getBoundingClientRect().top < innerHeight) continue;
      target.setAttribute('data-reveal', '');
      observer.observe(target);
    }
  }

  /* ------------------------------------------------------------------------
   * 9. Carteles de los vídeos de sección: versión ligera en móvil
   * --------------------------------------------------------------------- */
  const smallScreen = matchMedia('(max-width: 760px)').matches || !!navigator.connection?.saveData;
  $$('video[data-poster]').forEach(video => {
    video.poster = (smallScreen && video.dataset.posterMobile) || video.dataset.poster;
  });

  /* ------------------------------------------------------------------------
   * 10. Analítica de interacciones (categorías, nunca texto del visitante)
   * --------------------------------------------------------------------- */
  document.addEventListener('click', event => {
    if (!event.isTrusted) return; // ignora los clics que simula la mascota
    const target = event.target.closest('a,button');
    if (!target) return;
    if (target.matches('a[href^="tel:"]')) track('contact_call', { source: sourceOf(target) });
    else if (target.matches('.media-toggle,#play-film,#replay-unox')) track('video_play', { video: target.dataset.video || target.id });
    else if (target.matches('[data-recipe]')) track('recipe_select', { recipe: target.dataset.recipe });
    else if (target.matches('[data-metric]')) track('recipe_metric', { metric: target.dataset.metric });
    else if (target.matches('.model-tabs button')) track('model_select', { model: target.textContent.replace(/^\d+/, '').trim(), via: 'pestaña' });
    else if (target.matches('.gallery-arrow')) track('gallery_browse', {});
    else if (target.matches('.brand-switch a:not([aria-current])')) track('brand_switch', { to: target.textContent.trim() });
  }, true);

  const depthMarks = [25, 50, 75, 100];
  let depthFrame = 0;
  addEventListener('scroll', () => {
    if (depthFrame || !depthMarks.length) return;
    depthFrame = requestAnimationFrame(() => {
      depthFrame = 0;
      const total = document.documentElement.scrollHeight - innerHeight;
      const percent = total > 0 ? (scrollY / total) * 100 : 0;
      while (depthMarks.length && percent >= depthMarks[0] - 1) track('scroll_depth', { percent: depthMarks.shift() });
    });
  }, { passive: true });
})();
