/* E-REPORT SAGS TEST · ADMIN ACCOUNT LIFECYCLE V3
 * Loaded last: canonical CREATE / RESET / DELETE overrides.
 * CREATE writes Firebase Auth first, then users/{uid}, with rollback and orphan recovery.
 * DELETE tries the known initial password directly before any privileged backend fallback.
 */
(function(root){
'use strict';
const BUILD='V2.5-20261006-ACCOUNT-LIFECYCLE-08-ADMIN-LIFECYCLE',TMP_PASS='123456';
const S=v=>String(v??'').trim();
function session(){try{return typeof root.__sagsGetSession==='function'?root.__sagsGetSession():null}catch(_){return null}}
function role(){const s=session();let r=S(s?.role||s?.profile?.role).toUpperCase();if(!r){try{r=S(currentRole).toUpperCase()}catch(_){}}return r}
function isAdmin(){return ['AD','ADMIN'].includes(role())}
function status(t,bad=false){try{if(typeof root.setAccountManagerStatus==='function')return root.setAccountManagerStatus(t,bad)}catch(_){}const e=document.getElementById('accountManagerStatus');if(e){e.textContent=S(t);e.style.color=bad?'#b42318':'#455'}}
function code(e){return S(e?.code||e?.details?.code||'')}
function message(e){return S(e?.message||e?.details?.message||e||'Lỗi không xác định')}
function normUser(v){try{if(typeof root.normalizePersonalUsername==='function')return S(root.normalizePersonalUsername(v))}catch(_){}return S(v).toUpperCase().replace(/\s+/g,'')}
function normEmployee(v){try{if(typeof root.normalizeEmployeeCode==='function')return S(root.normalizeEmployeeCode(v))}catch(_){}let x=S(v).toUpperCase();if(!x)return'';return x.startsWith('CXR-')?x:'CXR-'+x}
function loginEmail(d){const direct=S(d?.email);if(direct)return direct.toLowerCase();const raw=S(d?.username);if(!raw)return'';try{if(typeof root.firebaseLoginEmail==='function')return S(root.firebaseLoginEmail(raw)).toLowerCase()}catch(_){}let x=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[Đđ]/g,'D').toLowerCase().replace(/[^a-z0-9._-]+/g,'.').replace(/^\.+|\.+$/g,'').replace(/\.{2,}/g,'.');return x?x+'@ereport-sags.local':''}
async function adminContext(){
 if(!isAdmin())throw Error('Chỉ AD được quản lý tài khoản.');
 const auth=root.firebase?.auth?.(),caller=auth?.currentUser;if(!caller?.uid)throw Error('Phiên Firebase AD chưa sẵn sàng. Hãy đăng nhập lại AD.');
 try{await caller.getIdToken(true)}catch(e){throw Error('Không làm mới được quyền AD: '+message(e))}
 const fs=root.firebase?.firestore?.();if(!fs)throw Error('Firestore chưa sẵn sàng.');
 return {auth,caller,fs};
}
function secondary(name){const app=root.firebase.initializeApp(root.firebase.app().options,name+'-'+Date.now()+'-'+Math.random().toString(36).slice(2));return {app,auth:app.auth()}}
async function closeSecondary(x){try{await x?.auth?.signOut()}catch(_){}try{await x?.app?.delete()}catch(_){}}
async function target(id,ctx){const uid=S(id);if(!uid)throw Error('Thiếu UID tài khoản.');const snap=await ctx.fs.collection('users').doc(uid).get();if(!snap.exists)throw Error('Tài khoản không còn tồn tại trong users/{UID}.');return {uid,ref:snap.ref,data:snap.data()||{}}}
async function cleanupPermission(d){
 try{const u=normUser(d?.username);if(!u)return;const safe=typeof root.sagsV470Safe==='function'?root.sagsV470Safe(u):u.replace(/[.#$\[\]\/]/g,'_');if(typeof root.sagsV470Ref==='function')await root.sagsV470Ref('account_permissions/'+safe).remove()}catch(e){console.warn('permission cleanup',e)}
}
async function publishPermission(username,source){try{const u=normUser(username);if(!u||typeof root.sagsV470Ref!=='function')return;const safe=typeof root.sagsV470Safe==='function'?root.sagsV470Safe(u):u.replace(/[.#$\[\]\/]/g,'_'),now=Date.now();await root.sagsV470Ref('account_permissions/'+safe).set({rev:now,updatedAtMs:now,source})}catch(e){console.warn('permission publish',e)}}
async function refresh(){try{await root.refreshAccountManager?.()}catch(_){}}
function createInput(){
 const employeeCode=normEmployee(document.getElementById('admEmployeeCode')?.value||''),name=S(document.getElementById('admFullName')?.value),username=normUser(document.getElementById('admUsername')?.value),departmentCode=S(document.getElementById('admSystemDepartment')?.value).toUpperCase(),groupCode=S(document.getElementById('admGroupCode')?.value).toUpperCase(),roleCode=S(document.getElementById('admRole')?.value).toUpperCase(),jobTitle=S(document.getElementById('admJobTitle')?.value),unit=S(document.getElementById('admUnit')?.value);
 let positionCode='';try{if(typeof root.v18PositionCode==='function')positionCode=S(root.v18PositionCode(jobTitle,{}))}catch(_){}
 return {employeeCode,name,username,departmentCode,groupCode,roleCode,jobTitle,unit,positionCode};
}
async function createAccount(){
 if(!isAdmin())return alert('Chỉ AD được tạo tài khoản.');
 let sec=null,cred=null,createdNew=false,recoveredOrphan=false,profileWritten=false;
 try{
  const ctx=await adminContext(),d=createInput();
  if(!d.employeeCode||!d.name||!d.username||!d.departmentCode||!d.groupCode||!d.roleCode||!d.jobTitle||!d.unit)return status('Cần nhập/chọn đủ thông tin tài khoản.',true);
  if(new Set(['AD','ĐH','DH','CBTT','PVHK','LNF','LOSTFOUND','KH','VIEWER','PĐH','ADMIN']).has(d.username))return status('Không dùng tên tài khoản '+d.username+' vì trùng mã hệ thống.',true);
  const email=loginEmail({username:d.username});if(!email)throw Error('Không tạo được email Firebase từ username '+d.username+'.');
  const users=ctx.fs.collection('users');
  status('Đang kiểm tra username / mã nhân viên / Firebase Auth…');
  const [sameUser,sameCode,sameEmail]=await Promise.all([users.where('username','==',d.username).get(),users.where('employeeCode','==',d.employeeCode).get(),users.where('email','==',email).get()]);
  if(!sameUser.empty)throw Error('Tài khoản '+d.username+' đã tồn tại trong users/{UID}.');
  if(!sameCode.empty)throw Error('Mã nhân viên '+d.employeeCode+' đã được sử dụng.');
  if(!sameEmail.empty)throw Error('Email '+email+' đã có hồ sơ E-REPORT.');
  sec=secondary('sags-create-v3');try{await sec.auth.setPersistence(root.firebase.auth.Auth.Persistence.NONE)}catch(_){}
  try{cred=await sec.auth.createUserWithEmailAndPassword(email,TMP_PASS);createdNew=true}
  catch(e){
   if(!code(e).includes('email-already-in-use'))throw e;
   status('Auth đã tồn tại · đang kiểm tra khả năng phục hồi hồ sơ mồ côi…');
   try{cred=await sec.auth.signInWithEmailAndPassword(email,TMP_PASS)}catch(signErr){throw Error('Firebase Auth '+email+' đã tồn tại nhưng không dùng mật khẩu mặc định 123456. Cần xóa/reset Auth cũ trước khi đăng ký lại. ['+code(signErr)+']')}
   const orphanUid=S(cred?.user?.uid);if(!orphanUid)throw Error('Không xác định được UID Auth đang tồn tại.');
   const old=await users.doc(orphanUid).get();if(old.exists)throw Error('Firebase Auth '+email+' đã có users/{UID}. Hãy tải lại danh sách tài khoản thay vì tạo mới.');
   recoveredOrphan=true;
  }
  const uid=S(cred?.user?.uid);if(!uid)throw Error('Firebase không trả UID tài khoản.');
  const now=Date.now(),storedRole=d.roleCode==='AD'?'ADMIN':d.roleCode;let actor=null;try{actor=typeof root.currentActor==='function'?root.currentActor():null}catch(_){}
  status(recoveredOrphan?'Đang phục hồi users/{UID} cho Auth mồ côi…':'Đang tạo users/{UID} theo Firebase UID…');
  await users.doc(uid).set({active:true,email,username:d.username,employeeCode:d.employeeCode,name:d.name,role:storedRole,roleCode:d.roleCode,departmentCode:d.departmentCode,systemDepartment:d.departmentCode,groupCode:d.groupCode,positionCode:d.positionCode||d.jobTitle,jobTitle:d.jobTitle,unit:d.unit,workUnit:d.unit,mustChangePassword:true,featureOverridesV485:{},permissionRoleV485:d.roleCode,permissionRevV485:now,authMode:'FIREBASE_100',firebaseUid:uid,createdBy:actor,createdAtMs:now,updatedAtMs:now,recoveredOrphanAuth:recoveredOrphan||false},{merge:false});
  profileWritten=true;
  const verify=await users.doc(uid).get(),vd=verify.data()||{};if(!verify.exists||normUser(vd.username)!==d.username||vd.active!==true)throw Error('Xác minh users/{UID} sau đăng ký không đạt.');
  await publishPermission(d.username,recoveredOrphan?'ACCOUNT_ORPHAN_RECOVERED':'ACCOUNT_CREATE_FIREBASE');
  ['admEmployeeCode','admFullName','admUsername','admJobTitle'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  try{root.v18SyncAccountHierarchy?.('adm')}catch(_){}
  status('✓ '+(recoveredOrphan?'Đã phục hồi':'Đã tạo')+' '+d.username+' · UID '+uid+' · mật khẩu ban đầu 123456.');
  alert('✓ '+(recoveredOrphan?'ĐÃ PHỤC HỒI TÀI KHOẢN':'ĐÃ TẠO TÀI KHOẢN')+'\n\nUsername: '+d.username+'\nFirebase: '+email+'\nMật khẩu: 123456');
  await refresh();
 }catch(e){
  if(createdNew&&cred?.user&&!profileWritten){try{await cred.user.delete()}catch(_){}}
  status('Không đăng ký được: '+message(e),true);
  alert('KHÔNG TẠO ĐƯỢC TÀI KHOẢN\n\n'+message(e));
 }finally{await closeSecondary(sec)}
}
async function callReset(t){
 const email=loginEmail(t.data),u=normUser(t.data?.username),payload={uid:t.uid,targetUid:t.uid,userId:t.uid,email,username:u,password:TMP_PASS,newPassword:TMP_PASS,mustChangePassword:true};
 const regions=['asia-southeast1',null,'us-central1'];let last=null,seen=new Set();
 for(const region of regions){try{const fx=region?root.firebase.app().functions(region):root.firebase.functions(),key=String(region||'default');if(seen.has(key))continue;seen.add(key);const res=await fx.httpsCallable('adminResetAuthPassword')(payload);if(res?.data?.ok===false)throw Error(S(res.data.error||res.data.message||'Cloud Function từ chối reset.'));return res?.data||{ok:true}}catch(e){last=e;console.warn('adminResetAuthPassword',region||'default',code(e),message(e));if(code(e).includes('permission-denied')||code(e).includes('unauthenticated'))break}}
 throw Error('RESET AUTH thất bại'+(code(last)?' ['+code(last)+']':'')+': '+message(last));
}
async function callDeleteServer(t){
 const payload={uid:t.uid,targetUid:t.uid,userId:t.uid,email:loginEmail(t.data),username:normUser(t.data?.username)},regions=['asia-southeast1',null,'us-central1'];let last=null;
 for(const region of regions){try{const fx=region?root.firebase.app().functions(region):root.firebase.functions(),res=await fx.httpsCallable('adminDeleteAuthUser')(payload);if(res?.data?.ok===false)throw Error(S(res.data.error||res.data.message||'Cloud Function từ chối xóa.'));return true}catch(e){last=e;console.warn('adminDeleteAuthUser',region||'default',code(e),message(e));if(code(e).includes('permission-denied')||code(e).includes('unauthenticated'))break}}
 return false;
}
async function deleteWithDefault(email,uid){
 let sec=null;try{sec=secondary('sags-delete-default');try{await sec.auth.setPersistence(root.firebase.auth.Auth.Persistence.NONE)}catch(_){}
  let cred;try{cred=await sec.auth.signInWithEmailAndPassword(email,TMP_PASS)}catch(e){const c=code(e);if(c.includes('user-not-found'))return {ok:true,missing:true};if(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('invalid-login-credentials'))return {ok:false,changedPassword:true,error:e};throw e}
  if(!cred?.user?.uid||S(cred.user.uid)!==S(uid))throw Error('UID Auth xác minh không khớp hồ sơ cần xóa.');
  await cred.user.delete();return {ok:true,missing:false};
 }finally{await closeSecondary(sec)}
}
async function resetPassword(id){
 if(!isAdmin())return alert('Chỉ AD được reset mật khẩu.');
 try{const ctx=await adminContext(),t=await target(id,ctx),label=normUser(t.data?.username)||S(t.data?.email)||t.uid;if(!confirm('RESET mật khẩu của '+label+' về 123456?'))return;status('Đang reset Firebase Authentication cho '+label+'…');await callReset(t);await t.ref.set({mustChangePassword:true,passwordResetAtMs:Date.now(),updatedAtMs:Date.now()},{merge:true});status('✓ Đã reset '+label+' về 123456.');alert('✓ RESET THÀNH CÔNG\n\n'+label+' · mật khẩu 123456');await refresh()}catch(e){status('Không reset được: '+message(e),true);alert('KHÔNG RESET ĐƯỢC AUTH\n\n'+message(e))}
}
async function deleteAccount(id){
 if(!isAdmin())return alert('Chỉ AD được xóa tài khoản.');
 let authDeleted=false;
 try{
  const ctx=await adminContext(),t=await target(id,ctx),d=t.data||{},label=normUser(d.username)||S(d.email)||t.uid,email=loginEmail(d);
  if(S(ctx.caller.uid)===t.uid)return alert('Không thể xóa chính tài khoản AD đang đăng nhập.');
  if(!email)throw Error('Tài khoản không có email Firebase để xóa Authentication.');
  if(!confirm('XÓA HOÀN TOÀN '+label+'?\n\nXóa Firebase Authentication + users/{UID}. Sau đó có thể tạo lại từ đầu bằng cùng username.\n\nKhông thể hoàn tác.'))return;
  status('1/3 · Thử xóa Auth trực tiếp bằng mật khẩu khởi tạo 123456…');
  let direct=await deleteWithDefault(email,t.uid);
  if(direct.ok){authDeleted=true}
  else{
   status('Tài khoản đã đổi mật khẩu · thử backend Admin xóa trực tiếp…');
   authDeleted=await callDeleteServer(t);
   if(!authDeleted){
    status('Backend xóa chưa sẵn sàng · thử reset 123456 làm phương án cuối…');
    try{await callReset(t);direct=await deleteWithDefault(email,t.uid);authDeleted=!!direct.ok}catch(e){throw Error('Auth còn tồn tại và đã đổi mật khẩu. Backend Admin chưa xóa/reset được: '+message(e))}
   }
  }
  if(!authDeleted)throw Error('Chưa xác nhận được Firebase Auth đã xóa.');
  status('2/3 · Auth đã xóa/không còn · đang xóa users/{UID}…');
  await t.ref.delete();
  status('3/3 · Đang dọn quyền ứng dụng…');await cleanupPermission(d);
  status('✓ Đã xóa hoàn toàn '+label+'. Có thể tạo lại ngay.');
  alert('✓ ĐÃ XÓA TÀI KHOẢN\n\n'+label+' đã được xóa khỏi Firebase Authentication và E-REPORT.\nCó thể tạo lại từ đầu bằng cùng username.');
  await refresh();
 }catch(e){status('Không xóa hoàn tất: '+message(e),true);alert('KHÔNG XÓA HOÀN TẤT\n\n'+message(e))}
}
function install(){
 root.adminCreatePersonalAccount=createAccount;
 root.adminResetAccountPassword=resetPassword;
 root.adminDeletePersonalAccount=deleteAccount;
 root.sagsAdminCreateAccountV3=createAccount;
 root.sagsAdminResetAuthPasswordV3=resetPassword;
 root.sagsAdminDeleteAccountV3=deleteAccount;
 document.querySelectorAll('.dangerAccountBtn').forEach(b=>{if(/VÔ HIỆU/i.test(b.textContent||''))b.textContent='XÓA'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
root.addEventListener('pageshow',()=>setTimeout(install,50),{passive:true});setTimeout(install,250);setTimeout(install,1100);
root.__SAGS_ADMIN_ACCOUNT_ACTIONS_V3={build:BUILD,install};
})(window);
