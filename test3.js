/* Pruebas del registro de eventos (store.js): node test3.js */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/store.js', 'utf8');
let fails = 0;
const eq = (name, a, b) => { const ok = JSON.stringify(a) === JSON.stringify(b); if(!ok){ fails++; console.log('✗', name, '\n  ', JSON.stringify(a), '\n  ', JSON.stringify(b)); } else console.log('✓', name); };

/* crea una instancia aislada de store.js con su propio localStorage y TODAY */
function makeStore(raw, today='2026-10-09'){
  const mem = {}; if(raw) mem['aef-review-v1'] = JSON.stringify(raw);
  const env = {
    localStorage: { getItem:k=>mem[k]??null, setItem:(k,v)=>{ mem[k]=String(v); } },
    TODAY: today,
    ymd: d => d.toISOString().slice(0,10),
    parseYmd: s => { const [y,m,d]=s.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); },
    applyTheme: ()=>{},
    hashStr: str => { let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return (h^=h>>>16)>>>0; }; },
  };
  env.addDays = (s,n) => { const d=env.parseYmd(s); d.setUTCDate(d.getUTCDate()+n); return env.ymd(d); };
  const api = new Function(...Object.keys(env), src + '\nreturn {S, record, markTask, mergeRemote, derive, compact, exportData, importData, setCard, addBase, setToday:t=>{}};')(...Object.values(env));
  return {api, mem};
}
const pick = ({stat, miss, days}) => ({stat, miss, days});

/* respuestas de ejemplo */
const answers = [];
const keys = ['2-1a#0','2-1a#1','w:v-food:apple','v:v:go','2-4a#3'];
let t0 = Date.UTC(2026,9,1,15,0,0);
for(let i=0;i<40;i++){ const k=keys[i%keys.length]; answers.push({k, ok: (i*7)%3!==0, day:`2026-10-0${1+(i%8)}`, t:t0+i*60000, tp: k.includes('#')?k.split('#')[0]:undefined}); }

/* 1) un solo dispositivo */
const one = makeStore(null).api;
const evs = answers.map((a,i)=>({i:'AAA.'+i, t:a.t, day:a.day, k:a.k, ok:a.ok?1:0, ...(a.tp?{tp:a.tp}:{})}));
one.mergeRemote({events: evs});
const single = pick(one.S);

/* 2) dos dispositivos con eventos intercalados que se sincronizan entre sí */
const A = makeStore(null).api, Bd = makeStore(null).api;
A.mergeRemote({events: evs.filter((_,i)=>i%2===0)});
Bd.mergeRemote({events: evs.filter((_,i)=>i%2===1)});
A.mergeRemote({events: Bd.S.ev}); Bd.mergeRemote({events: A.S.ev});
eq('dispositivo A = un solo dispositivo', pick(A.S), single);
eq('dispositivo B = un solo dispositivo', pick(Bd.S), single);
A.mergeRemote({events: Bd.S.ev});
eq('fusionar dos veces no duplica', A.S.ev.length, evs.length);

/* 3) migración desde v1: el progreso anterior queda como línea base */
const v1 = {settings:{cur:2}, stat:{'2-1a':{n:10,ok:7}}, miss:{'w:v-food:apple':4}, days:{'2026-09-30':{q:10,ok:7,tasks:{reto:true},cards:3}}, cards:{'w:v-food:apple':{b:2,due:'2026-10-01'}}};
const M = makeStore(v1).api;
eq('migración conserva stat', M.S.stat, v1.stat);
eq('migración conserva miss', M.S.miss, v1.miss);
eq('migración conserva days', M.S.days, v1.days);
eq('migración conserva ajustes y cartas', [M.S.settings.cur, M.S.cards['w:v-food:apple'].b], [2, 2]);
M.record('w:v-food:apple', true, {q:'flash'});
eq('un acierto baja el error pendiente (4 → 3)', M.S.miss['w:v-food:apple'], 3);
M.record('w:v-food:apple', false, {q:'flash', g:'pera', x:'manzana'});
const last = M.S.ev[M.S.ev.length-1];
eq('el error guarda lo que escribiste y lo correcto', [last.g, last.x, M.S.miss['w:v-food:apple']], ['pera','manzana',5]);

/* 4) compactar mantiene los totales */
const C = makeStore(null, '2026-10-09').api; C.mergeRemote({events: evs});
const before = pick(C.S); C.compact(3);
eq('compactar conserva stat/miss/days', pick(C.S), before);
eq('compactar deja solo eventos recientes', C.S.ev.every(e=>e.day >= '2026-10-06'), true);

/* 5) tareas y estado guardado sin datos derivados */
const T = makeStore(null).api; T.markTask('reto'); T.markTask('reto');
eq('una tarea se marca una sola vez', T.S.ev.filter(e=>e.task).length, 1);
eq('lo guardado no incluye datos derivados', ['stat','miss','days'].some(k=>k in T.exportData()), false);

/* 6) importar una copia de la versión anterior */
const I = makeStore(null).api;
I.record('2-1a#0', true, {tp:'2-1a'});
const old = {stat:{'2-1a':{n:10,ok:8}}, miss:{'w:v-food:apple':2}, days:{'2026-10-05':{q:10,ok:8,tasks:{reto:true}}}, cards:{'w:v-food:apple':{b:3,due:'2026-10-12'}}};
eq('importar devuelve true la primera vez', I.importData(old), true);
eq('importar suma los temas a lo existente', I.S.stat['2-1a'], {n:11, ok:9});
eq('importar trae los días, errores y flashcards', [I.S.days['2026-10-05'].q, I.S.miss['w:v-food:apple'], I.S.cards['w:v-food:apple'].b], [10, 2, 3]);
eq('lo importado queda pendiente de subir a la cuenta', !!I.S.pendingBase, true);
eq('importar el mismo archivo otra vez no duplica', [I.importData(old), I.S.stat['2-1a'].n], [false, 11]);

console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fails?1:0);
