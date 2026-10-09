const fs=require('fs');
eval(fs.readFileSync('extras.js','utf8').replace(/^const /gm,'var '));
const src=fs.readFileSync('core.js','utf8');
function lev(a,b){ if(a===b) return 0; const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let prev=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){ const cur=[i]; for(let j=1;j<=n;j++) cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); prev=cur; } return prev[n]; }
eval(src.slice(src.indexOf('function normEs'), src.indexOf('function enAnswers')));
const T=[['Guineo','guineo / banano',true],['banano','guineo / banano',true],['profesora','profesor(a)',true],['cansádo','cansado',true],['cansado','cansado / cansador',true],
['levantar','levantarse',true],['la manzana','manzana',true],['romper el hielo','romper el hielo, iniciar una conversación',true],['muy facil','ser muy fácil',true],
['perro','gato',false],['mesa','manzana',false],['casa','cama',false]];
let bad=0; T.forEach(([u,es,exp])=>{ const r=checkEs(u,es).ok; if(r!==exp){bad++;} console.log((r===exp?'✓':'✗'), JSON.stringify(u),'vs',JSON.stringify(es),'→',r); });
const tw=TWISTERS.trim().split('\n'), id=IDIOMS.trim().split('\n');
tw.forEach(l=>{ if(l.split('|').length!==5){bad++;console.log('BAD tw',l);} });
id.forEach(l=>{ const f=l.split('|'); if(f.length!==7||!f[1]||!f[2]||!f[4]){bad++;console.log('BAD idiom',l);} });
console.log({twisters:tw.length, idioms:id.length, conVE:id.filter(l=>l.split('|')[6]).length, bad});

process.exit(bad?1:0);
