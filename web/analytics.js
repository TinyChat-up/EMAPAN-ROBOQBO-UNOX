/*
 * EMAPAN · analítica básica y respetuosa
 * ---------------------------------------------------------------------------
 * Qué hace
 *   - Cuenta visitas con Vercel Web Analytics (sin cookies ni identificadores
 *     persistentes) y envía unos pocos eventos de interacción.
 *   - Expone window.emapanTrack(nombre, datos) para el resto de la web.
 *
 * Qué NO hace
 *   - No usa cookies, localStorage ni huella digital.
 *   - No envía nombres, teléfonos ni el texto que escribe el visitante:
 *     solo categorías cerradas (marca, modelo, opción elegida, origen).
 *   - No envía nada si el navegador pide no ser rastreado (Do Not Track o
 *     Global Privacy Control), ni en local.
 *
 * Puesta en marcha (una sola vez, sin tocar código)
 *   Vercel → proyecto → Analytics → Enable Web Analytics.
 *   Las visitas se cuentan en cualquier plan; el panel de eventos
 *   personalizados depende del plan contratado. Hasta que se active, el
 *   script de Vercel responde 404 y la web funciona igual.
 *
 * Comprobar qué se envía
 *   Añade ?analytics=debug a la URL y abre la consola del navegador.
 */
(() => {
  'use strict';

  const optedOut =
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.globalPrivacyControl === true;
  const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.host) || location.protocol === 'file:';
  const debug = /[?&]analytics=debug\b/.test(location.search);
  const enabled = !optedOut && !local;

  // Cola estándar de Vercel Web Analytics para sitios HTML sin empaquetador.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

  // Solo valores simples y cortos: nunca texto libre del visitante.
  function clean(data) {
    const out = {};
    for (const [key, value] of Object.entries(data || {}).slice(0, 6)) {
      if (typeof value === 'number' || typeof value === 'boolean') out[key] = value;
      else if (typeof value === 'string' && value) out[key] = value.slice(0, 48);
    }
    return out;
  }

  // Los últimos eventos quedan en memoria (no se guardan) para depurar y probar.
  const recent = [];

  window.emapanTrack = (name, data) => {
    const event = { name: String(name).slice(0, 40), data: clean(data) };
    recent.push(event);
    if (recent.length > 60) recent.shift();
    if (debug) console.info('[analítica]', event.name, event.data, enabled ? '' : '(no enviado)');
    if (!enabled) return;
    try {
      window.va('event', event);
      // Compatibilidad opcional si algún día se cambia de herramienta.
      window.plausible?.(event.name, { props: event.data });
      window.umami?.track?.(event.name, event.data);
    } catch { /* la analítica nunca debe romper la web */ }
  };
  window.emapanTrack.recent = recent;
  window.emapanTrack.enabled = enabled;

  if (enabled) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
  }
})();
