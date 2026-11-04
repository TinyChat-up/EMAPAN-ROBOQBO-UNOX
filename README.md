# EMAPAN Experience — Roboqbo y UNOX

Experiencia comercial visual para EMAPAN, con recorridos independientes para Roboqbo y UNOX, vídeo, selección de equipos, comparativas de tiempos, galerías y una mascota animada. Adaptada a móvil y ordenador.

## Conectar con Vercel

1. En Vercel, selecciona **Add New → Project** e importa este repositorio.
2. Mantén **Root Directory** en la raíz del repositorio (`./`).
3. La configuración `vercel.json` selecciona **Other**, sin compilación, y publica **dist**.
4. Pulsa **Deploy**.

No requiere claves API, variables de entorno ni servicios de pago para ejecutar la web. La conexión y el despliegue en Vercel se realizan desde la cuenta del propietario.

## Estructura

- `dist/index.html`: experiencia Roboqbo.
- `dist/unox.html`: experiencia UNOX.
- `dist/assets/`: imágenes, vídeos y logotipos utilizados en el proyecto.
- `dist/*.css` y `dist/*.js`: interfaz, reproducción y animaciones.
- `dist/vendor/`: bibliotecas y licencias de terceros.

Los vídeos se reproducen silenciados al entrar en pantalla. No hay botones para pausarlos. Si el navegador bloquea la reproducción automática, aparece un botón para iniciar el vídeo. Se respeta la preferencia de movimiento reducido del dispositivo. La apertura de UNOX se detiene en el horno para continuar el recorrido con el scroll.

## Ver en local

Desde la raíz del repositorio, con Python 3 instalado:

```sh
python3 -m http.server 8000 --directory dist
```

Abre `http://localhost:8000`.

## Contacto y contenido

La llamada abre el teléfono **615 619 104**. El formulario prepara un mensaje de WhatsApp; el visitante confirma su envío. Las comparativas de tiempos mantienen la fuente y sus condiciones en la propia página.

Los logotipos, fotografías y vídeos de EMAPAN, Roboqbo y UNOX pertenecen a sus respectivos titulares. Las licencias de las dependencias de terceros se conservan junto al código correspondiente.
