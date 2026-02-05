let audio = null;
let primed = false;

export function initTypingSound(opts = {}) {
  const src = opts.src || 'assets/typing.mp3';
  const volume = (opts.volume ?? 0.6);
  const rate = (opts.rate ?? 1.0);

  try {
    audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volume;
    audio.playbackRate = rate;
  } catch (e) {
    audio = null;
  }
}

export async function primeTypingSound() {
  // Call from a user gesture (click/tap) to unlock audio on many devices.
  if (!audio || primed) return;
  try {
    const prev = audio.volume;
    audio.volume = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = prev;
    primed = true;
  } catch (e) {
    primed = true;
  }
}

function tick() {
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
    // Make the long sample behave like a short key click
    setTimeout(() => {
      try { audio.pause(); audio.currentTime = 0; } catch(e) {}
    }, 70);
  } catch (e) {}
}

export async function typeText(el, fullText, opts = {}) {
  const speed = opts.speed ?? 170; // slower: 1 char per tick
  el.textContent = '';
  const text = (fullText || '').replace(/\r\n/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    el.textContent += ch;
    if (ch !== '\n' && ch !== ' ') tick();
    await new Promise(r => setTimeout(r, speed));
  }
}
