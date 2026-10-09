/* ===================== CORE: utilidades, datos, corrección, audio, fotos, preguntas ===================== */
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
/* ---------- tema ---------- */
function applyTheme(){ const t=S.settings.theme; if(t==='auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
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
const STLABEL = {base:'Base', visto:'Visto', actual:'Actual', proximo:'Próximo', extra:'Extra'};
const stChip = (b,f) => { const s=status(b,f); return `<span class="chip st-${s}">${STLABEL[s]}</span>`; };
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
const spk = (t, cls='icon-btn', label='') => `<button class="${cls}" data-say="${esc(t)}" title="Escuchar" aria-label="Escuchar">${ic('volume')}${label?`<span>${label}</span>`:''}</button>`;
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
    return {...base, kind:'type', label:'Traduce al inglés', prompt:`<span class="lang">ES</span> ${esc(it.es)}`, answers:it.answers, say:it.sentence, showAns:it.answers[0]};
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
  return {key:'match', tag:'Vocabulario', kind:'match', label:'Empareja inglés y español', pairs:ws.map(w=>({a:w.w, b:w.es, key:w.key})), left:shuffle(ws.map(w=>w.w),r), right:shuffle(ws.map(w=>w.es),r)};
}
function qVerb(v, r=freeRng, kind){
  const tag='Verbos irregulares';
  kind = kind || pick(['past','past','pp','pp','mcpp','meaning'], r);
  if(kind==='past') return {key:v.key, tag, kind:'type', label:'Escribe el pasado', prompt:`<b>${v.b}</b> → <span class="gap">___</span> <span class="muted small">(${esc(v.es)})</span>`, answers:alts(v.p), say:`${v.b}, ${v.p}`, exp:`${v.b} → ${v.p} → ${v.pp}`};
  if(kind==='pp') return {key:v.key, tag, kind:'type', label:'Escribe el participio', prompt:`<b>${v.b}</b> → ${esc(v.p)} → <span class="gap">___</span>`, answers:alts(v.pp), say:`${v.b}, ${v.p}, ${v.pp}`, exp:`${v.b} → ${v.p} → ${v.pp}`};
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
