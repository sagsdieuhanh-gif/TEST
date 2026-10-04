/* E-REPORT SAGS V6.4.123 · POST-LOGIN UNLOCK
 * Successful Firebase login transitions in-place. Never reload into a second
 * blocking auth restore. A restore watchdog makes the login card usable again
 * if cached-session recovery stalls behind the full-screen login overlay.
 */
(function(root){
'use strict';
const BUILD='V6.4.123-20261004-POSTLOGIN-UNLOCK-01';
const S=v=>String(v??'').trim();

function modal(){
  return document.getElementById('roleLoginModal');
}
function loginCard(){
  return modal()?.querySelector?.('.roleLoginCard')||null;
}
function resetBlockingUi(){
  const body=document.body;
  body?.classList.remove('v157-drawer-open','sags-quicktime-open','sags-overlay-open','v166-overlay-open','v163-operational');
  for(const id of ['quickTimeModal','fs09QuickModal','timeSkipModal','entry']){
    const e=document.getElementById(id); if(!e)continue;
    e.classList.remove('show','open','active');
    e.setAttribute('aria-hidden','true');
    e.style.setProperty('display','none','important');
    e.style.setProperty('pointer-events','none','important');
  }
}
function closeLoginOverlay(){
  const m=modal(),card=loginCard();
  if(card){
    card.style.removeProperty('visibility');
    card.style.removeProperty('pointer-events');
    card.removeAttribute('aria-hidden');
  }
  if(!m)return;
  m.classList.remove('show','open','active','sagsOverlayTop');
  m.hidden=true;
  m.setAttribute('aria-hidden','true');
  m.style.setProperty('display','none','important');
  m.style.setProperty('visibility','hidden','important');
  m.style.setProperty('pointer-events','none','important');
}
function reopenLoginOverlay(message=''){
  const m=modal(),card=loginCard(),err=document.getElementById('roleLoginError');
  if(!m)return;
  m.hidden=false;
  m.removeAttribute('aria-hidden');
  m.style.setProperty('display','flex','important');
  m.style.setProperty('visibility','visible','important');
  m.style.setProperty('pointer-events','auto','important');
  if(card){
    card.style.setProperty('visibility','visible','important');
    card.style.setProperty('pointer-events','auto','important');
    card.removeAttribute('aria-hidden');
  }
  if(err&&message)err.textContent=message;
}
function finishLogin(profile,{test=false}={}){
  if(!profile||!S(profile.role))throw new Error('firebase-profile-invalid');
  currentUserProfile=profile;
  currentRole=profile.role;
  try{
    localStorage.setItem(PERSONAL_SESSION_KEY,JSON.stringify(profile));
    localStorage.removeItem(ROLE_SESSION_KEY);
  }catch(_){}
  try{
    sessionStorage.removeItem('sagsPostLoginLandingV6439');
    sessionStorage.setItem('sagsActiveMenuV2','home');
    sessionStorage.removeItem('sagsUiWorkspaceV181');
    v1153ClearRefreshView?.();
  }catch(_){}
  resetBlockingUi();
  closeLoginOverlay();
  document.body?.classList.add('v157-authenticated','v157-home');
  try{applyRoleUI?.()}catch(e){console.warn('V6.4.123 applyRoleUI',e?.message||e)}
  try{showRoleHomeIdle?.()}catch(_){}
  try{bindRoleHomeFunctionButtons?.()}catch(_){}
  try{root.sagsUiClearBackStack?.()}catch(_){}
  try{root.sagsV479GoHome?.()}catch(e){console.warn('V6.4.123 goHome',e?.message||e)}
  try{root.sagsOverlayLayout?.refresh?.()}catch(_){}
  try{root.dispatchEvent(new CustomEvent('sags:login',{detail:{role:S(profile.role),username:S(profile.username)}}))}catch(_){}
  const err=document.getElementById('roleLoginError'); if(err)err.textContent='';
  if(!test&&profile.mustChangePassword)setTimeout(()=>{
    try{openChangePasswordModal(true);setChangePasswordStatus('Mật khẩu đang là mật khẩu khởi tạo. Hãy đổi mật khẩu Firebase trước khi tiếp tục.')}catch(_){}
  },180);
  if(!test)setTimeout(()=>{try{verifyPersonalSession(true)}catch(_){}},500);
  return true;
}
function loginErrorMessage(e,rawUser=''){
  const code=S(e?.code),detail=S(e?.message||e);
  if(/API_KEY_HTTP_REFERRER_BLOCKED|requests-from-referer|Requests from referer/i.test(code+' '+detail))return 'Tên miền '+location.hostname+' chưa được cho phép trong cấu hình API key Firebase. Liên hệ quản trị.';
  if(code.includes('invalid-credential')||code.includes('invalid-login-credentials')||code.includes('wrong-password')||code.includes('user-not-found'))return 'Sai tài khoản hoặc mật khẩu.';
  if(code.includes('user-disabled'))return 'Tài khoản đã bị khóa.';
  if(code.includes('too-many-requests'))return 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.';
  if(code.includes('operation-not-allowed'))return 'Đăng nhập hiện chưa sẵn sàng.';
  if(code.includes('network-request-failed'))return 'Không có kết nối. Kiểm tra mạng rồi thử lại.';
  if(code.includes('invalid-api-key'))return 'Lỗi cấu hình đăng nhập.';
  if(code.includes('unauthorized-domain'))return 'Thiết bị hiện chưa được phép đăng nhập.';
  if(detail.includes('firebase-profile-missing'))return 'Tài khoản chưa được cấp hồ sơ sử dụng.';
  if(detail.includes('firebase-profile-disabled'))return 'Tài khoản đã bị khóa.';
  if(detail.includes('firebase-username-missing'))return 'Đăng nhập Auth thành công nhưng users/{UID} chưa có username.';
  if(detail.includes('firebase-role-invalid'))return 'Tài khoản chưa được cấp quyền hợp lệ.';
  if(detail.includes('auth-not-ready'))return 'Đăng nhập chưa sẵn sàng. Tải lại ứng dụng.';
  return 'Không đăng nhập được.';
}
const patchedLogin=async function(email,pass){
  const err=document.getElementById('roleLoginError'); let signedInUser=null;
  try{
    if(!adFirebaseAuthAvailable()){
      if(err)err.textContent='Firebase Authentication chưa sẵn sàng. Hãy tải lại ứng dụng.';
      return false;
    }
    if(err)err.textContent='Đang xác thực tài khoản Firebase...';
    const auth=adFirebaseGetAuth(); if(!auth)throw new Error('auth-not-ready');
    try{await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(_){}
    const cred=await auth.signInWithEmailAndPassword(S(email),pass);
    signedInUser=cred?.user||null;
    const profile=await firebasePersonalBuildProfile(signedInUser);
    if(err)err.textContent='Đăng nhập Firebase thành công.';
    return finishLogin(profile);
  }catch(e){
    const code=S(e?.code),detail=S(e?.message||e);
    const fatalAfterSignIn=!!signedInUser&&(code.includes('user-disabled')||code.includes('user-not-found')||code.includes('invalid-user-token')||code.includes('user-token-expired')||/firebase-profile-(missing|disabled)|firebase-role-invalid|firebase-username-missing|firebase-auth-account-gone/.test(detail));
    if(fatalAfterSignIn)try{const a=adFirebaseGetAuth();if(a)await a.signOut()}catch(_){}
    if(err)err.textContent=loginErrorMessage(e);
    console.warn('Firebase personal login V6.4.123',code,detail,e);
    reopenLoginOverlay(err?.textContent||'Không đăng nhập được.');
    return false;
  }
};
patchedLogin.__sagsPostLoginUnlockV64123=true;
try{firebasePersonalAccountLogin=patchedLogin}catch(e){console.error('V6.4.123 could not replace Firebase login',e)}
try{root.firebasePersonalAccountLogin=patchedLogin}catch(_){}

function restoreWatchdog(){
  const m=modal(),card=loginCard(); if(!m||!card)return;
  let visible=false,hiddenCard=false;
  try{
    const ms=getComputedStyle(m),cs=getComputedStyle(card);
    visible=!m.hidden&&ms.display!=='none'&&ms.visibility!=='hidden';
    hiddenCard=cs.visibility==='hidden'||card.getAttribute('aria-hidden')==='true';
  }catch(_){}
  if(!visible||!hiddenCard)return;
  let profile=null,role='';
  try{const s=root.__sagsGetSession?.()||{};profile=s.profile||null;role=S(s.role||profile?.role)}catch(_){}
  if(profile&&role){
    try{finishLogin(profile);return}catch(e){console.warn('V6.4.123 watchdog finish',e?.message||e)}
  }
  reopenLoginOverlay('Khôi phục phiên đăng nhập mất quá lâu. Vui lòng đăng nhập lại.');
}
function armWatchdog(){
  [3500,7000,12000].forEach(ms=>setTimeout(restoreWatchdog,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',armWatchdog,{once:true});else armWatchdog();
root.addEventListener('pageshow',()=>setTimeout(restoreWatchdog,1800),{passive:true});
root.__SAGS_POST_LOGIN_UNLOCK_V64123={build:BUILD,finishLogin,restoreWatchdog,closeLoginOverlay,reopenLoginOverlay,testTransition:profile=>finishLogin(profile,{test:true})};
})(window);
