export function nowISO() {
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
export function uid() { return 'sub_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16); }
export function normalizeKorean(s) {
  return (s||"").toLowerCase().replace(/\s+/g,'').replace(/[\.,!?"'“”‘’()\[\]{}<>:;·—–\-_/\\]/g,'');
}
export function getStudent(){ try{ return JSON.parse(localStorage.getItem('student_profile')||"null"); }catch(e){ return null; } }
export function setStudent(profile){ localStorage.setItem('student_profile', JSON.stringify(profile)); }
export function pushLocalLog(row){
  const key='submission_log';
  const arr = JSON.parse(localStorage.getItem(key)||'[]');
  arr.push(row);
  localStorage.setItem(key, JSON.stringify(arr));
}
export function getLocalLog(){ return JSON.parse(localStorage.getItem('submission_log')||'[]'); }
export function downloadText(filename, content){
  const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
