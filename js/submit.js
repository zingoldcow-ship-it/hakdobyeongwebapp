import { nowISO, uid, pushLocalLog } from './utils.js';

function getAttempt(scene){
  const key = 'attempt_' + scene;
  const cur = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, String(cur));
  return cur;
}

export async function submitRow(payload){
  const attempt_no = getAttempt(payload.scene);

  const row = {
    submission_id: uid(),
    submitted_at: nowISO(),
    attempt_no,
    // normalize booleans
    is_correct: payload.is_correct === true,
    skipped: payload.skipped === true,
    ...payload
  };

  pushLocalLog(row);

  const endpoint = window.SUBMIT_ENDPOINT || "";
  if(!endpoint) return { ok:true, mode:"local_only", row };

  const json = JSON.stringify(row);

  // sendBeacon first (most reliable)
  try{
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'text/plain;charset=utf-8' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return { ok:true, mode:"beacon_queued", row };
    }
  }catch(e){}

  // fallback fetch
  try{
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: json,
      cache: 'no-store'
    });
    return { ok:true, mode:"fetch_no_cors", row };
  }catch(e){
    return { ok:true, mode:"local_only_due_to_error", row, error:String(e) };
  }
}

export function buildBasePayload(sceneId){
  const s = JSON.parse(localStorage.getItem('student_profile')||"{}");
  return {
    run_id: s.run_id || "",
    class: s.class_name || "",
    number: s.number || "",
    name: s.name || "",
    student_id: s.student_id || "",
    scene: sceneId
  };
}
