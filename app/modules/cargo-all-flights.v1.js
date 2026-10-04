/* E-REPORT SAGS V6.4.126 · CARGO ALL FLIGHTS AUTHORITY
 * Cargo keeps all-flight visibility, but uses the exact MY FLIGHT visual shell.
 * No Cargo-specific title/layout is allowed.
 */
(function(root){
'use strict';
if(root.__SAGS_CARGO_ALL_FLIGHTS_V64126)return;
root.__SAGS_CARGO_ALL_FLIGHTS_V64126=true;
const BUILD='V6.4.126-20261004-UNIFIED-MYFLIGHT-QUICKTIME-01',S=v=>String(v??'').trim(),U=v=>S(v).toUpperCase();
function session(){try{return root.__sagsGetSession?.()||{role:root.currentRole||'',profile:root.currentUserProfile||{}}}catch(_){return{role:root.currentRole||'',profile:root.currentUserProfile||{}}}}
function isCargo(){const s=session(),p=s.profile||{};const r=U(s.role||p.role||root.currentRole),text=U([r,p.roleCode,p.groupCode,p.unit,p.workUnit,p.departmentCode,p.systemDepartment,p.systemDept,p.department,p.group,p.jobTitle].filter(Boolean).join(' '));return r==='KH'||r==='CARGO'||U(p.groupCode)==='KH'||/KHO HÀNG|KHO HANG|CARGO/.test(text)}
function dateNow(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(_){return new Date().toISOString().slice(0,10)}}
function normalizeLabels(){
 if(!isCargo())return;
 const menu=document.querySelector('.v157MenuItem[data-v157-key="myflight"]');
 if(menu){
   const title=menu.querySelector('.title,.v157MenuTitle')||menu.querySelectorAll('span')[1];
   if(title)title.textContent='MY FLIGHT';
   const meta=menu.querySelector('.meta,.v157MenuMeta');if(meta)meta.textContent='Hồ sơ chuyến bay';
 }
 const h=document.querySelector('#fwcModal .fwcHead h3');if(h)h.textContent='✈ MY FLIGHT';
 const sub=document.querySelector('#fwcModal .fwcHead .fwcSub');if(sub)sub.textContent='Hồ sơ chuyến bay';
 document.getElementById('v38MyFlightLabel')?.remove();
}
function unifiedRenderer(){return root.__SAGS_FSAGS208_WORKSPACE?.renderCargoMyFlight}
function openAll(d){
 normalizeLabels();
 const fn=unifiedRenderer();
 if(typeof fn==='function')return fn(S(d)||dateNow());
 const fallback=root.sagsCargoOpenAllFlights;
 if(typeof fallback==='function'&&fallback!==openAll)return fallback(S(d)||dateNow());
 return false;
}
function refreshAll(){
 normalizeLabels();
 const fn=unifiedRenderer();
 if(typeof fn==='function')return fn(S(document.getElementById('fwcDate')?.value)||dateNow());
 return root.sagsCargoRefreshAllFlights?.();
}
function install(){
 if(!isCargo())return false;
 normalizeLabels();
 if(typeof unifiedRenderer()==='function'){
   root.flightWorkspaceOpenList=openAll;
   root.flightWorkspaceRefresh=refreshAll;
 }
 for(const id of ['roleBtnRosterFlights','roleBtnFlights']){
   const b=document.getElementById(id);if(b)b.onclick=()=>openAll(dateNow());
 }
 return true;
}
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[0,250,800,1600,3000].map(ms=>setTimeout(install,ms))}
const base=root.applyRoleUI;if(typeof base==='function'&&!base.__sagsCargoAllFlights126){const w=function(){const out=base.apply(this,arguments);Promise.resolve(out).finally(schedule);return out};w.__sagsCargoAllFlights126=1;w.__base=base;root.applyRoleUI=w;try{applyRoleUI=w}catch(_){}}
window.addEventListener('pageshow',schedule,{passive:true});
window.addEventListener('focus',schedule,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()},{passive:true});
schedule();
root.__SAGS_CARGO_ALL_FLIGHTS={build:BUILD,isCargo,install,openAll};
})(window);
