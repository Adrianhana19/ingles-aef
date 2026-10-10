/* ===================== VISTAS ===================== */

/* ---------- piezas comunes ---------- */
function toast(msg, action){
  $$('.toast').forEach(t=>t.remove());
  const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status');
  t.innerHTML = `<span>${esc(msg)}</span>${action?`<button class="toast-act">${esc(action.label)}</button>`:''}`;
  document.body.appendChild(t);
  if(action) t.querySelector('.toast-act').onclick=()=>{ t.remove(); action.run(); };
  setTimeout(()=>t.remove(), action?9000:2600);
}
const B = (label, icon='', cls='', attrs='') => `<button class="btn ${cls}" ${attrs}>${icon?ic(icon,18):''}<span>${label}</span></button>`;
const IB = (icon, title, attrs='') => `<button class="icon-btn" title="${esc(title)}" aria-label="${esc(title)}" ${attrs}>${ic(icon,18)}</button>`;
function pageHead(title, sub='', actions=''){ return `<header class="phead"><div><h1>${title}</h1>${sub?`<p class="lead">${sub}</p>`:''}</div>${actions?`<div class="row">${actions}</div>`:''}</header>`; }
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
const fmtDay = d => { const s=parseYmd(d).toLocaleDateString('es-SV',{weekday:'long', day:'numeric', month:'long'}); return s.charAt(0).toUpperCase()+s.slice(1); };
const fmtShort = d => parseYmd(d).toLocaleDateString('es-SV',{day:'numeric', month:'short'}).replace('.','');
const fmtTime = t => new Date(t).toLocaleString('es-SV',{day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).replace('.','');
const bookLabel = (b,f) => b==='X' ? 'Extra' : b==='B' ? `AEF 1, File ${f}` : b===1 ? `AEF 1, File ${f}` : `AEF 2, File ${f}`;

/* fórmula de gramática como un pequeño editor de código */
const SUBJ = new Set('i you he she it we they subject somebody someone'.split(' '));
const AUX = new Set("am is are was were be been being do does did don't doesn't didn't have has had haven't hasn't hadn't will won't would wouldn't can can't could couldn't should shouldn't must mustn't might going to not isn't aren't wasn't weren't 'm 're 's 've 'll 'd used there".split(' '));
const KW = new Set('verb base participle past infinitive adjective adj noun verb-ing -ing -ed +s +es -er -est wh- q aux s v o object plural singular'.split(' '));
function hl(f){
  return (f.match(/\([^)]*\)|[A-Za-z'’+\-]+|[^A-Za-z'’(+\-]+/g)||[]).map(tok=>{
    const low = tok.toLowerCase().replace(/’/g,"'");
    if(tok[0]==='(') return `<span class="tk-c">${esc(tok)}</span>`;
    if(/^[A-Za-z'’+\-]+$/.test(tok)){
      if(SUBJ.has(low)) return `<span class="tk-s">${esc(tok)}</span>`;
      if(AUX.has(low)) return `<span class="tk-a">${esc(tok)}</span>`;
      if(KW.has(low)) return `<span class="tk-k">${esc(tok)}</span>`;
      return esc(tok);
    }
    return esc(tok).replace(/·/g,'<span class="tk-p">·</span>').replace(/→/g,'<span class="tk-p">→</span>');
  }).join('');
}
const SIGN = {p:'+', n:'−', q:'?', i:'//'};
function codeBlock(t, lines=t.form){
  const file = t.title.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')+'.en';
  return `<figure class="code" aria-label="Estructura de ${esc(t.title)}"><figcaption class="code-bar"><span class="code-dots"><i></i><i></i><i></i></span><span class="code-file">${esc(file)}</span></figcaption>
    <ol class="code-body">${lines.map(([k,f])=>`<li class="cl-${k}"><span class="code-sign">${SIGN[k]}</span><span class="code-line">${k==='i'?`<span class="tk-c">${esc(f)}</span>`:hl(f)}</span></li>`).join('')}</ol></figure>`;
}
function keyLabel(k){
  if(k.startsWith('w:')){ const w=WORD[k]; return w ? w.w : k; }
  if(k.startsWith('v:')){ const v=VERB[k]; return v ? `${v.b} (irregular)` : k; }
  if(k.startsWith('r:')) return k.slice(2)+' (-ed)';
  const t=TOPIC[k.split('#')[0]]; return t ? `${unitLabel(t)} ${t.title}` : k;
}
const keyKind = k => k.startsWith('w:') ? 'vocab' : (k.startsWith('v:')||k.startsWith('r:')) ? 'verbs' : 'grammar';

/* tooltip para gráficas (cursor, foco o toque) */
const tip = document.createElement('div'); tip.className='tip'; tip.setAttribute('role','tooltip'); document.body.appendChild(tip);
function showTip(el){ tip.innerHTML = el.dataset.tip; tip.classList.add('on'); const r=el.getBoundingClientRect(), tr=tip.getBoundingClientRect();
  let x = r.left + r.width/2 - tr.width/2; x = Math.max(8, Math.min(x, innerWidth - tr.width - 8));
  let y = r.top - tr.height - 8; if(y < 8) y = r.bottom + 8; tip.style.left = x+'px'; tip.style.top = y+'px'; }
const hideTip = () => tip.classList.remove('on');
document.addEventListener('pointerover', e=>{ const el=e.target.closest('[data-tip]'); if(el) showTip(el); else hideTip(); });
document.addEventListener('focusin', e=>{ const el=e.target.closest('[data-tip]'); if(el) showTip(el); });
document.addEventListener('focusout', hideTip); addEventListener('scroll', hideTip, {passive:true});

/* ================== RUTAS ================== */
const TABS = [['hoy','home','Hoy'],['ejercicios','target','Ejercicios'],['vocabulario','image','Vocabulario'],['verbos','repeat','Verbos'],['gramatica','book','Gramática'],['progreso','chart','Progreso']];
function renderTabs(cur){
  const h = TABS.map(([id,icon,l])=>`<button class="tab ${cur===id?'on':''}" data-go="${id}" ${cur===id?'aria-current="page"':''}>${ic(icon,20)}<span>${l}</span></button>`).join('');
  $('#tabs').innerHTML=h; $('#bnav').innerHTML=h;
}
document.addEventListener('click', e => { const b=e.target.closest('[data-go]'); if(b){ e.preventDefault(); go(b.dataset.go); } });
document.addEventListener('click', e => { const b=e.target.closest('[data-say]'); if(b){ e.stopPropagation(); speak(b.dataset.say, b.dataset.slow==='1'); } });
$('#gear').innerHTML = ic('sliders',20); $('#gear').onclick = () => go('ajustes');
function go(h){ if(location.hash==='#'+h) route(); else location.hash=h; }
let SESSION=null;
function updatePill(){ const s=streak(); $('#streakPill').innerHTML = `${ic('flame',16)}<b>${s}</b>`; $('#streakPill').title = `Racha: ${s} día(s) seguidos`; }
function route(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  hideTip();
  const h = decodeURIComponent(location.hash.slice(1)) || 'hoy'; const [v, arg] = h.split('/');
  const tabFor = {quiz:'ejercicios', flash:'vocabulario', ajustes:'progreso'};
  document.body.classList.toggle('focus', v==='quiz' || v==='flash');
  renderTabs(tabFor[v] || v); updatePill();
  window.scrollTo(0,0);
  const views = {hoy:vHome, ejercicios:vExercises, vocabulario:vVocab, verbos:vVerbs, gramatica:vGrammar, progreso:vProgress, ajustes:vSettings, quiz:vQuiz, flash:vFlash};
  (views[v] || vHome)(arg);
}
window.addEventListener('hashchange', route);

/* ================== HOY ================== */
let TWOFF=0;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function weekDots(){
  const dow=(parseYmd(TODAY).getDay()+6)%7; const mon=addDays(TODAY,-dow);
  return ['L','M','M','J','V','S','D'].map((l,i)=>{ const d=addDays(mon,i); const on=practiced(d), today=d===TODAY, fut=d>TODAY;
    return `<span class="wd ${on?'on':''} ${today?'today':''} ${fut?'fut':''}" title="${fmtShort(d)}${on?': practicaste':''}"><i>${on?ic('check',12):''}</i>${l}</span>`; }).join('');
}
function vHome(){
  const d = day(), tasks = d.tasks||{}, s = streak();
  const hour = new Date().getHours(); const saludo = hour<12?'Buenos días':hour<19?'Buenas tardes':'Buenas noches';
  const curT = GRAMMAR.filter(t=>t.book===2 && t.file===S.settings.cur);
  const t = topicOfDay(), tw = rot(TW, 'tw', TWOFF), idm = rot(IDS, 'idioms'), dv = dailyVerbs();
  const doneN = ['words','verbs','reto'].filter(k=>tasks[k]).length;
  const step = (n, k, title, desc, meta, act) => `<li class="step ${tasks[k]?'done':''}">
      <span class="step-n" aria-hidden="true">${tasks[k]?ic('check',16):n}</span>
      <div class="step-txt"><b>${title}</b><span>${desc}</span></div>
      <span class="step-meta">${meta}</span>
      <button class="btn ${tasks[k]?'ghost':'primary'} sm" data-act="${act}">${tasks[k]?'Repetir':'Empezar'}</button></li>`;
  app.innerHTML = `
  <section class="band"><div class="wrap band-in">
    <div class="band-main">
      <p class="band-date">${fmtDay(TODAY)}</p>
      <h1 class="band-title">${saludo}.</h1>
      <p class="band-sub">Vas en el File ${S.settings.cur} de AEF 2: ${curT.map(x=>esc(x.title.toLowerCase())).join(', ')}.</p>
      <div class="row band-actions">${B(tasks.reto?'Repetir el reto del día':'Empezar el reto del día','play','cta lg','data-act="reto"')}${B('Flashcards del día','cards','on-dark lg','data-act="words"')}</div>
    </div>
    <aside class="streak-card" aria-label="Racha">
      <div class="streak-top">${ic('flame',28,'flame')}<div><b class="streak-n">${s}</b><span>${s===1?'día seguido':'días seguidos'}</span></div></div>
      <div class="week">${weekDots()}</div>
      <p class="streak-foot">Mejor racha: ${bestStreak()} · Hoy: ${d.q} respuestas${d.q?`, ${pct(d.ok,d.q)}% bien`:''}</p>
    </aside>
  </div></section>
  <div class="wrap page">
    <section class="block">
      <div class="block-head"><h2>Plan de hoy</h2><span class="muted">${doneN} de 3 completadas</span></div>
      <ol class="steps">
        ${step(1,'words','Palabras del día','10 flashcards: escribes el significado y la app te corrige.','10 tarjetas','words')}
        ${step(2,'verbs','Verbos del día',`${dv.map(v=>v.b).join(', ')}: pasado, participio y significado.`,'10 preguntas','verbs')}
        ${step(3,'reto','Reto del día','Gramática, vocabulario, verbos e idioms. Primero salen tus errores pendientes.',`${S.settings.daily} preguntas`,'reto')}
      </ol>
    </section>
    <div class="grid g3 block">
      <article class="panel">
        <div class="panel-head"><h3>Trabalenguas del día</h3><span class="tag">${esc(tw.snd)}</span></div>
        <p class="tw-text" id="twText">${tw.t.split(' ').map((x,i)=>`<span data-i="${i}">${esc(x)}</span>`).join(' ')}</p>
        <p class="tw-link" aria-label="Linking">${esc(tw.link).replace(/‿/g,'<b class="lk">‿</b>')}</p>
        <p class="muted small">${esc(tw.es)}</p>
        <div class="row">${B('Escuchar','volume','ghost sm',`data-say="${esc(tw.t)}"`)}${B('Lento','slow','ghost sm',`data-say="${esc(tw.t)}" data-slow="1"`)}${SR?B('Intentarlo','mic','primary sm','id="twMic"'):''}${IB('shuffle','Otro trabalenguas','id="twNext"')}</div>
        <div id="twRes"></div>
        <p class="note">${ic('bulb',16)}<span>${esc(tw.tip)}</span></p>
      </article>
      <article class="panel">
        <div class="panel-head"><h3>Idiom del día</h3><span class="tag">${IDS.length} en total</span></div>
        <p class="idiom">${esc(idm.w)} ${spk(idm.w)}</p>
        <p class="idiom-mean">${esc(idm.es)}</p>
        <p class="muted small">Literal: “${esc(idm.lit)}”</p>
        <div class="example"><div><b>${esc(idm.ex)}</b><span>${esc(idm.exEs)}</span></div>${spk(idm.ex)}</div>
        <p class="ve"><span class="flag" aria-hidden="true">🇻🇪</span>${idm.ve?`<span>En Venezuela: <b>${esc(idm.ve)}</b></span>`:`<span>No hay un equivalente venezolano exacto. En español: <b>${esc(idm.es)}</b></span>`}</p>
        <div class="row">${B('Practicar idioms','target','primary sm','id="idQuiz"')}${B('Ver todos','right','ghost sm','data-go="vocabulario/v-idioms"')}</div>
      </article>
      <article class="panel">
        <div class="panel-head"><h3>Tema del día</h3>${stChip(t.book,t.file)}</div>
        <p class="topic-name"><span class="unit">${unitLabel(t)}</span>${esc(t.title)}</p>
        <p class="muted small">${esc(t.es)}</p>
        ${codeBlock(t, t.form.slice(0,3))}
        <div class="row">${B('Practicar','target','primary sm',`data-topicq="${t.id}"`)}${B('Ver estructura','book','ghost sm',`data-go="gramatica/${t.id}"`)}</div>
      </article>
    </div>
    <nav class="shortcuts block" aria-label="Atajos">
      <button class="shortcut" data-act="errors">${ic('history',22)}<span><b>Repasar errores</b><small>${Object.keys(S.miss).length} pendientes</small></span></button>
      <button class="shortcut" data-go="gramatica">${ic('book',22)}<span><b>Gramática</b><small>${GRAMMAR.length} temas</small></span></button>
      <button class="shortcut" data-go="vocabulario">${ic('image',22)}<span><b>Vocabulario</b><small>${WORDS.length} palabras</small></span></button>
      <button class="shortcut" data-go="verbos">${ic('repeat',22)}<span><b>Verbos</b><small>${VERBS.length} irregulares</small></span></button>
    </nav>
  </div>`;
  bindActs();
  $('#twNext').onclick=()=>{ TWOFF++; vHome(); $('#twText').scrollIntoView({block:'center'}); };
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
    if(a==='verbs'){ const vs=dailyVerbs(); const r=makeRng('vq:'+TODAY); const qs=[]; vs.forEach(v=>{ qs.push(qVerb(v,r,'past')); qs.push(qVerb(v,r,pick(['pp','mcpp','meaning'],r))); }); startQuiz(shuffle(qs,r), {title:'Verbos del día', task:'verbs'}); }
    if(a==='errors') startErrors();
  });
  $$('[data-topicq]', root).forEach(el=>el.onclick=()=>startTopicQuiz(el.dataset.topicq));
}
function startErrors(keys){
  keys = keys || Object.keys(S.miss).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,15);
  const qs = keys.map(k=>qFromKey(k)).filter(Boolean);
  if(!qs.length){ toast('No tienes errores pendientes.'); return; }
  startQuiz(shuffle(qs), {title:'Repaso de errores'});
}
function startTopicQuiz(id, n=10){
  const t=TOPIC[id]; let qs = shuffle(t.parsed).map(it=>qFromItem(it));
  const extra = t.parsed.filter(it=>it.type==='t'||it.type==='o').map(it=>({...qFromItem(it, freeRng, false), kind:'listen', label:'Dictado: escribe lo que escuchas', answers:it.answers||[it.sentence], say:it.sentence, hint:it.es}));
  qs = qs.concat(shuffle(extra)).slice(0, n);
  startQuiz(qs, {title:`${unitLabel(t)} ${t.title}`, topic:id});
}
function tryTwister(tw){
  const btn=$('#twMic'), res=$('#twRes'); let rec;
  try{ rec=new SR(); }catch(e){ toast('Tu navegador no tiene reconocimiento de voz.'); return; }
  rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=4;
  if('speechSynthesis' in window) speechSynthesis.cancel();
  btn.disabled=true; btn.querySelector('span').textContent='Te escucho…'; res.innerHTML='';
  rec.onresult=e=>scoreTwister(tw, [...e.results[0]].map(a=>a.transcript));
  rec.onerror=e=>{ res.innerHTML=`<p class="inline-msg bad">${ic('alert',16)}<span>${e.error==='not-allowed'||e.error==='service-not-allowed'?'Permite el uso del micrófono para practicar.':e.error==='no-speech'?'No se escuchó nada. Inténtalo otra vez, un poco más fuerte.':e.error==='network'?'El reconocimiento de voz necesita internet.':'No se pudo usar el micrófono ('+esc(e.error)+').'}</span></p>`; };
  rec.onend=()=>{ if(btn.isConnected){ btn.disabled=false; btn.querySelector('span').textContent='Intentarlo'; } };
  try{ rec.start(); }catch(e){ rec.onend(); }
}
function scoreTwister(tw, alts){
  const orig = tw.t.split(' '); let best=null;
  alts.forEach(a=>{ const pool=norm(a).split(' ');
    const hit = orig.map(w=>norm(w).split(' ').filter(Boolean).every(tok=>{ const k=pool.findIndex(x=>x===tok || (tok.length>3 && lev(x,tok)<=1)); if(k>=0){ pool.splice(k,1); return true; } return false; }));
    const sc = hit.filter(Boolean).length/orig.length; if(!best || sc>best.sc) best={sc,hit,a}; });
  $$('#twText [data-i]').forEach(sp=>{ sp.className = best.hit[+sp.dataset.i] ? 'hit' : 'miss'; });
  const p=Math.round(best.sc*100);
  const msg = p>=90?'Pronunciación clara.':p>=70?'Bien. Repite las palabras marcadas en rojo.':p>=40?'Escucha la versión lenta y repite las palabras en rojo.':'Escucha primero la versión lenta y vuelve a intentarlo.';
  $('#twRes').innerHTML = `<p class="inline-msg ${p>=70?'ok':'bad'}">${ic(p>=70?'check':'alert',16)}<span><b>${p}%</b> ${msg} Se entendió: “${esc(best.a)}”.</span></p>`;
}

/* ================== EJERCICIOS ================== */
function vExercises(){
  const book = S.exBook || 'all';
  const tps = GRAMMAR.filter(t=>book==='all' || String(t.book)===book);
  const mode = (id, icon, title, desc, attr) => `<button class="mode" ${attr||`id="${id}"`}><span class="mode-ic">${ic(icon,22)}</span><span><b>${title}</b><small>${desc}</small></span></button>`;
  app.innerHTML = `<div class="wrap page">
  ${pageHead('Ejercicios','El reto del día cambia cada día. También puedes practicar un modo concreto o un tema del libro.')}
  <section class="block"><div class="modes">
    ${mode('','target','Reto del día',`${S.settings.daily} preguntas${day().tasks.reto?', hecho hoy':''}`,'data-act="reto"')}
    ${mode('mMix','grid','Mezcla rápida','10 preguntas al azar')}
    ${mode('mListen','headphones','Listening','Dictados y palabras por audio')}
    ${mode('mOrder','order','Ordenar oraciones','Word order')}
    ${mode('mErr','search','Encontrar el error','Errores típicos de hispanohablantes')}
    ${mode('mTr','languages','Traducción','Del español al inglés')}
    ${mode('','history','Mis errores',`${Object.keys(S.miss).length} pendientes`,'data-act="errors"')}
    ${mode('mVocab','image','Vocabulario mixto','Imágenes y significados')}
  </div></section>
  <section class="block">
    <div class="block-head"><h2>Practicar por tema</h2>
      <div class="seg" role="tablist">${[['all','Todos'],['B','Base'],['1','A1++'],['2','A2']].map(([k,l])=>`<button class="${book===k?'on':''}" data-book="${k}">${l}</button>`).join('')}</div></div>
    <div class="topics">${tps.map(t=>{ const a=acc(t.id); return `<button class="topic" data-topicq="${t.id}">
       <span class="unit">${unitLabel(t)}</span>
       <span class="topic-main"><b>${esc(t.title)}</b><small>${esc(t.es)}</small></span>
       <span class="topic-side">${stChip(t.book,t.file)}<span class="meter" title="${a===null?'Sin practicar':Math.round(a*100)+'% de aciertos'}"><i style="width:${a===null?0:Math.round(a*100)}%"></i></span><small>${a===null?'Sin practicar':Math.round(a*100)+'%'}</small></span></button>`; }).join('')}</div>
  </section></div>`;
  bindActs();
  $$('[data-book]').forEach(b=>b.onclick=()=>{ S.exBook=b.dataset.book; save(); vExercises(); });
  const all = () => eligibleTopics().flatMap(t=>t.parsed);
  const asListen = it => ({...qFromItem(it,freeRng,false), kind:'listen', label:'Dictado: escribe lo que escuchas', answers:it.answers||[it.sentence], say:it.sentence, hint:it.es});
  $('#mMix').onclick=()=>{ const its=shuffle(all()).slice(0,7).map(it=>qFromItem(it)); const ws=shuffle(eligibleWords()).slice(0,2).map(w=>qVocab(w)); startQuiz(shuffle(its.concat(ws, [qVerb(pick(VERBS))])), {title:'Mezcla rápida'}); };
  $('#mListen').onclick=()=>{ const its=shuffle(all().filter(i=>i.type==='t'||i.type==='o')).slice(0,7).map(asListen); const ws=shuffle(eligibleWords()).slice(0,3).map(w=>qVocab(w,freeRng,'listenword')); startQuiz(shuffle(its.concat(ws)), {title:'Listening'}); };
  $('#mOrder').onclick=()=>{ const its=shuffle(all().filter(i=>i.type==='t'||i.type==='o')).slice(0,10).map(it=>({...qFromItem(it,freeRng,false), kind:'order', label:'Ordena la oración', words:tokens(it.sentence), sentence:it.sentence, hint:it.es})); startQuiz(its,{title:'Ordenar oraciones'}); };
  $('#mErr').onclick=()=>startQuiz(shuffle(all().filter(i=>i.type==='e')).slice(0,10).map(it=>qFromItem(it)),{title:'Encontrar el error'});
  $('#mTr').onclick=()=>startQuiz(shuffle(all().filter(i=>i.type==='t')).slice(0,10).map(it=>qFromItem(it,freeRng,false)),{title:'Traducción'});
  $('#mVocab').onclick=()=>{ const ws=shuffle(eligibleWords()).slice(0,9); startQuiz(shuffle(ws.map(w=>qVocab(w))).concat([qMatch(shuffle(ws))]),{title:'Vocabulario mixto'}); };
}

/* ================== MOTOR DEL QUIZ ================== */
function startQuiz(qs, opts={}){
  qs = qs.filter(Boolean); if(!qs.length){ toast('No hay preguntas disponibles.'); return; }
  SESSION = {type:'quiz', qs, i:0, score:0, wrong:[], res:[], opts, answered:false};
  go('quiz');
}
function lessonTop(i, n, res, exitId){
  return `<div class="lesson-top"><div class="wrap lesson-top-in">${IB('x','Salir',`id="${exitId}"`)}
    <div class="segs" aria-label="Pregunta ${i+1} de ${n}">${Array.from({length:n},(_,k)=>`<i class="${res[k]===true?'ok':res[k]===false?'bad':k===i?'cur':''}"></i>`).join('')}</div>
    <span class="count">${Math.min(i+1,n)} / ${n}</span></div></div>`;
}
function vQuiz(){
  if(!SESSION || SESSION.type!=='quiz'){ go('ejercicios'); return; }
  const Q=SESSION; if(Q.i>=Q.qs.length) return quizResult();
  const q=Q.qs[Q.i]; Q.answered=false;
  let body='';
  const visual = q.visual ? `<div class="q-visual">${imgTag(q.visual,'')}<span class="emo">${q.visual.e}</span></div>` : '';
  const prompt = q.prompt ? `<div class="q-prompt" id="qp">${q.prompt}</div>` : '';
  if(q.kind==='mc'){
    body = `${visual}${q.listen?`<div class="listen-row"><button class="speak" data-say="${esc(q.say)}">${ic('volume',28)}<span>Escuchar</span></button></div>`:''}${prompt}
      <div class="opts" role="group">${q.opts.map((o,k)=>`<button class="opt" data-o="${esc(o)}"><span class="opt-key">${'ABCD'[k]||k+1}</span><span class="opt-txt">${esc(o)}</span><span class="opt-mark"></span></button>`).join('')}</div>`;
  } else if(q.kind==='type'){
    body = `${visual}${prompt}<input class="answer" id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe tu respuesta" aria-label="Tu respuesta">`;
  } else if(q.kind==='listen'){
    body = `<div class="listen-row"><button class="speak" data-say="${esc(q.say)}">${ic('volume',28)}<span>Escuchar</span></button><button class="speak alt" data-say="${esc(q.say)}" data-slow="1">${ic('slow',28)}<span>Más lento</span></button></div>
      ${q.hint?`<p class="hint-row"><button class="btn text sm" id="showHint">${ic('bulb',16)}<span>Ver pista en español</span></button><span id="hint" class="hidden muted">${esc(q.hint)}</span></p>`:''}
      <input class="answer" id="ans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe lo que escuchas" aria-label="Lo que escuchas">`;
  } else if(q.kind==='order'){
    const ws = q.words.map((w,i)=> i===0 && w!=='I' && !/^I'/.test(w) ? w.charAt(0).toLowerCase()+w.slice(1) : w);
    q._display = ws; q._pool = shuffle(ws.map((w,i)=>({w,i}))); q._picked=[];
    body = `${q.hint?`<div class="q-prompt"><span class="lang">ES</span> ${esc(q.hint)}</div>`:''}<div class="tiles ans" id="tAns"></div><div class="tiles pool" id="tPool"></div>`;
  } else if(q.kind==='err'){
    const toks = [...q.pre.trim().split(' ').filter(Boolean).map(w=>({w,bad:false})), {w:q.bad, bad:true}, ...q.post.trim().split(' ').filter(Boolean).map(w=>({w,bad:false}))];
    q._toks=toks;
    body = `<div class="words">${toks.map((t,i)=>`<button data-t="${i}">${esc(t.w)}</button>`).join('')}</div>`;
  } else if(q.kind==='match'){
    q._done=0; q._miss=0; q._sel=null;
    body = `<div class="match"><div class="opts">${q.left.map(a=>`<button class="opt" data-l="${esc(a)}"><span class="opt-txt">${esc(a)}</span></button>`).join('')}</div><div class="opts">${q.right.map(b=>`<button class="opt" data-r="${esc(b)}"><span class="opt-txt">${esc(b)}</span></button>`).join('')}</div></div>`;
  }
  const canCheck = ['type','listen','order'].includes(q.kind);
  app.innerHTML = `<div class="lesson">${lessonTop(Q.i, Q.qs.length, Q.res, 'qx')}
    <div class="wrap lesson-body">
      <p class="q-kicker"><span>${q.label}</span>${q.tag?`<span class="q-tag">${esc(q.tag)}</span>`:''}</p>
      ${body}
      <div class="q-tools">${q.say && q.kind!=='listen' && !q.listen ? B('Escuchar','volume','text sm','id="sayBtn" disabled title="Disponible al responder"'):''}
        ${q.topic?`<a class="btn text sm" href="#gramatica/${q.topic}" target="_blank" rel="noopener" title="Abre la estructura en otra pestaña">${ic('external',16)}<span>Ver estructura</span></a>`:''}
        ${q.kind==='mc'?'<span class="kbd-hint">Teclas 1–4</span>':''}</div>
    </div>
    <div class="action-bar ${canCheck?'':'idle'}" id="ab"><div class="wrap action-in">
      <div id="fb" class="fb" aria-live="polite"></div>
      <div class="row action-btns">${canCheck?B('No sé','','ghost','id="skip"')+B('Comprobar','check','primary','id="check"'):''}${B(Q.i+1>=Q.qs.length?'Ver resultado':'Siguiente','right','primary hidden','id="next"')}</div>
    </div></div></div>`;
  $('#qx').onclick=()=>{ SESSION=null; go('ejercicios'); };
  const sayBtn=$('#sayBtn'); if(sayBtn) sayBtn.onclick=()=>speak(q.say);
  $('#next').onclick=()=>{ Q.i++; vQuiz(); };
  if(q.visual) loadImagesFor([q.visual]);
  if(q.kind==='listen' || q.listen) setTimeout(()=>speak(q.say), 350);
  const sh=$('#showHint'); if(sh) sh.onclick=()=>{ $('#hint').classList.remove('hidden'); sh.remove(); };

  if(q.kind==='mc'){
    $$('.opt[data-o]').forEach(b=>b.onclick=()=>{
      if(Q.answered) return; const ok = b.dataset.o===q.ans;
      $$('.opt[data-o]').forEach(x=>{ x.disabled=true; if(x.dataset.o===q.ans){ x.classList.add('right'); x.querySelector('.opt-mark').innerHTML=ic('check',18); } });
      if(!ok){ b.classList.add('wrong'); b.querySelector('.opt-mark').innerHTML=ic('x',18); }
      if(q.fill && $('#qp')) $('#qp').innerHTML = `${esc(q.fill.pre)}<span class="gap filled">${esc(q.ans)}</span>${esc(q.fill.post)}`;
      finish(ok, ok?'':`La respuesta es <b>${esc(q.ans)}</b>.`, b.dataset.o, q.ans);
    });
  }
  if(q.kind==='type' || q.kind==='listen'){
    const inp=$('#ans'); setTimeout(()=>inp.focus(),50);
    const doCheck=()=>{ if(Q.answered) return; const val=inp.value; const res=checkTyped(val, q.answers); inp.disabled=true; inp.classList.add(res.ok?'right':'wrong');
      const shown = q.kind==='listen' ? q.say : (q.showAns || q.answers[0]);
      if(q.fill && $('#qp')) $('#qp').innerHTML = `${esc(q.fill.pre)}<span class="gap filled">${esc(q.answers[0])}</span>${esc(q.fill.post)}`;
      let msg = res.ok ? (res.exact?'':`Revisa la ortografía: <b>${esc(res.best)}</b>.`) : `La respuesta es <b>${esc(shown)}</b>.`;
      if(q.kind==='listen' && q.hint && res.ok) msg += ` <span class="muted">${esc(q.hint)}</span>`;
      finish(res.ok, msg, val, shown); };
    $('#check').onclick=doCheck; inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); doCheck(); } };
    $('#skip').onclick=()=>{ inp.value=''; doCheck(); };
  }
  if(q.kind==='order'){
    const draw=()=>{ $('#tAns').innerHTML=q._picked.map((t,k)=>`<button class="tile" data-k="${k}">${esc(t.w)}</button>`).join('') || '<span class="muted small">Toca las palabras en orden</span>';
      $('#tPool').innerHTML=q._pool.map((t,k)=>`<button class="tile" data-p="${k}">${esc(t.w)}</button>`).join('');
      $$('[data-p]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; q._picked.push(q._pool.splice(+b.dataset.p,1)[0]); draw(); });
      $$('[data-k]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; q._pool.push(q._picked.splice(+b.dataset.k,1)[0]); draw(); }); };
    draw();
    const doCheck=()=>{ if(Q.answered) return; const got=q._picked.map(t=>t.w).join(' '); const ok = got.toLowerCase()===q._display.join(' ').toLowerCase();
      finish(ok, ok?esc(q.sentence):`El orden correcto es <b>${esc(q.sentence)}</b>.`, got, q.sentence); };
    $('#check').onclick=doCheck; $('#skip').onclick=()=>{ q._picked=[]; doCheck(); };
  }
  if(q.kind==='err'){
    $$('[data-t]').forEach(b=>b.onclick=()=>{ if(Q.answered) return; const t=q._toks[+b.dataset.t]; const ok=t.bad;
      $$('[data-t]').forEach(x=>{ x.disabled=true; if(q._toks[+x.dataset.t].bad) x.classList.add('right'); }); if(!ok) b.classList.add('wrong');
      finish(ok, `<b>${esc(q.bad)}</b> → <b>${esc(q.fix||'')}</b>. ${esc(q.correct)}`, t.w, `${q.bad} → ${q.fix}`); });
  }
  if(q.kind==='match'){
    const pairOf = a => q.pairs.find(p=>p.a===a);
    $$('[data-l]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('gone')) return; $$('[data-l]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); q._sel=b.dataset.l; speak(b.dataset.l); });
    $$('[data-r]').forEach(b=>b.onclick=()=>{ if(!q._sel || b.classList.contains('gone')) return; const p=pairOf(q._sel); const L=$(`[data-l="${CSS.escape(q._sel)}"]`);
      if(p.b===b.dataset.r){ [L,b].forEach(x=>{ x.classList.remove('sel'); x.classList.add('right'); setTimeout(()=>x.classList.add('gone'),250); }); q._sel=null; q._done++;
        if(q._done===q.pairs.length){ const ok=q._miss<=1; finish(ok, ok?'Todas las parejas están bien.':`Hubo ${q._miss} errores. Repasa estas palabras.`); } }
      else { q._miss++; b.classList.add('wrong'); setTimeout(()=>b.classList.remove('wrong'),400); record(p.key,false,{q:'match', g:`${p.a} = ${b.dataset.r}`, x:`${p.a} = ${p.b}`}); } });
  }

  function finish(ok, msg, given, expected){
    Q.answered=true; Q.res[Q.i]=ok; if(ok) Q.score++; else Q.wrong.push(q);
    if(q.kind!=='match') record(q.key, ok, {tp:q.topic, q:q.kind, g:given, x:expected});
    const exp = q.exp && !String(msg).includes(q.exp) ? `<span class="fb-exp">${q.exp}</span>` : '';
    $('#fb').innerHTML = `<div class="fb-in ${ok?'ok':'bad'}"><span class="fb-ic">${ic(ok?'check':'x',20)}</span><div><b>${ok?'Correcto':'Incorrecto'}</b>${msg?`<span class="fb-msg">${msg}</span>`:''}${exp}</div></div>`;
    $('#ab').classList.remove('idle'); $('#ab').classList.add(ok?'is-ok':'is-bad');
    ['check','skip'].forEach(id=>{ const x=$('#'+id); if(x) x.classList.add('hidden'); });
    const sb=$('#sayBtn'); if(sb){ sb.disabled=false; sb.title=''; }
    if(q.say && q.kind!=='match') speak(q.say);
    const nx=$('#next'); nx.classList.remove('hidden'); nx.focus();
    $$('.segs i')[Q.i].className = ok?'ok':'bad';
  }
}
document.addEventListener('keydown', e=>{
  if(!SESSION || SESSION.type!=='quiz' || e.target.tagName==='INPUT') return;
  if(e.key==='Enter' && SESSION.answered && document.activeElement?.id!=='next'){ const n=$('#next'); if(n && !n.classList.contains('hidden')){ e.preventDefault(); n.click(); } return; }
  if(!SESSION.answered && /^[1-4a-dA-D]$/.test(e.key)){ const k = /\d/.test(e.key) ? +e.key-1 : 'abcd'.indexOf(e.key.toLowerCase()); const o=$$('.opt[data-o]')[k]; if(o){ e.preventDefault(); o.click(); } }
});
function reviewLine(q){
  if(q.kind==='match') return 'Emparejar palabras';
  if(q.kind==='err') return esc(q.correct);
  if(q.kind==='order' || q.kind==='listen') return esc(q.say);
  if(q.kind==='mc') return q.fill && q.prompt ? esc(q.fill.pre)+'<b>'+esc(q.ans)+'</b>'+esc(q.fill.post) : `${q.prompt?q.prompt.replace(/<button[\s\S]*?<\/button>/g,'')+' → ':''}<b>${esc(q.ans)}</b>`;
  return q.fill ? esc(q.fill.pre)+'<b>'+esc(q.answers[0])+'</b>'+esc(q.fill.post) : (q.prompt.replace(/<[^>]+>/g,'')+' → <b>'+esc(q.showAns||q.answers[0])+'</b>');
}
function quizResult(){
  const Q=SESSION, n=Q.qs.length, p=pct(Q.score,n);
  if(Q.opts.task) markTask(Q.opts.task);
  updatePill();
  const msg = p>=90?'Dominas este contenido.':p>=70?'Buen resultado. Repasa lo que falló.':p>=50?'Vas bien, pero conviene repasar estos puntos.':'Repasa la estructura y vuelve a intentarlo.';
  app.innerHTML = `<div class="lesson">${lessonTop(n-1, n, Q.res, 'qx2')}<div class="wrap lesson-body result">
    <p class="q-kicker"><span>${esc(Q.opts.title||'Resultado')}</span></p>
    <p class="score"><b>${Q.score}</b><span>de ${n}</span></p>
    <div class="meter lg"><i style="width:${p}%"></i></div>
    <p class="lead">${p}% de aciertos. ${msg}</p>
    ${Q.wrong.length?`<h3>Para repasar</h3><ul class="review">${Q.wrong.map(q=>`<li><div><span>${reviewLine(q)}</span><small>${esc(q.tag||'')}</small></div>${q.topic?`<a class="icon-btn" href="#gramatica/${q.topic}" title="Ver estructura" aria-label="Ver estructura">${ic('book',18)}</a>`:''}</li>`).join('')}</ul>`:''}
    <div class="row result-actions">${Q.wrong.length?B('Repetir errores','repeat','primary','id="again"'):''}${B('Volver a Hoy','home','ghost','data-go="hoy"')}${B('Más ejercicios','target','ghost','data-go="ejercicios"')}</div>
  </div></div>`;
  $('#qx2').onclick=()=>go('hoy');
  const ag=$('#again'); if(ag) ag.onclick=()=>{ const ws=Q.wrong.map(q=>({...q})); startQuiz(shuffle(ws), {title:'Repetir errores'}); };
  SESSION=null;
}

/* ================== VOCABULARIO ================== */
function groupMastery(g){ const known=g.words.filter(w=>S.cards[w.key] && S.cards[w.key].b>=3).length; return known/g.words.length; }
function vVocab(arg){
  if(arg && GROUP[arg]) return vGroup(GROUP[arg]);
  const book = S.vBook || 'all'; const q = (S.vq||'').toLowerCase().trim();
  const gs = VOCAB.filter(g=>book==='all'||String(g.book)===book);
  const dw = dailyWords();
  const found = q ? WORDS.filter(w=>(w.w+' '+w.es).toLowerCase().includes(q)).slice(0,60) : [];
  const list = q
    ? `<section class="block"><div class="block-head"><h2>${found.length} resultado(s)</h2></div><div class="words-grid">${found.map(wordCard).join('')||'<p class="muted">No hay palabras con ese texto. Prueba en inglés o en español.</p>'}</div></section>`
    : `<section class="block"><div class="block-head"><h2>Palabras del día</h2>${B(day().tasks.words?'Repetir flashcards':'Empezar flashcards','cards','primary sm','data-act="words"')}</div>
        <div class="words-grid">${dw.slice(0,8).map(wordCard).join('')}</div></section>
      <section class="block"><div class="block-head"><h2>Temas</h2>
        <div class="seg">${[['all','Todos'],['B','Base'],['1','A1++'],['2','A2'],['X','Idioms']].map(([k,l])=>`<button class="${book===k?'on':''}" data-vbook="${k}">${l}</button>`).join('')}</div></div>
        <div class="groups">${gs.map(g=>{ const m=Math.round(groupMastery(g)*100); return `<button class="group" data-go="vocabulario/${g.id}">
          <span class="group-ic" aria-hidden="true">${g.icon}</span>
          <span class="group-main"><b>${esc(g.title)}</b><small>${esc(g.es)}</small><small class="muted">${g.words.length} palabras · ${bookLabel(g.book,g.file)}${status(g.book,g.file)==='actual'?' · actual':''}</small></span>
          <span class="group-side"><span class="meter"><i style="width:${m}%"></i></span><small>${m}% dominadas</small></span></button>`; }).join('')}</div></section>`;
  app.innerHTML = `<div class="wrap page">${pageHead('Vocabulario','Palabras de cada File del libro con foto, audio y un ejemplo.')}
    <label class="search">${ic('search',18)}<input id="vs" type="search" placeholder="Buscar una palabra en inglés o español" value="${esc(S.vq||'')}" aria-label="Buscar palabra"></label>${list}</div>`;
  const vs=$('#vs'); vs.oninput=()=>{ S.vq=vs.value; const pos=vs.selectionStart; vVocab(); const n=$('#vs'); n.focus(); n.setSelectionRange(pos,pos); };
  $$('[data-vbook]').forEach(b=>b.onclick=()=>{ S.vBook=b.dataset.vbook; save(); vVocab(); });
  bindActs();
  loadImagesFor(q ? found : dw.slice(0,8));
}
function wordCard(w){
  const c=S.cards[w.key];
  return `<article class="wcard"><div class="wimg">${imgTag(w)}<span class="emo" aria-hidden="true">${w.e}</span></div>
    <div class="wbody"><div class="wword"><b>${esc(w.w)}</b>${spk(w.w)}</div><span class="wes">${esc(w.es)}</span>
    ${w.ex?`<button class="wex" data-say="${esc(w.ex)}" title="Escuchar el ejemplo">${ic('play',12)}<span>${esc(w.ex)}</span></button>`:''}
    ${c?`<span class="boxes-mini" title="Caja ${c.b} de 5">${[1,2,3,4,5].map(b=>`<i class="${c.b>=b?'on':''}"></i>`).join('')}</span>`:''}</div></article>`;
}
function vGroup(g){
  app.innerHTML = `<div class="wrap page">
    <button class="back" data-go="vocabulario">${ic('left',16)}<span>Vocabulario</span></button>
    ${pageHead(`${esc(g.title)}`, `${esc(g.es)}. ${g.words.length} palabras, ${bookLabel(g.book,g.file)}.`, B('Flashcards','cards','primary','id="gFlash"')+B('Quiz de 10','target','ghost','id="gQuiz"')+B('Escuchar todo','volume','ghost','id="gSay"'))}
    <div class="words-grid">${g.words.map(wordCard).join('')}</div></div>`;
  $('#gFlash').onclick=()=>startFlash(shuffle(g.words), {title:g.title});
  $('#gQuiz').onclick=()=>{ const ws=shuffle(g.words); const qs=ws.slice(0,9).map(w=>qVocab(w)); qs.splice(4,0,qMatch(shuffle(g.words))); startQuiz(qs,{title:g.title}); };
  $('#gSay').onclick=()=>speak(g.words.map(w=>w.w).join('. '));
  loadImagesFor(g.words);
}

/* ---------- flashcards (Leitner) ---------- */
const FMODES=[['en-es','EN → ES','Escribes el significado en español'],['es-en','ES → EN','Escribes la palabra en inglés'],['quick','Rápido','Solo volteas y dices si la sabías']];
function startFlash(words, opts={}){
  if(!words.length){ toast('No hay palabras para repasar.'); return; }
  SESSION={type:'flash', words:words.slice(), i:0, total:words.length, firstOk:0, round:1, again:[], res:[], opts, mode:S.flashMode||'en-es'};
  go('flash');
}
function vFlash(){
  if(!SESSION || SESSION.type!=='flash'){ go('vocabulario'); return; }
  const F=SESSION;
  if(F.i>=F.words.length){
    if(F.again.length){ F.words=F.again; F.again=[]; F.i=0; F.round++; F.res=[]; toast('Ahora, las que fallaste.'); }
    else return flashDone();
  }
  const w=F.words[F.i]; const c=S.cards[w.key]||{b:0}; const M=F.mode;
  const pic = `${imgTag(w,'fimg')}<span class="big" aria-hidden="true">${w.e}</span>`;
  const front = M==='es-en'
    ? `${pic}<p class="fw">${esc(w.es)}</p><p class="muted small">¿Cómo se dice en inglés?</p>`
    : `${pic}<p class="fw">${esc(w.w)} ${spk(w.w)}</p><p class="muted small">${M==='quick'?'Toca la tarjeta para ver el significado':'¿Qué significa en español?'}</p>`;
  const back = `${imgTag(w,'fimg')}<div id="fres"></div><p class="fw">${esc(w.w)}</p><p class="fes">${esc(w.es)}</p>
    ${w.ex?`<p class="muted small fex">${esc(w.ex)}</p>`:''}
    <div class="row center">${spk(w.w)}${w.ex?IB('chat','Escuchar el ejemplo',`data-say="${esc(w.ex)}"`):''}</div>`;
  const controls = M==='quick'
    ? `<div class="row action-btns" id="frow">${B('Voltear','rotate','primary','id="flip"')}</div>`
    : `<input class="answer" id="fans" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${M==='es-en'?'Escribe la palabra en inglés':'Escribe el significado en español'}" aria-label="Tu respuesta">
       <div class="row action-btns" id="frow">${B('No sé','','ghost','id="idk"')}${B('Comprobar','check','primary','id="chk"')}</div>`;
  app.innerHTML = `<div class="lesson">${lessonTop(F.i, F.words.length, F.res, 'fx')}
    <div class="wrap lesson-body flash-body">
      <div class="flash-head"><p class="q-kicker"><span>${esc(F.opts.title||'Flashcards')}${F.round>1?', repaso':''}</span><span class="q-tag">${esc(GROUP[w.g].title)}</span></p>
        <div class="seg">${FMODES.map(([k,l,tt])=>`<button class="${M===k?'on':''}" data-fmode="${k}" title="${tt}">${l}</button>`).join('')}</div></div>
      <div class="flash-wrap"><div class="flash" id="card"><div class="face">${front}</div><div class="face back">${back}</div></div></div>
      <p class="box-line" title="Las tarjetas suben de caja cuando aciertas; en la caja 5 vuelven cada 16 días">Caja ${c.b||0} de 5 <span class="boxes-mini">${[1,2,3,4,5].map(b=>`<i class="${c.b>=b?'on':''}"></i>`).join('')}</span></p>
      ${M==='quick'?'<p class="kbd-hint center">Espacio para voltear, 1 si no la sabías, 2 si la sabías</p>':''}
    </div>
    <div class="action-bar" id="ab"><div class="wrap action-in flash-actions">${controls}</div></div></div>`;
  loadImagesFor([w]);
  if(M!=='es-en') setTimeout(()=>speak(w.w),300);
  const cd=$('#card');
  const answer=(ok, given)=>{ const cur=S.cards[w.key]||{b:0}; const nb = ok ? Math.min(5,(cur.b||0)+1) : 1;
    setCard(w.key, nb, addDays(TODAY, ok?INTERVAL[nb]:0));
    record(w.key, ok, {q:'flash', g:given, x: M==='es-en'?w.w:w.es});
    F.res[F.i]=ok; if(ok && F.round===1) F.firstOk++; if(!ok) F.again.push(w); F.i++; vFlash(); };
  if(M==='quick'){
    const flip=()=>{ if(cd.classList.contains('flip')) return; cd.classList.add('flip');
      $('#frow').innerHTML=B('No la sabía','x','ghost bad','id="no"')+B('La sabía','check','primary ok','id="yes"');
      $('#no').onclick=()=>answer(false); $('#yes').onclick=()=>answer(true); };
    cd.onclick=e=>{ if(!e.target.closest('[data-say]')) flip(); }; $('#flip').onclick=flip;
    F.keys = e => { if(e.target.tagName==='INPUT') return; if(e.key===' '){ e.preventDefault(); flip(); } if(cd.classList.contains('flip')){ if(e.key==='1') answer(false); if(e.key==='2') answer(true); } };
  } else {
    F.keys = null;
    const inp=$('#fans'); setTimeout(()=>inp.focus(),60); let result=null, val='';
    const check=(skip)=>{ if(result!==null) return; val = skip ? '' : inp.value.trim();
      const res = !val ? {ok:false} : M==='es-en' ? checkTyped(val, enAnswers(w)) : checkEs(val, w.es);
      result=res.ok; inp.disabled=true; inp.classList.add(res.ok?'right':'wrong'); cd.classList.add('flip'); speak(w.w);
      $('#fres').innerHTML = `<p class="fres ${res.ok?'ok':'bad'}">${ic(res.ok?'check':'x',16)}<span>${res.ok ? (res.exact?'Correcto':'Correcto, revisa la ortografía') : (val?`Escribiste “${esc(val)}”`:'No la sabías')}</span></p>`;
      $('#frow').innerHTML = `${!res.ok && val?B('Mi respuesta también vale','thumb','ghost','id="valid"'):''}${B('Siguiente','right','primary','id="nxt"')}`;
      const v=$('#valid'); if(v) v.onclick=()=>answer(true, val);
      $('#nxt').onclick=()=>answer(result, val); $('#nxt').focus(); };
    $('#chk').onclick=()=>check(false); $('#idk').onclick=()=>check(true);
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); check(false); } };
  }
  $('#fx').onclick=()=>{ SESSION=null; go('vocabulario'); };
  $$('[data-fmode]').forEach(b=>b.onclick=()=>{ F.mode=b.dataset.fmode; S.flashMode=F.mode; save(); vFlash(); });
}
document.addEventListener('keydown', e=>{ if(SESSION && SESSION.type==='flash' && SESSION.keys) SESSION.keys(e); });
function flashDone(){
  const F=SESSION; if(F.opts.task) markTask(F.opts.task); updatePill();
  const p=pct(F.firstOk,F.total);
  app.innerHTML = `<div class="lesson"><div class="wrap lesson-body result">
    <p class="q-kicker"><span>${esc(F.opts.title||'Flashcards')}</span></p>
    <p class="score"><b>${F.firstOk}</b><span>de ${F.total} a la primera</span></p>
    <div class="meter lg"><i style="width:${p}%"></i></div>
    <p class="lead">Las que sabías vuelven en unos días; las que fallaste, mañana.</p>
    <div class="row result-actions">${B('Volver a Hoy','home','primary','data-go="hoy"')}${B('Vocabulario','image','ghost','data-go="vocabulario"')}</div></div></div>`;
  SESSION=null;
}

/* ================== VERBOS ================== */
function vVerbs(){
  const f=S.verbF||'all', q=(S.verbQ||'').toLowerCase(); const dv=dailyVerbs();
  const rows = VERBS.filter(v=>(f==='all'||String(v.lvl)===f) && (!q || (v.b+' '+v.p+' '+v.pp+' '+v.es).toLowerCase().includes(q)));
  const regRows = REGS.filter(v=>!q || (v.b+' '+v.es).toLowerCase().includes(q));
  const mode = (id, icon, title, desc) => `<button class="mode" id="${id}"><span class="mode-ic">${ic(icon,22)}</span><span><b>${title}</b><small>${desc}</small></span></button>`;
  app.innerHTML = `<div class="wrap page">${pageHead('Verbos','Irregulares en sus tres formas y regulares con la pronunciación de <i>-ed</i>.')}
  <section class="block"><div class="block-head"><h2>Verbos del día</h2>${B(day().tasks.verbs?'Repetir el quiz':'Quiz del día','target','primary sm','data-act="verbs"')}</div>
    <div class="vday">${dv.map(v=>`<div class="vday-i"><div class="row between"><b>${v.b}</b>${spk(v.b+', '+v.p+', '+v.pp)}</div><span class="forms">${esc(v.p)} <i>·</i> ${esc(v.pp)}</span><small class="muted">${esc(v.es)}</small></div>`).join('')}</div></section>
  <section class="block"><div class="modes">${mode('qPast','left','Pasado','go → went')}${mode('qPP','check','Participio','go → gone')}${mode('qMix','grid','Mixto','Formas y significado')}${mode('qEd','headphones','Sonido de -ed','/t/, /d/ o /ɪd/')}</div></section>
  <section class="block">
    <div class="block-head"><h2>Lista completa</h2><div class="seg">${[['all','Todos'],['1','AEF 1'],['2','AEF 2'],['reg','Regulares']].map(([k,l])=>`<button class="${f===k?'on':''}" data-vf="${k}">${l}</button>`).join('')}</div></div>
    <label class="search">${ic('search',18)}<input id="vq" type="search" placeholder="Buscar un verbo" value="${esc(S.verbQ||'')}" aria-label="Buscar verbo"></label>
    ${f!=='reg'?`<div class="tablewrap"><table class="table"><thead><tr><th>Base</th><th>Pasado</th><th>Participio</th><th>Español</th><th><span class="sr">Audio</span></th></tr></thead><tbody>
    ${rows.map(v=>{ const a=acc(v.key); return `<tr class="${dv.includes(v)?'hl':''}"><td><b>${v.b}</b></td><td>${esc(v.p)}</td><td>${esc(v.pp)}</td><td class="muted">${esc(v.es)}${a!==null&&a<0.6?' <span class="chip st-bad">repasar</span>':''}</td><td>${spk(v.b+', '+v.p+', '+v.pp)}</td></tr>`; }).join('')}
    </tbody></table></div>`:''}
  </section>
  ${f==='reg'||f==='all'?`<section class="block"><div class="block-head"><h2>Regulares: cómo suena -ed</h2></div>
    <div class="ed-rules"><p><span class="ed">/t/</span> después de sonidos sordos (p, k, s, sh, ch, f): <i>worked, stopped, watched</i></p>
      <p><span class="ed">/d/</span> después de sonidos sonoros y vocales: <i>played, lived, called</i></p>
      <p><span class="ed">/ɪd/</span> solo después de t o d: <i>wanted, needed, visited</i></p></div>
    <div class="tablewrap"><table class="table"><thead><tr><th>Base</th><th>Pasado</th><th>-ed</th><th>Español</th><th><span class="sr">Audio</span></th></tr></thead><tbody>
    ${regRows.map(v=>`<tr><td><b>${v.b}</b></td><td>${v.p}</td><td><span class="ed">/${v.s==='id'?'ɪd':v.s}/</span></td><td class="muted">${esc(v.es)}</td><td>${spk(v.b+', '+v.p)}</td></tr>`).join('')}</tbody></table></div></section>`:''}
  </div>`;
  bindActs();
  const inp=$('#vq'); inp.oninput=()=>{ S.verbQ=inp.value; const p=inp.selectionStart; vVerbs(); const n=$('#vq'); n.focus(); n.setSelectionRange(p,p); };
  $$('[data-vf]').forEach(b=>b.onclick=()=>{ S.verbF=b.dataset.vf; save(); vVerbs(); });
  const pool = () => f==='1'||f==='2' ? VERBS.filter(v=>String(v.lvl)===f) : VERBS;
  $('#qPast').onclick=()=>startQuiz(shuffle(pool()).slice(0,10).map(v=>qVerb(v,freeRng,'past')),{title:'Quiz de pasado'});
  $('#qPP').onclick=()=>startQuiz(shuffle(pool()).slice(0,10).map(v=>qVerb(v,freeRng,pick(['pp','mcpp']))),{title:'Quiz de participios'});
  $('#qMix').onclick=()=>startQuiz(shuffle(pool()).slice(0,12).map(v=>qVerb(v)),{title:'Quiz mixto de verbos'});
  $('#qEd').onclick=()=>startQuiz(shuffle(REGS).slice(0,10).map(v=>qEd(v)),{title:'Sonido de -ed'});
}

/* ================== GRAMÁTICA ================== */
function vGrammar(arg){
  const t = TOPIC[arg] || TOPIC[S.lastTopic] || GRAMMAR.find(x=>status(x.book,x.file)==='actual') || GRAMMAR[0];
  S.lastTopic=t.id; save();
  const q=(S.gq||'').toLowerCase();
  const sec = (book, title) => { const ts=GRAMMAR.filter(x=>x.book===book && (!q || (x.title+' '+x.es).toLowerCase().includes(q))); if(!ts.length) return '';
    return `<p class="gnav-h">${title}</p>${ts.map(x=>`<button class="gitem ${x.id===t.id?'on':''}" data-go="gramatica/${x.id}" ${x.id===t.id?'aria-current="page"':''}><span class="unit sm">${unitLabel(x)}</span><span class="gitem-t">${esc(x.title)}</span>${status(x.book,x.file)==='actual'?`<span class="dot-actual" title="Tema actual"></span>`:''}</button>`).join('')}`; };
  const a=acc(t.id);
  const idx=GRAMMAR.indexOf(t), prev=GRAMMAR[idx-1], next=GRAMMAR[idx+1];
  app.innerHTML = `<div class="wrap page"><div class="gram">
    <aside class="gnav"><label class="search sm">${ic('search',16)}<input id="gq" type="search" placeholder="Buscar tema" value="${esc(S.gq||'')}" aria-label="Buscar tema"></label>
      ${sec('B','Base: AEF 1, Files 1–6')}${sec(1,'A1++: AEF 1, Files 7–12')}${sec(2,'A2: AEF 2')}</aside>
    <article class="gdoc">
      <div class="row between"><div class="row"><span class="unit">${unitLabel(t)}</span><span class="muted small">${BOOKNAME[t.book]}</span>${stChip(t.book,t.file)}</div>
        <a class="btn text sm" href="#gramatica/${t.id}" target="_blank" rel="noopener">${ic('external',16)}<span>Abrir en otra pestaña</span></a></div>
      <h1>${esc(t.title)}</h1><p class="lead">${esc(t.es)}</p>
      <h2>Estructura</h2>${codeBlock(t)}
      <h2>Cuándo se usa</h2><ul class="uses">${t.uses.map(u=>`<li>${u}</li>`).join('')}</ul>
      <h2>Ejemplos</h2><ul class="exs">${t.ex.map(([en,es])=>`<li><div><b>${esc(en)}</b><span>${esc(es)}</span></div>${spk(en)}</li>`).join('')}</ul>
      <h2>Errores típicos</h2><ul class="errs">${t.errs.map(([x,v,n])=>`<li><p class="err-x">${ic('x',16)}<s>${esc(x)}</s></p><p class="err-v">${ic('check',16)}<span>${esc(v)}</span></p><p class="muted small">${esc(n)}</p></li>`).join('')}</ul>
      <div class="gfoot">
        <div class="row">${B('Practicar este tema','target','primary',`data-topicq="${t.id}"`)}<span class="muted small">${a===null?'Aún sin practicar':'Tus aciertos: '+Math.round(a*100)+'%'}</span></div>
        <div class="row">${prev?B(unitLabel(prev),'left','ghost sm',`data-go="gramatica/${prev.id}" title="${esc(prev.title)}"`):''}${next?B(unitLabel(next),'right','ghost sm',`data-go="gramatica/${next.id}" title="${esc(next.title)}"`):''}</div></div>
    </article></div></div>`;
  bindActs();
  const gq=$('#gq'); gq.oninput=()=>{ S.gq=gq.value; const p=gq.selectionStart; vGrammar(t.id); const n=$('#gq'); n.focus(); n.setSelectionRange(p,p); };
  const on=$('.gitem.on'); if(on && innerWidth>900) on.scrollIntoView({block:'nearest'});
}

/* ================== PROGRESO + HISTORIAL ================== */
function weekStart(d){ const dow=(parseYmd(d).getDay()+6)%7; return addDays(d,-dow); }
function weeklyData(n=12){
  const cur=weekStart(TODAY); const out=[];
  for(let k=n-1;k>=0;k--){ const ws=addDays(cur,-7*k); let q=0, ok=0, days=0;
    for(let i=0;i<7;i++){ const x=S.days[addDays(ws,i)]; if(x){ q+=x.q||0; ok+=x.ok||0; if(x.q||x.cards) days++; } }
    out.push({ws, we:addDays(ws,6), q, ok, days, p: q? Math.round(ok/q*100) : null}); }
  return out;
}
function topicTrends(){
  const a0=addDays(TODAY,-13), b0=addDays(TODAY,-27), A={}, Bm={};
  S.ev.forEach(e=>{ if(!e.tp) return; const m = e.day>=a0 ? A : e.day>=b0 ? Bm : null; if(!m) return; const s=m[e.tp]=m[e.tp]||{n:0,ok:0}; s.n++; if(e.ok) s.ok++; });
  return Object.keys(A).filter(k=>A[k].n>=3 && TOPIC[k]).map(k=>({t:TOPIC[k], n:A[k].n, p:pct(A[k].ok,A[k].n), prev: Bm[k]&&Bm[k].n>=3 ? pct(Bm[k].ok,Bm[k].n) : null})).sort((x,y)=>x.p-y.p);
}
function repeatedErrors(){
  const g={};
  S.ev.forEach(e=>{ if(e.task || e.ok || !e.g) return; const id=e.k+'|'+e.g.toLowerCase(); const r=g[id]=g[id]||{k:e.k, g:e.g, x:e.x, n:0, last:0}; r.n++; r.last=Math.max(r.last,e.t); if(e.x) r.x=e.x; });
  return Object.values(g).sort((a,b)=>b.n-a.n || b.last-a.last);
}
function vProgress(){
  const days = Object.values(S.days); const totQ = days.reduce((a,d)=>a+(d.q||0),0), totOk = days.reduce((a,d)=>a+(d.ok||0),0);
  const daysN = Object.keys(S.days).filter(practiced).length;
  const W = weeklyData(), maxQ = Math.max(1, ...W.map(w=>w.q));
  let start = weekStart(addDays(TODAY,-34)); const cells=[]; for(let d=start; d<=addDays(weekStart(TODAY),6); d=addDays(d,1)) cells.push(d);
  const lvl = d => { const x=S.days[d]; if(!x) return 0; const n=(x.q||0)+(x.cards||0); return n>=50?4:n>=25?3:n>=10?2:n>0?1:0; };
  const trends = topicTrends(); const rep = repeatedErrors().slice(0,10);
  const weakW = Object.keys(S.miss).filter(k=>k.startsWith('w:')&&WORD[k]).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,8);
  const weakV = Object.keys(S.miss).filter(k=>k.startsWith('v:')&&VERB[k]).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,8);
  const boxes=[0,0,0,0,0,0]; Object.values(S.cards).forEach(c=>boxes[c.b||0]++); const maxBox=Math.max(1,...boxes.slice(1));
  const lastWithData = [...W].reverse().find(w=>w.q);
  app.innerHTML = `<div class="wrap page">${pageHead('Progreso','Todo lo que respondes queda registrado. Úsalo para ver qué mejora y qué repasar.', B('Ajustes','sliders','ghost sm','data-go="ajustes"'))}
  <section class="stats block">
    <div class="stat"><span class="stat-l">Racha actual</span><b>${streak()}</b><small>días seguidos</small></div>
    <div class="stat"><span class="stat-l">Mejor racha</span><b>${bestStreak()}</b><small>días</small></div>
    <div class="stat"><span class="stat-l">Días practicados</span><b>${daysN}</b><small>en total</small></div>
    <div class="stat"><span class="stat-l">Respuestas</span><b>${totQ.toLocaleString('es-SV')}</b><small>${pct(totOk,totQ)}% correctas</small></div>
  </section>
  <div class="grid g2 block">
    <section class="panel">
      <div class="panel-head"><h3>Aciertos por semana</h3><span class="muted small">últimas 12 semanas</span></div>
      <div class="colchart" role="img" aria-label="Porcentaje de aciertos por semana">
        <div class="cc-grid"><span style="bottom:100%"><em>100%</em></span><span style="bottom:50%"><em>50%</em></span><span style="bottom:0"><em>0%</em></span></div>
        <div class="cc-cols">${W.map(w=>`<div class="cc-col" tabindex="0" data-tip="<b>${fmtShort(w.ws)} – ${fmtShort(w.we)}</b><br>${w.q?`${w.p}% de aciertos<br>${w.q} respuestas en ${w.days} día(s)`:'Sin práctica'}">
          ${w.q?`<div class="cc-bar" style="height:${w.p}%">${w===lastWithData?`<span class="cc-val">${w.p}%</span>`:''}</div>`:'<div class="cc-empty"></div>'}</div>`).join('')}</div>
      </div>
      <div class="cc-x">${W.map((w,i)=>`<span>${i%3===2||i===W.length-1?fmtShort(w.ws):''}</span>`).join('')}</div>
      <details class="tableview"><summary>Ver como tabla</summary><table class="table sm"><thead><tr><th>Semana</th><th>Aciertos</th><th>Respuestas</th></tr></thead><tbody>${W.map(w=>`<tr><td>${fmtShort(w.ws)}</td><td>${w.q?w.p+'%':'—'}</td><td>${w.q}</td></tr>`).join('')}</tbody></table></details>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Días de práctica</h3><span class="muted small">últimas 5 semanas</span></div>
      <div class="heat">${['L','M','M','J','V','S','D'].map(x=>`<span class="hd">${x}</span>`).join('')}${cells.map(d=>{ const x=S.days[d]; const n=x?(x.q||0)+(x.cards||0):0; return `<span class="hc l${lvl(d)} ${d===TODAY?'today':''} ${d>TODAY?'fut':''}" tabindex="0" data-tip="<b>${fmtShort(d)}</b><br>${n?`${n} respuestas${x.q?`, ${pct(x.ok,x.q)}% bien`:''}`:'Sin práctica'}">${+d.slice(8)}</span>`; }).join('')}</div>
      <p class="legend"><span>Menos</span>${[0,1,2,3,4].map(l=>`<i class="hc l${l}"></i>`).join('')}<span>Más</span></p>
    </section>
  </div>
  <section class="panel block">
    <div class="panel-head"><h3>Temas: últimas 2 semanas</h3><span class="muted small">comparado con las 2 anteriores</span></div>
    ${trends.length?`<ul class="trends">${trends.map(({t,n,p,prev})=>{ const d=prev===null?null:p-prev; return `<li><button class="trend-t" data-go="gramatica/${t.id}"><span class="unit sm">${unitLabel(t)}</span><span>${esc(t.title)}</span></button>
      <span class="meter" title="${p}% de aciertos"><i style="width:${p}%"></i></span><b class="trend-p">${p}%</b>
      <span class="trend-d ${d===null?'':d>=5?'up':d<=-5?'down':''}">${d===null?'<span class="muted">nuevo</span>':d>=5?`${ic('trend_up',16)}<span>+${d} pts</span>`:d<=-5?`${ic('trend_down',16)}<span>${d} pts</span>`:`${ic('minus',16)}<span>igual</span>`}</span><small class="muted">${n} resp.</small></li>`; }).join('')}</ul>`
      :`<p class="empty">Cuando respondas al menos 3 preguntas de un tema en las últimas 2 semanas, aquí verás su porcentaje y si va mejorando.</p>`}
  </section>
  <section class="panel block">
    <div class="panel-head"><h3>Errores que se repiten</h3>${rep.length?B('Practicar estos','target','primary sm','id="pracRep"'):''}</div>
    ${rep.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Escribiste</th><th>Correcto</th><th>Veces</th><th>Dónde</th></tr></thead><tbody>
      ${rep.map(r=>`<tr><td><s class="bad-txt">${esc(r.g)}</s></td><td><b>${esc(r.x||'')}</b></td><td>${r.n}</td><td class="muted small">${esc(keyLabel(r.k))}</td></tr>`).join('')}</tbody></table></div>`
      :`<p class="empty">Aquí aparecerán tus respuestas incorrectas agrupadas, por ejemplo “goed” en vez de “went”, con cuántas veces te pasó.</p>`}
  </section>
  <section class="panel block" id="logPanel"></section>
  <div class="grid g2 block">
    <section class="panel">
      <div class="panel-head"><h3>Flashcards por caja</h3><span class="muted small">${Object.keys(S.cards).length} de ${WORDS.length} palabras estudiadas</span></div>
      <ul class="hbars">${[1,2,3,4,5].map(b=>`<li><span>Caja ${b}</span><span class="hbar"><i style="width:${boxes[b]/maxBox*100}%"></i></span><b>${boxes[b]}</b></li>`).join('')}</ul>
      <p class="muted small">Caja 1: repasar hoy. Caja 5: dominada, vuelve en 16 días.</p>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Lo que más te cuesta</h3>${Object.keys(S.miss).length?B('Repasar errores','history','ghost sm','data-act="errors"'):''}</div>
      <p class="sub-h">Palabras</p><ul class="weak">${weakW.map(k=>`<li><span><b>${esc(WORD[k].w)}</b> <span class="muted">${esc(WORD[k].es)}</span></span>${spk(WORD[k].w)}</li>`).join('')||'<li class="muted">Nada pendiente.</li>'}</ul>
      <p class="sub-h">Verbos</p><ul class="weak">${weakV.map(k=>`<li><span><b>${VERB[k].b}</b> <span class="muted">${esc(VERB[k].p)}, ${esc(VERB[k].pp)}</span></span>${spk(VERB[k].b+', '+VERB[k].p+', '+VERB[k].pp)}</li>`).join('')||'<li class="muted">Nada pendiente.</li>'}</ul>
    </section>
  </div></div>`;
  bindActs();
  const pr=$('#pracRep'); if(pr) pr.onclick=()=>startErrors([...new Set(rep.map(r=>r.k))].slice(0,15));
  renderLog();
}
function renderLog(){
  const per=S.logPer||'30', typ=S.logType||'all', lim=S.logLim||30;
  const from = per==='all' ? '' : addDays(TODAY, -(+per-1));
  const list = S.ev.filter(e=>!e.task && !e.ok && e.day>=from && (typ==='all' || keyKind(e.k)===typ)).sort((a,b)=>b.t-a.t);
  const seg = (attr, cur, opts) => `<div class="seg">${opts.map(([k,l])=>`<button class="${cur===k?'on':''}" ${attr}="${k}">${l}</button>`).join('')}</div>`;
  $('#logPanel').innerHTML = `<div class="panel-head"><h3>Registro de errores</h3><span class="muted small">${list.length} en el periodo</span></div>
    <div class="row filters">${seg('data-per',per,[['7','7 días'],['30','30 días'],['all','Todo']])}${seg('data-typ',typ,[['all','Todo'],['grammar','Gramática'],['vocab','Vocabulario'],['verbs','Verbos']])}</div>
    ${list.length?`<ul class="log">${list.slice(0,lim).map(e=>`<li><time>${fmtTime(e.t)}</time><span class="log-k">${esc(keyLabel(e.k))}</span>
      <span class="log-a">${e.g?`<s class="bad-txt">${esc(e.g)}</s>`:'<span class="muted">sin respuesta</span>'}${e.x?` ${ic('right',14)} <b>${esc(e.x)}</b>`:''}</span></li>`).join('')}</ul>
      ${list.length>lim?B('Ver más','plus','ghost sm','id="logMore"'):''}${B('Practicar estos','target','primary sm','id="logPrac"')}`
      :`<p class="empty">No hay errores en este periodo${S.ev.length?'':'. El registro empieza a partir de esta versión de la app'}.</p>`}`;
  $$('[data-per]').forEach(b=>b.onclick=()=>{ S.logPer=b.dataset.per; S.logLim=30; save(); renderLog(); });
  $$('[data-typ]').forEach(b=>b.onclick=()=>{ S.logType=b.dataset.typ; S.logLim=30; save(); renderLog(); });
  const m=$('#logMore'); if(m) m.onclick=()=>{ S.logLim=lim+30; renderLog(); };
  const p=$('#logPrac'); if(p) p.onclick=()=>startErrors([...new Set(list.map(e=>e.k))].slice(0,15));
}

/* ================== AJUSTES ================== */
function vSettings(){
  const st=S.settings; loadVoices();
  const seg = (attr, cur, opts) => `<div class="seg">${opts.map(([k,l,icon])=>`<button class="${String(cur)===String(k)?'on':''}" ${attr}="${k}">${icon?ic(icon,16):''}<span>${l}</span></button>`).join('')}</div>`;
  app.innerHTML = `<div class="wrap page narrow">
  <button class="back" data-go="progreso">${ic('left',16)}<span>Progreso</span></button>
  ${pageHead('Ajustes')}
  <section class="settings block" id="syncPanel"></section>
  <section class="settings block"><h2>Curso</h2>
    <div class="setting"><div><b>File actual de AEF 2</b><small>Define qué temas están vistos, cuál es el actual y cuáles vienen después.</small></div>
      <select class="sel" id="cur">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${st.cur===i+1?'selected':''}>File ${i+1}</option>`).join('')}</select></div>
    <div class="setting"><div><b>Incluir temas próximos en el reto</b><small>Para adelantarte a lo que verás en clase.</small></div>${seg('data-next', st.includeNext?1:0, [[0,'No'],[1,'Sí']])}</div>
    <div class="setting"><div><b>Preguntas del reto diario</b></div>${seg('data-daily', st.daily, [[10,'10'],[15,'15'],[20,'20']])}</div>
  </section>
  <section class="settings block"><h2>Apariencia y voz</h2>
    <div class="setting"><div><b>Tema</b></div>${seg('data-theme-set', st.theme, [['auto','Sistema','monitor'],['light','Claro','sun'],['dark','Oscuro','moon']])}</div>
    <div class="setting"><div><b>Velocidad de la voz</b></div>${seg('data-rate', st.rate, [[0.7,'Lenta'],[0.9,'Normal'],[1.05,'Rápida']])}</div>
    <div class="setting"><div><b>Voz en inglés</b><small>${VOICES.length} voces disponibles en este dispositivo.</small></div>
      <div class="row"><select class="sel" id="voice"><option value="">Automática (en-US)</option>${VOICES.map(v=>`<option ${st.voice===v.name?'selected':''}>${esc(v.name)}</option>`).join('')}</select>${B('Probar','volume','ghost sm','data-say="Hello! Nice to meet you. How are you today?"')}</div></div>
  </section>
  <section class="settings block"><h2>Datos</h2>
    <div class="setting"><div><b>Copia de seguridad</b><small>Un archivo con todo tu progreso. Sirve también para pasarlo a otro dispositivo.</small></div>
      <div class="row">${B('Exportar','download','ghost sm','id="exp"')}<label class="btn ghost sm">${ic('upload',18)}<span>Importar</span><input type="file" id="imp" accept=".json,application/json" hidden></label></div></div>
    <div class="setting"><div><b>Reiniciar progreso</b><small>Borra la racha, las estadísticas, el registro y las flashcards${window.Sync&&Sync.user?' en todos tus dispositivos':''}.</small></div>${B('Reiniciar','trash','ghost danger sm','id="reset"')}</div>
  </section>
  <p class="muted small">Contenido original basado en el temario de American English File 3.ª ed. (AEF 1 y AEF 2). Fotos de Wikipedia y Wikimedia Commons. Voz del sistema.</p></div>`;
  renderSyncPanel();
  $$('[data-theme-set]').forEach(b=>b.onclick=()=>{ st.theme=b.dataset.themeSet; touchSettings(); applyTheme(); vSettings(); });
  $('#cur').onchange=e=>{ st.cur=+e.target.value; touchSettings(); toast('File actual: '+st.cur); };
  $$('[data-next]').forEach(b=>b.onclick=()=>{ st.includeNext=b.dataset.next==='1'; touchSettings(); vSettings(); });
  $$('[data-daily]').forEach(b=>b.onclick=()=>{ st.daily=+b.dataset.daily; touchSettings(); vSettings(); });
  $$('[data-rate]').forEach(b=>b.onclick=()=>{ st.rate=+b.dataset.rate; touchSettings(); vSettings(); speak('This is the new speed.'); });
  $('#voice').onchange=e=>{ st.voice=e.target.value; touchSettings(); speak('Hello! This is my voice.'); };
  $('#exp').onclick=()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(exportData())],{type:'application/json'})); a.download='progreso-ingles-'+TODAY+'.json'; a.click(); };
  $('#imp').onchange=e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ let ok; try{ ok=importData(JSON.parse(t)); }catch(err){ toast('Ese archivo no es una copia de esta app.'); return; } applyTheme(); toast(ok?'Progreso importado':'Ese archivo ya se había importado; no se sumó de nuevo.'); vSettings(); updatePill(); }); };
  const rs=$('#reset'); rs.onclick=()=>{ if(rs.dataset.sure){ resetAll(); toast('Progreso reiniciado'); vSettings(); updatePill(); } else { rs.dataset.sure='1'; rs.querySelector('span').textContent='Toca otra vez para confirmar'; setTimeout(()=>{ if(rs.isConnected){ delete rs.dataset.sure; rs.querySelector('span').textContent='Reiniciar'; } },4000); } };
}
/* panel de cuenta: sync.js lo reemplaza con el formulario real */
function renderSyncPanel(){
  const el=$('#syncPanel'); if(!el) return;
  if(window.Sync && Sync.renderPanel) return Sync.renderPanel(el);
  el.innerHTML = `<h2>Cuenta y sincronización</h2><div class="setting"><div><b>Sin conexión a la nube</b><small>Tu progreso se guarda solo en este dispositivo. Cuando haya internet, aquí podrás iniciar sesión para sincronizarlo.</small></div></div>`;
}

/* puente para sync.js (módulo ES fuera de este ámbito) */
window.AppStore = {S, SYNC, mergeRemote, addBase, derive, save, resetAll};
window.AppUI = {
  refresh(){ updatePill(); if(!SESSION) route(); },
  renderSyncPanel, toast, B, IB, ic, esc,
};
/* aviso de actualización del service worker (ver build.py) */
window.__swToast = run => toast('Hay una versión nueva de la app.', {label:'Actualizar', run});

/* ---------- inicio ---------- */
route();
