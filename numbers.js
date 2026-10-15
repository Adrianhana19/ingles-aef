/* ===================== NÚMEROS: cardinales, ordinales, años, fechas, horas y precios ===================== */
/* NUM:inicio — funciones puras (probadas en test6.js). Cada número se describe como:
   {kind, key:'n:<tipo>:<valor>', show (cómo se ve), say (forma recomendada), alts (todas las formas aceptadas), rule}  */
const NUM_ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const NUM_TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const NUM_KINDS = {
  card:  {label:'Cantidades',  rule:'Los números grandes se leen por grupos: 3,500 → three thousand five hundred. En EE. UU. no se dice "and" (two hundred forty-five). Cuidado con 13 (thirTEEN, acento al final) y 30 (THIRty, acento al inicio).'},
  ord:   {label:'Ordinales', rule:'Los ordinales casi siempre terminan en -th (fourth, twelfth), pero 1, 2 y 3 son especiales: first, second, third; también twenty-first, thirty-second. Se escriben 1st, 2nd, 3rd, 4th.'},
  year:  {label:'Años',     rule:'Los años se dicen en dos partes: 19‖98 → nineteen ninety-eight. Si la segunda parte es 0X se dice "oh": 1905 → nineteen oh five. Del 2000 al 2009: two thousand five. Desde 2010: twenty ten, twenty twenty-six.'},
  date:  {label:'Fechas',   rule:'En EE. UU. el mes va primero: 10/15/2026 es October 15th. El día se dice con ordinal (October fifteenth) y el año en dos partes (twenty twenty-six).'},
  time:  {label:'Horas',    rule:'La forma más común es decir los números tal cual: 7:45 → seven forty-five; 10:05 → ten oh five. También: a quarter after/past (y cuarto), half past (y media), a quarter to (menos cuarto). Hora en punto: nine o\'clock.'},
  price: {label:'Precios',  rule:'Los precios se dicen corto: $4.99 → four ninety-nine, o completo: four dollars and ninety-nine cents. $0.75 → seventy-five cents. $1,200 → twelve hundred dollars.'},
};
const under100 = n => n < 20 ? NUM_ONES[n] : NUM_TENS[Math.floor(n/10)] + (n%10 ? '-' + NUM_ONES[n%10] : '');
const under1000 = (n, and) => { const h = Math.floor(n/100), r = n%100; return [h ? NUM_ONES[h] + ' hundred' : '', r ? (h && and ? 'and ' : '') + under100(r) : ''].filter(Boolean).join(' ') || 'zero'; };
function numWords(n, and=false){
  if(n === 0) return 'zero';
  const parts = []; let rest = n;
  for(const [v, name] of [[1e9,'billion'], [1e6,'million'], [1e3,'thousand']]) if(rest >= v){ parts.push(under1000(Math.floor(rest/v), and) + ' ' + name); rest %= v; }
  if(rest) parts.push((parts.length && and && rest < 100 ? 'and ' : '') + under1000(rest, and));
  return parts.join(' ');
}
function ordWords(n){
  const w = numWords(n), m = w.match(/^(.*?)([a-z]+)$/), base = m[2];
  const irr = {one:'first', two:'second', three:'third', five:'fifth', eight:'eighth', nine:'ninth', twelve:'twelfth'};
  return m[1] + (irr[base] || (base.endsWith('y') ? base.slice(0,-1) + 'ieth' : base + 'th'));
}
const ordSuffix = n => (n%100 >= 11 && n%100 <= 13) ? 'th' : ({1:'st', 2:'nd', 3:'rd'}[n%10] || 'th');
const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/* formas de decir un año; la primera es la recomendada */
function yearWords(y){
  const hi = Math.floor(y/100), lo = y%100, full = numWords(y);
  if(y >= 2000 && y <= 2009) return lo ? [`two thousand ${NUM_ONES[lo]}`, `two thousand and ${NUM_ONES[lo]}`, `twenty oh ${NUM_ONES[lo]}`] : ['two thousand'];
  if(y >= 2010 && y <= 2099) return [`twenty ${under100(lo)}`, `two thousand ${under100(lo)}`, `two thousand and ${under100(lo)}`];
  if(lo === 0) return [`${under100(hi)} hundred`, full];
  if(lo < 10) return [`${under100(hi)} oh ${NUM_ONES[lo]}`, `${under100(hi)} hundred and ${NUM_ONES[lo]}`, full];
  return [`${under100(hi)} ${under100(lo)}`, full];
}
/* formas de decir una cantidad: con "a" en vez de "one" y, entre 1,100 y 9,900 redondos, "thirty-five hundred" */
function cardWords(n){
  const out = [numWords(n), numWords(n, true)];
  if(n >= 1100 && n < 10000 && n % 100 === 0 && n % 1000 !== 0) out.push(under100(n/100) + ' hundred');
  out.slice().forEach(w => { if(/^one (hundred|thousand|million)/.test(w)) out.push(w.replace(/^one /, 'a ')); });
  return [...new Set(out)];
}
function makeNum(kind, value){
  const K = NUM_KINDS[kind]; const it = {kind, key:`n:${kind}:${value}`, rule:K.rule, label:K.label};
  if(kind === 'card'){ const n = +value; const w = cardWords(n); return {...it, show:commas(n), say:w[0], alts:[...w, String(n), commas(n)]}; }
  if(kind === 'ord'){ const n = +value; return {...it, show:n + ordSuffix(n), say:ordWords(n), alts:[ordWords(n), n + ordSuffix(n), 'the ' + ordWords(n)]}; }
  if(kind === 'year'){ const y = +value, w = yearWords(y); return {...it, show:String(y), say:w[0], alts:[...w, String(y)]}; }
  if(kind === 'date'){
    const [ymd, fmt] = value.split('|'), [y, mo, d] = ymd.split('-').map(Number), M = MONTHS[mo-1], yw = yearWords(y), o = ordWords(d);
    const show = fmt === 's' ? `${mo}/${d}/${y}` : `${M} ${d}, ${y}`;
    const alts = []; yw.concat(String(y)).forEach(Y => { alts.push(`${M} ${o} ${Y}`, `${M} the ${o} ${Y}`, `the ${o} of ${M} ${Y}`, `${M} ${d} ${Y}`, `${M} ${d}${ordSuffix(d)} ${Y}`); });
    alts.push(`${mo}/${d}/${y}`);
    return {...it, show, say:`${M} ${o}, ${yw[0]}`, alts};
  }
  if(kind === 'time'){
    const [h, m] = value.split(':').map(Number), H = NUM_ONES[h], next = NUM_ONES[h % 12 + 1];
    const alts = [`${h}:${String(m).padStart(2,'0')}`];
    let say;
    if(m === 0){ say = `${H} o'clock`; alts.push(say, H, `${h} o'clock`); }
    else if(m < 10){ say = `${H} oh ${NUM_ONES[m]}`; alts.push(say, `${NUM_ONES[m]} after ${H}`, `${NUM_ONES[m]} past ${H}`); }
    else { say = `${H} ${under100(m)}`; alts.push(say);
      if(m === 15) alts.push(`a quarter after ${H}`, `quarter after ${H}`, `a quarter past ${H}`, `quarter past ${H}`);
      else if(m === 30) alts.push(`half past ${H}`);
      else if(m === 45) alts.push(`a quarter to ${next}`, `quarter to ${next}`, `a quarter of ${next}`);
      else if(m < 30) alts.push(`${under100(m)} after ${H}`, `${under100(m)} past ${H}`);
      else alts.push(`${under100(60-m)} to ${next}`); }
    return {...it, show:`${h}:${String(m).padStart(2,'0')}`, say, alts};
  }
  if(kind === 'price'){
    const cents = Math.round(+value * 100), D = Math.floor(cents/100), C = cents % 100;
    const dw = D === 1 ? 'one dollar' : `${numWords(D)} dollars`, cw = C === 1 ? 'one cent' : `${under100(C)} cents`;
    const show = '$' + commas(D) + (C ? '.' + String(C).padStart(2,'0') : '');
    let say, alts = [show, show.replace(/,/g,''), (D + C/100).toFixed(2)];
    if(!C){ say = dw; alts.push(dw, ...cardWords(D).map(w => w + (D === 1 ? ' dollar' : ' dollars'))); }
    else if(!D){ say = cw; alts.push(cw); }
    else { say = `${numWords(D)} ${C < 10 ? 'oh ' + NUM_ONES[C] : under100(C)}`; alts.push(say, `${dw} and ${cw}`, `${dw} ${cw}`); }
    return {...it, show, say, alts};
  }
  throw new Error('tipo de número desconocido: ' + kind);
}
const numFromKey = key => { const [, kind, ...rest] = key.split(':'); return makeNum(kind, rest.join(':')); };
/* normaliza lo que dice el micrófono o lo que escribes, para comparar sin importar la forma */
function normNum(s){
  return String(s).toLowerCase().replace(/[’‘`´]/g, "'")
    .replace(/o'clock|o’clock|oclock/g, ' oclock ')
    .replace(/(\d),(?=\d{3}\b)/g, '$1')
    .replace(/(\d+)(st|nd|rd|th)\b/g, '$1')
    .replace(/\$/g, ' ')
    .replace(/(\d)[:.](\d)/g, '$1 $2').replace(/(\d)\/(\d)/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(and|the|of|dollars?|cents?|at|it's|its|is)\b/g, ' ')
    .replace(/\ba\b/g, 'one').replace(/\bo\b/g, 'oh')
    .replace(/\s+/g, ' ').trim();
}
function checkNumber(item, text){
  const u = normNum(text); if(!u) return false;
  return item.alts.some(a => normNum(a) === u) || normNum(item.show) === u;
}
/* genera un número de un tipo, con rangos pensados para A2 */
function genNumber(kind, r){
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pickOf = arr => arr[Math.floor(r() * arr.length)];
  if(kind === 'card'){
    const x = r();
    const n = x < 0.2 ? (r() < 0.5 ? int(13,19) : int(3,9) * 10) : x < 0.4 ? int(21,99) : x < 0.6 ? int(101,999) : x < 0.8 ? (r() < 0.4 ? int(11,99) * 100 : int(1001,9999)) : x < 0.95 ? int(10,999) * 1000 + (r() < 0.5 ? 0 : int(1,999)) : int(1,9) * 1000000 + (r() < 0.5 ? 500000 : 0);
    return makeNum('card', n);
  }
  if(kind === 'ord') return makeNum('ord', r() < 0.85 ? int(1,31) : pickOf([40, 50, 100]));
  if(kind === 'year'){ const x = r(); return makeNum('year', x < 0.15 ? int(2000,2009) : x < 0.3 ? pickOf([1900, 1905, 1808, 1950, 2000, 1907, 1800]) : x < 0.65 ? int(1950,1999) : x < 0.9 ? int(2010,2035) : int(1800,1949)); }
  if(kind === 'date'){ const y = r() < 0.6 ? int(1990,2030) : int(1950,1989), mo = int(1,12), d = int(1, [31,28,31,30,31,30,31,31,30,31,30,31][mo-1]);
    return makeNum('date', `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}|${r() < 0.3 ? 's' : 'm'}`); }
  if(kind === 'time') return makeNum('time', `${int(1,12)}:${String(r() < 0.75 ? pickOf([0,5,10,15,20,30,40,45,50,55]) : int(1,59)).padStart(2,'0')}`);
  if(kind === 'price'){ const x = r(); const v = x < 0.15 ? int(5,95) / 100 : x < 0.35 ? int(1,99) : x < 0.85 ? int(1,49) + pickOf([0.99, 0.50, 0.25, 0.75, 0.05, int(1,98)/100]) : int(1,30) * 100; return makeNum('price', v.toFixed(2)); }
}
/* NUM:fin */
/* fecha de hoy en inglés, con día de la semana (para la tarjeta de Hoy) */
function todayNumber(){
  const d = parseYmd(TODAY), it = makeNum('date', `${TODAY}|m`), wd = WEEKDAYS[d.getDay()];
  return {...it, show:`${wd}, ${MONTHS[d.getMonth()]} ${d.getDate()}${ordSuffix(d.getDate())}, ${d.getFullYear()}`, say:`${wd}, ${it.say}`};
}
/* peso por tipo según cuánto fallas en él (eventos n:<tipo>:…) */
function numKindWeights(){
  const acc = {}; S.ev.forEach(e => { if(e.k && e.k.startsWith('n:')){ const k = e.k.split(':')[1]; const a = acc[k] = acc[k] || {n:0, ok:0}; a.n++; if(e.ok) a.ok++; } });
  return Object.fromEntries(Object.keys(NUM_KINDS).map(k => [k, acc[k] && acc[k].n >= 3 ? 1 + (1 - acc[k].ok / acc[k].n) * 1.5 : 1.2]));
}
/* preguntas de números: oral (say), escuchar y escribir en dígitos (listen) o escribir en palabras (type) */
function qNumber(item, mode){
  const tag = 'Números · ' + item.label;
  if(mode === 'say') return {key:item.key, tag, kind:'say', label:'Dilo en voz alta', num:item, say:item.say};
  if(mode === 'listen') return {key:item.key, tag, kind:'listen', label:'Escucha y escribe el número (en cifras)', num:item, answers:[item.show], say:item.say, showAns:item.show};
  return {key:item.key, tag, kind:'type', label:'Escríbelo en palabras', num:item, prompt:`<span class="num-inline">${esc(item.show)}</span>`, answers:[item.say], showAns:item.say, say:item.say, exp:item.rule};
}
function buildNumberSession(r, n=10){
  const w = numKindWeights(), kinds = Object.keys(NUM_KINDS), out = [];
  const oral = Math.round(n * 0.7);
  for(let i = 0; i < n; i++){
    const oralQ = i < oral;
    const pool = oralQ ? kinds : kinds.filter(k => k !== 'date' && k !== 'ord');       // lo escrito: números, años, horas y precios
    const kind = weightedPick(pool, k => w[k], r);
    let item = genNumber(kind, r), guard = 0; while(out.some(q => q.key === item.key) && guard++ < 10) item = genNumber(kind, r);
    out.push(qNumber(item, oralQ ? 'say' : (i === n - 1 ? 'type' : 'listen')));
  }
  return shuffle(out, r);
}
