/* ===================== SINCRONIZACIÓN (Firebase, opcional) =====================
   Módulo ES que se carga aparte. Si no hay configuración o no hay internet, la app sigue igual.

   Datos en Firestore (todo bajo users/{uid}, protegido por firestore.rules):
   - days/{AAAA-MM-DD}: { e_<dispositivo>: [eventos] }   (se agregan con arrayUnion; un documento por día)
   - meta/cards:    { c: { <palabra>: {b, due, u} } }     (gana el cambio más reciente por palabra)
   - meta/settings: ajustes + _u
   - meta/base:     progreso anterior al registro de eventos, sumado de todos los dispositivos
   - meta/state:    { resetAt } para propagar "Reiniciar progreso"
*/
import config from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/13.0.0/';
const St = window.AppStore, UI = window.AppUI;
const UPKEY = 'aef-review-up';
const Sync = window.Sync = { state: config ? 'loading' : 'noconfig', user: null, last: 0, error: '', renderPanel };
let F = null, auth = null, db = null, unsubs = [], linking = false;

const loadUp = () => { try { return JSON.parse(localStorage.getItem(UPKEY)) || {}; } catch (e) { return {}; } };
const saveUp = o => { try { localStorage.setItem(UPKEY, JSON.stringify(o)); } catch (e) {} };
const ref = (...p) => F.fs.doc(db, 'users', Sync.user.uid, ...p);
const pending = () => { const up = loadUp(); const done = new Set(up.uid === Sync.user?.uid ? up.ids || [] : []); return St.S.ev.filter(e => !done.has(e.i)); };
function markUploaded(ids){ const up = loadUp(); const set = new Set(up.uid === Sync.user.uid ? up.ids || [] : []); ids.forEach(i => set.add(i)); const keep = new Set(St.S.ev.map(e => e.i)); saveUp({ uid: Sync.user.uid, ids: [...set].filter(i => keep.has(i)) }); }
function refresh(){ UI.refresh(); const el = document.getElementById('syncPanel'); if (el) renderPanel(el); }

async function main(){
  if (!config) { refresh(); return; }
  try {
    const [app, au, fs] = await Promise.all(['app', 'auth', 'firestore'].map(m => import(SDK + 'firebase-' + m + '.js')));
    F = { app, au, fs };
  } catch (e) { Sync.state = 'nosdk'; refresh(); return; }
  const fb = F.app.initializeApp(config);
  auth = F.au.initializeAuth(fb, { persistence: [F.au.indexedDBLocalPersistence, F.au.browserLocalPersistence] });
  try { db = F.fs.initializeFirestore(fb, { localCache: F.fs.persistentLocalCache({ tabManager: F.fs.persistentMultipleTabManager() }) }); }
  catch (e) { db = F.fs.initializeFirestore(fb, {}); }
  F.au.onAuthStateChanged(auth, u => { stop(); Sync.user = u; Sync.state = u ? 'linking' : 'out'; refresh(); if (u) start(); });
}

/* ---------- conexión de este dispositivo con la cuenta ---------- */
async function start(){
  St.SYNC.onEvents = evs => upload(evs);
  St.SYNC.onCard = (k, v) => F.fs.setDoc(ref('meta', 'cards'), { c: { [k]: v } }, { merge: true }).catch(fail);
  St.SYNC.onSettings = s => F.fs.setDoc(ref('meta', 'settings'), s).catch(fail);
  St.SYNC.onReset = () => resetRemote();
  await link();
  if (!Sync.user) return;
  unsubs.push(F.fs.onSnapshot(F.fs.collection(db, 'users', Sync.user.uid, 'days'), snap => {
    const events = [];
    snap.docChanges().forEach(ch => { if (ch.type === 'removed') return; const d = ch.doc.data(); for (const k in d) if (k.startsWith('e_') && Array.isArray(d[k])) events.push(...d[k]); });
    if (St.mergeRemote({ events })) refresh();
    ok();
  }, fail));
  unsubs.push(F.fs.onSnapshot(ref('meta', 'cards'), s => { if (s.exists() && St.mergeRemote({ cards: s.data().c || {} })) refresh(); }, fail));
  unsubs.push(F.fs.onSnapshot(ref('meta', 'settings'), s => { if (s.exists() && St.mergeRemote({ settings: s.data() })) refresh(); }, fail));
  unsubs.push(F.fs.onSnapshot(ref('meta', 'base'), s => { if (s.exists()) { const b = s.data(); if (JSON.stringify(b) !== JSON.stringify(St.S.base)) { St.S.base = b; St.derive(); St.save(); refresh(); } } }, fail));
  unsubs.push(F.fs.onSnapshot(ref('meta', 'state'), s => {
    const r = s.exists() ? s.data().resetAt || 0 : 0;
    if (r > (St.S.resetSeen || 0)) { St.resetAll(true); St.S.resetSeen = r; St.save(); saveUp({ uid: Sync.user.uid, ids: [] }); refresh(); }
  }, fail));
}
/* la primera vez en cada dispositivo: suma su progreso anterior a la cuenta y sube todo lo pendiente */
async function link(){
  if (linking) return; linking = true;
  const uid = Sync.user.uid;
  try {
    if (!St.S.linked || !St.S.linked[uid]) {
      await F.fs.runTransaction(db, async tx => {
        const bRef = ref('meta', 'base'), cRef = ref('meta', 'cards'), sRef = ref('meta', 'settings');
        const [b, c, s] = await Promise.all([tx.get(bRef), tx.get(cRef), tx.get(sRef)]);
        const local = St.S.base, empty = !Object.keys(local.stat || {}).length && !Object.keys(local.days || {}).length;
        if (!empty || !b.exists()) tx.set(bRef, b.exists() ? St.addBase(b.data(), local) : local);
        const remoteCards = c.exists() ? c.data().c || {} : {}, merged = { ...remoteCards };
        for (const k in St.S.cards) { const l = St.S.cards[k]; if (!merged[k] || (l.u || 0) > (merged[k].u || 0)) merged[k] = l; }
        tx.set(cRef, { c: merged });
        if (!s.exists() || (St.S.settings._u || 0) > (s.data()._u || 0)) tx.set(sRef, St.S.settings);
      });
      St.S.linked = Object.assign({}, St.S.linked, { [uid]: Date.now() }); St.save();
    }
    await upload(pending());
    ok();
  } catch (e) { fail(e); }
  finally { linking = false; }
}
async function upload(evs){
  if (!Sync.user || !evs.length) return;
  const byDay = {}; evs.forEach(e => (byDay[e.day] = byDay[e.day] || []).push(e));
  const days = Object.keys(byDay);
  try {
    for (let i = 0; i < days.length; i += 400) {
      const batch = F.fs.writeBatch(db);
      days.slice(i, i + 400).forEach(d => batch.set(ref('days', d), { ['e_' + St.S.device]: F.fs.arrayUnion(...byDay[d]) }, { merge: true }));
      await batch.commit();
    }
    markUploaded(evs.map(e => e.i)); ok();
  } catch (e) { fail(e); }
}
async function resetRemote(){
  if (!Sync.user) return;
  try {
    const snap = await F.fs.getDocs(F.fs.collection(db, 'users', Sync.user.uid, 'days'));
    const docs = snap.docs.map(d => d.ref);
    for (let i = 0; i < docs.length; i += 400) { const b = F.fs.writeBatch(db); docs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit(); }
    const now = Date.now(); St.S.resetSeen = now; St.save(); saveUp({ uid: Sync.user.uid, ids: [] });
    const b = F.fs.writeBatch(db);
    b.set(ref('meta', 'base'), St.S.base); b.set(ref('meta', 'cards'), { c: {} }); b.set(ref('meta', 'state'), { resetAt: now });
    await b.commit(); ok();
  } catch (e) { fail(e); }
}
function stop(){ unsubs.forEach(u => u()); unsubs = []; St.SYNC.onEvents = () => {}; St.SYNC.onCard = () => {}; St.SYNC.onSettings = () => {}; St.SYNC.onReset = () => {}; }
function ok(){ Sync.state = 'ok'; Sync.last = Date.now(); Sync.error = ''; const el = document.getElementById('syncPanel'); if (el) renderPanel(el); }
function fail(e){ Sync.state = navigator.onLine ? 'error' : 'offline'; Sync.error = (e && (e.code || e.message)) || ''; const el = document.getElementById('syncPanel'); if (el) renderPanel(el); }
addEventListener('online', () => { if (Sync.user) link(); });

/* ---------- panel en Ajustes ---------- */
const AUTH_MSG = {
  'auth/invalid-credential': 'El correo o la contraseña no coinciden.',
  'auth/wrong-password': 'La contraseña no es correcta.',
  'auth/user-not-found': 'No hay una cuenta con ese correo. Usa "Crear cuenta".',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Usa "Iniciar sesión".',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'Revisa el correo: no tiene un formato válido.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/network-request-failed': 'No hay conexión a internet. Inténtalo cuando vuelva.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
};
const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'hace un momento' : s < 3600 ? `hace ${Math.round(s / 60)} min` : `hace ${Math.round(s / 3600)} h`; };
function renderPanel(el){
  const { B, ic, esc } = UI;
  const head = '<h2>Cuenta y sincronización</h2>';
  if (Sync.state === 'noconfig') { el.innerHTML = head + `<div class="setting"><div><b>Sincronización no configurada</b><small>Tu progreso se guarda en este dispositivo. Falta conectar el proyecto de Firebase.</small></div></div>`; return; }
  if (Sync.state === 'loading') { el.innerHTML = head + `<div class="setting"><div><b>Conectando…</b></div></div>`; return; }
  if (Sync.state === 'nosdk') { el.innerHTML = head + `<div class="setting"><div><b>Sin conexión</b><small>Para iniciar sesión hace falta internet. Tu progreso sigue guardándose en este dispositivo.</small></div></div>`; return; }
  if (!Sync.user) {
    el.innerHTML = head + `<div class="setting"><div><b>Sincroniza tu progreso</b><small>Inicia sesión en cada dispositivo (Mac, iPhone, iPad) con la misma cuenta: verás la misma racha, el mismo historial de errores y las mismas flashcards.</small></div>
      <form class="form" id="authForm" novalidate>
        <label>Correo<input type="email" id="authEmail" autocomplete="username" inputmode="email" required></label>
        <label>Contraseña<input type="password" id="authPass" autocomplete="current-password" minlength="6" required></label>
        <p class="inline-msg bad hidden" id="authErr"></p>
        <div class="row">${B('Iniciar sesión', 'user', 'primary', 'type="submit" data-mode="in"')}${B('Crear cuenta', 'plus', 'ghost', 'type="button" id="authNew"')}${B('Olvidé mi contraseña', '', 'text sm', 'type="button" id="authForgot"')}</div>
      </form></div>`;
    const form = el.querySelector('#authForm'), email = el.querySelector('#authEmail'), pass = el.querySelector('#authPass'), err = el.querySelector('#authErr');
    const show = (m, good) => { err.className = 'inline-msg ' + (good ? 'ok' : 'bad'); err.innerHTML = ic(good ? 'check' : 'alert', 16) + `<span>${esc(m)}</span>`; };
    const run = async (fn, okMsg) => { err.classList.add('hidden'); try { await fn(); if (okMsg) show(okMsg, true); } catch (e) { show(AUTH_MSG[e.code] || 'No se pudo completar. ' + (e.code || '')); } };
    form.onsubmit = e => { e.preventDefault(); run(() => F.au.signInWithEmailAndPassword(auth, email.value.trim(), pass.value)); };
    el.querySelector('#authNew').onclick = () => run(() => F.au.createUserWithEmailAndPassword(auth, email.value.trim(), pass.value));
    el.querySelector('#authForgot').onclick = () => email.value.trim() ? run(() => F.au.sendPasswordResetEmail(auth, email.value.trim()), 'Te enviamos un correo para cambiar la contraseña.') : show('Escribe tu correo arriba y vuelve a tocar "Olvidé mi contraseña".');
    return;
  }
  const n = pending().length;
  const st = Sync.state === 'ok' ? `<span class="sync-state ok">${ic('check', 16)}<span>Sincronizado ${Sync.last ? ago(Sync.last) : ''}</span></span>`
    : Sync.state === 'linking' ? `<span class="sync-state off">${ic('cloud', 16)}<span>Sincronizando…</span></span>`
    : Sync.state === 'offline' ? `<span class="sync-state off">${ic('cloud', 16)}<span>Sin conexión: se sincroniza al volver internet${n ? ` (${n} respuestas pendientes)` : ''}</span></span>`
    : `<span class="sync-state err">${ic('alert', 16)}<span>No se pudo sincronizar${Sync.error ? ` (${esc(Sync.error)})` : ''}</span></span>`;
  el.innerHTML = head + `<div class="setting"><div><b>${esc(Sync.user.email || 'Cuenta conectada')}</b><small>Tu progreso de este dispositivo está unido a esta cuenta.</small>${st}</div>
    <div class="row">${B('Sincronizar ahora', 'rotate', 'ghost sm', 'id="syncNow"')}${B('Cerrar sesión', 'logout', 'ghost sm', 'id="syncOut"')}</div></div>`;
  el.querySelector('#syncNow').onclick = () => { Sync.state = 'linking'; renderPanel(el); link(); };
  el.querySelector('#syncOut').onclick = () => F.au.signOut(auth);
}

main();
