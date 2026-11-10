# EMAPAN · Roboqbo y UNOX

Entrega completa para subir manualmente a GitHub y conectar con Vercel.
Actualizada el 5 de noviembre de 2026 a partir de la versión 16 de EMAPAN.

## Qué contiene

- `web/index.html`: experiencia Roboqbo.
- `web/unox.html`: experiencia UNOX.
- `web/assets/`: todas las imágenes, vídeos, logo vectorial y fondo de marca.
- `web/*.css` y `web/*.js`: estilos, navegación, comparativas, galerías y mascota.
- `web/evolution.js` y `web/evolution.css`: selector de necesidades, contacto contextual, gestos y animaciones añadidos en noviembre de 2026.
- `web/analytics.js`: analítica básica sin cookies (Vercel Web Analytics).
- `web/assets/opt/`: variantes ligeras de vídeos e imágenes. Los originales siguen en `web/assets/`.
- `tools/optimize-media.sh`: regenera `web/assets/opt/` a partir de los originales (requiere ffmpeg).
- `docs/EVOLUCION-2026-11.md`: diagnóstico, plan, mediciones antes/después y guía de revisión de la evolución.
- `web/vendor/`: librería local de desplazamiento y licencias conservadas.
- `vercel.json`: configuración para publicar la carpeta `web` sin compilación.

El sitio es HTML, CSS y JavaScript: no requiere instalar paquetes, claves de API ni servidor de aplicación. No incluye historial Git ni credenciales del entorno original.

## Subir a GitHub desde el navegador

1. Descomprime el ZIP en tu ordenador.
2. Abre https://github.com/TinyChat-up/EMAPAN-ROBOQBO-UNOX
3. Si el repositorio está vacío, pulsa el enlace para subir archivos existentes (`uploading an existing file`). Si ya tiene archivos, usa **Add file → Upload files**.
4. Arrastra la carpeta **web** que está dentro de la carpeta descomprimida. Debe quedar una carpeta `web` en la raíz del repositorio. Confirma los cambios.
5. En una segunda subida, añade **vercel.json** y **README.md** a la raíz del repositorio. Puedes añadir también `.gitignore` si tu ordenador lo muestra.
6. Confirma los cambios.

No subas el ZIP: GitHub no lo descomprime para crear la web. Tampoco arrastres la carpeta exterior `EMAPAN-ROBOQBO-UNOX`: entra en ella y sube su contenido.

GitHub permite hasta 100 archivos por tanda en la subida desde el navegador y la carpeta `web` contiene ahora 147, así que la subida manual exige varias tandas. Es más cómodo trabajar con Git: cada envío a una rama genera además una vista previa en Vercel.

## Conectar con Vercel

1. En Vercel, crea un proyecto e importa el repositorio `TinyChat-up/EMAPAN-ROBOQBO-UNOX`.
2. Mantén **Root Directory** en la raíz del repositorio (`.`).
3. Si debes revisar los ajustes: **Framework Preset = Other**, **Build Command vacío**, **Output Directory = web**. No necesitas comando de instalación ni variables de entorno.
4. Pulsa **Deploy**. El archivo `vercel.json` incluido define la configuración estática.
5. Comprueba la página inicial y la ruta `/unox.html` en el dominio que te asigne Vercel.

## Abrir en tu ordenador

Para comprobar las rutas igual que en el alojamiento, sirve la carpeta `web` con un servidor local. Si tienes Python instalado, abre una terminal dentro de `EMAPAN-ROBOQBO-UNOX` y ejecuta:

```bash
python3 -m http.server 8000 --directory web
```

Abre http://localhost:8000 y http://localhost:8000/unox.html. Abrir los HTML con doble clic no reproduce correctamente los enlaces que empiezan por `/`.

## Guía visual de desplazamiento

La mascota enseña el gesto sin añadir instrucciones visibles. Tras 4,2 segundos de inactividad en la entrada, hace dos gestos de 2,6 segundos: una mano desliza hacia arriba en móvil y una rueda de ratón se mueve en ordenador. La página acompaña el gesto con un avance total máximo de 112 píxeles. La flecha se puede tocar para continuar.

La pista se retira inmediatamente al tomar el control y recuerda durante la sesión que el usuario ha aprendido a desplazarse. Respeta la opción de ocultar la mascota y la preferencia de movimiento reducido. En ese modo y en pantallas apaisadas muy bajas, solo aparece una flecha estática sin movimiento automático.

## Cambios incluidos en esta entrega

- Conserva el logo vectorial limpio y el fondo de marca ya incorporados.
- Los controles de los vídeos no ofrecen la acción «Pausar»: mientras se reproducen se ocultan. «Reproducir» aparece cuando el vídeo está detenido y permite iniciarlo.
- Conserva las pausas automáticas fuera de pantalla, al ocultar la pestaña o al abrir el diálogo de contacto, y la preferencia de movimiento reducido.
- Conserva la introducción UNOX, su fotograma de presentación y el botón de repetición.
- El contacto prepara un mensaje de WhatsApp para el número 615 619 104. El visitante confirma el envío en WhatsApp; el sitio no guarda el formulario en una base de datos.

## Comprobaciones de la entrega

Sintaxis de JavaScript, referencias a archivos locales, presencia de las dos páginas e integridad del ZIP revisadas. La guía se ha comprobado en navegador a 390 × 844 y en ordenador; se han validado sus límites de desplazamiento, la interrupción al deslizar, el avance al tocar la flecha y la preferencia de movimiento reducido. Esta copia no se ha desplegado en Vercel.

## Evolución de noviembre de 2026

Resumen; el detalle está en `docs/EVOLUCION-2026-11.md`.

- **Selector de necesidades.** Dos preguntas y una recomendación de gama. Solo usa datos ya publicados en la web (capacidades de Roboqbo y uso de cada línea UNOX). Para cambiar preguntas u opciones, editar el bloque `FINDER` al principio de `web/evolution.js`. No añadir cifras ni prestaciones que no procedan de documentación del fabricante.
- **Contacto contextual.** El mensaje de WhatsApp incluye modelo, respuestas del selector e intención (prueba, presupuesto o asesoramiento). El sitio sigue sin guardar nada en una base de datos.
- **Medios ligeros.** Las páginas cargan las variantes de `web/assets/opt/`; en móvil, versiones más pequeñas. Tras sustituir un original, ejecutar `bash tools/optimize-media.sh`.
- **Analítica.** Activarla en Vercel → proyecto → Analytics → Enable Web Analytics. Sin cookies; no envía texto escrito por el visitante; respeta «Do Not Track». Con `?analytics=debug` en la URL se ven los eventos en la consola.
- **Caché.** `vercel.json` sirve `/assets` con caché de un día. Si se sustituye un archivo conservando el nombre, los visitantes recientes pueden tardar hasta un día en ver el nuevo.

## Documentación oficial

- Subir archivos a GitHub: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Configurar una web estática en Vercel: https://vercel.com/docs/builds/configure-a-build
