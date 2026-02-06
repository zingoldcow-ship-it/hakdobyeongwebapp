import { nowISO, uid, pushLocalLog } from './utils.js';

function toFormBody(obj){
  const p = new URLSearchParams();
  for(const [k,v] of Object.entries(obj)){
    if(Array.isArray(v)) p.set(k, v.join('|'));
    else p.set(k, (v ?? '').toString());
  }
  return p.toString();
}

export async function submitRow(payload){
  const row = { submission_id: uid(), submitted_at: nowISO(), ...payload };

  // Always keep a local copy first (failsafe)
  pushLocalLog(row);

  const endpoint = window.SUBMIT_ENDPOINT || "";
  if(!endpoint) return { ok:true, mode:"local_only", row };

  // Use form-urlencoded to avoid CORS preflight + redirect quirks.
  // Apps Script can read values via e.parameter (recommended).
  try{
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: toFormBody(row),
      cache: 'no-store',
      redirect: 'follow'
    });
    return { ok:true, mode:"fetch_form_no_cors", row };
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
