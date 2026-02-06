let audioCtx = null;
let buffer = null;
let gainNode = null;
let compNode = null;
let primed = false;

export function initTypingSound(opts = {}) {
  const src = opts.src || 'assets/typing.mp3';

  // The sample is very quiet on many laptop speakers.
  // We amplify hard but protect ears with a compressor (limiter-like).
  const volume = (opts.volume ?? 3.2); // tuned for classroom (was too loud) // 1.0=100%, 5.0≈+14dB

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    // Limiter-ish compressor (prevents harsh clipping)
    compNode = compNode || audioCtx.createDynamicsCompressor();
    compNode.threshold.value = -30;
    compNode.knee.value = 24;
    compNode.ratio.value = 20;
    compNode.attack.value = 0.002;
    compNode.release.value = 0.18;

    gainNode = gainNode || audioCtx.createGain();
    gainNode.gain.value = volume;

    compNode.connect(gainNode);
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
  if(!audioCtx || !buffer) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(compNode);

    const t = audioCtx.currentTime;
    src.start(t);

    // Slightly longer click for audibility on weak speakers
    src.stop(t + 0.12);
  } catch (e) {}
}

export async function typeText(el, fullText, opts = {}) {
  const speed = opts.speed ?? 90; // ms per char
  el.textContent = '';
  const text = (fullText || '').replace(/\r\n/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    el.textContent += ch;
    if (ch !== '\n' && ch !== ' ') tick();
    await new Promise(r => setTimeout(r, speed));
  }
}
