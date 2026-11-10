#!/usr/bin/env bash
# Genera las variantes ligeras de web/assets/opt a partir de los originales
# oficiales de web/assets. No modifica ni borra ningún original.
#
# Requisitos: ffmpeg con libx264 y libwebp.
# Uso:        bash tools/optimize-media.sh
#
# Solo se recomprime y, en las variantes móviles, se reduce el tamaño.
# No hay reescalado hacia arriba, interpolación ni generación por IA.
set -euo pipefail
cd "$(dirname "$0")/../web/assets"
mkdir -p opt

x264() { # entrada salida crf [filtro de escala]
  local in=$1 out=$2 crf=$3 vf=${4:-}
  ffmpeg -hide_banner -loglevel error -y -i "$in" -an \
    ${vf:+-vf "$vf"} -c:v libx264 -preset slow -crf "$crf" \
    -profile:v high -pix_fmt yuv420p -movflags +faststart "opt/$out"
}
webp() { # entrada salida ancho calidad
  ffmpeg -hide_banner -loglevel error -y -i "$1" \
    -vf "scale='min($3,iw)':-2:flags=lanczos" -c:v libwebp -quality "$4" \
    -compression_level 6 "opt/$2"
}

# --- Vídeo de entrada Roboqbo (el original pesa 12,6 MB a 7,8 Mb/s) ----------
# SSIM frente al original: 0,990 (1080p) y 0,974 (720p).
x264 qbo-story-hd.mp4 qbo-story-1080.mp4 26
x264 qbo-story-hd.mp4 qbo-story-720.mp4  28 "scale=1280:-2:flags=lanczos"

# --- Recetas a 6-7 Mb/s: misma resolución, compresión razonable ---------------
# (El resto de vídeos de sección ya está bien comprimido: en escritorio se
#  sirven los originales y recomprimirlos apenas ahorraba un 15-25 %.)
x264 new-qbo-bolognese.mp4   new-qbo-bolognese.mp4   25
x264 new-qbo-pesto.mp4       new-qbo-pesto.mp4       25

# --- Variantes móviles (960 px de ancho) de los vídeos de 1920 px ------------
for v in qbo-production qbo-meet new-unox-chefs new-unox-baking unox-film; do
  x264 "$v.mp4" "$v-m.mp4" 27 "scale=960:-2:flags=lanczos"
done

# --- Imágenes ----------------------------------------------------------------
# Galería: los originales miden hasta 3200 px y 1,4 MB.
for g in qbo-chef-pour qbo-chef-prep qbo-detail-hq qbo-kitchen-wide-hq \
         unox-range-hq unox-fans-hq unox-interior-hq; do
  webp "$g.webp" "$g-800.webp"  800  78
  webp "$g.webp" "$g-1600.webp" 1600 80
done
# Modelos (PNG con transparencia → WebP con transparencia).
for m in qbo-pro qbo-top qbo-big-cutout cheftop bakertop speed; do
  webp "$m.png" "$m.webp" 1200 86
done
# Carteles de la primera pantalla para móvil.
webp qbo-story-hd-poster.jpg qbo-story-poster-960.webp 960 76
webp unox-freeze.jpg         unox-freeze-960.webp      960 76
# Carteles de los vídeos de sección para móvil.
for p in qbo-production qbo-meet new-unox-chefs new-unox-baking unox-film; do
  webp "$p-poster.jpg" "$p-poster-960.webp" 960 74
done
# Fondo decorativo del pie (se muestra al 6 % de opacidad).
webp emapan-pattern-original.png emapan-pattern.webp 1200 60

echo "Variantes generadas en web/assets/opt:"
du -ch opt/* | tail -1
