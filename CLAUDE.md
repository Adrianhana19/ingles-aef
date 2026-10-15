# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Esta es una app personal para repasar inglés del programa de adultos de la Escuela Americana (El Salvador), siguiendo el temario de **American English File 3.ª ed.**:
- **AEF 1:** Files 1–6 (Base) y 7–12 (A1++).
- **AEF 2:** Files 1–12 (A2, el nivel actual del usuario).

Se publica como **PWA instalable** en GitHub Pages: el usuario la agrega a la pantalla de inicio del iPhone y el iPad, y funciona sin internet. El progreso se sincroniza opcionalmente con Firebase.

Todo se escribe en español: la interfaz de la app, las respuestas al usuario y este archivo. El contenido en inglés es **inglés americano**. El contenido es original y sigue el temario de AEF; no copies textos del libro.

## Ubicación y estado

- **Todo el proyecto está en `~/Documents/Proyectos/English`**: el código fuente, el repositorio git y `docs/` (la app publicada). Siempre se trabaja aquí.
- **`respaldos/`** (ignorada por git, porque son datos personales): exportaciones del progreso y la versión vieja del HTML.
- **App publicada:** https://adrianhana19.github.io/ingles-aef/
  - Sale de la rama `main`, carpeta `docs/`, del repo público `Adrianhana19/ingles-aef`.
  - El usuario la tiene instalada en el iPhone y el iPad con "Agregar a inicio".
- **Firebase:**
  - Proyecto `english-review-8adb3`, con autenticación por correo y contraseña y Firestore.
  - Las reglas están en `firestore.rules` y ya están publicadas en la consola.
  - La configuración pública está en `firebase-config.js`.
  - La sincronización funciona: el usuario ya creó su cuenta.
- **Copias que no se sincronizan:**
  - `ingles-aef.html`, en la raíz, es la versión de un solo archivo que genera `build.py` (ignorada por git).
  - El progreso real del usuario está en la app web, sincronizado con Firebase.
- **No cambies de forma incompatible** las claves de localStorage, los ids de los eventos ni las claves de las palabras (`w:grupo:palabra`): romperían el progreso sincronizado.

## Comandos

```bash
python3 build.py      # genera docs/ (PWA para GitHub Pages) e ingles-aef.html (un solo archivo, sin PWA ni sync)
node test.js          # valida los datos de gramática, vocabulario y verbos
node test2.js         # valida los trabalenguas y los idioms, y prueba checkEs()
node test3.js         # prueba el registro de eventos: fusión entre dispositivos, migración, compactación e importación
node test4.js         # prueba la elección de voz (pickVoice) con listas simuladas, incluida la de la Mac del usuario
node test5.js         # prueba el dominio y simula 30 días de reto: 70% nuevo, repaso espaciado, lo dominado casi no sale
node test6.js         # prueba el generador de números (formas de decir y corrección) y el conteo de verbos por letra
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
- `click` (`[x,y]`: clic real del ratón; sirve para probar la voz, que exige un gesto del usuario)

Notas sobre las pruebas:
- `size` y `dark` se aplican **antes** de `nav`.
- Borra `prof/` para no recibir la versión anterior desde la caché del service worker.
- Si una ejecución falla a medias, puede quedar vivo un Chrome headless en el puerto 9333 y las pruebas siguientes se conectarían a él. Ciérralo con `pkill -f "user-data-dir=$PWD/prof"`.
- `play.js` responde un reto completo; se pasa como `js`.
- `?fecha=AAAA-MM-DD` simula otro día.

## Arquitectura

**Construcción.** `build.py` concatena en este orden:
- Datos, como constantes globales: `grammar1.js → grammar2.js → vocab.js → verbs.js → extras.js`.
- Módulos, dentro de una sola IIFE y compartiendo ámbito: `icons.js → core.js → numbers.js → store.js → views.js`.

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

**Voz (`core.js`, bloque `VOZ`).**
- `pickVoice()` prefiere voces locales de buena calidad (primero las Premium/Enhanced), luego otras locales en `en-US`, y deja al final las voces de Google en línea, que en Chrome para Mac a menudo no suenan y no dan error.
- Las voces de efectos (Bubbles, Zarvox…) se excluyen.
- La voz elegida es **por dispositivo** (`localStorage['aef-review-voice']`) y no se sincroniza.
- `speak()` evita los fallos de Chrome: no llama a `speak()` justo después de `cancel()`, llama a `resume()` y, si una voz falla, reintenta una vez con la siguiente. Acepta un callback opcional `onResult`, que usa el botón "Probar" de Ajustes.
- `speechSynthesis` exige un gesto del usuario: lo que suena solo, sin un clic previo, puede devolver `not-allowed` y se ignora en silencio.

**Selección y dominio (`core.js`, bloque `SELECCION`, funciones puras).**
- **Historial:** `buildHistory(eventos, base, día)` arma un historial por unidad (ejercicio `tema#n`, tema, palabra, verbo) **solo con los días anteriores a hoy**: así el reto no cambia mientras se practica.
  - `hist()` lo usa para elegir.
  - `histNow()` incluye hoy y solo sirve para mostrar el avance.
- **Dominio:** `mastery()` = aciertos en las últimas K respuestas / K (K: tema 10, ejercicio 3, palabra 4, verbo 4).
  - La línea base (sin fechas) aporta hasta un 80%.
  - En palabras también cuenta la caja de flashcards (5 = 100%).
- **Probabilidad según dominio:** `masteryWeight()` vale 1 hasta 50% de dominio; luego `((1−m)/0,5)²`; mínimo 0,02 al 100%.
- **Nuevo o repaso:** `pickNewOrReview()` elige lo nunca visto con probabilidad `NEW_RATIO` (0,7, acordado con el usuario) y, si no, repaso.
  - El repaso pondera dominio × `recencyWeight` (nada de los últimos 2 días; peso completo a los 7).
  - Si una de las dos listas está vacía, usa la otra.
- **Errores pendientes:** van aparte. Hasta 3 al inicio del reto, por decisión del usuario.
- **Dónde se aplica:** `buildDaily`, `dailyVerbs`, `dailyWords` (unas 7 nuevas y 3 de repaso), `topicOfDay` y los modos de Ejercicios (`pickGrammar` y `pickMany`). "Practicar este tema" muestra primero lo no visto.

**Números (`numbers.js`, bloque `NUM` con funciones puras).**
- `makeNum(tipo, valor)` describe un número: `show` (cómo se ve), `say` (la forma recomendada, la que se muestra y suena), `alts` (todas las formas aceptadas, en palabras y en cifras) y `rule` (la regla en español).
  - Tipos: `card` (cantidades), `ord`, `year` (en dos partes: nineteen ninety-eight / nineteen oh five / two thousand five / twenty twenty-six), `date` (formato de EE. UU., mes primero), `time` y `price`.
  - El usuario no quiso teléfonos.
- **Corrección:** `checkNumber()` compara con `normNum()`, que ignora "and", "the", "of", "dollars", los sufijos de ordinales, etc.
  - El micrófono reconoce *qué* número se dijo, no *cómo*. Por eso, después siempre se muestra y se escucha la forma recomendada.
- **Sesión** (`buildNumberSession`): 10 preguntas, 7 orales (tipo `say`) y 3 escritas (escuchar y escribir en cifras, o escribir en palabras).
  - Da más peso a los tipos que más falla el usuario.
  - **La pregunta oral** usa `webkitSpeechRecognition` (`SR`). Si no está disponible, el usuario se autoevalúa.
- **Claves:** `n:<tipo>:<valor>`. `qFromKey` las regenera como pregunta escrita para "Mis errores". El reto diario no las toma como errores iniciales.
- La tarjeta **"Números del día"** en Hoy (cuadrícula `g2x2`) muestra la fecha de hoy y 3 ejemplos. También hay un modo "Números" en Ejercicios.

**Verbos por letra** (`vVerbs`, modo "Por letra"): solo irregulares (decisión del usuario). Elige hasta 6 verbos de la letra con `pickMany` (primero los no practicados) y hace 2 preguntas por verbo, como el modo Mixto. Respeta el filtro AEF 1 / AEF 2.

**Variedad diaria determinista.**
- `makeRng(semilla)` es un PRNG con semilla, y las semillas incluyen `TODAY`.
- `snap()` congela los errores pendientes y las cajas de flashcards al inicio del día, así el reto no cambia ese día.
- `rot(arr, sal, off)` rota el trabalenguas y el idiom diarios sin repetir.

**Preguntas y vistas.**
- Los generadores `qFromItem`, `qVocab`, `qVerb`, `qEd`, `qIdiom` y `qMatch` devuelven objetos con:
  - `kind`: `mc`|`type`|`listen`|`order`|`err`|`match`|`say` (oral, solo números)
  - `key`: con la forma `topicId#idx`, `w:grupo:palabra`, `v:verbo`, `r:verbo` o `n:tipo:valor`. `qFromKey()` regenera la pregunta a partir de ella.
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
