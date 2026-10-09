# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Esta es una app personal para repasar inglés del programa de adultos de la Escuela Americana (El Salvador), siguiendo el temario de **American English File 3.ª ed.**:
- **AEF 1:** Files 1–6 (Base) y 7–12 (A1++).
- **AEF 2:** Files 1–12 (A2, el nivel actual del usuario).

El entregable es **un solo archivo HTML**, `~/Desktop/ingles-aef.html`, que funciona sin servidor ni dependencias al abrirlo con doble clic.

Todo se escribe en español: la interfaz de la app, las respuestas al usuario y este archivo. El contenido en inglés es **inglés americano**. El contenido es original y sigue el temario de AEF; no copies textos del libro.

## Comandos

```bash
python3 build.py      # une CSS y JS → ~/Desktop/ingles-aef.html (y dist/index.html para pruebas)
node test.js          # valida los datos de gramática, vocabulario y verbos (debe terminar con bad: 0)
node test2.js         # valida los trabalenguas y los idioms, y prueba checkEs() (la comparación en español)
node imgs.js          # consulta Wikipedia y lista las palabras de vocabulario sin foto (necesita red)
```

Comprobar la sintaxis del JS ya ensamblado (después de `build.py`):
```bash
node -e "const h=require('fs').readFileSync(process.env.HOME+'/Desktop/ingles-aef.html','utf8');new Function(h.split('<script>')[1].split('</script>')[0]);console.log('OK')"
```

Prueba de humo en el navegador. Usa Chrome headless y el WebSocket nativo de Node, sin instalar nada:
```bash
(cd dist && python3 -m http.server 8765 &)      # sirve dist/index.html
node cdp.mjs steps-smoke.json                     # ejecuta los pasos, guarda capturas en shots/ e imprime ERRORS
pkill -f "http.server 8765"; rm -rf prof          # detiene el servidor y borra el perfil temporal de Chrome
```

`cdp.mjs` recibe un JSON con una lista de pasos. Cada paso puede tener:
- `nav`, `wait`
- `js` (se evalúa en la página; acepta promesas)
- `shot`, `size` (`[w,h,mobile]`), `dark`

`play.js` es un script que responde automáticamente un reto completo; se pasa como `js` en uno de los pasos. Para simular otro día, agrega `?fecha=AAAA-MM-DD` a la URL.

## Arquitectura

**Construcción.** `build.py` concatena los scripts en este orden fijo, dentro de un solo `<script>` y como globales:
`grammar1.js → grammar2.js → vocab.js → verbs.js → extras.js → app.js`

Los archivos de datos solo declaran constantes; `app.js` es una IIFE que las parsea al cargar. Si agregas un archivo, debes agregarlo a la lista de `build.py`.

**Formatos de datos.** Están pensados para escribirse a mano y se parsean en `app.js`:
- **`GRAMMAR`**, mediante `G({...})`. Cada tema tiene:
  - `id` con el patrón `B-1a` / `1-7a` / `2-10b`; de ahí sale la etiqueta de unidad
  - `book` (`'B'`, `1`, `2`) y `file`
  - las fichas de consulta: `form`, `uses`, `ex`, `errs`
  - `items`: los ejercicios en un minilenguaje (ver más abajo)
- **Minilenguaje de `items`** (`parseItem`):
  - `m:` opción múltiple: `[correcta|mala|mala]`
  - `g:` completar: `{resp|alternativa} (pista)`
  - `e:` error: `*mal>bien*`; un segmento con espacios se toca como una sola unidad, y `—` significa "quitar"
  - `t:` traducción: `español = English|alt`
  - `o:` ordenar
  - Una explicación opcional va después de ` ## `.
  - Los ítems `t:` y `o:` también se convierten en dictados y ejercicios de ordenar.
- **`VOCAB`**: cada grupo tiene `book`, `file` y `photo`. Las palabras se escriben como líneas `emoji|palabra|español|ejemplo|títuloWikipedia`. Si el título es `-`, la palabra no lleva foto; si falta y el grupo tiene `photo:true`, se usa la palabra con mayúscula inicial.
- **`IRREG`** y **`REG`** (en `verbs.js`), y **`TWISTERS`** e **`IDIOMS`** (en `extras.js`): son cadenas con campos separados por `|`; el orden de los campos está comentado al inicio de cada archivo.
  - Al cargar, los idioms se insertan como el grupo `v-idioms` con `book:'X'` (estado "Extra"), así participan en las flashcards y los quizzes.
  - Las claves de las palabras incluyen el nombre del grupo, así que renombrar un grupo o una palabra rompe el progreso guardado.

**Nivel del usuario.**
- `status(book, file)` clasifica cada tema o grupo como `base`, `visto`, `actual`, `proximo` o `extra`, comparándolo con `S.settings.cur`: el File actual de AEF 2, que el usuario cambia en Ajustes.
- `eligible()` excluye los temas `proximo` de la práctica diaria, salvo que se active `includeNext`.

**Variedad diaria determinista.**
- `makeRng(semilla)` es un PRNG con semilla, y las semillas incluyen `TODAY`.
- `snap()` congela `S.miss` y los aciertos al primer uso de cada día. Así, el reto, las palabras y los verbos del día no cambian aunque el usuario practique ese mismo día.
- `rot(arr, sal, off)` rota el trabalenguas y el idiom diarios sin repetir hasta agotar la lista.
- `TODAY` puede sobrescribirse con `?fecha=`.

**Preguntas.** Todos los generadores devuelven el mismo tipo de objeto, que `vQuiz` sabe renderizar:
- Generadores: `qFromItem`, `qVocab`, `qVerb`, `qEd`, `qIdiom`, `qMatch`.
- Campo `kind`: `mc` | `type` | `listen` | `order` | `err` | `match`.
- Campo `key`: con la forma `topicId#idx`, `w:grupo:palabra`, `v:verbo` o `r:verbo`. Sirve para registrar errores, y `qFromKey()` regenera la pregunta a partir de ella.

**Corrección de respuestas.**
- `norm()` y `checkTyped()` (en inglés) expanden las contracciones y toleran errores pequeños mediante `lev()`.
- `checkEs()` (en español) ignora tildes, artículos y `(a)`, acepta cualquier opción separada por `/` o `,`, y tolera la terminación "se".

**Estado.**
- Todo vive en `localStorage['aef-review-v1']`, en el objeto `S`:
  - `settings`
  - `days`: por fecha, con `q`, `ok`, `tasks`, `cards`
  - `stat`, `miss`
  - `cards`: las cajas Leitner, con forma `{b, due}`
  - `snap`
- Las URLs de las fotos se guardan en caché en `aef-review-imgs`.
- Mantén compatibles esas claves y formas: el usuario ya tiene progreso guardado.

**Rutas.** Se navega por `location.hash` (`#hoy`, `#gramatica/2-1a`, `#vocabulario/v-food`, `#quiz`, `#flash`…). Cada vista es una función `vXxx()` que reemplaza `#app.innerHTML` y vuelve a enlazar sus eventos. Los quizzes y las flashcards en curso viven en `SESSION`, solo en memoria.

**Servicios externos.** Son opcionales; si fallan, la app sigue funcionando:
- **Fotos:** la API de Wikipedia `prop=pageimages`, en lotes de 45 títulos. Si no hay foto, se queda el emoji.
- **Voz:** `speechSynthesis` con `en-US`.
- **Reconocimiento de voz:** `webkitSpeechRecognition`, para el botón 🎤 de los trabalenguas.
- **Fuentes:** Google Fonts.

## Convenciones de contenido

- **Idioms:** el equivalente en español debe ser **venezolano**, no salvadoreño. Si no hay uno natural, deja el campo vacío; la app muestra entonces el significado en español neutro.
- **Diseño:** los colores se definen con los tokens CSS de `:root` y se repiten para el modo oscuro, tanto en `prefers-color-scheme` como en `[data-theme="dark"]`. La página no debe tener scroll horizontal a 390 px de ancho.
- **Diálogos:** no uses `alert`/`confirm`, porque bloquean las pruebas automatizadas. Usa `toast()` o botones de confirmación de dos toques.
