import { normalizeKorean } from './utils.js';
export function checkAnswer(scene, answerRaw){
  const ans = normalizeKorean(answerRaw);
  const kws = (scene.keywords||[]).map(normalizeKorean);
  let hit=0;
  for(const k of kws){ if(k && ans.includes(k)) hit++; }
  const require = scene.require ?? 1;
  return { correct: hit>=require, hit, require };
}
export function autoHint(scene){ return scene.hint || "힌트: 본문에서 중요한 단어를 찾아 답에 넣어보세요."; }
