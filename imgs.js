const fs=require('fs');
eval(['vocab.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n').replace(/^const /gm,'var '));
const titles=[];
for(const g of VOCAB){ for(const l of g.w.trim().split('\n')){ const [e,w,es,ex,wiki]=l.split('|'); let t = wiki==='-'?'':(wiki||(g.photo? w.charAt(0).toUpperCase()+w.slice(1):'')); if(t) titles.push(t);} }
(async()=>{
 const miss=[];
 for(let i=0;i<titles.length;i+=45){
  const ch=titles.slice(i,i+45);
  const url='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|description&piprop=thumbnail&pithumbsize=480&redirects=1&titles='+encodeURIComponent(ch.join('|'));
  const j=await (await fetch(url,{headers:{'User-Agent':'aef-review-check/1.0'}})).json(); const q=j.query;
  const map={}; ch.forEach(t=>map[t]=t);
  (q.normalized||[]).forEach(n=>{for(const k in map) if(map[k]===n.from) map[k]=n.to;});
  (q.redirects||[]).forEach(n=>{for(const k in map) if(map[k]===n.from) map[k]=n.to;});
  const pages={}; Object.values(q.pages).forEach(p=>pages[p.title]=p);
  ch.forEach(t=>{ const p=pages[map[t]]; if(!p||!p.thumbnail) miss.push(t+'  ['+(p&&p.description||'?')+']'); else console.log('OK  ',t,'→',map[t],'|',(p.description||'').slice(0,50)); });
 }
 console.log('\nSIN FOTO ('+miss.length+'/'+titles.length+'):\n'+miss.join('\n'));
})();
