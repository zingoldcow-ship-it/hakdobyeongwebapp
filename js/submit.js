import { nowISO, uid, pushLocalLog } from './utils.js';

export async function submitRow(payload){
  const row = { submission_id: uid(), submitted_at: nowISO(), ...payload };

  // Always keep a local copy first (failsafe)
  pushLocalLog(row);

  const endpoint = window.SUBMIT_ENDPOINT || "";
  if(!endpoint) return { ok:true, mode:"local_only", row };

  // Avoid CORS preflight (OPTIONS) by sending as text/plain and using no-cors.
  try{
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row)
    });
    return { ok:true, mode:"remote_no_cors", row };
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
