let audioCtx = null;
let buffer = null;
let gainNode = null;
let primed = false;

export function initTypingSound(opts = {}) {
  const src = opts.src || 'assets/typing.mp3';
  const volume = (opts.volume ?? 0.35);

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    gainNode = gainNode || audioCtx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioCtx.destination);

    fetch(src)
      .then(r => r.arrayBuffer())
      .then(ab => audioCtx.decodeAudioData(ab))
      .then(decoded => { buffer = decoded; })
      .catch(() => { buffer = null; });
  } catch (e) {
    audioCtx = null;
    buffer = null;
  }
}

export async function primeTypingSound() {
  if(!audioCtx || primed) return;
  try {
    await audioCtx.resume();
    primed = true;
  } catch (e) {
    primed = true;
  }
}

function tick() {
  if(!audioCtx || !buffer || !gainNode) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(gainNode);

    const t = audioCtx.currentTime;
    src.start(t);
    src.stop(t + 0.06);
  } catch (e) {}
}

export async function typeText(el, fullText, opts = {}) {
  const speed = opts.speed ?? 120; // ms per char (faster)
  el.textContent = '';
  const text = (fullText || '').replace(/\r\n/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    el.textContent += ch;
    if (ch !== '\n' && ch !== ' ') tick();
    await new Promise(r => setTimeout(r, speed));
  }
}
