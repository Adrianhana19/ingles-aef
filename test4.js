/* Pruebas de la selección de voz (bloque VOZ de core.js): node test4.js */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/core.js', 'utf8');
const block = src.slice(src.indexOf('/* VOZ:inicio'), src.indexOf('/* VOZ:fin */'));
let fails = 0;
const eq = (name, a, b) => { if(a === b) console.log('✓', name); else { fails++; console.log('✗', name, '→', a, '(esperado', b + ')'); } };
const V = (name, lang='en-US', local=true) => ({name, lang, localService: local});
function choose(voices, pref=''){
  const mem = pref ? {'aef-review-voice': pref} : {};
  const localStorage = {getItem:k=>mem[k]??null, setItem:(k,v)=>{mem[k]=v;}, removeItem:k=>{delete mem[k];}};
  const api = new Function('localStorage', block + '\nVOICES = arguments[1];\nreturn {pickVoice, usableVoices};')(localStorage, voices);
  const v = api.pickVoice(); return {name: v && v.name, list: api.usableVoices().map(v=>v.name)};
}
// Mac de Adrian (lista real de Chrome, 2026-10-12)
const mac = ['Samantha','Albert','Bad News','Bahh','Bells','Boing','Bubbles','Cellos','Eddy (English (United States))','Flo (English (United States))','Fred','Good News','Grandma (English (United States))','Grandpa (English (United States))','Jester','Junior','Kathy','Organ','Ralph','Reed (English (United States))','Rocko (English (United States))','Sandy (English (United States))','Shelley (English (United States))','Superstar','Trinoids','Whisper','Wobble','Zarvox'].map(n=>V(n)).concat([V('Google US English','en-US',false)]);
const r = choose(mac);
eq('Mac de Adrian: elige Samantha', r.name, 'Samantha');
eq('Mac de Adrian: no ofrece voces de efectos', r.list.some(n=>/Bubbles|Zarvox|Bells|Albert|Whisper/.test(n)), false);
eq('Mac de Adrian: Google en línea queda al final', r.list[r.list.length-1], 'Google US English');
const sinSam = mac.filter(v=>v.name!=='Samantha');
const r2 = choose(sinSam);
eq('Mac sin Samantha: elige una voz local normal', ['Google US English','Bubbles','Albert'].includes(r2.name), false);
eq('Mac con Ava Premium: la prefiere sobre Samantha normal', choose([V('Fred'), V('Ava (Premium)'), V('Samantha'), V('Google US English','en-US',false)]).name, 'Ava (Premium)');
eq('Premium antes que la normal de la misma voz', choose([V('Ava'), V('Ava (Premium)')]).name, 'Ava (Premium)');
eq('Solo Google en línea: la usa', choose([V('Google US English','en-US',false)]).name, 'Google US English');
eq('iPhone: elige Samantha', choose([V('Daniel','en-GB'), V('Karen','en-AU'), V('Samantha'), V('Fred')]).name, 'Samantha');
eq('Inglés de EE. UU. antes que británico', choose([V('Daniel','en-GB'), V('Fred')]).name, 'Fred');
eq('Respeta la voz elegida en Ajustes', choose(mac, 'Fred').name, 'Fred');
eq('Si la voz elegida no existe aquí, usa la mejor', choose(mac, 'Ava (Enhanced)').name, 'Samantha');
console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fails?1:0);
