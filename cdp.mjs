import {spawn} from 'node:child_process';
import fs from 'node:fs';
const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port=9333, dir=process.cwd()+'/prof';
const proc=spawn(CH,['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${dir}`,'--window-size=1280,900','--no-first-run','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt; for(let i=0;i<50;i++){ try{ const l=await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt=l.find(x=>x.type==='page'); if(tgt) break; }catch(e){} await sleep(200); }
const ws=new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0; const pend={}; const errors=[];
ws.onmessage=m=>{ const d=JSON.parse(m.data); if(d.id&&pend[d.id]){ pend[d.id](d); delete pend[d.id]; }
  if(d.method==='Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);
  if(d.method==='Runtime.consoleAPICalled' && d.params.type==='error') errors.push('console: '+d.params.args.map(a=>a.value||a.description).join(' ')); };
const send=(method,params={})=>new Promise(r=>{ const i=++id; pend[i]=r; ws.send(JSON.stringify({id:i,method,params})); });
await send('Runtime.enable'); await send('Page.enable');
const ev=async(expr)=>{ const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true}); if(r.result.exceptionDetails) return 'EXC: '+(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text); return r.result.result.value; };
const shot=async(name)=>{ const r=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(`shots/${name}.png`,Buffer.from(r.result.data,'base64')); };
const setSize=async(w,h,mobile=false)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile});
const dark=async(on)=>send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:on?'dark':'light'}]});
fs.mkdirSync('shots',{recursive:true});
const steps=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
await setSize(1280,900);
for(const s of steps){
  if(s.nav){ await send('Page.navigate',{url:s.nav}); await sleep(s.wait||1500); }
  if(s.size) await setSize(...s.size);
  if(s.dark!==undefined) await dark(s.dark);
  if(s.js){ const v=await ev(s.js); console.log('JS>', s.label||'', typeof v==='string'?v.slice(0,1500):JSON.stringify(v).slice(0,1500)); }
  if(s.sleep) await sleep(s.sleep);
  if(s.shot) await shot(s.shot);
}
console.log('ERRORS:', errors.length? errors.join('\n'): 'ninguno');
ws.close(); proc.kill();
