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
/* VOZ:inicio — selección de voz (probada en test4.js sin navegador) */
let VOICES=[];
const VOICE_KEY='aef-review-voice';                       // la voz es por dispositivo: no se sincroniza
const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Good News|Jester|Organ|Pipe Organ|Superstar|Trinoids|Whisper|Zarvox|Deranged|Hysterical)\b/i;
const GOOD_VOICES=['Samantha','Ava','Allison','Susan','Alex','Tom','Evan','Nathan','Zoe','Joelle','Noelle','Aaron','Nicky'];
const isGoodVoice = v => GOOD_VOICES.some(n => v.name===n || v.name.startsWith(n+' '));
const isOnline = v => v.localService===false;
function voiceRank(v){                                     // menor = mejor
  const us = /en[-_]US/i.test(v.lang) ? 0 : 20;
  if(isOnline(v)) return 300+us;
  const gi = GOOD_VOICES.findIndex(n => v.name===n || v.name.startsWith(n+' '));
  if(gi>=0) return us + gi + (/Premium|Enhanced|Mejorad/i.test(v.name) ? 0 : 50);   // las Premium/Enhanced primero
  return 100+us;
}
function usableVoices(list=VOICES){ return list.filter(v=>/^en[-_]/i.test(v.lang) && !NOVELTY.test(v.name)).sort((a,b)=>voiceRank(a)-voiceRank(b)); }
function myVoice(){ try{ return localStorage.getItem(VOICE_KEY)||''; }catch(e){ return ''; } }
function setMyVoice(name){ try{ if(name) localStorage.setItem(VOICE_KEY, name); else localStorage.removeItem(VOICE_KEY); }catch(e){} }
function pickVoice(skip=[]){ const u=usableVoices().filter(v=>!skip.includes(v.name)); const pref=myVoice(); return (pref && u.find(v=>v.name===pref)) || u[0]; }
/* VOZ:fin */
function loadVoices(){ if(!('speechSynthesis' in window)) return; VOICES = speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang)); }
if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
let speakSeq = 0;
/* habla en inglés. Evita los fallos de Chrome (speak justo tras cancel, sintetizador pausado) y,
   si una voz falla, reintenta una vez con la siguiente. onResult({ok, voice, error}) es opcional. */
function speak(text, slow, onResult){
  if(!('speechSynthesis' in window)){ (onResult||(()=>toast('Este navegador no tiene voz disponible.')))({ok:false, error:'sin-voz'}); return; }
  const synth = speechSynthesis, seq = ++speakSeq;
  const clean = String(text).replace(/<[^>]+>/g,'').replace(/\s*(→|↔)\s*/g,', ').replace(/\s\/\s/g,', ').replace(/\s–\s/g,', ').replace(/_+/g,'blank').replace(/\(.*?\)/g,'');
  const busy = synth.speaking || synth.pending;
  if(busy) synth.cancel();
  try{ synth.resume(); }catch(e){}
  const attempt = (skip, n) => {
    if(seq!==speakSeq) return;
    if(!VOICES.length) loadVoices();
    const v = pickVoice(skip);
    const u = new SpeechSynthesisUtterance(clean); u.lang='en-US'; if(v) u.voice=v;
    u.rate = slow ? Math.max(0.5, S.settings.rate-0.3) : S.settings.rate;
    let settled = false;
    const fail = err => {
      if(settled || seq!==speakSeq) return; settled = true;
      if(n<1 && v && err!=='not-allowed'){ synth.cancel(); setTimeout(()=>attempt(skip.concat(v.name), n+1), 80); return; }
      if(onResult) onResult({ok:false, error:err, voice:v&&v.name});
      else if(err!=='not-allowed') toast('No se pudo reproducir la voz ('+err+'). Revisa Ajustes → Voz.');
    };
    const timer = setTimeout(()=>{ if(!settled){ if(synth.speaking){ settled=true; onResult&&onResult({ok:true, voice:v&&v.name}); } else fail('no-empezó'); } }, 2500);
    u.onstart = () => { clearTimeout(timer); if(settled) return; settled = true; onResult&&onResult({ok:true, voice:v&&v.name}); };
    u.onerror = e => { clearTimeout(timer); if(e.error==='interrupted' || e.error==='canceled') return; fail(e.error||'error'); };
    synth.speak(u);
  };
  const go = () => setTimeout(()=>attempt([],0), busy ? 80 : 0);
  if(!VOICES.length){ loadVoices(); if(!VOICES.length){ let done=false; const ready=()=>{ if(done) return; done=true; loadVoices(); go(); }; synth.addEventListener('voiceschanged', ready, {once:true}); setTimeout(ready, 1000); return; } }
  go();
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
  if(key.startsWith('n:')){ try{ return qNumber(numFromKey(key), 'listen'); }catch(e){ return null; } }
  if(key.startsWith('w:')){ const w=WORD[key]; return w ? qVocab(w,r) : null; }
  if(key.startsWith('v:')){ const v=VERB[key]; return v ? qVerb(v,r) : null; }
  if(key.startsWith('r:')){ const v=REGS.find(x=>x.key===key); return v ? qEd(v,r) : null; }
  const [tid, i] = key.split('#'); const t=TOPIC[tid]; if(!t || !t.parsed[+i]) return null; return qFromItem(t.parsed[+i], r);
}

/* ---------- selección diaria ---------- */
/* SELECCION:inicio — historial, dominio y elección "nuevo o repaso" (funciones puras, probadas en test5.js) */
const MASTERY_K = {topic:10, item:3, word:4, verb:4};
const NEW_RATIO = 0.7;                                     // 70% contenido nunca visto, 30% repaso
const kOf = key => key.startsWith('w:') ? MASTERY_K.word : (key.startsWith('v:')||key.startsWith('r:')) ? MASTERY_K.verb : key.includes('#') ? MASTERY_K.item : MASTERY_K.topic;
/* historial por unidad (ejercicio, tema, palabra, verbo) con los eventos de días ANTERIORES a hoy y la línea base */
function buildHistory(events, base, today){
  const H = {};
  for(const k in (base && base.stat) || {}){ const st = base.stat[k]; if(st && st.n) H[k] = {n:st.n, last:'', recent:[], base:{n:st.n, ok:st.ok}}; }
  const add = (k, ok, day) => { const h = H[k] = H[k] || {n:0, last:'', recent:[]}; h.n++; if(day > h.last) h.last = day; h.recent.push(ok ? 1 : 0); if(h.recent.length > 10) h.recent.shift(); };
  const evs = (events || []).filter(e => !e.task && e.k && e.day < today).sort((a,b) => (a.day<b.day?-1:a.day>b.day?1:0) || a.t-b.t);
  for(const e of evs){ add(e.k, e.ok, e.day); if(e.tp) add(e.tp, e.ok, e.day); }
  return H;
}
/* dominio 0–1: aciertos en las últimas K respuestas / K (lo que falta para K cuenta como no logrado).
   La línea base (sin fechas) aporta hasta un 80%. En palabras también cuenta la caja de flashcards (5 = 100%). */
function mastery(H, key, box){
  const h = H[key], K = kOf(key); let m = 0;
  if(h){
    const r = h.recent.slice(-K); m = r.reduce((a,b)=>a+b, 0) / K;
    if(h.base && r.length < K) m += Math.min(K - r.length, h.base.n) * (h.base.ok / h.base.n) * 0.8 / K;
  }
  if(box) m = Math.max(m, box / 5);
  return Math.min(1, m);
}
/* probabilidad según dominio: normal hasta 50%, luego baja en curva hasta casi nula al 100% */
const masteryWeight = m => m <= 0.5 ? 1 : Math.max(0.02, Math.pow((1 - m) / 0.5, 2));
const daysBetween = (a, b) => Math.round((Date.UTC(+b.slice(0,4), +b.slice(5,7)-1, +b.slice(8,10)) - Date.UTC(+a.slice(0,4), +a.slice(5,7)-1, +a.slice(8,10))) / 86400000);
/* repaso espaciado: nada de los últimos 2 días; el peso sube hasta los 7 días */
const recencyWeight = (last, today) => { if(!last) return 1; const d = daysBetween(last, today); return d <= 2 ? 0 : Math.min(1, (d - 2) / 5); };
function weightedOf(list, f, r){ const ws = list.map(f); const tot = ws.reduce((a,b)=>a+b, 0); if(!(tot > 0)) return null; let x = r() * tot; for(let i=0;i<list.length;i++){ x -= ws[i]; if(x <= 0 && ws[i] > 0) return list[i]; } return list.filter((_,i)=>ws[i]>0).pop() || null; }
/* elige un candidato: con probabilidad NEW_RATIO entre lo nunca visto, si no entre lo visto; si una lista no tiene opciones, usa la otra */
function pickNewOrReview(cands, r, o){
  const fresh = [], old = []; cands.forEach(c => (o.seen(c) ? old : fresh).push(c));
  const wantNew = r() < (o.ratio ?? NEW_RATIO);
  return (wantNew ? weightedOf(fresh, o.newW, r) : weightedOf(old, o.oldW, r)) || (wantNew ? weightedOf(old, o.oldW, r) : weightedOf(fresh, o.newW, r));
}
/* pesos para ejercicios de gramática: el tema reparte su peso entre sus ejercicios (nuevos o vistos) */
function grammarOptions(tps, H, today, usedT, topicBase){
  const per = {}; tps.forEach(t => { per[t.id] = {u:0, s:0}; t.parsed.forEach(it => H[it.key] ? per[t.id].s++ : per[t.id].u++); });
  const div = t => 1 + (usedT[t.id] || 0) * 2;
  return {
    seen: it => !!H[it.key],
    newW: it => { const t = TOPIC_OF(it); return topicBase(t) * Math.max(0.2, masteryWeight(mastery(H, t.id))) / (per[t.id].u || 1) / div(t); },
    oldW: it => { const t = TOPIC_OF(it), h = H[it.key]; return topicBase(t) * masteryWeight(mastery(H, it.key)) * masteryWeight(mastery(H, t.id)) * recencyWeight(h && h.last, today) / (per[t.id].s || 1) / div(t); },
  };
}
/* SELECCION:fin */
const TOPIC_OF = it => TOPIC[it.topic];
/* foto del inicio del día: errores pendientes y cajas de flashcards (así el reto no cambia mientras practicas) */
function snap(){
  if(!S.snap || S.snap.date!==TODAY || !S.snap.cb){ S.snap={date:TODAY, miss:{...S.miss}, cb:Object.fromEntries(Object.entries(S.cards).map(([k,c])=>[k,c.b]))}; save(); }
  return S.snap;
}
let HIST = null;
function hist(){ if(!HIST || HIST.day!==TODAY || HIST.n!==S.ev.length || HIST.base!==S.base){ HIST = {day:TODAY, n:S.ev.length, base:S.base, H:buildHistory(S.ev, S.base, TODAY)}; } return HIST.H; }
/* historial incluyendo hoy: solo para mostrar avance (vistos, dominio), no para elegir */
let HISTNOW = null;
function histNow(){ if(!HISTNOW || HISTNOW.n!==S.ev.length || HISTNOW.base!==S.base){ HISTNOW = {n:S.ev.length, base:S.base, H:buildHistory(S.ev, S.base, '9999-12-31')}; } return HISTNOW.H; }
const topicBase = t => { const s=status(t.book,t.file); return s==='actual'?4 : s==='visto'?2.4 : s==='base'?1.4 : 0.8; };
const wordBase = (w, M) => { const g=GROUP[w.g]; const s=status(g.book,g.file); return (s==='actual'?3:s==='visto'?2:1.2) * (M && M[w.key]?2:1); };
function eligibleTopics(){ return GRAMMAR.filter(t=>eligible(t.book,t.file)); }
function eligibleWords(){ return WORDS.filter(w=>{ const g=GROUP[w.g]; return eligible(g.book,g.file); }); }
function eligibleVerbs(){ return VERBS; }
function wordOptions(H, cb, M){
  return { seen: w => !!H[w.key] || !!cb[w.key],
    newW: w => wordBase(w, M),
    oldW: w => wordBase(w, M) * masteryWeight(mastery(H, w.key, cb[w.key])) * recencyWeight(H[w.key] && H[w.key].last, TODAY) };
}
function verbOptions(H, M){
  const b = v => (M && M[v.key] ? 3 : 1) * (v.lvl===1 ? 1.3 : 1);
  return { seen: v => !!H[v.key], newW: b, oldW: v => b(v) * masteryWeight(mastery(H, v.key)) * recencyWeight(H[v.key] && H[v.key].last, TODAY) };
}
/* elige n sin repetir, aplicando la regla nuevo/repaso en cada elección */
function pickMany(cands, n, r, o, used=new Set(), keyOf=c=>c.key){
  const out = []; let pool = cands.filter(c=>!used.has(keyOf(c)));
  while(out.length < n && pool.length){ const c = pickNewOrReview(pool, r, o); if(!c) break; out.push(c); used.add(keyOf(c)); pool = pool.filter(x=>x!==c); }
  return out;
}
function pickGrammar(tps, n, r, used=new Set(), usedT={}, filter=()=>true){
  const H = hist(), out = [];
  let pool = tps.flatMap(t=>t.parsed).filter(it=>!used.has(it.key) && filter(it));
  while(out.length < n && pool.length){
    const it = pickNewOrReview(pool, r, grammarOptions(tps, H, TODAY, usedT, topicBase)); if(!it) break;
    out.push(it); used.add(it.key); usedT[it.topic]=(usedT[it.topic]||0)+1; pool = pool.filter(x=>x!==it);
  }
  return out;
}

function buildDaily(){
  const r = makeRng('reto:'+TODAY), N = S.settings.daily, H = hist(), sp = snap(), M = sp.miss;
  const nG = Math.round(N*0.5), nV = Math.round(N*0.2), nB = Math.round(N*0.2);
  const qs=[], used=new Set(), usedT={};
  // errores pendientes primero (máx. 3)
  Object.keys(M).filter(k=>!k.startsWith('n:')).sort((a,b)=>M[b]-M[a] || (a<b?-1:1)).slice(0,3).forEach(k=>{ const q=qFromKey(k,r); if(q){ qs.push(q); used.add(k); } });
  pickGrammar(eligibleTopics(), Math.max(0, nG - qs.length), r, used, usedT).forEach(it=>qs.push(qFromItem(it, r)));
  const ws = eligibleWords();
  pickMany(ws, nV, r, wordOptions(H, sp.cb, M), used).forEach(w=>qs.push(qVocab(w,r)));
  const vs = pickMany(VERBS, nB, r, verbOptions(H, M), used);
  vs.forEach((v,i)=>{ if(i===0 && r()>0.5){ const re = pickMany(REGS, 1, r, verbOptions(H, M), used)[0]; if(re){ qs.push(qEd(re,r)); return; } } qs.push(qVerb(v,r)); });
  // emparejar: el grupo con más palabras sin ver
  const unseenBy = {}; ws.forEach(w=>{ if(!H[w.key] && !sp.cb[w.key]) unseenBy[w.g]=(unseenBy[w.g]||0)+1; });
  const gid = weightedOf(Object.keys(GROUP).filter(g=>ws.some(w=>w.g===g)), g=>1+(unseenBy[g]||0)*3, r) || pick(ws,r).g;
  const gw = shuffle(GROUP[gid].words, r).sort((a,b)=>(!!H[a.key]||!!sp.cb[a.key]) - (!!H[b.key]||!!sp.cb[b.key]));
  const out = shuffle(qs, r).slice(0, N-2);
  out.splice(Math.floor(out.length/2), 0, qMatch(gw, r));
  const idw = idiomWord(r()<0.5 ? rot(IDS,'idioms') : pick(IDS, r));
  out.splice(Math.floor(out.length*0.8), 0, qIdiom(idw, r));
  return out;
}
/* flashcards del día: ~70% palabras nuevas y ~30% repaso de las pendientes (primero las de caja más baja) */
function dailyWords(n=10){
  const r = makeRng('words:'+TODAY), pool = eligibleWords();
  const due = pool.filter(w=>S.cards[w.key] && S.cards[w.key].due<=TODAY).sort((a,b)=>S.cards[a.key].b-S.cards[b.key].b);
  const o={actual:0,visto:1,extra:2,base:2,proximo:3};
  const fresh = shuffle(pool.filter(w=>!S.cards[w.key]), r).sort((a,b)=>o[status(GROUP[a.g].book,GROUP[a.g].file)]-o[status(GROUP[b.g].book,GROUP[b.g].file)]);
  const freshMix = shuffle(fresh.slice(0, 60), r);
  const nDue = Math.min(due.length, Math.max(n - freshMix.length, Math.round(n*(1-NEW_RATIO))));
  return shuffle(due.slice(0, nDue).concat(freshMix.slice(0, n - nDue)), r);
}
function dailyVerbs(n=5){
  const r = makeRng('verbs:'+TODAY), M = snap().miss, H = hist();
  const miss = VERBS.filter(v=>M[v.key]).sort((a,b)=>M[b.key]-M[a.key]).slice(0,2);
  return miss.concat(pickMany(VERBS, n - miss.length, r, verbOptions(H, M), new Set(miss.map(v=>v.key))));
}
function topicOfDay(){
  const r=makeRng('topic:'+TODAY), H=hist();
  return weightedPick(eligibleTopics(), t=>{ const h=H[t.id]; const recent = h && h.last && daysBetween(h.last, TODAY) <= 3; return topicBase(t) * masteryWeight(mastery(H, t.id)) * (recent ? 0.3 : 1); }, r);
}
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
