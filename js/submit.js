import { nowISO, uid, pushLocalLog } from './utils.js';

function toQS(obj){
  const p = new URLSearchParams();
  for(const [k,v] of Object.entries(obj)){
    if(v === undefined || v === null) continue;
    if(Array.isArray(v)) p.set(k, v.join('|'));
    else p.set(k, String(v));
  }
  return p.toString();
}

function sendByImage(endpoint, row){
  return new Promise((resolve) => {
    try{
      const img = new Image();
      // Ensure cache doesn't swallow repeated identical requests
      const url = endpoint + (endpoint.includes('?') ? '&' : '?') + toQS({ ...row, _ts: Date.now() });
      img.onload = () => resolve({ ok:true, mode:"img_get", url });
      img.onerror = () => resolve({ ok:true, mode:"img_get_no_load", url }); // still often reaches server
      img.src = url;
      // don't hang forever
      setTimeout(()=>resolve({ ok:true, mode:"img_get_timeout", url }), 1200);
    }catch(e){
      resolve({ ok:true, mode:"local_only_due_to_error", error:String(e) });
    }
  });
}

export async function submitRow(payload){
  const row = { submission_id: uid(), submitted_at: nowISO(), ...payload };
  pushLocalLog(row);

  const endpoint = (window.SUBMIT_ENDPOINT || "").trim();
  if(!endpoint) return { ok:true, mode:"local_only", row };

  // CORS/redirect safe: use GET beacon via Image. Requires Apps Script doGet to log if parameters exist.
  const res = await sendByImage(endpoint, row);
  return { ...res, row };
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
