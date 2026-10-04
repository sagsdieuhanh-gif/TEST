/* E-REPORT SAGS V6.4.120 · CARGO MY FLIGHT ROUTE AUTHORITY
 * UI-only route correction: Cargo/Kho hàng uses the same My Flight shell as DH/CBTT.
 * Business scope stays different: Cargo sees every eligible FSAGS 208 flight for the day.
 */
(function(root){
'use strict';
const BUILD='V6.4.120-20261004-CARGO-MYFLIGHT-QUICK-01';
const S=v=>String(v??'').trim(),U=v=>S(v).toUpperCase();
function session(){try{return root.__sagsGetSession?.()||{role:root.currentRole||'',profile:root.currentUserProfile||{}}}catch(_){return{role:root.currentRole||'',profile:root.currentUserProfile||{}}}}
function isCargo(){
 const s=session(),p=s.profile||{},r=U(s.role||p.role||root.currentRole);
 const text=U([r,p.roleCode,p.groupCode,p.unit,p.workUnit,p.departmentCode,p.systemDepartment,p.systemDept,p.department,p.group,p.jobTitle].filter(Boolean).join(' '));
 return r==='KH'||r==='CARGO'||U(p.groupCode)==='KH'||/KHO HÀNG|KHO HANG|CARGO/.test(text);
}
function today(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(_){return new Date().toISOString().slice(0,10)}}
function currentDate(v=''){return S(v)||S(document.getElementById('fwcDate')?.value)||S(sessionStorage.getItem('sagsV36FwcDate'))||today()}
function normalizeShell(){
 const cargo=isCargo();document.body?.classList.toggle('sags-cargo-unified-myflight',cargo);
 if(!cargo)return;
 const modal=document.getElementById('fwcModal');if(!modal)return;
 const title=modal.querySelector('.fwcHead h3');if(title&&title.textContent!=='✈ MY FLIGHT')title.textContent='✈ MY FLIGHT';
 const sub=modal.querySelector('.fwcHead .fwcSub');if(sub&&sub.textContent!=='Hồ sơ của tôi')sub.textContent='Hồ sơ của tôi';
 for(const id of ['sagsStableMyFlightBack','v644MyFlightBack','sagsContextBackRow'])document.getElementById(id)?.remove();
 const menu=document.querySelector('.v157MenuItem[data-v157-key="myflight"]');
 if(menu){const spans=menu.querySelectorAll('span');if(spans[1]&&spans[1].textContent!=='My Flight')spans[1].textContent='My Flight';const meta=menu.querySelector('.meta');if(meta)meta.textContent='Công việc của tôi';}
}
function unified(date){
 const api=root.__SAGS_FSAGS208_WORKSPACE;
 if(typeof api?.renderCargoMyFlight!=='function')return null;
 const out=api.renderCargoMyFlight(currentDate(date));
 Promise.resolve(out).finally(()=>{for(const ms of [0,120,360])setTimeout(normalizeShell,ms)});
 return out;
}
let baseList=null,baseRefresh=null,baseCargo=null,baseCargoRefresh=null;
function wire(){
 if(!isCargo()){normalizeShell();return false}
 normalizeShell();
 if(typeof root.flightWorkspaceOpenList==='function'&&!root.flightWorkspaceOpenList.__sagsCargoExactUiV64120){
   baseList=root.flightWorkspaceOpenList;
   const fn=function(date){const x=unified(date);return x??baseList.apply(this,arguments)};
   fn.__sagsCargoExactUiV64120=true;fn.__base=baseList;root.flightWorkspaceOpenList=fn;
 }
 if(typeof root.flightWorkspaceRefresh==='function'&&!root.flightWorkspaceRefresh.__sagsCargoExactUiV64120){
   baseRefresh=root.flightWorkspaceRefresh;
   const fn=function(){const x=unified(currentDate());return x??baseRefresh.apply(this,arguments)};
   fn.__sagsCargoExactUiV64120=true;fn.__base=baseRefresh;root.flightWorkspaceRefresh=fn;
 }
 if(typeof root.sagsCargoOpenAllFlights==='function'&&!root.sagsCargoOpenAllFlights.__sagsCargoExactUiV64120){
   baseCargo=root.sagsCargoOpenAllFlights;
   const fn=function(date){const x=unified(date);return x??baseCargo.apply(this,arguments)};
   fn.__sagsCargoExactUiV64120=true;fn.__base=baseCargo;root.sagsCargoOpenAllFlights=fn;
 }
 if(typeof root.sagsCargoRefreshAllFlights==='function'&&!root.sagsCargoRefreshAllFlights.__sagsCargoExactUiV64120){
   baseCargoRefresh=root.sagsCargoRefreshAllFlights;
   const fn=function(){const x=unified(currentDate());return x??baseCargoRefresh.apply(this,arguments)};
   fn.__sagsCargoExactUiV64120=true;fn.__base=baseCargoRefresh;root.sagsCargoRefreshAllFlights=fn;
 }
 for(const id of ['roleBtnRosterFlights','roleBtnFlights']){
   const b=document.getElementById(id);if(b&&!b.dataset.sagsCargoExactUiV64120){b.dataset.sagsCargoExactUiV64120='1';b.addEventListener('click',e=>{if(!isCargo())return;e.preventDefault();e.stopImmediatePropagation();unified(today())},true)}
 }
 return true;
}
function settle(){wire();for(const ms of [50,320,1750])setTimeout(()=>{wire();normalizeShell()},ms)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle,{once:true});else settle();
root.addEventListener('pageshow',settle,{passive:true});
root.addEventListener('focus',settle,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle()},{passive:true});
root.__SAGS_CARGO_MYFLIGHT_V64120={build:BUILD,isCargo,wire,normalizeShell,open:unified};
})(window);
