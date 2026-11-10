# Evolución de la experiencia Roboqbo y UNOX · noviembre 2026

Rama de trabajo: `claude/lucid-ride-79hvrl`. La versión publicada (`main`) no se ha tocado.

Este documento recoge el diagnóstico, el plan priorizado, lo que ya está hecho en la rama, cómo revisarlo y las mediciones antes/después.

---

## 1. Diagnóstico

Método: lectura completa del código, navegación automatizada (Chromium) en 360, 390, 430, 768, 1024 y 1440 px, medición de peso y tiempos con red 4G simulada (4 Mb/s, 150 ms) y CPU ×4 más lenta, y auditoría de accesibilidad con axe-core.

La base es buena: identidad clara, dos mundos visuales bien diferenciados, respeto de «movimiento reducido», sin errores de consola y sin desbordamiento horizontal. Lo que sigue son los puntos donde había margen real.

### Problemas comprobados

| # | Qué | Evidencia |
|---|-----|-----------|
| 1 | **El vídeo de entrada de Roboqbo pesaba 12,6 MB** y se precargaba entero también en móvil. | 15,2 MB transferidos en los 3 primeros segundos en un móvil. Con 4G el vídeo tardaba 4,7 s en empezar y no llegaba a poder reproducirse sin cortes en 12 s. |
| 2 | **Imágenes mucho mayores de lo que se muestra.** | Galería de 3200 px y hasta 1,4 MB por foto para tarjetas de ~300 px en móvil; recorte de Qbo.BIG de 1,2 MB; fondo del pie de 729 KB que se ve al 6 % de opacidad. |
| 3 | **Sin medición.** No había ninguna analítica. | No era posible saber cuántas visitas llegan al contacto ni qué modelo interesa. |
| 4 | **El contacto no llevaba contexto.** | El mensaje de WhatsApp solo incluía el equipo. EMAPAN recibía la consulta sin tipo de negocio, volumen ni intención. |
| 5 | **No había forma de orientarse entre modelos.** | Para saber qué gama encaja había que recorrer la página entera; el único dato comparativo era la capacidad, repartida en tres pantallas. |
| 6 | **Recorrido móvil largo en los tramos fijados.** | La gama ocupaba 3,4 pantallas de scroll en Roboqbo y 4,2 en UNOX para enseñar tres modelos. |
| 7 | **Áreas táctiles pequeñas.** | 95 apariciones de enlaces o botones por debajo de 40 px en el recorrido (pie de página de 56×11 px, «Descubrir» de 51×14 px, fuentes y créditos…). |
| 8 | **Contraste insuficiente en 21 textos pequeños.** | Entre 2,8:1 y 4,4:1 (mínimo recomendado 4,5:1): notas de la comparativa de tiempos, contador de galería, números de pestaña. |
| 9 | **Brasa no hacía nada al tocarla.** | El botón de la mascota y su bocadillo existen en el HTML, pero no tenían ninguna acción asociada. |
| 10 | **Solape en UNOX con el móvil apaisado.** | Las pestañas de modelo quedaban encima del botón «Verlo en mi cocina». |
| 11 | **Mantenibilidad.** | 9 hojas de estilo en cascada, minificadas en pocas líneas, de las que solo se usa el 40–49 %; 5 scripts que comparten variables globales; marcado oculto que ya no se muestra (capítulos del vídeo, contadores). 20 MB de recursos en `web/assets` que ninguna página usa. |

### Comprobado, pero es una decisión vuestra

- **Los vídeos no se pueden pausar** (lo indica el README como decisión de diseño). Las pautas de accesibilidad WCAG 2.2.2 piden un mecanismo de pausa para movimiento automático de más de 5 s. La web sí respeta «movimiento reducido». No lo he cambiado.
- **La mascota mueve la página sola** unos 112 px tras 4,2 s de inactividad. Está documentado y se interrumpe al primer gesto; hay usuarios a los que les incomoda que la página se mueva sin tocarla. No lo he cambiado.
- **Título y descripción de la portada** hablan del SAT y no de Roboqbo. Fue un cambio reciente y deliberado; solo lo señalo por su efecto en buscadores.

### No son problemas

- La fluidez del scroll es correcta: ~4,5 ms de script por fotograma con CPU ×4 más lenta. La mascota recalcula obstáculos en cada fotograma, pero no llega a causar tirones.
- Estabilidad visual (CLS) excelente antes y después.

---

## 2. Plan priorizado

Impacto comercial / esfuerzo / riesgo, de mayor a menor prioridad.

| Prioridad | Mejora | Impacto | Esfuerzo | Riesgo | Estado |
|---|---|---|---|---|---|
| 1 | Vídeos e imágenes ligeros, con variante móvil | Alto (la web aparece antes; menos abandonos en móvil) | Bajo | Bajo | **Hecho** |
| 2 | Selector de necesidades en 2 preguntas | Alto (camino corto hasta el contacto) | Medio | Bajo | **Hecho** |
| 3 | Contacto contextual (modelo, negocio, volumen, intención) | Alto (consultas mejor cualificadas) | Bajo | Bajo | **Hecho** |
| 4 | Analítica básica sin cookies | Alto (permite decidir con datos) | Bajo | Bajo | **Hecho**; falta activarla en Vercel |
| 5 | Recorrido móvil más corto + cambio de modelo deslizando | Medio | Bajo | Bajo | **Hecho** |
| 6 | Áreas táctiles, contraste y solape apaisado | Medio | Bajo | Bajo | **Hecho** |
| 7 | Animaciones de entrada y de cambio de modelo | Medio-bajo | Bajo | Bajo | **Hecho** |
| 8 | Brasa como anfitriona del selector | Medio-bajo | Bajo | Bajo | **Hecho** |
| 9 | Ficha técnica por modelo y comparador de gama | Alto | Medio | Medio: necesita datos del fabricante | Pendiente de documentación |
| 10 | Unificar las 9 hojas de estilo y limpiar marcado y recursos sin uso | Bajo para el visitante, alto para mantener | Alto | Medio-alto (regresiones visuales) | Pendiente; conviene hacerlo aparte |
| 11 | Canal alternativo a WhatsApp (correo o formulario) | Medio | Medio | Bajo | Pendiente: necesita una dirección o servicio de destino |

---

## 3. Qué hay en la rama

### Selector de necesidades
- Se abre desde la primera pantalla («Encuentra tu Qbo» / «Encuentra tu horno»), desde la cabecera de la gama («¿Cuál encaja contigo?»), desde la barra inferior, desde el cierre y tocando a Brasa.
- **Roboqbo:** tipo de negocio (solo da contexto) y volumen por elaboración → Qbo.PRO, Qbo.TOP o Qbo.BIG.
- **UNOX:** dónde va a trabajar el horno → CHEFTOP-X, BAKERTOP-X o SPEED.Compact, y momento de compra (solo da contexto).
- «No lo tengo claro» enseña las tres opciones con su dato y ofrece asesoramiento.
- En móvil sube desde abajo; en escritorio es un panel centrado. Recuerda la respuesta durante la sesión.

**De dónde salen las recomendaciones.** Solo de datos que ya estaban publicados en la web: capacidades de Roboqbo (5/10, 15–70 y 120–860 litros) y el uso al que UNOX destina cada línea (restauración, panadería y pastelería, servicio rápido). No se ha añadido ninguna cifra, prestación ni precio. El resultado lo dice expresamente y remite a EMAPAN para confirmar modelo y configuración.

> No pude consultar roboqbo.com ni unox.com desde el entorno de trabajo (dominios fuera de la red permitida), así que no he ampliado la información técnica. Por eso la ficha por modelo queda pendiente (punto 9 del plan).

### Contacto contextual
- El diálogo muestra equipo, negocio y volumen/uso, con «Cambiar» para volver al selector.
- Nuevo «¿Qué necesitas?»: prueba gratis, presupuesto o asesoramiento (Roboqbo); asesoramiento o presupuesto (UNOX).
- El mensaje de WhatsApp sale con todo ello. Ejemplo real de las pruebas:
  *«Hola, soy Ana. Me gustaría una prueba gratis y sin compromiso con un chef profesional y la máquina Roboqbo. Equipo: Qbo.TOP. Negocio: Pastelería u obrador. Volumen por elaboración: De 15 a 70 litros. Mi receta o idea: …»*
- La barra inferior recuerda el modelo elegido.

### Recorrido móvil
- Tramos fijados más cortos: 340 → 250 svh (Roboqbo) y 420 → 320 svh (UNOX).
- Se cambia de modelo deslizando el dedo sobre la máquina, además de con las pestañas y el scroll.
- El texto del modelo entra con una transición breve; las secciones aparecen suavemente una sola vez. Todo se desactiva con «movimiento reducido».

### Medios
- `web/assets/opt/` contiene las variantes ligeras. **Los originales siguen intactos** en `web/assets/`.
- `tools/optimize-media.sh` las regenera (ffmpeg). Solo recomprime y reduce tamaño: sin reescalado hacia arriba ni IA.
- Vídeo de entrada: 12,6 MB → 5,0 MB (1080p, SSIM 0,990) y 2,7 MB (720p para móvil, SSIM 0,974).
- Vídeos de sección con variante de 960 px para móvil; recetas de boloñesa y pesto recomprimidas.
- Galería con dos tamaños (`srcset`); modelos en WebP con transparencia; fondo del pie de 729 KB → 46 KB.
- `vercel.json`: caché de un día para `/assets` (antes se revalidaba cada recurso en cada visita).

### Analítica
- `web/analytics.js`: Vercel Web Analytics, sin cookies ni identificadores. No envía nombres ni el texto que escribe el visitante, solo categorías cerradas. No se activa con «Do Not Track», «Global Privacy Control» ni en local.
- Eventos: apertura, respuestas y resultado del selector; modelo visto; apertura de contacto; clic en WhatsApp; clic en llamar; reproducción de vídeo; receta comparada; profundidad de scroll; cambio de marca.
- **Para activarla:** Vercel → proyecto → Analytics → Enable Web Analytics. Las visitas se cuentan en cualquier plan; el panel de eventos personalizados depende del plan contratado (conviene comprobarlo en el panel). Hasta entonces la web funciona igual.
- Para ver qué se envía: añadir `?analytics=debug` a la URL y abrir la consola.

### Archivos
| Archivo | Cambio |
|---|---|
| `web/evolution.js`, `web/evolution.css`, `web/analytics.js` | Nuevos. Legibles y comentados (no minificados). |
| `web/index.html`, `web/unox.html` | Accesos al selector, diálogo del selector, contacto con contexto, medios ligeros. |
| `web/guide-experience.js` | El diálogo de contacto pasa a `evolution.js`; Brasa se detiene con cualquier diálogo abierto. |
| `web/cinema.js`, `web/homeboard.js`, `web/brand-motion.js` | Una línea cada uno: aviso de cambio de modelo y elección de variante ligera. |
| `web/emapan-brand.css` | Fondo del pie ligero. |
| `vercel.json` | Caché de recursos. |
| `tools/optimize-media.sh` | Nuevo. |

No se ha añadido ningún framework, dependencia ni API de pago. Sigue siendo HTML, CSS y JavaScript sin compilación.

---

## 4. Antes y después

Medido en local con el mismo guion para las dos versiones. Los tiempos son de laboratorio: sirven para comparar, no como cifra absoluta de producción.

### Peso y carga

| | Antes | Después |
|---|---|---|
| Roboqbo móvil · transferido en los 3 primeros segundos | 15,2 MB | 3,3 MB |
| Roboqbo móvil · página completa recorrida | 30,0 MB | 9,1 MB |
| UNOX móvil · página completa recorrida | 14,7 MB | 5,4 MB |
| Roboqbo escritorio · primeros 3 s | 15,2 MB | 6,0 MB |
| Roboqbo escritorio · página completa | 40,9 MB | 24,6 MB |
| Roboqbo móvil 4G · el vídeo de entrada empieza | 4,7 s | 2,0–2,5 s |
| Roboqbo móvil 4G · el vídeo puede reproducirse sin cortes | no en 12 s | 2,4–2,7 s |
| UNOX móvil 4G · intro lista para reproducirse entera | 5,4 s | 2,5–2,8 s |
| Roboqbo móvil 4G · mayor elemento visible (LCP) | 1,3 s | 0,8–1,0 s |

### Facilidad de uso

| | Antes | Después |
|---|---|---|
| Longitud del recorrido en móvil de 390 px (pantallas) | 9,0 Roboqbo · 7,5 UNOX | 8,3 · 6,7 |
| Toques desde la primera pantalla hasta WhatsApp con modelo recomendado y contexto | no existía (había que recorrer la gama) | 5, sin desplazarse |
| Áreas táctiles por debajo de 40 px en el recorrido | 95 | 18 (interruptor de métrica en tableta, 36 px) |
| Textos con contraste insuficiente | 21 | 0 |
| Incidencias de accesibilidad (axe-core, páginas y diálogos) | 25 | 2 |
| Solape de pestañas en UNOX apaisado | sí | no |
| Errores de consola o recursos fallidos | 0 | 0 |
| Desbordamiento horizontal | 0 | 0 |
| Estabilidad visual (CLS) | 0,001–0,007 | 0–0,0006 |

Las 2 incidencias restantes son la falta de titular de primer nivel visible en UNOX con «movimiento reducido», que ya existía.

### Pruebas automáticas de la versión nueva
116 de 116 comprobaciones superadas en 360×740, 390×844, 430×932, 768×1024 y 1440×900, en ambas páginas: vídeo de entrada con la variante correcta, recorrido de los tres modelos por scroll, pestañas, deslizamiento, contacto con el equipo correcto, cierre con Escape y retorno del foco, scroll libre tras cerrar, vídeos de sección, receta con vídeo recomprimido, ninguna sección oculta, sin desbordamiento ni errores. Además: Brasa abre el selector, «movimiento reducido» y «Do Not Track». Comprobado también en móvil apaisado (740×360) y pantallas bajas (360×640).

### Lo que no he podido validar
- **Dispositivos reales y Safari de iOS.** Todo se ha probado en Chromium con emulación táctil. Antes de publicar conviene probar en un iPhone y un Android reales: vídeo de entrada, selector, deslizamiento entre modelos y apertura de WhatsApp.
- **El despliegue en Vercel.** No he encontrado el proyecto en la cuenta de Vercel conectada a esta sesión, así que no he verificado la vista previa ni la cabecera de caché en su infraestructura.
- **El efecto en solicitudes.** Solo se sabrá con la analítica activada y unas semanas de datos.

Queda un solape menor inherente a cualquier barra flotante: durante el scroll, la barra inferior puede pasar un instante sobre el contenido que entra por abajo. Ya ocurría con las flechas de la galería.

---

## 5. Cómo revisarlo

**En Vercel.** Si el repositorio está conectado, cada envío a la rama genera una vista previa: Vercel → proyecto → Deployments → rama `claude/lucid-ride-79hvrl`.

**En local.**

```bash
git fetch origin claude/lucid-ride-79hvrl
```

```bash
git checkout claude/lucid-ride-79hvrl
```

```bash
python3 -m http.server 8000 --directory web
```

Abrir http://localhost:8000 y http://localhost:8000/unox.html. Para ver los eventos de analítica en la consola, añadir `?analytics=debug`.

**Recorrido sugerido (5 minutos, mejor en el móvil).**
1. Primera pantalla → «Encuentra tu Qbo» → dos respuestas → resultado.
2. «Pedir prueba gratis» → comprobar el contexto y el mensaje que se abre en WhatsApp.
3. Cerrar, bajar: la barra inferior muestra el modelo elegido.
4. En la gama, deslizar el dedo sobre la máquina y usar las pestañas.
5. Tocar a Brasa: abre el selector.
6. Repetir en `/unox.html`.

**Volver atrás.** Todo lo nuevo vive en tres archivos y en `assets/opt`. Los originales no se han borrado.

---

## 6. Decisiones que necesito de vosotros

1. **Opciones del selector.** Revisad los textos de negocio y volumen, sobre todo cómo tratar los volúmenes entre gamas (10–15 y 70–120 litros). Ahora se indica «elige la más cercana y lo afinamos contigo».
2. **Documentación técnica** de Roboqbo y UNOX (catálogos o fichas) para la ficha por modelo y el comparador.
3. **Pausa de vídeos y movimiento automático de la página:** mantener o revisar.
4. **Limpieza de los 20 MB de recursos sin uso** en `web/assets`: los he dejado por si los queréis conservar.
5. **Activar Web Analytics** en Vercel.
