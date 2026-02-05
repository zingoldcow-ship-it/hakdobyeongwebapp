import { nowISO, uid, pushLocalLog, getStudent } from './utils.js';
export async function submitRow(payload){
  const row = { submission_id: uid(), submitted_at: nowISO(), ...payload };
  pushLocalLog(row);
  const endpoint = window.SUBMIT_ENDPOINT || "https://script.google.com/macros/s/AKfycbzdBexBQglNQ6VpdQbEB-C-nmJPnrKtW778oDm86UXY6VkSi9uL9ueGaLP2ekELbh_7iQ/exec";
  if(!endpoint) return { ok:true, mode:"local_only", row };
  try{
    const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(row) });
    const text = await res.text();
    return { ok:res.ok, mode:"remote", row, response:text };
  }catch(e){
    return { ok:true, mode:"local_only_due_to_error", row, error:String(e) };
  }
}
export function buildBasePayload(sceneId){
  const s = getStudent()||{};
  return { run_id:s.run_id||"", class:s.class_name||"", number:s.number||"", name:s.name||"", student_id:s.student_id||"", scene:sceneId };
}
