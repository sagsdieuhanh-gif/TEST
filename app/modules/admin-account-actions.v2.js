/* E-REPORT SAGS TEST · ADMIN ACCOUNT ACTIONS V2
 * Loaded last to override legacy account reset/delete handlers.
 * RESET uses privileged adminResetAuthPassword callable.
 * DELETE resets a target to a temporary known password, signs into that target
 * in an isolated Firebase app, deletes that Auth user, then removes users/{uid}.
 */
(function(root){
'use strict';
const BUILD='V2.5-20261006-ACCOUNT-ACTIONS-FSAGS208-06-ADMIN-ACTIONS';
const TMP_PASS='123456';
const S=v=>String(v??'').trim();
function session(){try{return typeof root.__sagsGetSession==='function'?root.__sagsGetSession():null}catch(_){return null}}
function role(){const s=session();let r=S(s?.role||s?.profile?.role).toUpperCase();if(!r){try{r=S(currentRole).toUpperCase()}catch(_){}}return r}
function profile(){const s=session();if(s?.profile)return s.profile;try{return currentUserProfile||null}catch(_){return null}}
function isAdmin(){return ['AD','ADMIN'].includes(role())}
function status(t,bad=false){try{if(typeof root.setAccountManagerStatus==='function')return root.setAccountManagerStatus(t,bad)}catch(_){}const e=document.getElementById('accountManagerStatus');if(e){e.textContent=S(t);e.style.color=bad?'#b42318':'#455'}}
function username(v){return S(v).toUpperCase().replace(/\s+/g,'')}
function loginEmail(d){const direct=S(d?.email);if(direct)return direct.toLowerCase();const raw=S(d?.username);if(!raw)return'';try{if(typeof root.firebaseLoginEmail==='function')return S(root.firebaseLoginEmail(raw)).toLowerCase()}catch(_){}let x=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[Đđ]/g,'D').toLowerCase().replace(/[^a-z0-9._-]+/g,'.').replace(/^\.+|\.+$/g,'').replace(/\.{2,}/g,'.');return x?x+'@ereport-sags.local':''}
function code(e){return S(e?.code||e?.details?.code||'')}
function message(e){return S(e?.message||e?.details?.message||e||'Lỗi không xác định')}
async function adminContext(){
 if(!isAdmin())throw Error('Chỉ AD được quản lý tài khoản.');
 const auth=root.firebase?.auth?.();const caller=auth?.currentUser;
 if(!caller?.uid)throw Error('Phiên Firebase AD chưa sẵn sàng. Hãy đăng nhập lại AD.');
 try{await caller.getIdToken(true)}catch(e){throw Error('Không làm mới được quyền AD: '+message(e))}
 const fs=root.firebase?.firestore?.();if(!fs)throw Error('Firestore chưa sẵn sàng.');
 return {auth,caller,fs};
}
async function target(id,ctx){
 const uid=S(id);if(!uid)throw Error('Thiếu UID tài khoản.');
 const snap=await ctx.fs.collection('users').doc(uid).get();
 if(!snap.exists)throw Error('Tài khoản không còn tồn tại trong users/{UID}.');
 return {uid,ref:snap.ref,data:snap.data()||{}};
}
async function callReset(t,ctx){
 const email=loginEmail(t.data),u=username(t.data?.username);
 const payload={uid:t.uid,targetUid:t.uid,userId:t.uid,email,username:u,password:TMP_PASS,newPassword:TMP_PASS,mustChangePassword:true};
 const regions=['asia-southeast1',null,'us-central1'];let last=null,seen=new Set();
 for(const region of regions){
  try{
   const fx=region?root.firebase.app().functions(region):root.firebase.functions();
   const key=String(fx?.app?.name||'[DEFAULT]')+'|'+String(region||'default');if(seen.has(key))continue;seen.add(key);
   const res=await fx.httpsCallable('adminResetAuthPassword')(payload);
   if(res?.data?.ok===false)throw Error(S(res.data.error||res.data.message||'Cloud Function từ chối reset.'));
   return res?.data||{ok:true};
  }catch(e){
   last=e;const c=code(e);
   console.warn('adminResetAuthPassword',region||'default',c,message(e));
   if(c.includes('permission-denied')||c.includes('unauthenticated'))break;
  }
 }
 const c=code(last),m=message(last);
 throw Error('RESET AUTH thất bại'+(c?' ['+c+']':'')+': '+m);
}
async function cleanupPermission(d){
 try{
  const u=username(d?.username);if(!u)return;
  const safe=typeof root.sagsV470Safe==='function'?root.sagsV470Safe(u):u.replace(/[.#$\[\]/]/g,'_');
  if(typeof root.sagsV470Ref==='function')await root.sagsV470Ref('account_permissions/'+safe).remove();
 }catch(e){console.warn('permission cleanup',e)}
}
async function refresh(){try{await root.refreshAccountManager?.()}catch(_){}}
async function resetPassword(id){
 if(!isAdmin())return alert('Chỉ AD được reset mật khẩu.');
 try{
  const ctx=await adminContext(),t=await target(id,ctx),label=username(t.data?.username)||S(t.data?.email)||t.uid;
  if(!confirm('RESET mật khẩu của '+label+' về 123456?\n\nNgười dùng sẽ phải đổi mật khẩu sau khi đăng nhập.'))return;
  status('Đang reset Firebase Authentication cho '+label+'…');
  await callReset(t,ctx);
  await t.ref.set({mustChangePassword:true,passwordResetAtMs:Date.now(),updatedAtMs:Date.now()},{merge:true});
  status('✓ Đã reset '+label+' về 123456.');
  alert('✓ RESET THÀNH CÔNG\n\nTài khoản: '+label+'\nMật khẩu: 123456\n\nNgười dùng phải đổi mật khẩu sau khi đăng nhập.');
  await refresh();
 }catch(e){status('Không reset được: '+message(e),true);alert('KHÔNG RESET ĐƯỢC AUTH\n\n'+message(e))}
}
async function deleteAccount(id){
 if(!isAdmin())return alert('Chỉ AD được xóa tài khoản.');
 let secApp=null,secAuth=null,authDeleted=false;
 try{
  const ctx=await adminContext(),t=await target(id,ctx),d=t.data||{},label=username(d.username)||S(d.email)||t.uid,email=loginEmail(d);
  if(String(ctx.caller.uid)===t.uid)return alert('Không thể xóa chính tài khoản AD đang đăng nhập.');
  if(!email)throw Error('Tài khoản không có email Firebase để xóa Authentication.');
  if(!confirm('XÓA HOÀN TOÀN '+label+'?\n\nThao tác này sẽ xóa Firebase Authentication và hồ sơ users/{UID}. Sau đó có thể tạo lại tài khoản từ đầu với cùng username.\n\nKhông thể hoàn tác.'))return;
  status('1/3 · Đang xác minh và chuẩn bị xóa Auth '+label+'…');
  await callReset(t,ctx);
  status('2/3 · Đang xóa Firebase Authentication '+label+'…');
  secApp=root.firebase.initializeApp(root.firebase.app().options,'sags-delete-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  secAuth=secApp.auth();
  try{await secAuth.setPersistence(root.firebase.auth.Auth.Persistence.NONE)}catch(_){}
  const cred=await secAuth.signInWithEmailAndPassword(email,TMP_PASS);
  if(!cred?.user?.uid||String(cred.user.uid)!==t.uid)throw Error('UID Auth xác minh không khớp hồ sơ cần xóa.');
  await cred.user.delete();authDeleted=true;
  status('3/3 · Auth đã xóa. Đang xóa hồ sơ và quyền ứng dụng…');
  await t.ref.delete();
  await cleanupPermission(d);
  status('✓ Đã xóa hoàn toàn '+label+'. Có thể tạo lại tài khoản từ đầu.');
  alert('✓ ĐÃ XÓA TÀI KHOẢN\n\n'+label+' đã được xóa khỏi Firebase Authentication và E-REPORT.\nBây giờ có thể tạo lại từ đầu bằng cùng username.');
  await refresh();
 }catch(e){
  const prefix=authDeleted?'Firebase Auth đã xóa nhưng hồ sơ ứng dụng chưa dọn xong. ':'';
  status(prefix+message(e),true);
  alert('KHÔNG XÓA HOÀN TẤT\n\n'+prefix+message(e));
 }finally{
  try{await secAuth?.signOut()}catch(_){}
  try{await secApp?.delete()}catch(_){}
 }
}
function install(){
 root.adminResetAccountPassword=resetPassword;
 root.adminDeletePersonalAccount=deleteAccount;
 root.sagsAdminResetAuthPasswordV2=resetPassword;
 root.sagsAdminDeleteAccountV2=deleteAccount;
 document.querySelectorAll('.dangerAccountBtn').forEach(b=>{if(/VÔ HIỆU/i.test(b.textContent||''))b.textContent='XÓA'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
root.addEventListener('pageshow',()=>setTimeout(install,50),{passive:true});
setTimeout(install,300);setTimeout(install,1200);
root.__SAGS_ADMIN_ACCOUNT_ACTIONS_V2={build:BUILD,install};
})(window);
