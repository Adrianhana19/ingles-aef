# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Esta es una app personal para repasar inglés del programa de adultos de la Escuela Americana (El Salvador), siguiendo el temario de **American English File 3.ª ed.**:
- **AEF 1:** Files 1–6 (Base) y 7–12 (A1++).
- **AEF 2:** Files 1–12 (A2, el nivel actual del usuario).

Se publica como **PWA instalable** en GitHub Pages: el usuario la agrega a la pantalla de inicio del iPhone y el iPad, y funciona sin internet. El progreso se sincroniza opcionalmente con Firebase.

Todo se escribe en español: la interfaz de la app, las respuestas al usuario y este archivo. El contenido en inglés es **inglés americano**. El contenido es original y sigue el temario de AEF; no copies textos del libro.

## Ubicación y estado

- **Código fuente y repositorio git:** `~/Proyectos/ingles-aef`. Siempre se trabaja aquí.
- **App publicada:** https://adrianhana19.github.io/ingles-aef/
  - Sale de la rama `main`, carpeta `docs/`, del repo público `Adrianhana19/ingles-aef`.
  - El usuario la tiene instalada en el iPhone y el iPad con "Agregar a inicio".
- **Firebase:**
  - Proyecto `english-review-8adb3`, con autenticación por correo y contraseña y Firestore.
  - Las reglas están en `firestore.rules` y ya están publicadas en la consola.
  - La configuración pública está en `firebase-config.js`.
  - La sincronización funciona: el usuario ya creó su cuenta.
- **Copias que no se sincronizan:**
  - `~/Desktop/ingles-aef.html` es la versión de un solo archivo que genera `build.py`.
  - `~/Documents/Proyectos/English/ingles-aef.html` es una copia antigua.
  - El progreso real del usuario está en la app web, sincronizado con Firebase.
- **No cambies de forma incompatible** las claves de localStorage, los ids de los eventos ni las claves de las palabras (`w:grupo:palabra`): romperían el progreso sincronizado.

## Comandos

```bash
python3 build.py      # genera docs/ (PWA para GitHub Pages) y ~/Desktop/ingles-aef.html (un solo archivo, sin PWA ni sync)
node test.js          # valida los datos de gramática, vocabulario y verbos
node test2.js         # valida los trabalenguas y los idioms, y prueba checkEs()
node test3.js         # prueba el registro de eventos: fusión entre dispositivos, migración y compactación
node imgs.js          # consulta Wikipedia y lista las palabras sin foto (necesita red)
./deploy.sh "mensaje" # build + pruebas + commit + push; Pages tarda 1–2 min en actualizar
```

Prueba de humo en el navegador. Usa Chrome headless y CDP con el WebSocket nativo de Node, sin dependencias:
```bash
(cd docs && python3 -m http.server 8766 &)
rm -rf prof && node cdp.mjs steps-smoke.json     # guarda capturas en shots/ e imprime ERRORS
pkill -f "http.server 8766"
```

Pasos que acepta `cdp.mjs`:
- `nav`, `wait`
- `js` (se evalúa en la página; acepta promesas)
- `shot`
- `size` (`[w,h,mobile]`)
- `dark`
- `offline` (emula sin red)
- `reload` (recarga y espera los ms indicados)

Notas sobre las pruebas:
- `size` y `dark` se aplican **antes** de `nav`.
- Borra `prof/` para no recibir la versión anterior desde la caché del service worker.
- `play.js` responde un reto completo; se pasa como `js`.
- `?fecha=AAAA-MM-DD` simula otro día.

## Arquitectura

**Construcción.** `build.py` concatena en este orden:
- Datos, como constantes globales: `grammar1.js → grammar2.js → vocab.js → verbs.js → extras.js`.
- Módulos, dentro de una sola IIFE y compartiendo ámbito: `icons.js → core.js → store.js → views.js`.

Ese orden importa:
- `core.js` usa `ic()` de `icons.js`.
- `store.js` usa `TODAY`, `addDays` y `applyTheme` de `core.js`.
- `views.js` usa todo lo anterior.

Archivos aparte de la IIFE:
- `sync.js` es un `<script type="module">` y solo se incluye en `docs/`.
- `sw.template.js` genera `docs/sw.js`; la versión de caché es un hash del build.

**Formatos de datos.**
- **`GRAMMAR`**, mediante `G({...})`. Cada tema tiene:
  - `id` con el patrón `B-1a` / `1-7a` / `2-10b`
  - `book` (`'B'`, `1`, `2`) y `file`
  - las fichas de consulta: `form`, `uses`, `ex`, `errs`
  - `items`: los ejercicios en un minilenguaje (ver más abajo)
- **Minilenguaje de `items`** (`parseItem` en `core.js`):
  - `m:` opción múltiple: `[correcta|mala]`
  - `g:` completar: `{resp|alt} (pista)`
  - `e:` error: `*mal>bien*`
  - `t:` traducción: `español = English|alt`
  - `o:` ordenar
  - Una explicación opcional va después de ` ## `.
- **`VOCAB`**: las palabras se escriben como líneas `emoji|palabra|español|ejemplo|títuloWikipedia`. Si el título es `-`, la palabra no lleva foto.
- **`IRREG`**, **`REG`**, **`TWISTERS`** e **`IDIOMS`**: son cadenas con campos separados por `|`; el orden está comentado al inicio de cada archivo.
  - Los idioms se insertan como el grupo `v-idioms` con `book:'X'` (estado "Extra").
  - El equivalente de cada idiom es **venezolano**; si no hay uno natural, el campo va vacío.

**Progreso basado en eventos (`store.js`).**
- **Fuente de verdad:**
  - `S.base`: el progreso anterior al registro de eventos (migrado de v1) y lo ya compactado.
  - `S.ev`: un evento por respuesta, `{i,t,day,k,ok,tp?,q?,g?,x?}`. Las tareas se guardan como `{i,t,day,task}`.
  - `S.cards` (con `u`) y `S.settings` (con `_u`): se fusionan por fecha de cambio.
- **Datos derivados:** `derive()` recalcula `S.stat`, `S.miss` y `S.days` reproduciendo los eventos en orden canónico (fecha, hora, id). No se guardan.
  - Por eso, fusionar los eventos de varios dispositivos da el mismo resultado que haberlo respondido todo en uno (lo verifica `test3.js`).
- **Escritura:** pasa siempre por `record()`, `markTask()`, `setCard()` y `touchSettings()`. Nunca modifiques `S.days` ni `S.stat` directamente.
- **Errores:** las respuestas incorrectas guardan lo escrito (`g`) y lo correcto (`x`) para el historial de Progreso.
- **Compactación:** `compact()` lleva los eventos viejos a `S.base` cuando hay más de 15 000.
- **localStorage:** `aef-review-v1` (el estado) y `aef-review-imgs` (las URLs de las fotos). Las claves de las palabras incluyen el nombre del grupo, así que renombrar un grupo o una palabra rompe el progreso guardado.

**Sincronización (`sync.js` + Firebase).**
- La configuración está en `firebase-config.js`. Si es `null`, no hay sincronización.
- Inicio de sesión con correo y contraseña. No se usa el inicio con Google porque falla dentro de una PWA de iOS.
- **Datos en Firestore**, bajo `users/{uid}`:
  - `days/{AAAA-MM-DD}`: `{e_<dispositivo>: [eventos]}`, agregados con `arrayUnion`.
  - `meta/cards`, `meta/settings`, `meta/base` y `meta/state` (`resetAt`, para propagar un reinicio).
- Al conectar un dispositivo por primera vez, `link()` suma su línea base a la de la cuenta en una transacción y sube los eventos pendientes.
- `firestore.rules` limita todo a `request.auth.uid == userId`.
- La app expone `window.AppStore` y `window.AppUI` como puente hacia el módulo.

**Variedad diaria determinista.**
- `makeRng(semilla)` es un PRNG con semilla, y las semillas incluyen `TODAY`.
- `snap()` congela los errores y los aciertos al inicio del día, así el reto no cambia ese día.
- `rot(arr, sal, off)` rota el trabalenguas y el idiom diarios sin repetir.

**Preguntas y vistas.**
- Los generadores `qFromItem`, `qVocab`, `qVerb`, `qEd`, `qIdiom` y `qMatch` devuelven objetos con:
  - `kind`: `mc`|`type`|`listen`|`order`|`err`|`match`
  - `key`: con la forma `topicId#idx`, `w:grupo:palabra`, `v:verbo` o `r:verbo`. `qFromKey()` regenera la pregunta a partir de ella.
- **Rutas:** se navega por `location.hash` (`#hoy`, `#gramatica/2-1a`…), con una función `vXxx()` por vista.
- **Modo lección:** el quiz y las flashcards activan `body.focus`, que oculta la navegación.

## Diseño

- **Estética** inspirada en Codecademy, sin usar su marca:
  - marino `#10162F`, morado `#3A10E5`, amarillo `#FFD300` solo para el botón principal
  - tipografía Hanken Grotesk, y JetBrains Mono solo para fórmulas y atajos
  - bordes de 1 a 2 px y sombra desplazada sólida en lo que se puede tocar
- **Íconos:** son SVG de línea de `icons.js` (`ic(nombre)`). En la interfaz no se usan emojis: solo como contenido (imagen de respaldo del vocabulario, banderas).
- **Fórmulas de gramática:** se muestran como un editor de código (`codeBlock()` y `hl()` en `views.js`).
- **Colores:** se definen como tokens en `:root` y se repiten para el modo oscuro, tanto en `prefers-color-scheme` como en `[data-theme="dark"]`. La página no debe tener scroll horizontal a 390 px; hay que probar también el iPad (820×1180 y 1180×820).
- **Gráficas de Progreso:** se hacen con HTML y CSS, no con SVG, para que el texto no se encoja. Una sola serie, sin leyenda. El verde y el rojo se reservan para mejora o retroceso y siempre van con ícono.
- **Diálogos:** no uses `alert`/`confirm`. Usa `toast()` o botones de confirmación de dos toques.
