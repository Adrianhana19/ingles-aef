(async()=>{
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const log=[];
document.querySelector('[data-act="reto"]').click(); await sleep(400);
for(let n=0;n<40;n++){
  if(document.querySelector('.result')) break;
  const label=document.querySelector('.qtype span')?.textContent; const card=document.querySelector('.qcard');
  let kind='?';
  if(card.querySelector('.match')){ kind='match';
    for(const L of [...card.querySelectorAll('[data-l]')]){ L.click(); for(const R of [...card.querySelectorAll('[data-r]:not(.gone):not(.right)')]){ R.click(); await sleep(30); if(L.classList.contains('right')) break; } await sleep(300); } }
  else if(card.querySelector('#tPool')){ kind='order'; let g=0; while(card.querySelector('[data-p]') && g++<30){ card.querySelector('[data-p]').click(); } document.querySelector('#check').click(); }
  else if(card.querySelector('#ans')){ kind='type'; card.querySelector('#ans').value= n%2? 'test':''; document.querySelector('#check').click(); }
  else if(card.querySelector('[data-t]')){ kind='err'; card.querySelector('[data-t]').click(); }
  else if(card.querySelector('[data-o]')){ kind='mc'; card.querySelector('[data-o]').click(); }
  await sleep(150);
  const fb=document.querySelector('#fb').textContent.trim().slice(0,70);
  log.push(n+1+' '+kind+' | '+label+' | '+fb);
  const nx=document.querySelector('#next'); if(!nx || nx.classList.contains('hidden')){ log.push('  !! no next button'); break; }
  nx.click(); await sleep(150);
}
log.push('RESULT: '+(document.querySelector('.result h1')?.textContent||'no result'));
return log.join('\n');
})()
