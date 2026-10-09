/* ===================== STORE: progreso basado en eventos =====================
   Fuente de verdad:
   - S.base: progreso anterior al registro de eventos (migrado de v1) y lo compactado; stat/miss/days + until.
   - S.ev:   cada respuesta es un evento {i, t, day, k, ok, tp?, q?, g?, x?}; las tareas son {i, t, day, task}.
   - S.cards: cajas Leitner {b, due, u}; S.settings (+ _u). Ambos se fusionan por fecha de cambio (u).
   S.stat, S.miss y S.days se RECALCULAN (derive) y no se guardan: así sumar eventos de varios
   dispositivos da el mismo resultado que si todo se hubiera respondido en uno solo.
*/
const KEY='aef-review-v1', IMGKEY='aef-review-imgs';
function loadJSON(k){ try{ return JSON.parse(localStorage.getItem(k)) || null; }catch(e){ return null; } }
function saveJSON(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
const RAW = loadJSON(KEY) || {};
const S = Object.assign({settings:{}, cards:{}, ev:[]}, RAW);
S.settings = Object.assign({theme:'auto', cur:1, rate:0.9, daily:15, includeNext:false, voice:'', _u:0}, S.settings);
if(!S.device) S.device = Math.random().toString(36).slice(2,8);
/* migración v1 → v2: el progreso que ya tenías pasa a ser la línea base */
if(!S.base) S.base = {stat:RAW.stat||{}, miss:RAW.miss||{}, days:RAW.days||{}, until:''};
delete S.stat; delete S.miss; delete S.days;
const IMG = loadJSON(IMGKEY) || {};

let SEQ = 0;
const SYNC = {onEvents(){}, onCard(){}, onSettings(){}, onReset(){}};   // sync.js los reemplaza
const evIds = new Set(S.ev.map(e=>e.i));

function save(){ const {stat, miss, days, ...keep} = S; if(!saveJSON(KEY, keep)){ compact(60); saveJSON(KEY, (({stat,miss,days,...k})=>k)(S)); } }
const clone = o => JSON.parse(JSON.stringify(o||{}));

/* ---------- cálculo de estadísticas ---------- */
function blankDay(){ return {q:0, ok:0, tasks:{}, cards:0}; }
function applyEvent(e, stat, miss, days){
  const d = days[e.day] = days[e.day] || blankDay(); d.tasks = d.tasks || {};
  if(e.task){ d.tasks[e.task] = true; return; }
  const st = stat[e.k] = stat[e.k] || {n:0, ok:0}; st.n++; if(e.ok) st.ok++;
  if(e.tp){ const s2 = stat[e.tp] = stat[e.tp] || {n:0, ok:0}; s2.n++; if(e.ok) s2.ok++; }
  if(e.ok){ if(miss[e.k]){ miss[e.k]--; if(miss[e.k]<=0) delete miss[e.k]; } }
  else miss[e.k] = (miss[e.k]||0) + 2;
  d.q++; if(e.ok) d.ok++; if(e.q==='flash') d.cards = (d.cards||0) + 1;
}
/* orden canónico: fecha, hora, id. Así compactar (cortar por fecha) equivale a procesar un prefijo de la misma secuencia */
const byTime = (a,b) => (a.day<b.day?-1:a.day>b.day?1:0) || a.t-b.t || (a.i<b.i?-1:a.i>b.i?1:0);
function derive(){
  const B = S.base, stat = clone(B.stat), miss = {...(B.miss||{})}, days = clone(B.days);
  S.ev.sort(byTime);
  for(const e of S.ev){ if(B.until && e.day < B.until) continue; applyEvent(e, stat, miss, days); }
  S.stat = stat; S.miss = miss; S.days = days;
}
derive();

/* compacta los eventos de más de `keepDays` días dentro de la línea base (limita el tamaño local) */
function compact(keepDays=180){
  const cut = addDays(TODAY, -keepDays); const old = S.ev.filter(e=>e.day < cut);
  if(!old.length) return false;
  const B = S.base, stat = clone(B.stat), miss = {...(B.miss||{})}, days = clone(B.days);
  old.sort(byTime).forEach(e=>{ if(!(B.until && e.day < B.until)) applyEvent(e, stat, miss, days); });
  S.base = {stat, miss, days, until: cut > (B.until||'') ? cut : B.until};
  S.ev = S.ev.filter(e=>e.day >= cut); evIds.clear(); S.ev.forEach(e=>evIds.add(e.i));
  derive(); return true;
}

/* ---------- escritura ---------- */
function newId(t){ return S.device+'.'+t.toString(36)+'.'+(SEQ++).toString(36); }
function push(e){
  S.ev.push(e); evIds.add(e.i); applyEvent(e, S.stat, S.miss, S.days);
  if(S.ev.length > 15000) compact(180);
  save(); SYNC.onEvents([e]);
}
/* registra una respuesta. info: {tp: tema, q: tipo, g: lo que respondiste, x: lo correcto} */
function record(key, ok, info={}){
  const t = Date.now(), e = {i:newId(t), t, day:TODAY, k:key, ok:ok?1:0};
  if(info.tp) e.tp = info.tp; if(info.q) e.q = info.q;
  if(!ok){ if(info.g!=null && String(info.g).trim()) e.g = String(info.g).trim().slice(0,80); if(info.x!=null) e.x = String(info.x).replace(/<[^>]+>/g,'').slice(0,80); }
  push(e);
}
function markTask(task){ if(day().tasks[task]) return; const t=Date.now(); push({i:newId(t), t, day:TODAY, task}); }
function setCard(key, b, due){ S.cards[key] = {b, due, u:Date.now()}; save(); SYNC.onCard(key, S.cards[key]); }
function touchSettings(){ S.settings._u = Date.now(); save(); SYNC.onSettings(S.settings); }

/* ---------- lectura ---------- */
const day = (d=TODAY) => (S.days[d] = S.days[d] || blankDay());
function acc(key){ const st=S.stat[key]; return st && st.n ? st.ok/st.n : null; }
function practiced(d){ const x=S.days[d]; return !!(x && (x.q>0 || x.cards>0)); }
function streak(){ let n=0, d=TODAY; if(!practiced(d)) d=addDays(d,-1); while(practiced(d)){ n++; d=addDays(d,-1); } return n; }
function bestStreak(){ const ds=Object.keys(S.days).filter(practiced).sort(); let best=0,cur=0,prev=null; ds.forEach(d=>{ cur = (prev && addDays(prev,1)===d) ? cur+1 : 1; best=Math.max(best,cur); prev=d; }); return best; }

/* ---------- fusión (sincronización, importación) ---------- */
function mergeRemote({events=[], cards={}, settings=null, base=null}={}){
  let changed = false;
  if(base && (base.until||'') >= (S.base.until||'') && JSON.stringify(base)!==JSON.stringify(S.base)){ S.base = base; changed = true; }
  for(const e of events){ if(e && e.i && !evIds.has(e.i)){ S.ev.push(e); evIds.add(e.i); changed = true; } }
  for(const k in cards){ const r=cards[k], l=S.cards[k]; if(r && (!l || (r.u||0) > (l.u||0))){ S.cards[k] = r; changed = true; } }
  if(settings && (settings._u||0) > (S.settings._u||0)){ S.settings = Object.assign({}, S.settings, settings); applyTheme(); changed = true; }
  if(changed){ derive(); save(); }
  return changed;
}
/* suma una línea base a otra (para unir el progreso anterior de dos dispositivos) */
function addBase(a, b){
  const out = {stat:clone(a.stat), miss:{...(a.miss||{})}, days:clone(a.days), until:a.until||b.until||''};
  for(const k in b.stat||{}){ const s=out.stat[k]=out.stat[k]||{n:0,ok:0}; s.n+=b.stat[k].n; s.ok+=b.stat[k].ok; }
  for(const k in b.miss||{}) out.miss[k] = Math.max(out.miss[k]||0, b.miss[k]);
  for(const d in b.days||{}){ const x=b.days[d], o=out.days[d]=out.days[d]||blankDay(); o.q+=x.q||0; o.ok+=x.ok||0; o.cards=(o.cards||0)+(x.cards||0); o.tasks=Object.assign({}, o.tasks, x.tasks); }
  return out;
}
function exportData(){ const {stat, miss, days, ...keep} = S; return {app:'english-review', v:2, exported:new Date().toISOString(), ...keep}; }
function importData(o){
  if(o && o.v===2){ mergeRemote({events:o.ev||[], cards:o.cards||{}, settings:o.settings, base:null}); if(o.base) S.base = addBase(S.base, o.base); }
  else if(o && (o.stat || o.days)){ S.base = addBase(S.base, {stat:o.stat, miss:o.miss, days:o.days}); Object.assign(S.cards, o.cards||{}); }
  else throw new Error('formato');
  derive(); save();
}
function resetAll(silent){ S.base={stat:{}, miss:{}, days:{}, until:''}; S.ev=[]; S.cards={}; S.snap=null; evIds.clear(); derive(); save(); if(!silent) SYNC.onReset(); }
applyTheme();
