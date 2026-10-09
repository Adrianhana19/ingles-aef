/* ===================== APP ===================== */
(function(){
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const app = $('#app');

function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function parseYmd(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(s,n){ const d=parseYmd(s); d.setDate(d.getDate()+n); return ymd(d); }
const params = new URLSearchParams(location.search);
const TODAY = /^\d{4}-\d{2}-\d{2}$/.test(params.get('fecha')||'') ? params.get('fecha') : ymd(new Date());

/* RNG con semilla (mismo día = mismos ejercicios) */
function hashStr(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return (h^=h>>>16)>>>0; }; }
function makeRng(seed){ let a=hashStr(String(seed))(); return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const freeRng = makeRng(Date.now()+':'+Math.random());
function shuffle(arr, r=freeRng){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pick(arr, r=freeRng){ return arr[Math.floor(r()*arr.length)]; }
function weightedPick(items, wfn, r){ const ws=items.map(wfn); const tot=ws.reduce((a,b)=>a+b,0); let x=r()*tot; for(let i=0;i<items.length;i++){ x-=ws[i]; if(x<=0) return items[i]; } return items[items.length-1]; }

/* ---------- almacenamiento ---------- */
const KEY='aef-review-v1', IMGKEY='aef-review-imgs';
function loadJSON(k){ try{ return JSON.parse(localStorage.getItem(k)) || null; }catch(e){ return null; } }
function saveJSON(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
const S = Object.assign({settings:{}, days:{}, stat:{}, miss:{}, cards:{}}, loadJSON(KEY)||{});
S.settings = Object.assign({theme:'auto', cur:1, rate:0.9, daily:15, includeNext:false, voice:''}, S.settings);
const save = () => saveJSON(KEY, S);
const IMG = loadJSON(IMGKEY) || {};
const day = (d=TODAY) => (S.days[d] = S.days[d] || {q:0, ok:0, tasks:{}});

function record(key, ok){
  const st = S.stat[key] = S.stat[key] || {n:0, ok:0};
  st.n++; if(ok) st.ok++;
  if(ok){ if(S.miss[key]){ S.miss[key]--; if(S.miss[key]<=0) delete S.miss[key]; } }
  else S.miss[key] = (S.miss[key]||0) + 2;
  const d = day(); d.q++; if(ok) d.ok++;
  save();
}
function recordTopic(id, ok){ const st = S.stat[id] = S.stat[id] || {n:0, ok:0}; st.n++; if(ok) st.ok++; save(); }
function acc(key){ const st=S.stat[key]; return st && st.n ? st.ok/st.n : null; }

/* ---------- tema ---------- */
function applyTheme(){ const t=S.settings.theme; if(t==='auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
applyTheme();

/* ---------- datos ---------- */
const BOOKNAME = {B:'Base · AEF 1', 1:'A1++ · AEF 1', 2:'A2 · AEF 2', X:'Extra'};
const BOOKCHIP = {B:'bB', 1:'b1', 2:'b2', X:'bX'};
function status(book, file){
  if(book==='X') return 'extra';
  if(book==='B') return 'base';
  if(book===1) return 'visto';
  if(file < S.settings.cur) return 'visto';
  if(file === S.settings.cur) return 'actual';
  return 'proximo';
}
const STLABEL = {base:'Base (por repasar)', visto:'Visto', actual:'Actual', proximo:'Próximo', extra:'Extra'};
const stChip = (b,f) => { const s=status(b,f); return `<span class="chip st-${s}">${s==='actual'?'📍 ':s==='visto'?'✓ ':''}${STLABEL[s]}</span>`; };
const eligible = (b,f) => { const s=status(b,f); return s!=='proximo' || S.settings.includeNext; };
function unitLabel(t){ const m=t.id.match(/^(.)-(\d+)([a-z])$/); return m[1]==='B' ? 'F'+m[2] : m[2]+m[3].toUpperCase(); }

/* gramática: parseo de ítems */
function parseItem(str, topic, idx){
  const type = str[0]; let body = str.slice(2), exp = '';
  const hx = body.indexOf(' ## '); if(hx>=0){ exp = body.slice(hx+4); body = body.slice(0,hx); }
  const it = {type, topic:topic.id, key: topic.id+'#'+idx, exp};
  if(type==='m'){ const m=body.match(/\[(.+?)\]/); it.opts=m[1].split('|'); it.ans=it.opts[0]; it.pre=body.slice(0,m.index); it.post=body.slice(m.index+m[0].length); }
  else if(type==='g'){ const m=body.match(/\{(.+?)\}/); it.answers=m[1].split('|'); it.pre=body.slice(0,m.index); it.post=body.slice(m.index+m[0].length); }
  else if(type==='e'){ const m=body.match(/\*(.+?)>(.+?)\*/); it.bad=m[1]; it.fix=m[2]; it.pre=body.slice(0,m.index); it.post=body.slice(m.index+m[0].length);
    let fixed = (it.pre + (it.fix==='—'?'':it.fix) + it.post).replace(/\s+/g,' ').trim(); it.correct = fixed.charAt(0).toUpperCase()+fixed.slice(1); }
  else if(type==='t'){ const [es,en]=body.split(' = '); it.es=es; it.answers=en.split('|'); it.sentence=it.answers[0]; }
  else if(type==='o'){ it.sentence=body; }
  return it;
}
GRAMMAR.forEach(t => { t.parsed = t.items.map((s,i)=>parseItem(s,t,i)); });
const TOPIC = Object.fromEntries(GRAMMAR.map(t=>[t.id,t]));

/* vocabulario */
/* trabalenguas e idioms (extras.js) */
const TW = TWISTERS.trim().split('\n').map(l=>{ const [t,snd,link,es,tip]=l.split('|'); return {t,snd,link,es,tip}; });
const IDS = IDIOMS.trim().split('\n').map(l=>{ const [e,w,es,lit,ex,exEs,ve]=l.split('|'); return {e,w,es,lit,ex,exEs,ve:ve||''}; });
VOCAB.push({id:'v-idioms', book:'X', file:0, title:'Idioms', es:'Expresiones idiomáticas', icon:'💡', photo:false, w:IDS.map(i=>[i.e,i.w,i.es,i.ex].join('|')).join('\n')});
/* rotación diaria sin repetir: orden fijo mezclado + índice por día */
function dayIndex(){ return Math.round(parseYmd(TODAY).getTime()/86400000); }
function rot(arr, salt, off=0){ const order=shuffle(arr.map((_,i)=>i), makeRng(salt)); const n=arr.length; return arr[order[(((dayIndex()+off)%n)+n)%n]]; }

const WORDS = [];
VOCAB.forEach(g => {
  g.words = g.w.trim().split('\n').map(l => {
    const [e,w,es,ex,wiki] = l.split('|');
    const o = {e, w, es, ex:ex||'', g:g.id, key:'w:'+g.id+':'+w,
      wiki: wiki==='-' ? '' : (wiki || (g.photo ? w.charAt(0).toUpperCase()+w.slice(1) : ''))};
    if(!g.photo && wiki && wiki!=='-') o.wiki = wiki;
    WORDS.push(o); return o;
  });
});
const GROUP = Object.fromEntries(VOCAB.map(g=>[g.id,g]));
const WORD = Object.fromEntries(WORDS.map(w=>[w.key,w]));
const spellable = w => /^[a-zA-Z' -]+$/.test(w.w) && w.w.length<=22;

/* verbos */
const VERBS = IRREG.trim().split('\n').map(l=>{ const [b,p,pp,es,lvl,e]=l.split('|'); return {b,p,pp,es,lvl:+lvl,e,key:'v:'+b}; });
const REGS = REG.trim().split('\n').map(l=>{ const [b,p,s,es]=l.split('|'); return {b,p,s,es,key:'r:'+b}; });
const VERB = Object.fromEntries(VERBS.map(v=>[v.key,v]));
const alts = s => { const parts=s.split(' / ').map(x=>x.trim()); return [s, s.replace(/ \/ /g,'/'), ...parts]; };

/* ---------- comparación de respuestas ---------- */
function norm(s){
  s = String(s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"');
  s = s.replace(/\bcan't\b/g,'can not').replace(/\bcannot\b/g,'can not').replace(/\bwon't\b/g,'will not')
       .replace(/n't\b/g,' not').replace(/'re\b/g,' are').replace(/'m\b/g,' am').replace(/'ve\b/g,' have')
       .replace(/'ll\b/g,' will').replace(/'d\b/g,' would')
       .replace(/\b(he|she|it|that|what|where|who|there|here|how|when|why)'s\b/g,'$1 is')
       .replace(/\bmom\b/g,'mother').replace(/\bdad\b/g,'father');
  return s.replace(/[.,!?¿¡;:"()]/g,' ').replace(/\s+/g,' ').trim();
}
function lev(a,b){ if(a===b) return 0; const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let prev=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){ const cur=[i]; for(let j=1;j<=n;j++) cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); prev=cur; } return prev[n]; }
function checkTyped(input, answers){
  const u = norm(input); if(!u) return {ok:false};
  for(const a of answers){ if(norm(a)===u) return {ok:true, exact:true}; }
  for(const a of answers){ const n=norm(a); const tol = n.length>14 ? 2 : n.length>5 ? 1 : 0; if(tol && lev(n,u)<=tol) return {ok:true, exact:false, best:a}; }
  return {ok:false};
}

/* ---------- audio ---------- */
let VOICES=[];
function loadVoices(){ if(!('speechSynthesis' in window)) return; VOICES = speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang)); }
if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(){
  if(S.settings.voice){ const v=VOICES.find(v=>v.name===S.settings.voice); if(v) return v; }
  return VOICES.find(v=>/en[-_]US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny|Allison|Ava/i.test(v.name)) || VOICES.find(v=>/en[-_]US/i.test(v.lang)) || VOICES[0];
}
function speak(text, slow){
  if(!('speechSynthesis' in window)){ toast('Tu navegador no tiene voz disponible'); return; }
  const clean = String(text).replace(/<[^>]+>/g,'').replace(/\s*(→|↔)\s*/g,', ').replace(/\s\/\s/g,', ').replace(/\s–\s/g,', ').replace(/_+/g,'blank').replace(/\(.*?\)/g,'');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean); u.lang='en-US'; const v=pickVoice(); if(v) u.voice=v;
  u.rate = slow ? Math.max(0.5, S.settings.rate-0.3) : S.settings.rate;
  speechSynthesis.speak(u);
}
const spk = (t, cls='icon-btn') => `<button class="${cls}" data-say="${esc(t)}" title="Escuchar" aria-label="Escuchar">🔊</button>`;
document.addEventListener('click', e => { const b=e.target.closest('[data-say]'); if(b){ e.stopPropagation(); speak(b.dataset.say, b.dataset.slow==='1'); } });

/* ---------- fotos (Wikipedia) ---------- */
const pending = new Set(); let imgTimer=null; const waiters=[];
function requestImages(titles){
  titles.filter(t=>t && !(t in IMG)).forEach(t=>pending.add(t));
  return new Promise(res=>{ waiters.push(res); clearTimeout(imgTimer); imgTimer=setTimeout(flushImages, 30); });
}
async function flushImages(){
  const list=[...pending]; pending.clear(); const ws=waiters.splice(0);
  for(let i=0;i<list.length;i+=45){
    const chunk=list.slice(i,i+45);
    try{
      const url='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=480&redirects=1&titles='+encodeURIComponent(chunk.join('|'));
      const r = await fetch(url); const j = await r.json(); const q=j.query||{};
      const map={}; chunk.forEach(t=>map[t]=t);
      (q.normalized||[]).forEach(n=>{ for(const k in map) if(map[k]===n.from) map[k]=n.to; });
      (q.redirects||[]).forEach(n=>{ for(const k in map) if(map[k]===n.from) map[k]=n.to; });
      const thumbs={}; Object.values(q.pages||{}).forEach(p=>{ if(p.thumbnail) thumbs[p.title]=p.thumbnail.source; });
      chunk.forEach(t=>{ IMG[t]=thumbs[map[t]]||''; });
      saveJSON(IMGKEY, IMG);
    }catch(e){ /* sin internet: se queda el emoji */ }
  }
  ws.forEach(f=>f()); paintImages();
}
function paintImages(root=document){
  $$('img[data-wiki]', root).forEach(img=>{
    const u = IMG[img.dataset.wiki];
    if(u && !img.src){ img.onload=()=>img.classList.add('ok'); img.onerror=()=>img.remove(); img.src=u; }
  });
}
function imgTag(w, cls=''){ return w.wiki ? `<img data-wiki="${esc(w.wiki)}" alt="${esc(w.w)}" class="${cls}" loading="lazy">` : ''; }
function loadImagesFor(words){ const t=words.map(w=>w.wiki).filter(Boolean); if(!t.length) return; if(t.every(x=>x in IMG)){ paintImages(); return; } requestImages(t); }

/* ---------- toast & confetti ---------- */
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }
function confetti(){
  const c=$('#confetti'), x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight;
  const cols=['#5b4cf0','#ff8a3d','#16a36a','#e5484d','#ffc53d','#0ea5e9'];
  const P=Array.from({length:140},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,r:4+Math.random()*6,c:pick(cols),vx:-2+Math.random()*4,vy:2+Math.random()*4,a:Math.random()*6}));
  let f=0; (function loop(){ x.clearRect(0,0,c.width,c.height); P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.05; p.a+=.1; x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.fillStyle=p.c; x.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6); x.restore(); }); if(++f<200) requestAnimationFrame(loop); else x.clearRect(0,0,c.width,c.height); })();
}

/* ---------- racha ---------- */
function practiced(d){ const x=S.days[d]; return !!(x && (x.q>0 || x.cards>0)); }
function streak(){ let n=0, d=TODAY; if(!practiced(d)) d=addDays(d,-1); while(practiced(d)){ n++; d=addDays(d,-1); } return n; }
function bestStreak(){ const ds=Object.keys(S.days).filter(practiced).sort(); let best=0,cur=0,prev=null; ds.forEach(d=>{ cur = (prev && addDays(prev,1)===d) ? cur+1 : 1; best=Math.max(best,cur); prev=d; }); return best; }
function updatePill(){ const s=streak(); $('#streakPill').innerHTML = `🔥 ${s}`; $('#streakPill').title = `Racha: ${s} día(s) seguidos`; }

/* ================== GENERADORES DE PREGUNTAS ================== */
/* Tipos: mc, type, order, err, match, listen, img */
function qFromItem(it, r=freeRng, allowVariant=true){
  const t = TOPIC[it.topic]; const base = {key:it.key, topic:it.topic, tag:unitLabel(t)+' · '+t.title};
  if(it.type==='m'){
    const promptTxt = (it.pre+it.post).replace(/[\s?.!]/g,'') ? `${esc(it.pre)}<span class="gap">___</span>${esc(it.post)}` : 'Elige la opción correcta:';
    return {...base, kind:'mc', label:'Elige la opción correcta', prompt:promptTxt, fill:{pre:it.pre,post:it.post}, opts:shuffle(it.opts,r), ans:it.ans, exp:it.exp, say:(it.pre+it.ans+it.post)};
  }
  if(it.type==='g') return {...base, kind:'type', label:'Completa el espacio', prompt:`${esc(it.pre)}<span class="gap">___</span>${esc(it.post)}`, fill:{pre:it.pre,post:it.post}, answers:it.answers, exp:it.exp, say:(it.pre+it.answers[0]+it.post).replace(/\(.*?\)\s?/g,'')};
  if(it.type==='e') return {...base, kind:'err', label:'Toca la palabra incorrecta', pre:it.pre, bad:it.bad, fix:it.fix==='—'?'(quitar)':it.fix, post:it.post, correct:it.correct, exp:it.exp, say:it.correct};
  if(it.type==='t'){
    const v = allowVariant ? r() : 0;
    if(v>0.78) return {...base, kind:'listen', label:'Dictado: escribe lo que escuchas', answers:it.answers.slice(0,1).concat(it.answers), say:it.sentence, hint:it.es};
    if(v>0.6) return {...base, kind:'order', label:'Ordena la oración', words:tokens(it.sentence), sentence:it.sentence, hint:it.es, say:it.sentence};
    return {...base, kind:'type', label:'Traduce al inglés', prompt:`<span class="muted">🇸🇻</span> ${esc(it.es)}`, answers:it.answers, say:it.sentence, showAns:it.answers[0]};
  }
  if(it.type==='o'){
    if(allowVariant && r()>0.75) return {...base, kind:'listen', label:'Dictado: escribe lo que escuchas', answers:[it.sentence], say:it.sentence};
    return {...base, kind:'order', label:'Ordena la oración', words:tokens(it.sentence), sentence:it.sentence, say:it.sentence};
  }
}
function tokens(sentence){ return sentence.replace(/[.?!]$/,'').split(' '); }

function qVocab(w, r=freeRng, kind){
  const g = GROUP[w.g]; const pool = (g.words.length>=4 ? g.words : WORDS).filter(x=>x!==w);
  const tag = 'Vocabulario · '+g.title;
  const kinds = ['img','meaning','listenword']; if(spellable(w)) kinds.push('spell','spell');
  kind = kind || pick(kinds, r);
  const d3 = shuffle(pool, r).filter((x,i,a)=>a.findIndex(y=>y.w===x.w)===i).slice(0,3);
  if(kind==='img') return {key:w.key, tag, kind:'mc', label:'¿Qué es?', visual:w, prompt:'', opts:shuffle([w.w,...d3.map(x=>x.w)],r), ans:w.w, say:w.w, exp:w.es};
  if(kind==='meaning') return {key:w.key, tag, kind:'mc', label:'¿Qué significa?', prompt:`<b>${esc(w.w)}</b> ${spk(w.w)}`, opts:shuffle([w.es,...d3.map(x=>x.es)],r), ans:w.es, say:w.w, exp:w.ex};
  if(kind==='listenword') return {key:w.key, tag, kind:'mc', label:'Escucha y elige', listen:true, prompt:'', opts:shuffle([w.w,...d3.map(x=>x.w)],r), ans:w.w, say:w.w, exp:w.es};
  return {key:w.key, tag, kind:'type', label:'Escribe en inglés', visual:w, prompt:`${esc(w.es)}`, answers:[w.w], say:w.w, exp:w.ex};
}
function qIdiom(w, r=freeRng){
  if(r()<0.5) return qVocab(w, r, 'meaning');
  const d3 = shuffle(GROUP['v-idioms'].words.filter(x=>x!==w), r).slice(0,3);
  return {key:w.key, tag:'Idioms', kind:'mc', label:'¿Qué idiom corresponde?', prompt:`“${esc(w.es)}”`, opts:shuffle([w.w,...d3.map(x=>x.w)],r), ans:w.w, say:w.ex||w.w, exp:w.ex};
}
const idiomWord = i => WORD['w:v-idioms:'+i.w];
function qMatch(words, r=freeRng){
  const ws = words.slice(0,5);
  return {key:'match', tag:'Vocabulario', kind:'match', label:'Empareja inglés ↔ español', pairs:ws.map(w=>({a:w.w, b:w.es, key:w.key})), left:shuffle(ws.map(w=>w.w),r), right:shuffle(ws.map(w=>w.es),r)};
}
function qVerb(v, r=freeRng, kind){
  const tag='Verbos irregulares';
  kind = kind || pick(['past','past','pp','pp','mcpp','meaning'], r);
  if(kind==='past') return {key:v.key, tag, kind:'type', label:'Escribe el pasado', prompt:`${v.e} <b>${v.b}</b> → <span class="gap">___</span> <span class="muted small">(${esc(v.es)})</span>`, answers:alts(v.p), say:`${v.b}, ${v.p}`, exp:`${v.b} → ${v.p} → ${v.pp}`};
  if(kind==='pp') return {key:v.key, tag, kind:'type', label:'Escribe el participio', prompt:`${v.e} <b>${v.b}</b> → ${esc(v.p)} → <span class="gap">___</span>`, answers:alts(v.pp), say:`${v.b}, ${v.p}, ${v.pp}`, exp:`${v.b} → ${v.p} → ${v.pp}`};
  if(kind==='mcpp'){
    const set=new Set([v.pp.split(' / ')[0]]); const cands=[v.p.split(' / ')[0], v.b+'ed', v.b.replace(/e$/,'')+'ed', v.b+'en', v.p.split(' / ')[0]+'en', v.b];
    for(const c of shuffle(cands,r)){ if(set.size>=3) break; set.add(c); }
    const opts=[...set];
    return {key:v.key, tag, kind:'mc', label:'Elige el participio (have + ___)', prompt:`I have <span class="gap">___</span> <span class="muted small">(${v.b})</span>`, fill:{pre:'I have ',post:''}, opts:shuffle(opts,r), ans:opts[0], say:`${v.b}, ${v.p}, ${v.pp}`, exp:`${v.b} → ${v.p} → ${v.pp}`};
  }
  const d3 = shuffle(VERBS.filter(x=>x!==v),r).slice(0,3);
  return {key:v.key, tag, kind:'mc', label:'¿Qué significa?', prompt:`<b>${v.b}</b> – ${esc(v.p)} – ${esc(v.pp)} ${spk(v.b+', '+v.p+', '+v.pp)}`, opts:shuffle([v.es,...d3.map(x=>x.es)],r), ans:v.es, say:v.b, exp:''};
}
function qEd(v, r=freeRng){
  const L={t:'/t/  (worked)', d:'/d/  (played)', id:'/ɪd/  (wanted)'};
  return {key:v.key, tag:'Verbos regulares · -ed', kind:'mc', label:'¿Cómo suena la terminación -ed?', prompt:`<b>${v.p}</b> ${spk(v.p)} <span class="muted small">(${esc(v.es)})</span>`, opts:[L.t,L.d,L.id], ans:L[v.s], say:v.p, exp:'Regla: después de /t/ o /d/ → /ɪd/; después de sonidos sordos (p, k, s, sh, ch, f) → /t/; el resto → /d/.'};
}
function qFromKey(key, r=freeRng){
  if(key.startsWith('w:')){ const w=WORD[key]; return w ? qVocab(w,r) : null; }
  if(key.startsWith('v:')){ const v=VERB[key]; return v ? qVerb(v,r) : null; }
  if(key.startsWith('r:')){ const v=REGS.find(x=>x.key===key); return v ? qEd(v,r) : null; }
  const [tid, i] = key.split('#'); const t=TOPIC[tid]; if(!t || !t.parsed[+i]) return null; return qFromItem(t.parsed[+i], r);
}

/* ---------- selección diaria ---------- */
/* "foto" del progreso al inicio del día: así el mismo día siempre genera los mismos ejercicios */
function snap(){
  if(!S.snap || S.snap.date!==TODAY){ S.snap={date:TODAY, miss:{...S.miss}, acc:Object.fromEntries(GRAMMAR.map(t=>[t.id,acc(t.id)]))}; save(); }
  return S.snap;
}
function topicWeight(t){
  const s=status(t.book,t.file); let w = s==='actual'?4 : s==='visto'?2.4 : s==='base'?1.4 : 0.8;
  const a=snap().acc[t.id] ?? null; if(a!==null) w *= 1 + (1-a)*1.5; else w *= 1.15;
  return w;
}
function eligibleTopics(){ return GRAMMAR.filter(t=>eligible(t.book,t.file)); }
function eligibleWords(){ return WORDS.filter(w=>{ const g=GROUP[w.g]; return eligible(g.book,g.file); }); }
function eligibleVerbs(){ return VERBS; }

function buildDaily(){
  const r = makeRng('reto:'+TODAY), N = S.settings.daily;
  const nG = Math.round(N*0.5), nV = Math.round(N*0.2), nB = Math.round(N*0.2);
  const qs=[], usedT={}, used=new Set(), M=snap().miss;
  const tps = eligibleTopics();
  // errores pendientes primero (máx. 3)
  Object.keys(M).sort((a,b)=>M[b]-M[a] || (a<b?-1:1)).slice(0,3).forEach(k=>{ const q=qFromKey(k,r); if(q){ qs.push(q); used.add(k); } });
  let guard=0;
  while(qs.length < nG && guard++<400){
    const t = weightedPick(tps, x=>topicWeight(x)/(1+(usedT[x.id]||0)*2), r);
    const it = pick(t.parsed, r); if(used.has(it.key)) continue;
    used.add(it.key); usedT[t.id]=(usedT[t.id]||0)+1; qs.push(qFromItem(it, r));
  }
  const ws = shuffle(eligibleWords(), r);
  const wgt = w => { const g=GROUP[w.g]; const s=status(g.book,g.file); return (s==='actual'?3:s==='visto'?2:1.2) * (M[w.key]?2:1); };
  const chosenW=[]; guard=0;
  while(chosenW.length < nV && guard++<300){ const w=weightedPick(ws,wgt,r); if(!chosenW.includes(w) && !used.has(w.key)) chosenW.push(w); }
  chosenW.forEach(w=>qs.push(qVocab(w,r)));
  const vs = shuffle(eligibleVerbs(), r); const chosenV=[]; guard=0;
  while(chosenV.length < nB && guard++<300){ const v=weightedPick(vs, v=>(M[v.key]?3:1)*(v.lvl===1?1.3:1), r); if(!chosenV.includes(v) && !used.has(v.key)) chosenV.push(v); }
  chosenV.forEach((v,i)=> qs.push(i===0 && r()>0.5 ? qEd(pick(REGS,r),r) : qVerb(v,r)));
  // emparejar con un grupo del día
  const gw = shuffle(GROUP[pick(ws,r).g].words, r);
  const out = shuffle(qs, r).slice(0, N-2);
  out.splice(Math.floor(out.length/2), 0, qMatch(gw, r));
  const idw = idiomWord(r()<0.5 ? rot(IDS,'idioms') : pick(IDS, r));
  out.splice(Math.floor(out.length*0.8), 0, qIdiom(idw, r));
  return out;
}
function dailyWords(n=10){
  const r = makeRng('words:'+TODAY);
  const pool = eligibleWords();
  const due = pool.filter(w=>S.cards[w.key] && S.cards[w.key].due<=TODAY).sort((a,b)=>S.cards[a.key].b-S.cards[b.key].b);
  const fresh = shuffle(pool.filter(w=>!S.cards[w.key]), r).sort((a,b)=>{ const sa=status(GROUP[a.g].book,GROUP[a.g].file), sb=status(GROUP[b.g].book,GROUP[b.g].file); const o={actual:0,visto:1,extra:2,base:2,proximo:3}; return o[sa]-o[sb]; });
  // mezcla: hasta 6 por repasar + nuevas (mezcladas entre grupos)
  const freshMix = shuffle(fresh.slice(0, 60), r);
  return due.slice(0,6).concat(freshMix).slice(0,n);
}
function dailyVerbs(n=5){
  const r = makeRng('verbs:'+TODAY);
  const M = snap().miss;
  const miss = VERBS.filter(v=>M[v.key]).sort((a,b)=>M[b.key]-M[a.key]).slice(0,2);
  return miss.concat(shuffle(VERBS.filter(v=>!miss.includes(v)), r)).slice(0,n);
}
function topicOfDay(){ const r=makeRng('topic:'+TODAY); return weightedPick(eligibleTopics(), topicWeight, r); }

/* ================== RUTAS ================== */
const TABS = [['hoy','🏠','Hoy'],['ejercicios','🎯','Ejercicios'],['vocabulario','🖼️','Vocabulario'],['verbos','🔁','Verbos'],['gramatica','📘','Gramática'],['progreso','📈','Progreso']];
function renderTabs(cur){ const h=TABS.map(([id,ic,l])=>`<button class="tab ${cur===id?'on':''}" data-go="${id}"><span class="ic">${ic}</span><span>${l}</span></button>`).join(''); $('#tabs').innerHTML=h; $('#bnav').innerHTML=h; }
document.addEventListener('click', e => { const b=e.target.closest('[data-go]'); if(b){ e.preventDefault(); go(b.dataset.go); } });
$('#gear').onclick = () => go('ajustes');
function go(h){ if(location.hash==='#'+h) route(); else location.hash=h; }
let SESSION=null; // quiz o flashcards en curso
function route(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  const h = decodeURIComponent(location.hash.slice(1)) || 'hoy'; const [v, arg] = h.split('/');
  const tabFor = {quiz:'ejercicios', flash:'vocabulario', ajustes:'progreso'};
  renderTabs(tabFor[v] || v); updatePill();
  window.scrollTo(0,0);
  const views = {hoy:vHome, ejercicios:vExercises, vocabulario:vVocab, verbos:vVerbs, gramatica:vGrammar, progreso:vProgress, ajustes:vSettings, quiz:vQuiz, flash:vFlash};
  (views[v] || vHome)(arg);
}
window.addEventListener('hashchange', route);

/* ================== HOY ================== */
function vHome(){
  const d = day(); const s = streak(); const tasks=d.tasks||{};
  const fecha = parseYmd(TODAY).toLocaleDateString('es-SV',{weekday:'long', day:'numeric', month:'long'});
  const fechaTxt = fecha.charAt(0).toUpperCase()+fecha.slice(1);
  const hour = new Date().getHours(); const saludo = hour<12?'¡Buenos días!':hour<19?'¡Buenas tardes!':'¡Buenas noches!';
  const t = topicOfDay(); const tw = rot(TW, 'tw', TWOFF); const idm = rot(IDS, 'idioms');
  const doneN = ['words','verbs','reto'].filter(k=>tasks[k]).length;
  const task = (k, ic, bg, title, sub, act) => `<div class="task ${tasks[k]?'done':''}" data-act="${act}"><div class="tic" style="background:${bg}">${ic}</div><div><b>${title}</b><div class="muted small">${sub}</div></div><span class="check">${tasks[k]?'✅':'▶️'}</span></div>`;
  app.innerHTML = `<div class="view">
  <div class="hero"><div class="deco">🗽</div>
    <p class="small" style="margin:0">${fechaTxt}</p>
    <h1>${saludo} Let's practice.</h1>
    <p>Estás en <b>AEF 2 · File ${S.settings.cur}</b>. Hoy tienes ${3-doneN} tarea(s) pendiente(s).</p>
    <div class="row" style="margin-top:14px;gap:22px">
      <div class="stat"><b>🔥 ${s}</b><span class="small">días de racha</span></div>
      <div class="stat"><b>${d.q}</b><span class="small">respuestas hoy</span></div>
      <div class="stat"><b>${d.q?Math.round(d.ok/d.q*100):0}%</b><span class="small">aciertos hoy</span></div>
    </div>
    <div class="row" style="margin-top:18px"><button class="btn lg" data-act="reto">🎯 Empezar el reto del día</button></div>
  </div>
  <div class="section-title"><h2>Plan de hoy</h2><span class="muted small">${doneN}/3 completadas · cambia cada día</span></div>
  <div class="grid g3">
    ${task('words','🖼️','var(--primary-soft)','Palabras del día','10 flashcards con foto y audio','words')}
    ${task('verbs','🔁','var(--accent-soft)','Verbos del día','5 verbos irregulares · quiz de 10','verbs')}
    ${task('reto','🎯','var(--ok-soft)','Reto del día',`${S.settings.daily} preguntas mezcladas`,'reto')}
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><div class="row between"><span class="chip">🗣️ Trabalenguas del día</span><span class="chip st-actual">${esc(tw.snd)}</span></div>
      <h3 class="tw-text" id="twText">${tw.t.split(' ').map((x,i)=>`<span data-i="${i}">${esc(x)}</span>`).join(' ')}</h3>
      <p class="tw-link"><span class="tiny muted">LINKING</span><br>${esc(tw.link).replace(/‿/g,'<b class="lk">‿</b>')}</p>
      <p class="muted small">${esc(tw.es)}</p>
      <div class="row"><button class="btn sm alt" data-say="${esc(tw.t)}">🔊 Escuchar</button><button class="btn sm alt" data-say="${esc(tw.t)}" data-slow="1">🐢 Lento</button>${SR?'<button class="btn sm accent" id="twMic">🎤 Intentarlo</button>':''}<button class="btn sm alt" id="twNext" title="Otro trabalenguas">🔀 Otro</button></div>
      <div id="twRes"></div>
      <div class="tip small" style="margin-top:12px">💡 ${esc(tw.tip)}</div></div>
    <div class="card"><span class="chip">💡 Idiom del día</span>
      <h3 style="margin-top:12px;font-size:1.4rem">${idm.e} ${esc(idm.w)} ${spk(idm.w)}</h3>
      <p style="margin:0 0 4px"><b>${esc(idm.es)}</b></p>
      <p class="muted small">Literal: “${esc(idm.lit)}”</p>
      <ul class="exlist"><li><span><b>${esc(idm.ex)}</b><span class="es">${esc(idm.exEs)}</span></span>${spk(idm.ex)}</li></ul>
      <div class="ve">🇻🇪 ${idm.ve?`<b>En Venezuela:</b> “${esc(idm.ve)}”`:`<b>No hay un equivalente venezolano exacto.</b> En español: “${esc(idm.es)}”`}</div>
      <div class="row" style="margin-top:12px"><button class="btn sm" id="idQuiz">🎯 Practicar idioms</button><button class="btn sm alt" data-go="vocabulario/v-idioms">Ver los ${IDS.length}</button></div></div>
    <div class="card"><div class="row between"><span class="chip ${BOOKCHIP[t.book]}">📘 Tema del día · ${unitLabel(t)}</span>${stChip(t.book,t.file)}</div>
      <h3 style="margin-top:10px">${esc(t.title)}</h3><p class="muted">${esc(t.es)}</p>
      <div class="formula">${t.form.slice(0,2).map(([k,f])=>`<div><span class="sg ${k}">${k==='p'?'+':k==='n'?'−':k==='q'?'?':'i'}</span><span>${esc(f)}</span></div>`).join('')}</div>
      <div class="row"><button class="btn sm" data-topicq="${t.id}">Practicar</button><button class="btn sm alt" data-go="gramatica/${t.id}">Ver estructura</button></div></div>
  </div>
  <div class="section-title"><h2>Accesos rápidos</h2></div>
  <div class="grid g4">
    <div class="card mode-card" data-act="errors"><div class="e">🩹</div><b>Repasar errores</b><div class="muted small">${Object.keys(S.miss).length} pendientes</div></div>
    <div class="card mode-card" data-go="gramatica"><div class="e">📘</div><b>Consultar gramática</b><div class="muted small">${GRAMMAR.length} temas</div></div>
    <div class="card mode-card" data-go="vocabulario"><div class="e">🖼️</div><b>Vocabulario</b><div class="muted small">${WORDS.length} palabras</div></div>
    <div class="card mode-card" data-go="verbos"><div class="e">🔁</div><b>Verbos</b><div class="muted small">${VERBS.length} irregulares</div></div>
  </div></div>`;
  bindActs();
  $('#twNext').onclick=()=>{ TWOFF++; vHome(); };
  const mic=$('#twMic'); if(mic) mic.onclick=()=>tryTwister(tw);
  $('#idQuiz').onclick=()=>{ const seen=[]; for(let k=0;k>-12;k--){ const x=rot(IDS,'idioms',k); if(!seen.includes(x)) seen.push(x); }
    const ws=shuffle(seen).slice(0,7).map(idiomWord); const qs=ws.map(w=>qIdiom(w)); qs.splice(3,0,qMatch(shuffle(ws)));
    startQuiz(qs,{title:'Idioms recientes'}); };
}
function bindActs(root=app){
  $$('[data-act]', root).forEach(el=>el.onclick=()=>{
    const a=el.dataset.act;
    if(a==='reto') startQuiz(buildDaily(), {title:'Reto del día', task:'reto'});
    if(a==='words') startFlash(dailyWords(), {title:'Palabras del día', task:'words'});
    if(a==='verbs'){ const vs=dailyVerbs(); const r=makeRng('vq:'+TODAY); const qs=[]; vs.forEach(v=>{ qs.push(qVerb(v,r,'past')); qs.push(qVerb(v,r,pick(['pp','mcpp','meaning'],r))); }); startQuiz(shuffle(qs,r), {title:'Verbos del día', task:'verbs', intro:vs}); }
    if(a==='errors') startErrors();
  });
  $$('[data-topicq]', root).forEach(el=>el.onclick=()=>startTopicQuiz(el.dataset.topicq));
}
function startErrors(){
  const keys = Object.keys(S.miss).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,15);
  const qs = keys.map(k=>qFromKey(k)).filter(Boolean);
  if(!qs.length){ toast('¡No tienes errores pendientes! 🎉'); return; }
  startQuiz(shuffle(qs), {title:'Repaso de errores'});
}
function startTopicQuiz(id, n=10){
  const t=TOPIC[id]; let qs = shuffle(t.parsed).map(it=>qFromItem(it));
  // agrega variantes (dictado / ordenar) para completar
  const extra = t.parsed.filter(it=>it.type==='t'||it.type==='o').map(it=>({...qFromItem(it, freeRng, false), kind:'listen', label:'Dictado: escribe lo que escuchas', answers:it.answers||[it.sentence], say:it.sentence, hint:it.es}));
  qs = qs.concat(shuffle(extra)).slice(0, Math.max(n, Math.min(qs.length, n)));
  startQuiz(qs, {title:`${unitLabel(t)} · ${t.title}`, topic:id});
}

let TWOFF=0;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function tryTwister(tw){
  const btn=$('#twMic'), res=$('#twRes'); let rec;
  try{ rec=new SR(); }catch(e){ toast('Reconocimiento de voz no disponible'); return; }
  rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=4;
  if('speechSynthesis' in window) speechSynthesis.cancel();
  btn.disabled=true; btn.textContent='🎙️ Te escucho… ¡habla!'; res.innerHTML='';
  rec.onresult=e=>scoreTwister(tw, [...e.results[0]].map(a=>a.transcript));
  rec.onerror=e=>{ res.innerHTML=`<p class="small" style="color:var(--bad);margin:8px 0 0">${e.error==='not-allowed'||e.error==='service-not-allowed'?'Permite el uso del micrófono para practicar.':e.error==='no-speech'?'No te escuché. Intenta de nuevo, un poco más fuerte.':e.error==='network'?'El reconocimiento de voz necesita internet.':'No se pudo usar el micrófono ('+e.error+').'}</p>`; };
  rec.onend=()=>{ if(btn.isConnected){ btn.disabled=false; btn.textContent='🎤 Intentarlo'; } };
  try{ rec.start(); }catch(e){ rec.onend(); }
}
function scoreTwister(tw, alts){
  const orig = tw.t.split(' '); let best=null;
  alts.forEach(a=>{ const pool=norm(a).split(' ');
    const hit = orig.map(w=>norm(w).split(' ').filter(Boolean).every(tok=>{ const k=pool.findIndex(x=>x===tok || (tok.length>3 && lev(x,tok)<=1)); if(k>=0){ pool.splice(k,1); return true; } return false; }));
    const sc = hit.filter(Boolean).length/orig.length; if(!best || sc>best.sc) best={sc,hit,a}; });
  $$('#twText [data-i]').forEach(sp=>{ sp.className = best.hit[+sp.dataset.i] ? 'hit' : 'miss'; });
  const p=Math.round(best.sc*100);
  const msg = p>=90?'¡Excelente pronunciación! 🏆':p>=70?'¡Muy bien! 👏 Repite las palabras en rojo.':p>=40?'Vas bien 💪 Escucha en 🐢 lento y repite las palabras en rojo.':'Sigue practicando 🙂 Escucha primero en 🐢 lento.';
  $('#twRes').innerHTML = `<div class="feedback ${p>=70?'ok':'bad'}" style="margin-top:12px">${p}% · ${msg}<span class="exp">Escuché: “${esc(best.a)}”</span></div>`;
  const d=day(); d.tw=(d.tw||0)+1; save();
  if(p>=90) confetti();
}

/* ================== EJERCICIOS ================== */
function vExercises(){
  const book = S.exBook || 'all';
  const tps = GRAMMAR.filter(t=>book==='all' || String(t.book)===book);
  app.innerHTML = `<div class="view">
  <h1>🎯 Ejercicios</h1><p class="muted">El reto del día cambia cada día. También puedes practicar por tema o con modos especiales.</p>
  <div class="grid g4" style="margin-top:14px">
    <div class="card mode-card" data-act="reto"><div class="e">🎯</div><b>Reto del día</b><div class="muted small">${S.settings.daily} preguntas · ${day().tasks.reto?'✅ hecho':'pendiente'}</div></div>
    <div class="card mode-card" id="mMix"><div class="e">🎲</div><b>Mezcla rápida</b><div class="muted small">10 preguntas al azar</div></div>
    <div class="card mode-card" id="mListen"><div class="e">🎧</div><b>Listening</b><div class="muted small">Dictados y audio</div></div>
    <div class="card mode-card" id="mOrder"><div class="e">🧩</div><b>Ordenar oraciones</b><div class="muted small">Word order</div></div>
    <div class="card mode-card" id="mErr"><div class="e">🔎</div><b>Encuentra el error</b><div class="muted small">Errores típicos</div></div>
    <div class="card mode-card" id="mTr"><div class="e">🇸🇻➡️🇺🇸</div><b>Traducción</b><div class="muted small">Español → inglés</div></div>
    <div class="card mode-card" data-act="errors"><div class="e">🩹</div><b>Mis errores</b><div class="muted small">${Object.keys(S.miss).length} pendientes</div></div>
    <div class="card mode-card" id="mVocab"><div class="e">🖼️</div><b>Vocabulario mixto</b><div class="muted small">Imágenes y significado</div></div>
  </div>
  <div class="section-title"><h2>Practicar por tema</h2>
    <div class="filters" style="margin:0">${[['all','Todos'],['B','Base'],['1','A1++'],['2','A2']].map(([k,l])=>`<button class="fbtn ${book===k?'on':''}" data-book="${k}">${l}</button>`).join('')}</div></div>
  <div class="grid g3">${tps.map(t=>{ const a=acc(t.id); return `<div class="card topic-pick" data-topicq="${t.id}">
     <div class="row between"><span class="chip ${BOOKCHIP[t.book]}">${unitLabel(t)}</span>${stChip(t.book,t.file)}</div>
     <b>${esc(t.title)}</b><span class="muted small">${esc(t.es)}</span>
     <div class="bar"><i style="width:${a===null?0:Math.round(a*100)}%"></i></div><span class="tiny muted">${a===null?'Sin practicar':Math.round(a*100)+'% aciertos'}</span></div>`; }).join('')}</div></div>`;
  bindActs();
  $$('[data-book]').forEach(b=>b.onclick=()=>{ S.exBook=b.dataset.book; save(); vExercises(); });
  const all = () => eligibleTopics().flatMap(t=>t.parsed);
  $('#mMix').onclick=()=>{ const its=shuffle(all()).slice(0,7).map(it=>qFromItem(it)); const ws=shuffle(eligibleWords()).slice(0,2).map(w=>qVocab(w)); startQuiz(shuffle(its.concat(ws, [qVerb(pick(VERBS))])), {title:'Mezcla rápida'}); };
  $('#mListen').onclick=()=>{ const its=shuffle(all().filter(i=>i.type==='t'||i.type==='o')).slice(0,7).map(it=>({...qFromItem(it,freeRng,false), kind:'listen', label:'Dictado: escribe lo que escuchas', answers:it.answers||[it.sentence], say:it.sentence, hint:it.es}));
    const ws=shuffle(eligibleWords()).slice(0,3).map(w=>qVocab(w,freeRng,'listenword')); startQuiz(shuffle(its.concat(ws)), {title:'Listening'}); };
  $('#mOrder').onclick=()=>{ const its=shuffle(all().filter(i=>i.type==='t'||i.type==='o')).slice(0,10).map(it=>({...qFromItem(it,freeRng,false), kind:'order', label:'Ordena la oración', words:tokens(it.sentence), sentence:it.sentence, hint:it.es})); startQuiz(its,{title:'Ordenar oraciones'}); };
  $('#mErr').onclick=()=>startQuiz(shuffle(all().filter(i=>i.type==='e')).slice(0,10).map(it=>qFromItem(it)),{title:'Encuentra el error'});
  $('#mTr').onclick=()=>startQuiz(shuffle(all().filter(i=>i.type==='t')).slice(0,10).map(it=>qFromItem(it,freeRng,false)),{title:'Traducción'});
  $('#mVocab').onclick=()=>{ const ws=shuffle(eligibleWords()).slice(0,9); startQuiz(shuffle(ws.map(w=>qVocab(w))).concat([qMatch(shuffle(ws))]),{title:'Vocabulario mixto'}); };
}

/* ================== MOTOR DEL QUIZ ================== */
function startQuiz(qs, opts={}){
  qs = qs.filter(Boolean); if(!qs.length){ toast('No hay preguntas disponibles'); return; }
  SESSION = {type:'quiz', qs, i:0, score:0, wrong:[], opts, answered:false};
  go('quiz');
}
function vQuiz(){
  if(!SESSION || SESSION.type!=='quiz'){ go('ejercicios'); return; }
  const Q=SESSION; if(Q.i>=Q.qs.length) return quizResult();
  const q=Q.qs[Q.i]; Q.answered=false;
  const pct = Math.round(Q.i/Q.qs.length*100);
  let body='';
  const visual = q.visual ? `<div class="vimg" style="height:auto;min-height:150px;border-radius:18px;margin-bottom:12px">${imgTag(q.visual,'')}<span class="emo" style="font-size:5rem">${q.visual.e}</span></div>` : '';
  if(q.kind==='mc'){
    body = `${visual}${q.listen?`<button class="speak-big" data-say="${esc(q.say)}">🔊</button>`:''}
      ${q.prompt?`<div class="qprompt" id="qp">${q.prompt}</div>`:''}
      <div class="opts ${q.opts.every(o=>o.length<18)?'two':''}">${q.opts.map(o=>`<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
  } else if(q.kind==='type'){
    body = `${visual}<div class="qprompt" id="qp">${q.prompt}</div><input class="answer" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe tu respuesta…">`;
  } else if(q.kind==='listen'){
    body = `<div class="row" style="justify-content:center;gap:18px;margin-bottom:10px"><button class="speak-big" style="margin:0" data-say="${esc(q.say)}">🔊</button><button class="speak-big" style="margin:0;width:64px;height:64px;font-size:1.6rem;background:var(--accent)" data-say="${esc(q.say)}" data-slow="1" title="Lento">🐢</button></div>
      ${q.hint?`<p class="muted small" style="text-align:center">Pista: <span id="hint" class="hidden">${esc(q.hint)}</span><button class="btn sm alt" id="showHint">mostrar</button></p>`:''}
      <input class="answer" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe lo que escuchas…">`;
  } else if(q.kind==='order'){
    const first = q.words[0]; const ws = q.words.map((w,i)=> i===0 && w!=='I' && !/^I'/.test(w) ? w.charAt(0).toLowerCase()+w.slice(1) : w);
    q._display = ws; q._pool = shuffle(ws.map((w,i)=>({w,i}))); q._picked=[];
    body = `${q.hint?`<p class="muted">🇸🇻 ${esc(q.hint)}</p>`:''}<div class="tiles" id="tAns"></div><div class="tiles pool" id="tPool"></div>`;
  } else if(q.kind==='err'){
    const toks = [...q.pre.trim().split(' ').filter(Boolean).map(w=>({w,bad:false})), {w:q.bad, bad:true}, ...q.post.trim().split(' ').filter(Boolean).map(w=>({w,bad:false}))];
    q._toks=toks;
    body = `<div class="words">${toks.map((t,i)=>`<button data-t="${i}">${esc(t.w)}</button>`).join('')}</div>`;
  } else if(q.kind==='match'){
    q._done=0; q._miss=0; q._sel=null;
    body = `<div class="match"><div class="opts">${q.left.map(a=>`<button class="opt" data-l="${esc(a)}">${esc(a)}</button>`).join('')}</div><div class="opts">${q.right.map(b=>`<button class="opt" data-r="${esc(b)}">${esc(b)}</button>`).join('')}</div></div>`;
  }
  const canCheck = ['type','listen','order'].includes(q.kind);
  app.innerHTML = `<div class="view quiz">
    <div class="qhead"><button class="icon-btn" id="qx" title="Salir">✕</button><div class="bar"><i style="width:${pct}%"></i></div><b class="small">${Q.i+1}/${Q.qs.length}</b></div>
    <div class="qcard">
      <div class="qtype"><span>${q.label}</span>${q.tag?`<span class="chip">${esc(q.tag)}</span>`:''}</div>
      ${body}
      <div id="fb"></div>
      <div class="qfoot"><div class="row">${q.say && q.kind!=='listen' && !q.listen ? `<button class="btn sm alt" id="sayBtn" ${q.kind==='mc'||q.kind==='type'||q.kind==='err'||q.kind==='order'?'disabled title="Disponible al responder"':''}>🔊 Escuchar</button>`:''}
        ${q.topic?`<a class="btn sm alt" href="#gramatica/${q.topic}" target="_blank" title="Abre la estructura en otra pestaña">📘 Estructura</a>`:''}</div>
        <div class="row">${canCheck?`<button class="btn alt sm" id="skip">No sé</button><button class="btn" id="check">Comprobar</button>`:''}<button class="btn hidden" id="next">Siguiente →</button></div></div>
    </div></div>`;
  $('#qx').onclick=()=>{ SESSION=null; go('ejercicios'); };
  const sayBtn=$('#sayBtn'); if(sayBtn) sayBtn.onclick=()=>speak(q.say);
  $('#next').onclick=()=>{ Q.i++; vQuiz(); };
  if(q.visual) loadImagesFor([q.visual]);
  if(q.kind==='listen' || q.listen) setTimeout(()=>speak(q.say), 350);
  const sh=$('#showHint'); if(sh) sh.onclick=()=>{ $('#hint').classList.remove('hidden'); sh.remove(); };

  if(q.kind==='mc'){
    $$('.opt[data-o]').forEach(b=>b.onclick=()=>{
      if(Q.answered) return; const ok = b.dataset.o===q.ans;
      $$('.opt[data-o]').forEach(x=>{ x.disabled=true; if(x.dataset.o===q.ans) x.classList.add('right'); });
      if(!ok) b.classList.add('wrong');
      if(q.fill && $('#qp')) $('#qp').innerHTML = `${esc(q.fill.pre)}<span class="gap">${esc(q.ans)}</span>${esc(q.fill.post)}`;
      finish(ok, ok?'':`Respuesta: <b>${esc(q.ans)}</b>`);
    });
  }
  if(q.kind==='type' || q.kind==='listen'){
    const inp=$('#ans'); setTimeout(()=>inp.focus(),50);
    const doCheck=()=>{ if(Q.answered) return; const res=checkTyped(inp.value, q.answers); inp.disabled=true; inp.classList.add(res.ok?'right':'wrong');
      const shown = q.showAns || q.answers[0];
      if(q.fill && $('#qp')) $('#qp').innerHTML = `${esc(q.fill.pre)}<span class="gap">${esc(q.answers[0])}</span>${esc(q.fill.post)}`;
      let msg = res.ok ? (res.exact?'':`Casi perfecto. Revisa la ortografía: <b>${esc(res.best)}</b>`) : `Respuesta correcta: <b>${esc(q.kind==='listen'?q.say:shown)}</b>`;
      if(q.kind==='listen' && q.hint && res.ok) msg += `<span class="exp">🇸🇻 ${esc(q.hint)}</span>`;
      finish(res.ok, msg); };
    $('#check').onclick=doCheck; inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); doCheck(); } };
    $('#skip').onclick=()=>{ inp.value=''; doCheck(); };
  }
  if(q.kind==='order'){
    const draw=()=>{ $('#tAns').innerHTML=q._picked.map((t,k)=>`<button class="tile" data-k="${k}">${esc(t.w)}</button>`).join('') || '<span class="muted small">Toca las palabras en orden…</span>';
      $('#tPool').innerHTML=q._pool.map((t,k)=>`<button class="tile" data-p="${k}">${esc(t.w)}</button>`).join('');
      $$('[data-p]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; q._picked.push(q._pool.splice(+b.dataset.p,1)[0]); draw(); });
      $$('[data-k]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; q._pool.push(q._picked.splice(+b.dataset.k,1)[0]); draw(); }); };
    draw();
    const doCheck=()=>{ if(Q.answered) return; const got=q._picked.map(t=>t.w).join(' ').toLowerCase(); const ok = got===q._display.join(' ').toLowerCase();
      finish(ok, ok?`<span class="exp">${esc(q.sentence)}</span>`:`Orden correcto: <b>${esc(q.sentence)}</b>`); };
    $('#check').onclick=doCheck; $('#skip').onclick=()=>{ q._picked=[]; doCheck(); };
  }
  if(q.kind==='err'){
    $$('[data-t]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; const t=q._toks[+b.dataset.t]; const ok=t.bad;
      $$('[data-t]').forEach(x=>{ x.disabled=true; if(q._toks[+x.dataset.t].bad) x.classList.add('right'); }); if(!ok) b.classList.add('wrong');
      finish(ok, `Corrección: <b>${esc(q.bad)}</b> → <b>${esc(q.fix || '')}</b><span class="exp">✅ ${esc(q.correct)}</span>`); });
  }
  if(q.kind==='match'){
    const pairOf = a => q.pairs.find(p=>p.a===a);
    $$('[data-l]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('gone')) return; $$('[data-l]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); q._sel=b.dataset.l; speak(b.dataset.l); });
    $$('[data-r]').forEach(b=>b.onclick=()=>{ if(!q._sel || b.classList.contains('gone')) return; const p=pairOf(q._sel); const L=$(`[data-l="${CSS.escape(q._sel)}"]`);
      if(p.b===b.dataset.r){ [L,b].forEach(x=>{ x.classList.remove('sel'); x.classList.add('right'); setTimeout(()=>x.classList.add('gone'),250); }); q._sel=null; q._done++;
        if(q._done===q.pairs.length){ const ok=q._miss<=1; finish(ok, ok?`¡Todo emparejado! (${q._miss} error)`:`Tuviste ${q._miss} errores. ¡Repasa estas palabras!`); } }
      else { q._miss++; b.classList.add('wrong'); setTimeout(()=>b.classList.remove('wrong'),400); record(p.key,false); } });
  }

  function finish(ok, msg){
    Q.answered=true; if(ok) Q.score++; else Q.wrong.push(q);
    if(q.kind!=='match') record(q.key, ok);
    if(q.topic) recordTopic(q.topic, ok);
    const exp = q.exp && !msg.includes(q.exp) ? `<span class="exp">💡 ${q.exp}</span>` : '';
    $('#fb').innerHTML = `<div class="feedback ${ok?'ok':'bad'}">${ok?pick(['¡Excelente! 🎉','¡Muy bien! 👏','¡Correcto! ✅','Great job! 🌟','Perfect! 💯']):'Ups… 😅'} ${msg?`<span class="exp">${msg}</span>`:''}${exp}</div>`;
    ['check','skip'].forEach(id=>{ const x=$('#'+id); if(x) x.classList.add('hidden'); });
    const sb=$('#sayBtn'); if(sb){ sb.disabled=false; sb.title=''; }
    if(q.say && q.kind!=='match') speak(q.say);
    const nx=$('#next'); nx.classList.remove('hidden'); nx.textContent = Q.i+1>=Q.qs.length ? 'Ver resultado 🏁' : 'Siguiente →'; nx.focus();
  }
}
document.addEventListener('keydown', e=>{ if(e.key==='Enter' && SESSION && SESSION.type==='quiz' && SESSION.answered && document.activeElement?.id!=='next'){ const n=$('#next'); if(n && !n.classList.contains('hidden')){ e.preventDefault(); n.click(); } } });

function quizResult(){
  const Q=SESSION, n=Q.qs.length, p=Math.round(Q.score/n*100);
  if(Q.opts.task){ const d=day(); d.tasks[Q.opts.task]=true; d.best = Math.max(d.best||0, p); }
  save(); updatePill();
  const big = p>=90?'🏆':p>=70?'🌟':p>=50?'💪':'📚';
  const msg = p>=90?'¡Increíble! Dominas este contenido.':p>=70?'¡Muy bien! Sigue así.':p>=50?'Vas bien, pero repasa tus errores.':'Repasa la estructura y vuelve a intentarlo.';
  app.innerHTML = `<div class="view quiz"><div class="qcard result">
    <div class="big">${big}</div><h1>${Q.score} / ${n}</h1><p class="muted">${esc(Q.opts.title||'')} · ${p}% · ${msg}</p>
    <div class="bar" style="max-width:360px;margin:10px auto 20px"><i style="width:${p}%"></i></div>
    ${Q.wrong.length?`<div style="text-align:left"><h3>Para repasar</h3><ul class="exlist">${Q.wrong.map(q=>`<li><span>${q.kind==='match'?'Emparejar palabras':q.kind==='err'?esc(q.correct):q.kind==='order'||q.kind==='listen'?esc(q.say):q.kind==='mc'?(q.prompt? (q.fill? esc(q.fill.pre)+'<b>'+esc(q.ans)+'</b>'+esc(q.fill.post) : '<b>'+esc(q.ans)+'</b>') : '<b>'+esc(q.ans)+'</b>'):(q.fill? esc(q.fill.pre)+'<b>'+esc(q.answers[0])+'</b>'+esc(q.fill.post) : (q.prompt.replace(/<[^>]+>/g,'')+' → <b>'+esc(q.showAns||q.answers[0])+'</b>'))}
       <span class="es">${esc(q.tag||'')}</span></span>${q.topic?`<a class="btn sm alt" href="#gramatica/${q.topic}">📘</a>`:''}</li>`).join('')}</ul></div>`:''}
    <div class="row" style="justify-content:center;margin-top:20px">${Q.wrong.length?`<button class="btn accent" id="again">🔁 Repetir errores</button>`:''}<button class="btn" data-go="hoy">🏠 Inicio</button><button class="btn alt" data-go="ejercicios">Más ejercicios</button></div>
  </div></div>`;
  if(p>=70) confetti();
  const ag=$('#again'); if(ag) ag.onclick=()=>{ const ws=Q.wrong.map(q=>({...q})); startQuiz(shuffle(ws), {title:'Repetir errores'}); };
  SESSION=null;
}

/* ================== VOCABULARIO ================== */
function groupMastery(g){ const ks=g.words.map(w=>S.cards[w.key]); const known=ks.filter(c=>c && c.b>=3).length; return known/g.words.length; }
function vVocab(arg){
  if(arg && GROUP[arg]) return vGroup(GROUP[arg]);
  const book = S.vBook || 'all'; const q = (S.vq||'').toLowerCase();
  const gs = VOCAB.filter(g=>book==='all'||String(g.book)===book);
  const dw = dailyWords();
  let list = '';
  if(q){
    const found = WORDS.filter(w=>(w.w+' '+w.es).toLowerCase().includes(q)).slice(0,60);
    list = `<div class="section-title"><h2>Resultados (${found.length})</h2></div><div class="grid g4">${found.map(wordCard).join('')||'<p class="muted">Sin resultados.</p>'}</div>`;
  } else {
    list = `<div class="section-title"><h2>Palabras del día</h2><div class="row"><button class="btn sm" data-act="words">🃏 Flashcards del día ${day().tasks.words?'✅':''}</button></div></div>
    <div class="grid g4">${dw.slice(0,8).map(wordCard).join('')}</div>
    <div class="section-title"><h2>Temas de vocabulario</h2>
      <div class="filters" style="margin:0">${[['all','Todos'],['B','Base'],['1','A1++'],['2','A2'],['X','Idioms']].map(([k,l])=>`<button class="fbtn ${book===k?'on':''}" data-vbook="${k}">${l}</button>`).join('')}</div></div>
    <div class="grid g3">${gs.map(g=>{ const m=groupMastery(g); return `<div class="card group-card" data-go="vocabulario/${g.id}"><div class="gem">${g.icon}</div><div style="flex:1;min-width:0">
      <div class="row" style="gap:6px"><span class="chip ${BOOKCHIP[g.book]}">${g.book==='X'?'Extra':(g.book==='B'?'Base':g.book===1?'AEF 1':'AEF 2')+' · F'+g.file}</span>${status(g.book,g.file)==='actual'?'<span class="chip st-actual">📍 Actual</span>':''}</div>
      <b>${esc(g.title)}</b><div class="muted small">${esc(g.es)} · ${g.words.length} palabras${g.photo?' · 📷':''}</div>
      <div class="bar" style="height:6px;margin-top:6px"><i style="width:${Math.round(m*100)}%"></i></div></div></div>`; }).join('')}</div>`;
  }
  app.innerHTML = `<div class="view"><h1>🖼️ Vocabulario</h1><p class="muted">Palabras organizadas por File del libro, con emoji, foto (si hay internet), audio y ejemplo.</p>
    <input class="search" id="vs" placeholder="🔍 Buscar palabra en inglés o español…" value="${esc(S.vq||'')}">${list}</div>`;
  const vs=$('#vs'); vs.oninput=()=>{ S.vq=vs.value; const pos=vs.selectionStart; vVocab(); const n=$('#vs'); n.focus(); n.setSelectionRange(pos,pos); };
  $$('[data-vbook]').forEach(b=>b.onclick=()=>{ S.vBook=b.dataset.vbook; save(); vVocab(); });
  bindActs();
  loadImagesFor(q ? WORDS.filter(w=>(w.w+' '+w.es).toLowerCase().includes(q)).slice(0,60) : dw.slice(0,8));
}
function wordCard(w){
  const c=S.cards[w.key];
  return `<div class="vcard"><div class="vimg">${imgTag(w)}<span class="emo">${w.e}</span></div>
    <div class="vbody"><div class="vword"><span>${esc(w.w)}</span>${spk(w.w)}</div><span class="small">${esc(w.es)}</span>
    ${w.ex?`<span class="vex">${esc(w.ex)} <button class="icon-btn" style="width:26px;height:26px;font-size:.75rem;vertical-align:middle" data-say="${esc(w.ex)}">▶</button></span>`:''}
    ${c?`<span class="tiny muted">Caja ${c.b}/5</span>`:''}</div></div>`;
}
function vGroup(g){
  app.innerHTML = `<div class="view">
    <div class="row" style="margin-bottom:10px"><button class="btn sm alt" data-go="vocabulario">← Vocabulario</button></div>
    <div class="row between"><div><span class="chip ${BOOKCHIP[g.book]}">${BOOKNAME[g.book]}${g.book==='X'?'':' · File '+g.file}</span> ${stChip(g.book,g.file)}<h1 style="margin-top:8px">${g.icon} ${esc(g.title)}</h1><p class="muted">${esc(g.es)} · ${g.words.length} palabras</p></div>
    <div class="row"><button class="btn" id="gFlash">🃏 Flashcards</button><button class="btn accent" id="gQuiz">🎯 Quiz (10)</button><button class="btn alt" id="gSay">🔊 Escuchar todo</button></div></div>
    <div class="grid g4" style="margin-top:16px">${g.words.map(wordCard).join('')}</div></div>`;
  $('#gFlash').onclick=()=>startFlash(shuffle(g.words), {title:g.title});
  $('#gQuiz').onclick=()=>{ const ws=shuffle(g.words); const qs=ws.slice(0,9).map(w=>qVocab(w)); qs.splice(4,0,qMatch(shuffle(g.words))); startQuiz(qs,{title:g.title}); };
  $('#gSay').onclick=()=>speak(g.words.map(w=>w.w).join('. '));
  loadImagesFor(g.words);
}

/* ---------- flashcards (Leitner) ---------- */
const INTERVAL=[0,1,2,4,8,16];
/* comparación flexible en español: sin tildes, sin artículos, acepta cualquier opción separada por / o coma */
function normEs(s){
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\(.*?\)/g,' ').replace(/[¿?¡!.,;:"'“”]/g,' ')
    .replace(/\b(el|la|los|las|un|una|unos|unas|to)\b/g,' ').replace(/\s+/g,' ').trim();
}
function checkEs(input, es){
  const u = normEs(input); if(!u) return {ok:false};
  const parts = [es, ...es.split(/\s*(?:\/|,|;|→|↔|–|=)\s*/)].map(normEs).filter(Boolean);
  const alts = new Set();
  parts.forEach(p=>{ alts.add(p); alts.add(p.replace(/se\b/g,'').trim()); alts.add(p.replace(/^(ser|estar|tener) /,'')); });
  const mine = [u, u.replace(/se\b/g,'').trim()];
  for(const a of alts) if(a && mine.includes(a)) return {ok:true, exact:true};
  for(const a of alts){ const tol = a.length>12 ? 2 : a.length>4 ? 1 : 0; if(tol && mine.some(x=>lev(a,x)<=tol)) return {ok:true, exact:false}; }
  return {ok:false};
}
function enAnswers(w){ return [w.w, ...w.w.split(/\s*(?:\/|→|↔|–)\s*/)].filter(Boolean); }
const FMODES=[['en-es','✍️ EN → ES'],['es-en','✍️ ES → EN'],['quick','⚡ Rápido']];
function startFlash(words, opts={}){
  if(!words.length){ toast('No hay palabras'); return; }
  SESSION={type:'flash', words:words.slice(), i:0, total:words.length, firstOk:0, round:1, again:[], opts, mode:S.flashMode||'en-es'};
  go('flash');
}
function vFlash(){
  if(!SESSION || SESSION.type!=='flash'){ go('vocabulario'); return; }
  const F=SESSION;
  if(F.i>=F.words.length){
    if(F.again.length){ F.words=F.again; F.again=[]; F.i=0; F.round++; toast('Repasemos las que fallaste 💪'); }
    else return flashDone();
  }
  const w=F.words[F.i]; const c=S.cards[w.key]||{b:0}; const M=F.mode;
  const pic = `${imgTag(w,'fimg')}<div class="big">${w.e}</div>`;
  const front = M==='es-en'
    ? `${pic}<div class="fw" style="margin-top:10px">${esc(w.es)}</div><p class="muted small">¿Cómo se dice en inglés?</p>`
    : `${pic}<div class="fw" style="margin-top:8px">${esc(w.w)} ${spk(w.w)}</div><p class="muted small">${M==='quick'?'Toca para ver el significado':'¿Qué significa en español?'}</p>`;
  const back = `${imgTag(w,'fimg')}<div id="fres"></div><div class="fw">${esc(w.w)}</div><div style="font-size:1.15rem;margin:2px 0 6px"><b>${esc(w.es)}</b></div>
    ${w.ex?`<p class="muted small" style="margin:0 0 8px"><i>${esc(w.ex)}</i></p>`:''}
    <div class="row" style="justify-content:center">${spk(w.w)}${w.ex?`<button class="icon-btn" data-say="${esc(w.ex)}" title="Escuchar el ejemplo">💬</button>`:''}</div>`;
  const controls = M==='quick'
    ? `<div class="row" style="justify-content:center" id="fbtns"><button class="btn lg" id="flip">Voltear tarjeta ↻</button></div>
       <p class="muted small" style="text-align:center">Atajos: <b>espacio</b> voltear · <b>1</b> no la sabía · <b>2</b> la sabía</p>`
    : `<div class="flash-input" id="fbtns"><input class="answer" id="fans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${M==='es-en'?'Escribe la palabra en inglés…':'Escribe el significado en español…'}">
       <div class="row" style="justify-content:center;margin-top:10px" id="frow"><button class="btn alt" id="idk">No sé</button><button class="btn" id="chk">Comprobar</button></div></div>
       <p class="muted small" style="text-align:center">Pulsa <b>Enter</b> para comprobar y otra vez <b>Enter</b> para seguir. No hacen falta tildes.</p>`;
  app.innerHTML = `<div class="view quiz">
    <div class="qhead"><button class="icon-btn" id="fx" title="Salir">✕</button><div class="bar"><i style="width:${Math.round(F.i/F.words.length*100)}%"></i></div><b class="small">${F.i+1}/${F.words.length}${F.round>1?' · repaso':''}</b></div>
    <div class="row between" style="margin-bottom:12px"><span class="chip">${esc(F.opts.title||'Flashcards')} · ${esc(GROUP[w.g].title)}</span>
      <div class="seg">${FMODES.map(([k,l])=>`<button class="${M===k?'on':''}" data-fmode="${k}">${l}</button>`).join('')}</div></div>
    <div class="flash-wrap"><div class="flash" id="card"><div class="face">${front}</div><div class="face back">${back}</div></div></div>
    <div class="boxes" style="margin:14px 0">${[1,2,3,4,5].map(b=>`<span style="${c.b>=b?'background:var(--ok);color:#fff':''}">${b}</span>`).join('')}</div>
    ${controls}</div>`;
  loadImagesFor([w]);
  if(M!=='es-en') setTimeout(()=>speak(w.w),300);
  const cd=$('#card');
  const answer=(ok)=>{ const cur=S.cards[w.key]||{b:0}; const nb = ok ? Math.min(5,(cur.b||0)+1) : 1;
    S.cards[w.key]={b:nb, due:addDays(TODAY, ok?INTERVAL[nb]:0)}; record(w.key, ok); const d=day(); d.cards=(d.cards||0)+1;
    if(ok && F.round===1) F.firstOk++; if(!ok) F.again.push(w); F.i++; save(); vFlash(); };
  if(M==='quick'){
    const flip=()=>{ if(cd.classList.contains('flip')) return; cd.classList.add('flip');
      $('#fbtns').innerHTML=`<button class="btn bad lg" id="no">😕 No la sabía</button><button class="btn ok lg" id="yes">😊 La sabía</button>`;
      $('#no').onclick=()=>answer(false); $('#yes').onclick=()=>answer(true); };
    cd.onclick=e=>{ if(!e.target.closest('[data-say]')) flip(); }; $('#flip').onclick=flip;
    F.keys = e => { if(e.target.tagName==='INPUT') return; if(e.key===' '){ e.preventDefault(); flip(); } if(cd.classList.contains('flip')){ if(e.key==='1') answer(false); if(e.key==='2') answer(true); } };
  } else {
    F.keys = null;
    const inp=$('#fans'); setTimeout(()=>inp.focus(),60); let result=null;
    const check=(skip)=>{ if(result!==null) return; const val = skip ? '' : inp.value.trim();
      const res = !val ? {ok:false} : M==='es-en' ? checkTyped(val, enAnswers(w)) : checkEs(val, w.es);
      result=res.ok; inp.disabled=true; inp.classList.add(res.ok?'right':'wrong'); cd.classList.add('flip'); speak(w.w);
      $('#fres').innerHTML = `<div class="fres ${res.ok?'ok':'bad'}">${res.ok ? (res.exact?'✅ ¡Correcto!':'✅ ¡Correcto! Revisa la ortografía') : (val?`❌ Escribiste: <b>${esc(val)}</b>`:'❌ No la sabías')}</div>`;
      $('#frow').innerHTML = `${!res.ok && val?`<button class="btn alt" id="valid">👍 Mi respuesta también es válida</button>`:''}<button class="btn ${res.ok?'ok':''}" id="nxt">Siguiente →</button>`;
      const v=$('#valid'); if(v) v.onclick=()=>answer(true);
      $('#nxt').onclick=()=>answer(result); $('#nxt').focus(); };
    $('#chk').onclick=()=>check(false); $('#idk').onclick=()=>check(true);
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); check(false); } };
  }
  $('#fx').onclick=()=>{ SESSION=null; go('vocabulario'); };
  $$('[data-fmode]').forEach(b=>b.onclick=()=>{ F.mode=b.dataset.fmode; S.flashMode=F.mode; save(); vFlash(); });
}
document.addEventListener('keydown', e=>{ if(SESSION && SESSION.type==='flash' && SESSION.keys) SESSION.keys(e); });
function flashDone(){
  const F=SESSION; if(F.opts.task){ day().tasks[F.opts.task]=true; } save(); updatePill();
  const p=Math.round(F.firstOk/F.total*100);
  app.innerHTML = `<div class="view quiz"><div class="qcard result"><div class="big">${p>=80?'🏆':'🃏'}</div><h1>${F.firstOk} / ${F.total}</h1>
    <p class="muted">Acertaste ${p}% a la primera. Las que sabías volverán en unos días; las que fallaste, mañana.</p>
    <div class="bar" style="max-width:360px;margin:10px auto 20px"><i style="width:${p}%"></i></div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-go="hoy">🏠 Inicio</button><button class="btn alt" data-go="vocabulario">Vocabulario</button></div></div></div>`;
  confetti(); SESSION=null;
}

/* ================== VERBOS ================== */
function vVerbs(){
  const f=S.verbF||'all', q=(S.verbQ||'').toLowerCase(); const dv=dailyVerbs();
  const rows = VERBS.filter(v=>(f==='all'||String(v.lvl)===f) && (!q || (v.b+' '+v.p+' '+v.pp+' '+v.es).toLowerCase().includes(q)));
  const regRows = REGS.filter(v=>!q || (v.b+' '+v.es).toLowerCase().includes(q));
  app.innerHTML = `<div class="view"><h1>🔁 Verbos</h1><p class="muted">Lista de verbos irregulares (base → pasado → participio) y regulares con la pronunciación de <b>-ed</b>.</p>
  <div class="card" style="margin:14px 0"><div class="row between"><h3 style="margin:0">⭐ Verbos del día</h3><button class="btn sm" data-act="verbs">Quiz del día ${day().tasks.verbs?'✅':''}</button></div>
    <div class="grid g4" style="margin-top:12px">${dv.map(v=>`<div class="card" style="padding:12px;box-shadow:none;background:var(--surface2)"><div class="row between"><span style="font-size:1.6rem">${v.e}</span>${spk(v.b+', '+v.p+', '+v.pp)}</div>
      <b>${v.b}</b> → <b style="color:var(--primary)">${esc(v.p)}</b> → <b style="color:var(--accent)">${esc(v.pp)}</b><div class="muted small">${esc(v.es)}</div></div>`).join('')}</div></div>
  <div class="grid g4" style="margin-bottom:14px">
    <div class="card mode-card" id="qPast"><div class="e">⏪</div><b>Quiz de pasado</b><div class="muted small">go → went</div></div>
    <div class="card mode-card" id="qPP"><div class="e">✅</div><b>Quiz de participios</b><div class="muted small">go → gone</div></div>
    <div class="card mode-card" id="qMix"><div class="e">🎲</div><b>Quiz mixto</b><div class="muted small">Pasado, participio, significado</div></div>
    <div class="card mode-card" id="qEd"><div class="e">👂</div><b>Sonidos de -ed</b><div class="muted small">/t/ /d/ /ɪd/</div></div>
  </div>
  <input class="search" id="vq" placeholder="🔍 Buscar verbo…" value="${esc(S.verbQ||'')}">
  <div class="filters">${[['all','Todos'],['1','AEF 1'],['2','AEF 2'],['reg','Regulares']].map(([k,l])=>`<button class="fbtn ${f===k?'on':''}" data-vf="${k}">${l}</button>`).join('')}</div>
  ${f!=='reg'?`<div class="tablewrap"><table class="vtable"><thead><tr><th></th><th>Base</th><th>Pasado</th><th>Participio</th><th>Español</th><th></th></tr></thead><tbody>
  ${rows.map(v=>{ const a=acc(v.key); return `<tr class="${dv.includes(v)?'dayv':''}"><td>${v.e}</td><td><b>${v.b}</b></td><td>${esc(v.p)}</td><td>${esc(v.pp)}</td><td class="muted">${esc(v.es)}${a!==null&&a<0.6?' <span class="chip st-actual">repasar</span>':''}</td><td>${spk(v.b+', '+v.p+', '+v.pp)}</td></tr>`; }).join('')}
  </tbody></table></div>`:''}
  ${f==='reg'||f==='all'?`<div class="section-title"><h2>Verbos regulares y la pronunciación de -ed</h2></div>
  <div class="card" style="margin-bottom:12px"><div class="grid g3">
    <div><span class="ed t">/t/</span> después de sonidos sordos: p, k, s, sh, ch, f → <i>worked, stopped, watched</i></div>
    <div><span class="ed d">/d/</span> después de sonidos sonoros y vocales → <i>played, lived, called</i></div>
    <div><span class="ed id">/ɪd/</span> solo después de t o d → <i>wanted, needed, visited</i></div></div></div>
  <div class="tablewrap"><table class="vtable"><thead><tr><th>Base</th><th>Pasado</th><th>-ed</th><th>Español</th><th></th></tr></thead><tbody>
  ${regRows.map(v=>`<tr><td><b>${v.b}</b></td><td>${v.p}</td><td><span class="ed ${v.s}">/${v.s==='id'?'ɪd':v.s}/</span></td><td class="muted">${esc(v.es)}</td><td>${spk(v.b+', '+v.p)}</td></tr>`).join('')}</tbody></table></div>`:''}
  </div>`;
  bindActs();
  const inp=$('#vq'); inp.oninput=()=>{ S.verbQ=inp.value; const p=inp.selectionStart; vVerbs(); const n=$('#vq'); n.focus(); n.setSelectionRange(p,p); };
  $$('[data-vf]').forEach(b=>b.onclick=()=>{ S.verbF=b.dataset.vf; save(); vVerbs(); });
  const pool = () => f==='1'||f==='2' ? VERBS.filter(v=>String(v.lvl)===f) : VERBS;
  $('#qPast').onclick=()=>startQuiz(shuffle(pool()).slice(0,10).map(v=>qVerb(v,freeRng,'past')),{title:'Quiz de pasado'});
  $('#qPP').onclick=()=>startQuiz(shuffle(pool()).slice(0,10).map(v=>qVerb(v,freeRng,pick(['pp','mcpp']))),{title:'Quiz de participios'});
  $('#qMix').onclick=()=>startQuiz(shuffle(pool()).slice(0,12).map(v=>qVerb(v)),{title:'Quiz mixto de verbos'});
  $('#qEd').onclick=()=>startQuiz(shuffle(REGS).slice(0,10).map(v=>qEd(v)),{title:'Sonidos de -ed'});
}

/* ================== GRAMÁTICA ================== */
function vGrammar(arg){
  const t = TOPIC[arg] || TOPIC[S.lastTopic] || GRAMMAR.find(x=>status(x.book,x.file)==='actual') || GRAMMAR[0];
  S.lastTopic=t.id; save();
  const q=(S.gq||'').toLowerCase();
  const sec = (book, title) => { const ts=GRAMMAR.filter(x=>x.book===book && (!q || (x.title+' '+x.es).toLowerCase().includes(q))); if(!ts.length) return '';
    return `<h4>${title}</h4>${ts.map(x=>`<button class="gitem ${x.id===t.id?'on':''}" data-go="gramatica/${x.id}"><span class="u">${unitLabel(x)}</span><span style="flex:1">${esc(x.title)}</span>${status(x.book,x.file)==='actual'?'📍':''}</button>`).join('')}`; };
  const sg = k => `<span class="sg ${k}">${k==='p'?'+':k==='n'?'−':k==='q'?'?':'i'}</span>`;
  const a=acc(t.id);
  const idx=GRAMMAR.indexOf(t), prev=GRAMMAR[idx-1], next=GRAMMAR[idx+1];
  app.innerHTML = `<div class="view"><div class="gram-layout">
    <aside class="card gnav"><input class="search" id="gq" placeholder="🔍 Buscar tema…" value="${esc(S.gq||'')}" style="padding:9px 12px">
      ${sec('B','Base · AEF 1 (Files 1–6)')}${sec(1,'A1++ · AEF 1 (Files 7–12)')}${sec(2,'A2 · AEF 2')}</aside>
    <article class="card">
      <div class="row between"><div class="row"><span class="chip ${BOOKCHIP[t.book]}">${BOOKNAME[t.book]} · ${unitLabel(t)}</span>${stChip(t.book,t.file)}</div>
        <a class="btn sm alt" href="#gramatica/${t.id}" target="_blank" title="Abrir en otra pestaña del navegador">↗ Otra pestaña</a></div>
      <h1 style="margin-top:12px">${esc(t.title)}</h1><p class="muted" style="font-size:1.1rem">${esc(t.es)}</p>
      <h3>🧱 Estructura</h3><div class="formula">${t.form.map(([k,f])=>`<div>${sg(k)}<span>${esc(f)}</span></div>`).join('')}</div>
      <h3>🎯 ¿Cuándo se usa?</h3><ul>${t.uses.map(u=>`<li>${u}</li>`).join('')}</ul>
      <h3>💬 Ejemplos</h3><ul class="exlist">${t.ex.map(([en,es])=>`<li><span><b>${esc(en)}</b><span class="es">${esc(es)}</span></span>${spk(en)}</li>`).join('')}</ul>
      <h3 style="margin-top:18px">⚠️ Errores típicos</h3><ul class="exlist errs">${t.errs.map(([x,v,n])=>`<li><span class="x">${esc(x)}</span> → <span class="v">${esc(v)}</span> <span class="es">${esc(n)}</span></li>`).join('')}</ul>
      <div class="row between" style="margin-top:20px;border-top:1px solid var(--line);padding-top:16px">
        <div class="row"><button class="btn" data-topicq="${t.id}">🎯 Practicar este tema</button><span class="muted small">${a===null?'Aún sin practicar':'Tus aciertos: '+Math.round(a*100)+'%'}</span></div>
        <div class="row">${prev?`<button class="btn sm alt" data-go="gramatica/${prev.id}">← ${unitLabel(prev)}</button>`:''}${next?`<button class="btn sm alt" data-go="gramatica/${next.id}">${unitLabel(next)} →</button>`:''}</div></div>
    </article></div></div>`;
  bindActs();
  const gq=$('#gq'); gq.oninput=()=>{ S.gq=gq.value; const p=gq.selectionStart; vGrammar(t.id); const n=$('#gq'); n.focus(); n.setSelectionRange(p,p); };
  const on=$('.gitem.on'); if(on && innerWidth>860) on.scrollIntoView({block:'nearest'});
}

/* ================== PROGRESO ================== */
function vProgress(){
  const all = Object.values(S.days); const totQ = all.reduce((a,d)=>a+d.q,0), totOk = all.reduce((a,d)=>a+d.ok,0);
  const daysN = Object.keys(S.days).filter(practiced).length;
  // calendario: últimas 5 semanas empezando en lunes
  let start = addDays(TODAY, -34); const sd=parseYmd(start).getDay(); start = addDays(start, -((sd+6)%7));
  const cells=[]; for(let d=start; d<=TODAY; d=addDays(d,1)) cells.push(d);
  const lvl = d => { const x=S.days[d]; if(!x) return ''; const n=x.q+(x.cards||0); return n>=25?'l3':n>=10?'l2':n>0?'l1':''; };
  const topics = GRAMMAR.filter(t=>S.stat[t.id]).map(t=>({t,a:acc(t.id),n:S.stat[t.id].n})).sort((a,b)=>a.a-b.a);
  const weakW = Object.keys(S.miss).filter(k=>k.startsWith('w:')&&WORD[k]).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,10);
  const weakV = Object.keys(S.miss).filter(k=>k.startsWith('v:')&&VERB[k]).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,10);
  const boxes=[0,0,0,0,0,0]; Object.values(S.cards).forEach(c=>boxes[c.b]++);
  app.innerHTML = `<div class="view"><div class="row between"><h1>📈 Progreso</h1><button class="btn sm alt" data-go="ajustes">⚙️ Ajustes</button></div>
  <div class="grid g4">
    <div class="card stat"><b>🔥 ${streak()}</b><span class="muted small">racha actual</span></div>
    <div class="card stat"><b>🏅 ${bestStreak()}</b><span class="muted small">mejor racha</span></div>
    <div class="card stat"><b>📅 ${daysN}</b><span class="muted small">días practicados</span></div>
    <div class="card stat"><b>✍️ ${totQ}</b><span class="muted small">respuestas · ${totQ?Math.round(totOk/totQ*100):0}% aciertos</span></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>Calendario</h3><div class="cal">${['L','M','M','J','V','S','D'].map(x=>`<div class="hd">${x}</div>`).join('')}${cells.map(d=>`<div class="${lvl(d)} ${d===TODAY?'today':''}" title="${d}">${+d.slice(8)}</div>`).join('')}</div>
      <p class="muted small" style="margin-top:10px">Más verde = más práctica ese día.</p></div>
    <div class="card"><h3>Flashcards (cajas Leitner)</h3><p class="muted small">Caja 1 = repasar hoy · Caja 5 = dominada (vuelve en 16 días)</p>
      ${[1,2,3,4,5].map(b=>`<div class="row" style="margin:8px 0"><span class="chip" style="min-width:64px">Caja ${b}</span><div class="bar" style="flex:1"><i style="width:${Math.min(100,boxes[b]/Math.max(1,WORDS.length)*100*4)}%"></i></div><b>${boxes[b]}</b></div>`).join('')}
      <p class="muted small">${Object.keys(S.cards).length} de ${WORDS.length} palabras estudiadas.</p></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>Aciertos por tema</h3>${topics.length?topics.map(({t,a,n})=>`<div style="margin:10px 0;cursor:pointer" data-go="gramatica/${t.id}"><div class="row between small"><span><b>${unitLabel(t)}</b> ${esc(t.title)}</span><span class="${a<0.6?'':'muted'}">${Math.round(a*100)}% · ${n}</span></div><div class="bar" style="height:7px"><i style="width:${Math.round(a*100)}%;${a<0.6?'background:var(--bad)':''}"></i></div></div>`).join(''):'<p class="muted">Haz tu primer reto para ver estadísticas.</p>'}</div>
    <div class="card"><h3>Lo que más te cuesta</h3>
      <h4 class="muted small">PALABRAS</h4><ul class="weak">${weakW.map(k=>`<li><span>${WORD[k].e} <b>${esc(WORD[k].w)}</b> – ${esc(WORD[k].es)}</span>${spk(WORD[k].w)}</li>`).join('')||'<li class="muted">¡Nada por ahora!</li>'}</ul>
      <h4 class="muted small" style="margin-top:14px">VERBOS</h4><ul class="weak">${weakV.map(k=>`<li><span><b>${VERB[k].b}</b> – ${esc(VERB[k].p)} – ${esc(VERB[k].pp)}</span>${spk(VERB[k].b+', '+VERB[k].p+', '+VERB[k].pp)}</li>`).join('')||'<li class="muted">¡Nada por ahora!</li>'}</ul>
      <button class="btn sm" style="margin-top:12px" data-act="errors">🩹 Repasar mis errores</button></div>
  </div></div>`;
  bindActs();
}

/* ================== AJUSTES ================== */
function vSettings(){
  const st=S.settings; loadVoices();
  app.innerHTML = `<div class="view" style="max-width:720px;margin:0 auto"><div class="row" style="margin-bottom:10px"><button class="btn sm alt" data-go="progreso">← Progreso</button></div><h1>⚙️ Ajustes</h1>
  <div class="card">
    <div class="setting"><div><b>Tema</b><div class="muted small">Claro, oscuro o según tu sistema</div></div><div class="seg">${[['auto','Auto'],['light','☀️ Claro'],['dark','🌙 Oscuro']].map(([k,l])=>`<button class="${st.theme===k?'on':''}" data-theme-set="${k}">${l}</button>`).join('')}</div></div>
    <div class="setting"><div><b>¿En qué File de AEF 2 estás?</b><div class="muted small">Define qué temas son "Visto", "Actual" y "Próximo"</div></div>
      <select class="sel" id="cur">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${st.cur===i+1?'selected':''}>AEF 2 · File ${i+1}</option>`).join('')}</select></div>
    <div class="setting"><div><b>Incluir temas próximos en el reto</b><div class="muted small">Para adelantarte a lo que verás en clase</div></div><div class="seg"><button class="${!st.includeNext?'on':''}" data-next="0">No</button><button class="${st.includeNext?'on':''}" data-next="1">Sí</button></div></div>
    <div class="setting"><div><b>Preguntas del reto diario</b></div><div class="seg">${[10,15,20].map(n=>`<button class="${st.daily===n?'on':''}" data-daily="${n}">${n}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Velocidad de la voz</b></div><div class="seg">${[[0.7,'Lenta'],[0.9,'Normal'],[1.05,'Rápida']].map(([n,l])=>`<button class="${st.rate===n?'on':''}" data-rate="${n}">${l}</button>`).join('')}</div></div>
    <div class="setting"><div><b>Voz en inglés</b><div class="muted small">${VOICES.length} voces disponibles en tu equipo</div></div>
      <div class="row"><select class="sel" id="voice"><option value="">Automática (en-US)</option>${VOICES.map(v=>`<option ${st.voice===v.name?'selected':''}>${esc(v.name)}</option>`).join('')}</select><button class="btn sm alt" data-say="Hello! Nice to meet you. How are you today?">Probar</button></div></div>
    <div class="setting"><div><b>Copia de seguridad</b><div class="muted small">Tu progreso se guarda solo en este navegador</div></div>
      <div class="row"><button class="btn sm alt" id="exp">⬇️ Exportar</button><label class="btn sm alt" style="cursor:pointer">⬆️ Importar<input type="file" id="imp" accept=".json" hidden></label></div></div>
    <div class="setting"><div><b>Reiniciar progreso</b><div class="muted small">Borra racha, estadísticas y flashcards</div></div><button class="btn sm bad" id="reset">Reiniciar</button></div>
  </div>
  <p class="muted small" style="margin-top:14px">Contenido original basado en el temario de American English File 3.ª ed. (AEF 1 y AEF 2). Fotos: Wikipedia/Wikimedia Commons. Voz: la del navegador.</p></div>`;
  $$('[data-theme-set]').forEach(b=>b.onclick=()=>{ st.theme=b.dataset.themeSet; save(); applyTheme(); vSettings(); });
  $('#cur').onchange=e=>{ st.cur=+e.target.value; save(); toast('Guardado: AEF 2 · File '+st.cur); };
  $$('[data-next]').forEach(b=>b.onclick=()=>{ st.includeNext=b.dataset.next==='1'; save(); vSettings(); });
  $$('[data-daily]').forEach(b=>b.onclick=()=>{ st.daily=+b.dataset.daily; save(); vSettings(); });
  $$('[data-rate]').forEach(b=>b.onclick=()=>{ st.rate=+b.dataset.rate; save(); vSettings(); speak('This is the new speed.'); });
  $('#voice').onchange=e=>{ st.voice=e.target.value; save(); speak('Hello! This is my voice.'); };
  $('#exp').onclick=()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'})); a.download='progreso-ingles-'+TODAY+'.json'; a.click(); };
  $('#imp').onchange=e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); Object.assign(S,o); save(); applyTheme(); toast('Progreso importado ✅'); vSettings(); }catch(err){ toast('Archivo no válido'); } }); };
  const rs=$('#reset'); rs.onclick=()=>{ if(rs.dataset.sure){ ['days','stat','miss','cards'].forEach(k=>S[k]={}); save(); toast('Progreso reiniciado'); vSettings(); updatePill(); } else { rs.dataset.sure='1'; rs.textContent='¿Seguro? Toca otra vez'; setTimeout(()=>{ if(rs.isConnected){ delete rs.dataset.sure; rs.textContent='Reiniciar'; } },4000); } };
}

/* ---------- inicio ---------- */
route();
})();
