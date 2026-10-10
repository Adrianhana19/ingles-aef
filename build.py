"""Construye la app.

- docs/  → versión web instalable (PWA) que publica GitHub Pages: index.html, manifest, service worker, íconos, sync.js
- ingles-aef.html (en esta carpeta) → versión de un solo archivo para abrir sin internet (sin PWA ni sincronización)
"""
import hashlib, json, pathlib, shutil

d = pathlib.Path(__file__).parent
DATA = ['grammar1.js', 'grammar2.js', 'vocab.js', 'verbs.js', 'extras.js']   # constantes globales
MODS = ['icons.js', 'core.js', 'store.js', 'views.js']                      # comparten un mismo ámbito (IIFE)

css = (d/'style.css').read_text()
js = '\n'.join((d/f).read_text() for f in DATA)
js += "\n(function(){\n'use strict';\n" + '\n'.join((d/f).read_text() for f in MODS) + "\n})();\n"

FONTS = '''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">'''

PWA_HEAD = '''<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="English">'''

SW_REG = '''<script>
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
  navigator.serviceWorker.register('sw.js').then(reg=>{
    const ask = w => window.__swToast && window.__swToast(()=>w.postMessage('skip'));
    if(reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
    reg.addEventListener('updatefound',()=>{ const w=reg.installing; w && w.addEventListener('statechange',()=>{ if(w.state==='installed' && navigator.serviceWorker.controller) ask(w); }); });
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') reg.update(); });
  });
  let reloaded=false; navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(!reloaded){ reloaded=true; location.reload(); } });
}
</script>'''

def page(pwa: bool) -> str:
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>English Review</title>
<meta name="description" content="Repaso de inglés con el temario de American English File: ejercicios diarios, vocabulario con fotos, verbos y gramática.">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#10162F" media="(prefers-color-scheme: dark)">
{PWA_HEAD if pwa else ''}
{FONTS}
<style>
{css}
</style>
</head>
<body>
<header class="topbar"><div class="topbar-in">
  <a class="brand" href="#hoy"><span class="logo" aria-hidden="true">En</span><span>English Review</span></a>
  <nav id="tabs" aria-label="Secciones"></nav>
  <div class="topbar-end"><span class="streak-pill" id="streakPill"></span><button class="icon-btn" id="gear" title="Ajustes" aria-label="Ajustes"></button></div>
</div></header>
<main id="app"></main>
<nav class="bottomnav" id="bnav" aria-label="Secciones"></nav>
<script>
{js}
</script>
{SW_REG if pwa else ''}
{'<script type="module" src="sync.js"></script>' if pwa and (d/'sync.js').exists() else ''}
</body>
</html>
'''

# ---------- docs/ (PWA para GitHub Pages) ----------
docs = d/'docs'
docs.mkdir(exist_ok=True)
html = page(True)
(docs/'index.html').write_text(html)
(docs/'.nojekyll').write_text('')
for f in ('sync.js', 'firebase-config.js'):
    if (d/f).exists():
        shutil.copy(d/f, docs/f)
(docs/'icons').mkdir(exist_ok=True)
for f in (d/'icons').glob('*'):
    if f.suffix in ('.png', '.svg'):
        shutil.copy(f, docs/'icons'/f.name)

manifest = {
    "name": "English Review", "short_name": "English",
    "description": "Repaso de inglés con el temario de American English File",
    "lang": "es", "start_url": "./#hoy", "scope": "./", "display": "standalone",
    "background_color": "#10162F", "theme_color": "#10162F",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        {"src": "icons/icon.svg", "sizes": "any", "type": "image/svg+xml"},
    ],
}
(docs/'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))

h = hashlib.sha1()
for f in sorted(docs.rglob('*')):
    if f.is_file() and f.name != 'sw.js':
        h.update(f.read_bytes())
version = h.hexdigest()[:10]
core = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']
core += [f for f in ('sync.js', 'firebase-config.js') if (docs/f).exists()]
(docs/'sw.js').write_text((d/'sw.template.js').read_text().replace('__VERSION__', version).replace('__CORE__', json.dumps(core)))

# ---------- versión de un solo archivo ----------
out = d/'ingles-aef.html'
out.write_text(page(False))
print(f'docs/ listo (versión {version}, {len(html)//1024} KB) · {out}')
