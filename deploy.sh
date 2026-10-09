#!/bin/sh
# Construye, valida y publica la app en GitHub Pages (rama main, carpeta docs/).
# Uso: ./deploy.sh "mensaje del commit"
set -e
cd "$(dirname "$0")"
python3 build.py
node test.js  > /dev/null
node test2.js > /dev/null
node test3.js > /dev/null
node -e "const h=require('fs').readFileSync('docs/index.html','utf8');new Function(h.match(/<script>\n([\s\S]*?)\n<\/script>/)[1]);"
git add -A
git commit -m "${1:-Actualiza la app}" || echo "Sin cambios que publicar"
git push
echo "Publicado. GitHub Pages tarda 1–2 minutos en actualizar."
