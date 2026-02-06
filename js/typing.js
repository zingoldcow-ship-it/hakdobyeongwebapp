let audioCtx = null;
let buffer = null;
let gainNode = null;
let compNode = null;
let primed = false;

export function initTypingSound(opts = {}) {
  const src = opts.src || 'assets/typing.mp3';
  // NOTE: we amplify beyond 1.0 because the sample itself is very quiet.
  const volume = (opts.volume ?? 2.8); // 1.0=100%, 2.8≈+9dB

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    // Compressor first (prevents harsh clipping when we amplify)
    compNode = compNode || audioCtx.createDynamicsCompressor();
    compNode.threshold.value = -24;
    compNode.knee.value = 30;
    compNode.ratio.value = 12;
    compNode.attack.value = 0.003;
    compNode.release.value = 0.12;

    // Gain after compressor
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
  if(!audioCtx || !buffer || !gainNode) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(compNode);

    const t = audioCtx.currentTime;
    src.start(t);
    // slightly longer click for audibility
    src.stop(t + 0.09);
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
