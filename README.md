# EMAPAN · Roboqbo y UNOX

Entrega completa para subir manualmente a GitHub y conectar con Vercel.
Actualizada el 5 de noviembre de 2026 a partir de la versión 16 de EMAPAN.

## Qué contiene

- `web/index.html`: experiencia Roboqbo.
- `web/unox.html`: experiencia UNOX.
- `web/assets/`: todas las imágenes, vídeos, logo vectorial y fondo de marca.
- `web/*.css` y `web/*.js`: estilos, navegación, comparativas, galerías y mascota.
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

Se proponen dos subidas porque GitHub permite hasta 100 archivos por tanda. La carpeta `web` contiene 99 archivos; todos pesan menos de 25 MiB.

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

La entrada SAT es estática: no muestra la mascota sobre el titular ni hace desplazamientos automáticos. El enlace «Explorar Roboqbo» o «Explorar UNOX» continúa hacia la experiencia de producto, donde se conserva la guía visual y la preferencia de ocultarla. También se respeta la preferencia de movimiento reducido.

## Cambios incluidos en esta entrega

- Conserva el logo vectorial limpio y el fondo de marca ya incorporados.
- Los controles de los vídeos no ofrecen la acción «Pausar»: mientras se reproducen se ocultan. «Reproducir» aparece cuando el vídeo está detenido y permite iniciarlo.
- Conserva las pausas automáticas fuera de pantalla, al ocultar la pestaña o al abrir el diálogo de contacto, y la preferencia de movimiento reducido.
- Conserva la introducción UNOX, su fotograma de presentación y el botón de repetición.
- El contacto prepara un mensaje de WhatsApp para el número 615 619 104. El visitante confirma el envío en WhatsApp; el sitio no guarda el formulario en una base de datos.

## Comprobaciones de la entrega

Sintaxis de JavaScript, referencias a archivos locales, presencia de las dos páginas e integridad del ZIP revisadas. La guía se ha comprobado en navegador a 390 × 844 y en ordenador; se han validado sus límites de desplazamiento, la interrupción al deslizar, el avance al tocar la flecha y la preferencia de movimiento reducido. Esta copia no se ha desplegado en Vercel.

## Documentación oficial

- Subir archivos a GitHub: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Configurar una web estática en Vercel: https://vercel.com/docs/builds/configure-a-build

## Identidad SAT y enlaces compartidos

Las dos páginas presentan a **Emapan S.L.** como **SAT · Servicio técnico oficial**. SAT significa Servicio de Asistencia Técnica. La frase de marca es «Si tu máquina protesta, hablamos su idioma.». No se atribuye la condición de SAT oficial a una marca concreta: las fuentes del repositorio no confirman autorizaciones de Roboqbo o UNOX.

- Título de pestaña, Open Graph y Twitter: `Emapan S.L. | SAT oficial`.
- Imagen compartida: `web/assets/emapan-sat-share.png` (1200 × 630), con fuente vectorial en el SVG del mismo nombre. El logo conserva los colores originales; el favicon usa el emblema blanco sobre carbón.
- El HTML estático contiene las URL absolutas para `https://www.satemapan.com/`, incluidas las imágenes compartidas y las URL canónicas de `/` y `/unox.html`. No depende de JavaScript del navegador ni requiere compilación o variables de entorno. Si cambia el dominio, actualiza ambas páginas.
- Tras desplegar, comprueba `/` y `/unox.html` en móvil y vuelve a solicitar la lectura de ambas URL en el depurador de enlaces de la plataforma social. La caché de cada plataforma puede conservar tarjetas anteriores.
