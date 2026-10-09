const fs=require('fs');
eval(['grammar1.js','grammar2.js','vocab.js','verbs.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n').replace(/^const /gm,'var '));
let bad=0, counts={m:0,g:0,e:0,t:0,o:0};
for(const t of GRAMMAR){
  for(const s of t.items){
    const ty=s[0]; counts[ty]=(counts[ty]||0)+1; const b=s.slice(2).split(' ## ')[0];
    const ok = ty==='m'? /\[.+?\|.+?\]/.test(b) : ty==='g'? /\{.+?\}/.test(b) : ty==='e'? /\*.+?>.+?\*/.test(b) : ty==='t'? b.split(' = ').length===2 : ty==='o'? b.length>3 : false;
    if(!ok || s[1]!==':'){ bad++; console.log('BAD', t.id, s); }
  }
  if(!t.form||!t.uses||!t.ex||!t.errs) console.log('MISSING ref', t.id);
}
const ids=GRAMMAR.map(t=>t.id); if(new Set(ids).size!==ids.length) console.log('DUP topic ids');
let nw=0; for(const g of VOCAB){ for(const l of g.w.trim().split('\n')){ nw++; const f=l.split('|'); if(f.length<4||!f[0]||!f[1]||!f[2]) {bad++; console.log('BAD word',g.id,l);} } }
const vs=IRREG.trim().split('\n'); vs.forEach(l=>{ if(l.split('|').length!==6){bad++;console.log('BAD verb',l);} });
REG.trim().split('\n').forEach(l=>{ if(l.split('|').length!==4){bad++;console.log('BAD reg',l);} });
console.log({topics:GRAMMAR.length, items:Object.values(counts).reduce((a,b)=>a+b), counts, groups:VOCAB.length, words:nw, irregular:vs.length, bad});

process.exit(bad?1:0);
