window.LunaUtils = (() => {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`; };
  const parseDate = value => value ? new Date(`${value}T12:00:00`) : null;
  const dateLabel = value => value ? parseDate(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) : 'Not recorded';
  const shortDate = value => value ? parseDate(value).toLocaleDateString(undefined,{month:'short',day:'numeric'}) : '—';
  const diffDays = (a,b) => Math.round((parseDate(b)-parseDate(a))/86400000);
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initials = name => (name || 'L').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const today = () => iso(new Date());
  function toast(message,type='') { const region=document.querySelector('#toastRegion'); if(!region)return; const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;region.appendChild(el);setTimeout(()=>el.remove(),3500); }
  function download(filename, content, type='text/csv') { const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url); }
  return {pad,iso,parseDate,dateLabel,shortDate,diffDays,escape,initials,uid,today,toast,download};
})();
