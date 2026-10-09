import pathlib
d=pathlib.Path(__file__).parent
css=(d/'style.css').read_text()
js='\n'.join((d/f).read_text() for f in ['grammar1.js','grammar2.js','vocab.js','verbs.js','extras.js','app.js'])
html=f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>English Review AEF</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<header class="topbar"><div class="topbar-in">
  <div class="brand"><div class="logo">EN</div><span>English Review <span class="muted small">AEF</span></span></div>
  <nav class="tabs" id="tabs"></nav>
  <div class="streak-pill" id="streakPill">🔥 0</div>
  <button class="icon-btn" id="gear" title="Ajustes" aria-label="Ajustes">⚙️</button>
</div></header>
<main id="app"></main>
<nav class="bottomnav" id="bnav"></nav>
<canvas id="confetti"></canvas>
<script>
{js}
</script>
</body>
</html>
'''
out=pathlib.Path.home()/'Desktop'/'ingles-aef.html'
out.write_text(html)
(d/'dist').mkdir(exist_ok=True)
(d/'dist'/'index.html').write_text(html)
print(out, len(html)//1024, 'KB')
