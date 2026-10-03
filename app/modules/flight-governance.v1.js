/* TEST · Flight Governance Engine V1
   Centralizes department manager permissions, per-flight LOAD SYSTEM mode,
   reassignment/reopen actions and append-only audit history.
*/
(function(root){
'use strict';
if(root.__SAGS_FLIGHT_GOVERNANCE_V1)return;
root.__SAGS_FLIGHT_GOVERNANCE_V1='V1.0.0-20261003-TEST';

const ROOT='flight_records';
const MANAGER_POSITIONS=new Set(['DOI_TRUONG','DOI_PHO','CA_TRUONG','CA_PHO']);
const SPECIAL_MANUAL_LOAD_CARRIERS=new Set(['9G','QH','VU']);
const STATUS_TEXT={
  CHUA_PHAN_CONG:'CHƯA PHÂN CÔNG',
  CHO_NHAN:'CHỜ NHẬN',
  DANG_THUC_HIEN:'ĐANG THỰC HIỆN',
  HOAN_TAT:'HOÀN TẤT',
  KHONG_AP_DUNG:'KHÔNG ÁP DỤNG'
};
const UNIT_LABEL={DH:'ĐIỀU HÀNH',CBTT:'CÂN BẰNG TRỌNG TẢI',CARGO:'KHO HÀNG',PVHK:'PHỤC VỤ HÀNH KHÁCH'};
const S=v=>String(v??'').trim();
const U=v=>S(v).toUpperCase();
const safe=v=>S(v).replace(/[.#$\[\]\/]/g,'_');
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return null}};
const plain=v=>S(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D').replace(/đ/g,'d').toUpperCase();

function session(){try{return root.__sagsGetSession?.()||{role:root.currentRole||'',profile:root.currentUserProfile||{}}}catch(_){return{role:root.currentRole||'',profile:root.currentUserProfile||{}}}}
function profile(){const x=session();return x.profile||root.currentUserProfile||{}}
function role(){const x=session(),p=x.profile||{};return U(x.role||p.role||root.currentRole)}
function username(){const p=profile();return S(p.username||p.user||p.email||root.currentUsername||root.currentUser||'')}
function actorName(){const p=profile();return S(p.name||p.fullName||p.displayName||p.username||username()||'SYSTEM')}
function employeeCode(){const p=profile();return S(p.employeeCode||p.staffCode||p.employeeId||p.staffId||'')}
function positionCode(){
  const p=profile(),direct=U(p.positionCode||p.jobTitleCode||p.position);
  if(MANAGER_POSITIONS.has(direct)||direct==='NHAN_VIEN')return direct;
  const t=plain(p.jobTitle||p.title||p.positionName||'');
  if(/DOI\s*TRUONG/.test(t))return'DOI_TRUONG';
  if(/DOI\s*PHO/.test(t))return'DOI_PHO';
  if(/CA\s*TRUONG/.test(t))return'CA_TRUONG';
  if(/CA\s*PHO/.test(t))return'CA_PHO';
  return direct||'NHAN_VIEN';
}
function department(){
  if(['AD','ADMIN'].includes(role()))return'AD';
  const p=profile(),r=role(),raw=plain([p.systemDepartment,p.departmentCode,p.department,p.groupCode,p.group,p.unit,p.workUnit,r].filter(Boolean).join(' '));
  if(r==='CBTT'||/CBTT|CAN BANG TRONG TAI|CAN BANG/.test(raw))return'CBTT';
  if(['KH','CARGO'].includes(r)||/KHO HANG|CARGO|HANG HOA/.test(raw))return'CARGO';
  if(['DH','ĐH'].includes(r)||/DIEU HANH|OPS|OPERATION/.test(raw))return'DH';
  if(r==='PVHK'||/PVHK|HANH KHACH|PASSENGER/.test(raw))return'PVHK';
  return S(p.systemDepartment||p.departmentCode||r);
}
function isAdmin(){return profile().active!==false&&['AD','ADMIN'].includes(role())}
function isManager(){return profile().active!==false&&role()!=='VIEWER'&&(isAdmin()||MANAGER_POSITIONS.has(positionCode()))}
function canManageDepartment(unit){unit=U(unit);return profile().active!==false&&role()!=='VIEWER'&&(isAdmin()||(MANAGER_POSITIONS.has(positionCode())&&department()===unit))}
function assignmentUnit(item){
  const roleKey=U(item?.roleKey),src=U(item?.sourceColumn),form=U(item?.formGroup);
  if(roleKey==='CBTT'||src.includes('GRND_LS')||['FINAL','FSAGS54','FSAGS94','FSAGS94_CLC','CLC_CHECKLIST'].includes(form))return'CBTT';
  if(roleKey==='PAX09'||src.includes('PAX_SUPR')||form==='FSAGS09')return'PVHK';
  if(['COR','LD','BOTH'].includes(roleKey)||src.includes('GRND_COR')||src.includes('GRND_LD')||['FSAGS','FSAGS423','FSAGS421','FSAGS551'].includes(form))return'DH';
  if(form==='FSAGS208'||form==='LOADING208')return'CARGO';
  return'';
}
function db(path){if(typeof root.sagsV470Ref!=='function')throw new Error('Firebase RTDB chưa sẵn sàng.');return root.sagsV470Ref(path)}
function currentDate(){return S(document.getElementById('fwcDate')?.value||sessionStorage.getItem('sagsV36FwcDate')||new Date().toISOString().slice(0,10))}
function carrier(rec){try{return S(root.sagsAirlineFormPolicy?.carrier?.(rec)||'')}catch(_){return''}}
function loadSystemMode(rec){const raw=U(rec?.loadSystemMode||rec?.governance?.loadSystemMode||rec?.loadControl?.mode||'NORMAL');return raw==='SYSTEM_DOWN'?'SYSTEM_DOWN':'NORMAL'}
function isSpecialManualCarrier(rec){return SPECIAL_MANUAL_LOAD_CARRIERS.has(carrier(rec))}
function statusOverride(rec,unit){
  const x=rec?.departmentOverrides?.[U(unit)];if(!x||x.active===false)return null;
  const code=U(x.statusCode||x.status);if(!STATUS_TEXT[code])return null;
  const kind=code==='HOAN_TAT'?'DONE':code==='DANG_THUC_HIEN'?'WORKING':code==='KHONG_AP_DUNG'?'NA':'WAITING';
  return{kind,text:STATUS_TEXT[code],source:'MANAGER_OVERRIDE'};
}
function auditId(action){return 'AUD_'+Date.now()+'_'+Math.random().toString(36).slice(2,8).toUpperCase()+'_'+safe(action||'CHANGE')}
function actorSnapshot(){
  const p=profile();
  return{username:username(),name:actorName(),employeeCode:employeeCode(),department:department(),positionCode:positionCode(),jobTitle:S(p.jobTitle||p.title||''),role:role()};
}
function auditRecord(action,details={}){
  const at=Date.now(),id=auditId(action);
  return{id,eventId:id,action:S(action),atMs:at,at:new Date(at).toISOString(),actor:actorSnapshot(),...clone(details)};
}
async function readFlight(date,fid){return(await db(ROOT+'/'+safe(date)+'/'+safe(fid)).once('value')).val()||null}
async function updateWithAudit(date,fid,patch,action,details){
  const event=auditRecord(action,details),full={...patch};
  full[ROOT+'/'+safe(date)+'/'+safe(fid)+'/auditTrail/'+safe(event.id)]=event;
  full[ROOT+'/'+safe(date)+'/'+safe(fid)+'/auditUpdatedAtMs']=event.atMs;
  await db('').update(full);
  try{root.dispatchEvent(new CustomEvent('sags:flight-governance-changed',{detail:{date,fid,action,event}}))}catch(_){}
  return event;
}
function requireReason(reason){reason=S(reason);if(reason.length<3)throw new Error('Cần nhập lý do điều chỉnh.');return reason}
function requireManager(unit){if(!canManageDepartment(unit))throw new Error('Chỉ cán bộ cấp Đội/Ca của '+(UNIT_LABEL[unit]||unit)+' hoặc AD được thực hiện.')}
async function setLoadSystemMode(date,fid,mode,reason){
  date=S(date)||currentDate();fid=S(fid);mode=U(mode)==='SYSTEM_DOWN'?'SYSTEM_DOWN':'NORMAL';requireManager('CBTT');reason=requireReason(reason);
  const rec=await readFlight(date,fid);if(!rec)throw new Error('Không tìm thấy Flight Record.');
  if(!isSpecialManualCarrier(rec))throw new Error('SYSTEM DOWN chuyển F-94 ↔ F-54 chỉ áp dụng cho 9G, QH, VU.');
  const old=loadSystemMode(rec);if(old===mode)return false;
  const now=Date.now(),c=carrier(rec),patch={};
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/loadSystemMode']=mode;
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/loadSystemModeAtMs']=now;
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/loadSystemModeBy']=actorSnapshot();
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/loadSystemModeReason']=reason;
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/governance/loadSystemMode']=mode;
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/governance/loadSystemModeUpdatedAtMs']=now;
  await updateWithAudit(date,fid,patch,'LOAD_SYSTEM_MODE_CHANGED',{
    unit:'CBTT',oldValue:old,newValue:mode,reason,carrier:c,
    formTransition:old==='SYSTEM_DOWN'?'F-54 → F-94':'F-94 → F-54'
  });
  try{await root.sagsReconcilePolicyAuxForms?.(date)}catch(e){console.info('Policy reconcile after system mode',e?.message||e)}
  try{root.sagsV477InvalidateQueueStatus?.()}catch(_){}
  setTimeout(()=>{try{root.flightWorkspaceRefresh?.()}catch(_){}},80);
  return true;
}
async function setDepartmentStatus(date,fid,unit,statusCode,reason){
  date=S(date)||currentDate();fid=S(fid);unit=U(unit);statusCode=U(statusCode);requireManager(unit);reason=requireReason(reason);
  if(!STATUS_TEXT[statusCode])throw new Error('Trạng thái không hợp lệ.');
  const rec=await readFlight(date,fid);if(!rec)throw new Error('Không tìm thấy Flight Record.');
  const old=rec.departmentOverrides?.[unit]?.statusCode||'';
  const now=Date.now(),patch={};
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/departmentOverrides/'+safe(unit)]={active:true,statusCode,statusText:STATUS_TEXT[statusCode],updatedAtMs:now,updatedBy:actorSnapshot(),reason};
  await updateWithAudit(date,fid,patch,'DEPARTMENT_STATUS_CHANGED',{unit,oldValue:old||null,newValue:statusCode,reason});
  setTimeout(()=>{try{root.flightWorkspaceOpenFlight?.(fid)}catch(_){}},80);
  return true;
}
async function clearDepartmentOverride(date,fid,unit,reason){
  date=S(date)||currentDate();fid=S(fid);unit=U(unit);requireManager(unit);reason=requireReason(reason);
  const rec=await readFlight(date,fid);if(!rec)throw new Error('Không tìm thấy Flight Record.');
  const old=rec.departmentOverrides?.[unit]?.statusCode||'';
  const patch={};patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/departmentOverrides/'+safe(unit)]=null;
  await updateWithAudit(date,fid,patch,'DEPARTMENT_STATUS_OVERRIDE_CLEARED',{unit,oldValue:old||null,newValue:null,reason});
  setTimeout(()=>{try{root.flightWorkspaceOpenFlight?.(fid)}catch(_){}},80);
  return true;
}
async function reassignAssignment(date,fid,aid,newUser,reason){
  date=S(date)||currentDate();fid=S(fid);aid=S(aid);newUser=S(newUser).toUpperCase();if(!newUser)throw new Error('Thiếu tài khoản nhận mới.');reason=requireReason(reason);
  const [flight,manSnap]=await Promise.all([readFlight(date,fid),db('roster_manifests/'+safe(date)+'/items/'+safe(aid)).once('value')]);
  const item=manSnap.val()||flight?.assignments?.[aid];if(!flight||!item)throw new Error('Không tìm thấy assignment.');
  if(S(item.flightId)!==fid||item.active===false)throw new Error('Phân công không thuộc chuyến đang chọn hoặc đã bị hủy.');
  const unit=assignmentUnit(item);requireManager(unit);
  if(item.formInstanceId){const r=await root.SAGSRosterResponsibility.instance().reassign(date,aid,newUser,reason);return !r.same&&!r.cancelled;}const oldUser=S(item.user||item.targetUser||item.ownerUser).toUpperCase();if(oldUser===newUser)return false;
  const now=Date.now(),next={...item,user:newUser,targetUser:newUser,ownerUser:newUser,reassignedAtMs:now,reassignedBy:actorSnapshot(),reassignReason:reason,updatedAtMs:now,active:true},patch={};
  patch['roster_manifests/'+safe(date)+'/items/'+safe(aid)]=next;
  if(oldUser)patch['roster_mail/'+safe(oldUser)+'/items/'+safe(aid)+'/active']=false;
  patch['roster_mail/'+safe(newUser)+'/items/'+safe(aid)]={...next,opDate:date,date:S(next.date||date)};
  patch['roster_sessions/'+safe(aid)+'/ownerUser']=newUser;
  patch['roster_sessions/'+safe(aid)+'/claimStatus']='UNCLAIMED';
  patch['roster_sessions/'+safe(aid)+'/workPartStatus']='UNCLAIMED';
  patch['roster_sessions/'+safe(aid)+'/taskStatusV333']='UNCLAIMED';
  patch['roster_sessions/'+safe(aid)+'/claimedBy']=null;
  patch['roster_sessions/'+safe(aid)+'/claimedAtMs']=null;
  patch['roster_sessions/'+safe(aid)+'/updatedAtMs']=now;
  patch['roster_sessions/'+safe(aid)+'/statusSummary']={ownerUser:newUser,claimStatus:'UNCLAIMED',workPartStatus:'UNCLAIMED',taskStatusV333:'UNCLAIMED',summaryAtMs:now};
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/assignments/'+safe(aid)]=next;
  await updateWithAudit(date,fid,patch,'ASSIGNMENT_REASSIGNED',{unit,assignmentId:aid,formGroup:S(item.formGroup),oldValue:oldUser||null,newValue:newUser,reason});
  try{root.sagsV477InvalidateQueueStatus?.()}catch(_){}
  return true;
}
async function reopenAssignment(date,fid,aid,reason){
  date=S(date)||currentDate();fid=S(fid);aid=S(aid);reason=requireReason(reason);
  const [flight,manSnap]=await Promise.all([readFlight(date,fid),db('roster_manifests/'+safe(date)+'/items/'+safe(aid)).once('value')]);
  const item=manSnap.val()||flight?.assignments?.[aid];if(!flight||!item)throw new Error('Không tìm thấy assignment.');
  if(S(item.flightId)!==fid||item.active===false)throw new Error('Phân công không thuộc chuyến đang chọn hoặc đã bị hủy.');
  const unit=assignmentUnit(item);requireManager(unit);
  if(item.formInstanceId)throw Error('Form dùng chung đã bàn giao; AD cập nhật phân công qua preview roster để bảo toàn trách nhiệm ARR/DEP.');
  const now=Date.now(),patch={};
  patch['roster_sessions/'+safe(aid)+'/claimStatus']='CLAIMED';
  patch['roster_sessions/'+safe(aid)+'/workPartStatus']='IN_PROGRESS';
  patch['roster_sessions/'+safe(aid)+'/taskStatusV333']='IN_PROGRESS';
  patch['roster_sessions/'+safe(aid)+'/completedAtMs']=null;
  patch['roster_sessions/'+safe(aid)+'/completedBy']=null;
  patch['roster_sessions/'+safe(aid)+'/reopenedByManager']=true;
  patch['roster_sessions/'+safe(aid)+'/reopenedAtMs']=now;
  patch['roster_sessions/'+safe(aid)+'/updatedAtMs']=now;
  patch['roster_sessions/'+safe(aid)+'/statusSummary']={ownerUser:S(item.user||item.targetUser),claimStatus:'CLAIMED',workPartStatus:'IN_PROGRESS',taskStatusV333:'IN_PROGRESS',completedAtMs:null,summaryAtMs:now};
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/assignments/'+safe(aid)+'/managerReopenedAtMs']=now;
  patch[ROOT+'/'+safe(date)+'/'+safe(fid)+'/assignments/'+safe(aid)+'/managerReopenedBy']=actorSnapshot();
  await updateWithAudit(date,fid,patch,'ASSIGNMENT_REOPENED',{unit,assignmentId:aid,formGroup:S(item.formGroup),reason});
  try{root.sagsV477InvalidateQueueStatus?.()}catch(_){}
  return true;
}
async function reassignCargo208(date,fid,newUser,reason){
  date=S(date)||currentDate();fid=S(fid);newUser=S(newUser).toUpperCase();if(!newUser)throw new Error('Thiếu tài khoản Kho hàng mới.');requireManager('CARGO');reason=requireReason(reason);
  const rec=await readFlight(date,fid);if(!rec)throw new Error('Không tìm thấy Flight Record.');
  const mod=rec.modules?.FSAGS208||{},old=S(mod.currentHandler?.username).toUpperCase(),now=Date.now(),p={};
  p[ROOT+'/'+safe(date)+'/'+safe(fid)+'/modules/FSAGS208/currentHandler']={username:newUser,name:newUser,assignedAtMs:now,assignedBy:actorSnapshot()};
  p[ROOT+'/'+safe(date)+'/'+safe(fid)+'/modules/FSAGS208/status']=U(mod.status)==='SENT'?'SENT':'IN_PROGRESS';
  p[ROOT+'/'+safe(date)+'/'+safe(fid)+'/modules/FSAGS208/updatedAtMs']=now;
  await updateWithAudit(date,fid,p,'FSAGS208_HANDLER_CHANGED',{unit:'CARGO',oldValue:old||null,newValue:newUser,reason});
  return true;
}
function formLabel(item){const g=U(item?.formGroup);if(g==='FSAGS54')return'F-54';if(['FSAGS94','FSAGS94_CLC','CLC_CHECKLIST'].includes(g))return'F-94';if(g==='FINAL')return'FINAL';return S(item?.formGroup||'FORM')}
function esc(v){return S(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ensureStyle(){
  if(document.getElementById('sagsGovernanceStyle'))return;
  const st=document.createElement('style');st.id='sagsGovernanceStyle';st.textContent=`
.sagsGovPanel{border:1px solid #b9cfe0;background:#f7fbfe;border-radius:12px;padding:9px;margin:7px 0;display:grid;gap:7px}
.sagsGovRow{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.sagsGovTitle{font:900 11px Arial;color:#315d83}.sagsGovPill{display:inline-flex;padding:5px 8px;border-radius:999px;background:#eef3f7;color:#31556f;font:900 10px Arial}.sagsGovPill.down{background:#fff1e8;color:#9b3f00;border:1px solid #efb17f}.sagsGovBtn{border:0;border-radius:8px;min-height:34px;padding:6px 9px;background:#0b67b2;color:#fff;font:900 10px Arial}.sagsGovBtn.warn{background:#b45309}.sagsGovBtn.gray{background:#e8eef3;color:#314a61}.sagsGovDocs{display:flex;gap:5px;flex-wrap:wrap}.sagsGovDoc{padding:5px 7px;border-radius:8px;background:#eaf6ee;color:#17643a;font:900 10px Arial}.sagsGovModal{position:fixed;inset:0;z-index:19999;background:#0008;display:flex;align-items:center;justify-content:center;padding:10px}.sagsGovCard{width:min(94vw,720px);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;padding:12px;box-shadow:0 18px 50px #0005}.sagsGovAudit{border-bottom:1px solid #e2e8ee;padding:8px 0;font:11px/1.45 Arial}.sagsGovAudit b{color:#164d75}.sagsGovAssignment{border:1px solid #d9e3ea;border-radius:10px;padding:8px;margin:6px 0}.sagsGovAssignment .sagsGovBtn{margin:4px 4px 0 0}
@media(max-width:767px){.sagsGovPanel{padding:7px}.sagsGovBtn{min-height:32px}.sagsGovCard{padding:9px}.sagsGovRow{gap:4px}}
`;document.head.appendChild(st)
}
function closeModal(){document.getElementById('sagsGovernanceModal')?.remove()}
function modal(title,html){
  closeModal();ensureStyle();const m=document.createElement('div');m.id='sagsGovernanceModal';m.className='sagsGovModal';m.innerHTML='<div class="sagsGovCard"><div class="sagsGovRow" style="justify-content:space-between"><h3 style="margin:0">'+esc(title)+'</h3><button class="sagsGovBtn gray" id="sagsGovClose">ĐÓNG</button></div><div id="sagsGovModalBody">'+html+'</div></div>';document.body.appendChild(m);document.getElementById('sagsGovClose').onclick=closeModal;m.onclick=e=>{if(e.target===m)closeModal()};return m
}
async function openAudit(date,fid){
  date=S(date)||currentDate();fid=S(fid);modal('LỊCH SỬ ĐIỀU CHỈNH','<p>Đang tải lịch sử…</p>');
  try{
    const v=(await db(ROOT+'/'+safe(date)+'/'+safe(fid)+'/auditTrail').once('value')).val()||{},rows=Object.values(v).sort((a,b)=>Number(b.atMs||0)-Number(a.atMs||0));
    document.getElementById('sagsGovModalBody').innerHTML=rows.length?rows.map(x=>{
      const a=x.actor||{},when=Number(x.atMs||0)?new Date(Number(x.atMs)).toLocaleString('vi-VN'):'',change=x.oldValue!==undefined||x.newValue!==undefined?'<div><b>'+esc(S(x.oldValue??'—'))+' → '+esc(S(x.newValue??'—'))+'</b></div>':'';
      return '<div class="sagsGovAudit"><div><b>'+esc(when)+' · '+esc(UNIT_LABEL[x.unit]||x.unit||a.department||'HỆ THỐNG')+'</b></div><div>'+esc(a.name||a.username||'SYSTEM')+' · '+esc(a.positionCode||'')+' · '+esc(x.action||'')+'</div>'+change+(x.formTransition?'<div>'+esc(x.formTransition)+'</div>':'')+(x.reason?'<div>Lý do: '+esc(x.reason)+'</div>':'')+'</div>'
    }).join(''):'<p>Chưa có điều chỉnh quản lý nào trên chuyến này.</p>';
  }catch(e){document.getElementById('sagsGovModalBody').textContent='Không tải được lịch sử: '+S(e?.message||e)}
}
async function openManager(date,fid,unit){
  date=S(date)||currentDate();fid=S(fid);unit=U(unit);requireManager(unit);modal('QUẢN LÝ · '+(UNIT_LABEL[unit]||unit),'<p>Đang tải nghiệp vụ…</p>');
  try{
    const rec=await readFlight(date,fid);if(!rec)throw new Error('Không tìm thấy Flight Record.');
    const assignments=Object.values(rec.assignments||{}).filter(a=>a&&a.active!==false&&assignmentUnit(a)===unit);
    const override=rec.departmentOverrides?.[unit]?.statusCode||'';
    let html='<div class="sagsGovAssignment"><b>TRẠNG THÁI BỘ PHẬN</b><div class="sagsGovRow" style="margin-top:6px"><select id="sagsGovStatus">'+Object.entries(STATUS_TEXT).map(([k,v])=>'<option value="'+k+'" '+(k===override?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select><button class="sagsGovBtn" id="sagsGovStatusSave">LƯU TRẠNG THÁI</button><button class="sagsGovBtn gray" id="sagsGovStatusClear">BỎ GHI ĐÈ</button></div></div>';
    if(unit==='CARGO'){
      const h=rec.modules?.FSAGS208?.currentHandler?.username||'CHƯA NHẬN';
      html+='<div class="sagsGovAssignment"><b>FSAGS 208</b><div>Người xử lý: '+esc(h)+'</div><button class="sagsGovBtn" id="sagsGovCargoReassign">ĐỔI NGƯỜI XỬ LÝ 208</button></div>';
    }
    if(assignments.length)html+=assignments.map(a=>'<div class="sagsGovAssignment"><b>'+esc(formLabel(a))+'</b> · '+esc(a.user||a.targetUser||'CHƯA PHÂN')+'<div><button class="sagsGovBtn" data-gov-reassign="'+esc(a.assignmentId)+'">ĐỔI NGƯỜI</button><button class="sagsGovBtn warn" data-gov-reopen="'+esc(a.assignmentId)+'">MỞ LẠI</button></div></div>').join('');
    else if(unit!=='CARGO')html+='<p>Chưa có assignment đang hiệu lực cho bộ phận này.</p>';
    document.getElementById('sagsGovModalBody').innerHTML=html;
    document.getElementById('sagsGovStatusSave').onclick=async()=>{try{const reason=prompt('Lý do điều chỉnh trạng thái:','');if(reason===null)return;await setDepartmentStatus(date,fid,unit,document.getElementById('sagsGovStatus').value,reason);closeModal()}catch(e){alert(e.message||e)}};
    document.getElementById('sagsGovStatusClear').onclick=async()=>{try{const reason=prompt('Lý do bỏ trạng thái ghi đè:','');if(reason===null)return;await clearDepartmentOverride(date,fid,unit,reason);closeModal()}catch(e){alert(e.message||e)}};
    document.querySelectorAll('[data-gov-reassign]').forEach(b=>b.onclick=async()=>{try{const u=prompt('Tài khoản nhận mới:','');if(!u)return;const reason=prompt('Lý do đổi người:','');if(reason===null)return;await reassignAssignment(date,fid,b.dataset.govReassign,u,reason);await openManager(date,fid,unit)}catch(e){alert(e.message||e)}});
    document.querySelectorAll('[data-gov-reopen]').forEach(b=>b.onclick=async()=>{try{const reason=prompt('Lý do mở lại công việc:','');if(reason===null)return;if(!confirm('Mở lại công việc này? Lịch sử cũ vẫn được giữ.'))return;await reopenAssignment(date,fid,b.dataset.govReopen,reason);await openManager(date,fid,unit)}catch(e){alert(e.message||e)}});
    if(unit==='CARGO')document.getElementById('sagsGovCargoReassign').onclick=async()=>{try{const u=prompt('Tài khoản Kho hàng nhận FSAGS 208:','');if(!u)return;const reason=prompt('Lý do đổi người xử lý 208:','');if(reason===null)return;await reassignCargo208(date,fid,u,reason);await openManager(date,fid,unit)}catch(e){alert(e.message||e)}};
  }catch(e){document.getElementById('sagsGovModalBody').textContent='Không tải được: '+S(e?.message||e)}
}
function docsHtml(rec){
  const docs=rec?.documents||{},order=['FSAGS54','FSAGS94','FSAGS208'],html=[];
  for(const code of order){const d=docs[code];if(!d)continue;const label=code==='FSAGS54'?'F-54':code==='FSAGS94'?'F-94':'FSAGS 208',status=U(d.status||'ASSIGNED').replaceAll('_',' ');html.push('<span class="sagsGovDoc">'+esc(label)+' · '+esc(status)+(d.revisionNo?' · R'+esc(d.revisionNo):'')+'</span>')}
  return html.join('');
}
async function decorate(date,fid){
  date=S(date)||currentDate();fid=S(fid);const body=document.getElementById('fwcBody');if(!body||!fid)return;
  try{
    const rec=await readFlight(date,fid);if(!rec||!document.getElementById('fwcBody'))return;document.getElementById('sagsGovernancePanel')?.remove();ensureStyle();
    const panel=document.createElement('div');panel.id='sagsGovernancePanel';panel.className='sagsGovPanel';
    const c=carrier(rec),mode=loadSystemMode(rec),special=SPECIAL_MANUAL_LOAD_CARRIERS.has(c),own=department(),buttons=[];
    if(isAdmin())for(const u of['DH','CBTT','CARGO','PVHK'])buttons.push('<button class="sagsGovBtn gray" data-gov-unit="'+u+'">⚙ '+esc(UNIT_LABEL[u]||u)+'</button>');
    else if(isManager()&&['DH','CBTT','CARGO','PVHK'].includes(own))buttons.push('<button class="sagsGovBtn gray" data-gov-unit="'+esc(own)+'">⚙ QUẢN LÝ '+esc(UNIT_LABEL[own]||own)+'</button>');
    let modeHtml='';
    if(special){
      modeHtml='<div class="sagsGovRow"><span class="sagsGovTitle">LOAD SYSTEM</span><span class="sagsGovPill '+(mode==='SYSTEM_DOWN'?'down':'')+'">'+(mode==='SYSTEM_DOWN'?'⚠ SYSTEM DOWN · TẢI TAY':'✓ NORMAL · F-94')+'</span>'+(canManageDepartment('CBTT')?'<button class="sagsGovBtn '+(mode==='SYSTEM_DOWN'?'':'warn')+'" id="sagsGovModeToggle">'+(mode==='SYSTEM_DOWN'?'KHÔI PHỤC NORMAL':'CHUYỂN SYSTEM DOWN')+'</button>':'')+'</div>';
    }
    const dhtml=docsHtml(rec);
    panel.innerHTML=modeHtml+(dhtml?'<div class="sagsGovRow"><span class="sagsGovTitle">HỒ SƠ BIỂU MẪU</span><span class="sagsGovDocs">'+dhtml+'</span></div>':'')+'<div class="sagsGovRow">'+buttons.join('')+'<button class="sagsGovBtn gray" id="sagsGovAuditBtn">🕘 LỊCH SỬ ĐIỀU CHỈNH</button></div>';
    const head=body.querySelector('.fwcWorkspaceHead');if(head)head.insertAdjacentElement('afterend',panel);else body.prepend(panel);
    document.getElementById('sagsGovAuditBtn').onclick=()=>openAudit(date,fid);
    panel.querySelectorAll('[data-gov-unit]').forEach(b=>b.onclick=()=>openManager(date,fid,b.dataset.govUnit));
    const toggle=document.getElementById('sagsGovModeToggle');if(toggle)toggle.onclick=async()=>{try{const next=mode==='SYSTEM_DOWN'?'NORMAL':'SYSTEM_DOWN',reason=prompt(next==='SYSTEM_DOWN'?'Lý do SYSTEM DOWN / làm tải tay:':'Lý do khôi phục SYSTEM NORMAL:','');if(reason===null)return;if(!confirm((next==='SYSTEM_DOWN'?'Chuyển chuyến sang SYSTEM DOWN và dùng F-54?':'Khôi phục NORMAL và quay lại F-94 cho công việc đang áp dụng?')))return;await setLoadSystemMode(date,fid,next,reason);setTimeout(()=>root.flightWorkspaceOpenFlight?.(fid),120)}catch(e){alert(e.message||e)}};
  }catch(e){console.info('Flight governance decorate',e?.message||e)}
}
function wrapFlightOpen(){
  const fn=root.flightWorkspaceOpenFlight;if(typeof fn!=='function'||fn.__sagsGovernanceWrapped)return false;
  const w=function(fid){const out=fn.apply(this,arguments),date=currentDate();setTimeout(()=>decorate(date,S(fid)),0);return out};w.__sagsGovernanceWrapped=true;w.__base=fn;root.flightWorkspaceOpenFlight=w;return true;
}
async function openUnifiedDossier(date,fid){
 date=S(date)||currentDate();fid=S(fid);
 if(!fid)throw new Error('Chọn một chuyến bay trước khi mở hồ sơ.');
 if(typeof root.sagsV338OpenDossier!=='function')throw new Error('Chức năng hồ sơ chuyến chưa sẵn sàng. Hãy tải lại ứng dụng.');
 return await root.sagsV338OpenDossier(date,fid);
}
function install(){ensureStyle();wrapFlightOpen()}
root.sagsFlightGovernance={build:root.__SAGS_FLIGHT_GOVERNANCE_V1,MANAGER_POSITIONS,SPECIAL_MANUAL_LOAD_CARRIERS,STATUS_TEXT,department,positionCode,isManager,canManageDepartment,assignmentUnit,loadSystemMode,isSpecialManualCarrier,statusOverride,setLoadSystemMode,setDepartmentStatus,clearDepartmentOverride,reassignAssignment,reopenAssignment,reassignCargo208,openAudit,openManager,decorate,openUnifiedDossier};
root.sagsOpenUnifiedFlightDossier=openUnifiedDossier;
root.addEventListener?.('sags:flight-governance-changed',e=>{const fid=S(e?.detail?.fid);if(fid)setTimeout(()=>decorate(e.detail.date,fid),100)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,700);setTimeout(install,2200);
})(window);
