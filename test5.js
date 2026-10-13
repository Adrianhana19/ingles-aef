/* Pruebas de la selección "nuevo o repaso" y del dominio (bloque SELECCION de core.js): node test5.js */
const fs = require('fs');
const core = fs.readFileSync(__dirname + '/core.js', 'utf8');
const block = core.slice(core.indexOf('/* SELECCION:inicio'), core.indexOf('/* SELECCION:fin */'));
eval(['grammar1.js','grammar2.js'].map(f => fs.readFileSync(__dirname + '/' + f, 'utf8')).join('\n').replace(/^const /gm, 'var '));
GRAMMAR.forEach(t => { t.parsed = t.items.map((_, i) => ({key: t.id + '#' + i, topic: t.id})); });
const TOPIC = Object.fromEntries(GRAMMAR.map(t => [t.id, t]));
const TOPIC_OF = it => TOPIC[it.topic];
const api = new Function('TOPIC_OF', block + '\nreturn {buildHistory, mastery, masteryWeight, recencyWeight, pickNewOrReview, grammarOptions, daysBetween};')(TOPIC_OF);
const {buildHistory, mastery, masteryWeight, recencyWeight, pickNewOrReview, grammarOptions, daysBetween} = api;

let fails = 0;
const ok = (name, cond, extra='') => { if(cond) console.log('✓', name, extra); else { fails++; console.log('✗', name, extra); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

/* 1) curva de dominio */
ok('dominio ≤ 50% → probabilidad normal', masteryWeight(0) === 1 && masteryWeight(0.5) === 1);
ok('dominio 75% → 0,25', near(masteryWeight(0.75), 0.25));
ok('dominio 90% → 0,04', near(masteryWeight(0.9), 0.04));
ok('dominio 100% → casi nulo (0,02)', masteryWeight(1) === 0.02);

/* 2) dominio a partir del historial */
const ev = (k, ok, day, tp) => ({i: k + day + Math.random(), t: Date.parse(day), day, k, ok: ok ? 1 : 0, ...(tp ? {tp} : {})});
const H1 = buildHistory([ev('2-1a#0',1,'2026-10-01','2-1a'), ev('2-1a#0',1,'2026-10-02','2-1a'), ev('2-1a#0',1,'2026-10-03','2-1a'), ev('2-1a#1',0,'2026-10-03','2-1a'), ev('2-1a#2',1,'2026-10-13','2-1a')], {stat:{}}, '2026-10-13');
ok('3 aciertos seguidos en un ejercicio → 100%', mastery(H1, '2-1a#0') === 1);
ok('1 de 3 → 33%', near(mastery(H1, '2-1a#1'), 0));
ok('los eventos de hoy no cuentan (el reto no cambia en el día)', !H1['2-1a#2']);
ok('tema: 3 de 10 respuestas bien → 30%', near(mastery(H1, '2-1a'), 0.3));
ok('palabra en caja 5 de flashcards → 100%', mastery({}, 'w:v-food:apple', 5) === 1);
ok('progreso importado (sin fecha) aporta como máximo 80%', near(mastery(buildHistory([], {stat:{'2-1a':{n:20, ok:20}}}, '2026-10-13'), '2-1a'), 0.8));
ok('repaso: nada de los últimos 2 días', recencyWeight('2026-10-11', '2026-10-13') === 0 && recencyWeight('2026-10-06', '2026-10-13') === 1);

/* 3) simulación de 30 días de reto (parte de gramática) con un estudiante que acierta más con la práctica */
function simulate(days = 30, perDay = 7, seed = 11){
  let s = seed; const r = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const st = t => t.book === 'B' ? 'base' : t.book === 1 ? 'visto' : t.file === 1 ? 'actual' : 'proximo';
  const tps = GRAMMAR.filter(t => st(t) !== 'proximo');
  const topicBase = t => ({actual:4, visto:2.4, base:1.4}[st(t)]);
  const events = [], exposures = {}, lastDay = {};
  const out = []; let win = {n:0, rep:0, close:0, dom:0}; const total = {n:0, newN:0, close:0, dom:0};
  for(let d = 1; d <= days; d++){
    const day = '2026-11-' + String(d).padStart(2, '0');
    const H = buildHistory(events, {stat:{}}, day), usedT = {};
    let pool = tps.flatMap(t => t.parsed);
    for(let k = 0; k < perDay; k++){
      const it = pickNewOrReview(pool, r, grammarOptions(tps, H, day, usedT, topicBase)); if(!it) break;
      pool = pool.filter(x => x !== it); usedT[it.topic] = (usedT[it.topic] || 0) + 1;
      const isNew = !H[it.key];
      if(!isNew){ win.rep++; if(daysBetween(lastDay[it.key], day) <= 2) { win.close++; total.close++; } }
      if(!isNew && mastery(H, it.key) === 1){ win.dom++; total.dom++; }
      win.n++; total.n++; if(isNew) total.newN++;
      const p = Math.min(0.97, 0.55 + 0.15 * (exposures[it.key] || 0));
      events.push(ev(it.key, r() < p, day, it.topic)); exposures[it.key] = (exposures[it.key] || 0) + 1; lastDay[it.key] = day;
    }
    if(d % 10 === 0){ out.push(`días ${d-9}–${d}: ${Math.round(win.rep / win.n * 100)}% repaso (${win.close} vistas hace ≤ 2 días, ${win.dom} ya dominadas al 100%)`); win = {n:0, rep:0, close:0, dom:0}; }
  }
  return {out, total, distinct: Object.keys(exposures).length, available: tps.reduce((a, t) => a + t.parsed.length, 0)};
}
const sim = simulate();
console.log('\nSimulación de 30 días (gramática, 7 por día):\n  ' + sim.out.join('\n  '));
console.log(`  Ejercicios distintos vistos: ${sim.distinct} de ${sim.available} (antes: 167 con 8 por día)`);
const newPct = sim.total.newN / sim.total.n;
ok('entre 60% y 80% de lo elegido es nuevo', newPct >= 0.6 && newPct <= 0.8, `(${Math.round(newPct * 100)}%)`);
ok('ningún repaso de algo visto hace ≤ 2 días', sim.total.close === 0);
ok('lo dominado al 100% sale en menos del 2%', sim.total.dom / sim.total.n < 0.02, `(${(sim.total.dom / sim.total.n * 100).toFixed(1)}%)`);

let late = []; for(let k = 1; k <= 8; k++){ const s2 = simulate(30, 7, k * 7919); late.push(...s2.out.slice(1).map(l => +l.match(/(\d+)% repaso/)[1])); }
const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;
ok('desde el día 11, el repaso promedia 30% (±5) en 8 simulaciones', Math.abs(lateAvg - 30) <= 5, `(${lateAvg.toFixed(1)}%)`);

console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fails ? 1 : 0);
