import { nowISO, uid, pushLocalLog } from './utils.js';

export async function submitRow(payload){
  const row = { submission_id: uid(), submitted_at: nowISO(), ...payload };

  // Always store locally first
  pushLocalLog(row);

  const endpoint = window.SUBMIT_ENDPOINT || "";
  if(!endpoint) return { ok:true, mode:"local_only", row };

  const json = JSON.stringify(row);

  // 1) Try sendBeacon (most reliable for cross-origin logging)
  try{
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'text/plain;charset=utf-8' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return { ok:true, mode:"beacon_queued", row };
    }
  }catch(e){ /* ignore */ }

  // 2) Fallback to fetch (no-cors + text/plain to avoid preflight)
  try{
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: json,
      cache: 'no-store',
      redirect: 'follow'
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
