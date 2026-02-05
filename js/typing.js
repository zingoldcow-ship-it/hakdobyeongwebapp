let audioCtx=null; let enabled=false;
export function enableTypingSound(){
  try{ audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)(); enabled=true; }catch(e){ enabled=false; }
}
function tick(){
  if(!enabled||!audioCtx) return;
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type='square'; o.frequency.value = 220 + Math.random()*60; g.gain.value=0.02;
  o.connect(g); g.connect(audioCtx.destination);
  const t=audioCtx.currentTime; o.start(t); o.stop(t+0.015);
}
export async function typeText(el, fullText, opts={}){
  const speed = opts.speed ?? 14; const chunk = opts.chunk ?? 1;
  el.textContent=''; let i=0; const text = (fullText||'').replace(/\r\n/g,'\n');
  return new Promise((resolve)=>{
    const timer=setInterval(()=>{
      if(i>=text.length){ clearInterval(timer); resolve(); return; }
      const part=text.slice(i,i+chunk); el.textContent += part;
      for(const ch of part){ if(ch!=='\n' && ch!==' ') tick(); }
      i+=chunk;
    }, speed);
  });
}
